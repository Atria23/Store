<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Transaction;
use App\Models\Product;
use App\Models\User\AffiliateHistory;
use App\Models\AffiliateProduct; // Pastikan ini ditambahkan
use App\Models\User\Affiliator; // Pastikan ini ditambahkan
use Inertia\Inertia;
use App\Services\TransactionUpdateService;
use App\Mail\AdminTransactionManualNotification;
use Illuminate\Support\Facades\Mail;

class TransactionController extends Controller
{   
        
    public function update(Request $request)
    {
        \Log::info('Transaction update request:', $request->all());

        $validated = $request->validate([
            'id' => 'required|exists:transactions,id',
            'status' => 'required|string',
            'sn' => 'nullable|string',
        ]);

        $transaction = Transaction::find($validated['id']);
        if ($transaction) {
            $status = $validated['status'];

            // Tentukan rc dan message berdasarkan status
            $rc = $status === 'Sukses' ? '00' : '99';
            $message = $status === 'Sukses' ? 'Transaksi berhasil' : 'Transaksi gagal';

            $transaction->update([
                'status' => $validated['status'],
                'sn' => $validated['sn'] ?? '',
                'rc' => $rc,
                'message' => $message,
            ]);

            \Log::info('Transaksi diperbarui', [
                'id' => $transaction->id,
                'status' => $validated['status'],
                'rc' => $rc,
                'message' => $message,
            ]);

            // Refund saldo jika statusnya gagal dan sebelumnya bukan gagal
            if ($status === 'Gagal' && strtolower($transaction->getOriginal('status')) !== 'Gagal') {
                $user = $transaction->user;
                $user->balance += $transaction->price_product;
                $user->save();

                \Log::info("Balance refunded for user ID {$user->id} for Transaction ID {$transaction->ref_id}");
            }

            return redirect()->route('manage.history')->with('success', 'Transaksi berhasil diperbarui');
        }

        return redirect()->back()->with('error', 'Transaksi tidak ditemukan');
    }

    public function makeTransaction(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'User not authenticated'], 401);
        }

        $buyer_sku_code = $request->input('buyer_sku_code');
        $price = $request->input('price');

        $product = Product::where('buyer_sku_code', $buyer_sku_code)->first();
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        // Cek saldo user, jika kurang langsung return error
        if ($user->balance < $product->price) {
            // Jika ingin redirect ke route checkout:
            return redirect()->route('checkout')->with('error', 'Saldo tidak cukup, silakan isi saldo terlebih dahulu.');
        }

        $username = env('P_U');
        $apiKey = env('P_AK');
        $ref_id = uniqid();
        $buyer_sku_code = $request->input('buyer_sku_code');
        $customer_no = $request->input('customer_no');
        $price = $request->input('price');
        $sign = md5($username . $apiKey . $ref_id);

        $product = Product::where('buyer_sku_code', $buyer_sku_code)->first();
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $isManualSku = str_contains($buyer_sku_code, '#');
        $status = 'Pending';
        $rc = $isManualSku ? '03' : null;
        $sn = null;
        $message = 'Menunggu proses manual';

        // Jika bukan SKU manual, kirim ke API
        if (!$isManualSku) {
            $data = [
                'username' => $username,
                'buyer_sku_code' => $buyer_sku_code,
                'customer_no' => $customer_no,
                'ref_id' => $ref_id,
                'sign' => $sign,
            ];

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post('https://api.digiflazz.com/v1/transaction', $data);

            $responseData = $response->json();

            $status = $responseData['data']['status'] ?? 'Failed';
            $rc = $responseData['data']['rc'] ?? 'UNKNOWN_ERROR';
            $sn = $responseData['data']['sn'] ?? null;
            $message = $responseData['data']['message'] ?? 'Transaction failed';
        }

        $transaction = Transaction::create([
            'user_id' => $user->id,
            'ref_id' => $ref_id,
            'buyer_sku_code' => $buyer_sku_code,
            'customer_no' => $customer_no,
            'status' => $status,
            'price' => $price,
            'price_product' => $product->price,
            'product_name' => $product->product_name,
            'category' => $product->category,
            'brand' => $product->brand,
            'type' => $product->type,
            'rc' => $rc,
            'sn' => $sn,
            'buyer_last_saldo' => $user->balance,
            'message' => $message,
        ]);

        $affiliator = Affiliator::where('user_id', $user->id)->first();
        $affiliateProduct = AffiliateProduct::where('buyer_sku_code', $buyer_sku_code)->first();

        if (!$affiliateProduct) {
            Log::error('AffiliateProduct not found for buyer_sku_code: ' . $buyer_sku_code);
            return response()->json(['error' => 'Affiliate product not found'], 404);
        }

        if (is_null($affiliateProduct->commission)) {
            Log::error('Commission is NULL for buyer_sku_code: ' . $buyer_sku_code);
            return response()->json(['error' => 'Commission value is NULL'], 400);
        }

        $affiliator_id = $affiliator->affiliate_by ?? null;
        $transaction_id = $transaction->id ?? null;
        $commission = $affiliateProduct->commission ?? 0.00;
        $affiliate_product_id = $affiliateProduct->id ?? null;

        Log::info('Affiliate History Data:', [
            'affiliator_id' => $affiliator_id,
            'transaction_id' => $transaction_id,
            'commission' => $commission,
            'status' => $status,
            'affiliate_product_id' => $affiliate_product_id
        ]);

        if ($affiliator_id !== null && $transaction_id !== null && $affiliate_product_id !== null) {
            AffiliateHistory::create([
                'affiliator_id' => $affiliator_id,
                'transaction_id' => $transaction_id,
                'affiliate_product_id' => $affiliate_product_id,
                'commission' => $commission,
                'status' => $status,
            ]);
        } else {
            Log::error('AffiliateHistory insert failed: Missing affiliator_id, transaction_id, or affiliate_product_id');
        }

        $user->balance -= $product->price;
        $user->save();
        $transaction->buyer_last_saldo = $user->balance;
        $transaction->save();

        // if ($responseData['data']['status'] === 'Gagal') {
        //     $user = $transaction->user;
        //     $user->balance += $transaction->price_product;
        //     $user->save();
    
        //     Log::info("Balance refunded for user ID {$user->id} for Transaction ID {$transaction->ref_id}");
        // }

        if ($transaction->status === 'Gagal') {
            $user = $transaction->user;
            $user->balance += $transaction->price_product;
            $user->save();
        
            Log::info("Balance refunded for user ID {$user->id} for Transaction ID {$transaction->ref_id}");
        }
        

        if ($isManualSku) {
            \Log::info('Manual SKU terdeteksi, memulai pengiriman email notifikasi...'); // <== ini

            $adminEmails = config('custom.manual_trancastions_emails');

            foreach ($adminEmails as $email) {
                try {
                    Mail::to(trim($email))->send(new AdminTransactionManualNotification($transaction));
                    \Log::info('Email notifikasi transaksi manual berhasil dikirim ke: ' . $email);
                } catch (\Exception $e) {
                    \Log::error('Gagal mengirim email ke: ' . $email . '. Error: ' . $e->getMessage());
                }
            }            

            return response()->json([
                'message' => 'Transaction pending (manual)',
                'data' => [
                    'status' => 'Pending',
                    'message' => 'Menunggu proses manual',
                    'ref_id' => $ref_id,
                ],
                'balance' => $user->balance,
            ], 200);
        } else {
            if ($responseData['data']['status'] !== 'Gagal') {
                return response()->json([
                    'message' => 'Transaction successful',
                    'data' => $responseData['data'],
                    'balance' => $user->balance,
                ], 200);
            } else {
                return response()->json([
                    'message' => 'Transaction failed',
                    'data' => $responseData['data'] ?? null,
                    'balance' => $user->balance,
                ], $response->status());
            }
        }
        
    }


    public function verifyPassword(Request $request)
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        $user = Auth::user();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(["success" => false, "message" => "Password salah"], 401);
        }

        return response()->json(["success" => true]);
    }

    public function getBalance()
    {
        $user = Auth::user();
    
        if (!$user) {
            return response()->json(['message' => 'User not authenticated'], 401);
        }
    
        return response()->json(['balance' => $user->balance], 200);
    }

    public function getCompletedTransactions()
    {
        $transactions = Transaction::all(['ref_id', 'product_name', 'customer_no', 'price', 'status', 'created_at', 'category', 'brand', 'type']);
        return Inertia::render('Transactions/Completed', [
            'transactions' => $transactions,
        ]);
    }

    public function historyPage()
    {
        $user = Auth::user();

        // Ambil data dari tabel transactions_history berdasarkan user_id
        $transactionsHistory = \DB::table('transactions_history')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get(['ref_id', 'product_name', 'customer_no', 'price', 'status', 'sn', 'created_at']);

        // Kirim data ke Inertia
        return Inertia::render('User/History', [
            'transactions' => $transactionsHistory,
        ]);
    }

    public function updateTransactionStatus()
    {
        $service = new TransactionUpdateService();
        $result = $service->updatePendingTransactions();

        return response()->json([
            'message' => $result,
        ]);
    }
    
    public function webhookHandler(Request $request)
    {
        Log::info('Webhook function triggered');

        try {
            $secret = env('DIGIFLAZZ_WEBHOOK_SECRET');

            if (!$secret) {
                Log::error('Webhook secret is not set');
                return response()->json(['message' => 'Webhook secret missing'], 500);
            }

            $payload = $request->getContent();
            $headers = $request->headers->all();

            Log::info('Webhook Received', ['headers' => $headers, 'payload' => json_decode($payload, true)]);

            if (!$request->hasHeader('x-signature')) {
                Log::warning('Missing x-signature header');
                return response()->json(['message' => 'Missing signature'], 403);
            }

            $calculatedSignature = hash_hmac('sha256', $payload, $secret);
            $receivedSignature = $request->header('x-signature');

            if (!hash_equals($calculatedSignature, $receivedSignature)) {
                Log::warning('Invalid signature', ['calculated' => $calculatedSignature, 'received' => $receivedSignature]);
                return response()->json(['message' => 'Invalid signature'], 403);
            }

            $data = json_decode($payload, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::warning('Invalid JSON payload', ['error' => json_last_error_msg()]);
                return response()->json(['message' => 'Invalid JSON'], 400);
            }

            if (!isset($data['event'], $data['ref_id'], $data['status']) || empty($data['ref_id'])) {
                Log::warning('Invalid payload format', ['payload' => $data]);
                return response()->json(['message' => 'Invalid payload'], 400);
            }

            $transaction = Transaction::where('ref_id', $data['ref_id'])->first();

            if (!$transaction) {
                Log::warning('Transaction not found', ['ref_id' => $data['ref_id']]);
                return response()->json(['message' => 'Transaction not found'], 404);
            }

            if (in_array($transaction->status, ['Sukses', 'Gagal'])) {
                Log::info('Transaction already processed', ['ref_id' => $transaction->ref_id, 'status' => $transaction->status]);
                return response()->json(['message' => 'Transaction already processed'], 200);
            }

            DB::transaction(function () use ($transaction, $data) {
                $transaction->update([
                    'status' => $data['status'],
                    'rc' => $data['rc'] ?? $transaction->rc,
                    'sn' => $data['sn'] ?? $transaction->sn,
                    'message' => $data['message'] ?? $transaction->message,
                ]);

                if ($data['status'] === 'Gagal') {
                    $user = $transaction->user;
                    if ($user) {
                        $user->increment('balance', $transaction->price_product);
                        Log::info('Balance refunded', ['user_id' => $user->id, 'amount' => $transaction->price_product]);
                    }
                }
            });

            Log::info('Transaction updated', ['ref_id' => $transaction->ref_id, 'status' => $data['status']]);

            return response()->json(['message' => 'Webhook processed successfully'], 200);
        } catch (\Exception $e) {
            Log::error('Webhook processing error', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Internal Server Error'], 500);
        }
    }

}