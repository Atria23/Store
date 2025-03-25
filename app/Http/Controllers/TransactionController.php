<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth; // Untuk autentikasi
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use App\Models\User; // Model User untuk memanipulasi data user
use App\Models\Transaction; // Pastikan Model Transaction sudah ada
use App\Models\Product; // Model untuk mengambil data produk
use Inertia\Inertia;

class TransactionController extends Controller
{

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
    
    public function makeTransaction(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'User not authenticated'], 401);
        }

        $username = env('P_U');
        $apiKey = env('P_AK');
        $ref_id = uniqid();
        $buyer_sku_code = $request->input('buyer_sku_code');
        $customer_no = $request->input('customer_no');
        $price = $request->input('price');
        $sign = md5($username . $apiKey . $ref_id);

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

        // Ambil data produk dari tabel products berdasarkan buyer_sku_code
        $product = Product::where('buyer_sku_code', $buyer_sku_code)->first();

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        // Ambil data produk
        $product_name = $product->product_name;
        $price_product = $product->price;
        $category = $product->category;  // Ambil category dari tabel products
        $brand = $product->brand;        // Ambil brand dari tabel products
        $type = $product->type;          // Ambil type dari tabel products

        // Simpan transaksi ke database
        $transaction = Transaction::create([
            'user_id' => $user->id,
            'ref_id' => $ref_id,
            'buyer_sku_code' => $buyer_sku_code,
            'customer_no' => $customer_no,
            'status' => $responseData['data']['status'] ?? 'Failed',
            'price' => $price,
            'price_product' => $price_product,
            'product_name' => $product_name,
            'category' => $category,  // Menambahkan category
            'brand' => $brand,        // Menambahkan brand
            'type' => $type,          // Menambahkan type
            'rc' => $responseData['data']['rc'] ?? 'UNKNOWN_ERROR',
            'sn' => $responseData['data']['sn'] ?? null,
            'buyer_last_saldo' => $user->balance,
            'message' => $responseData['data']['message'] ?? 'Transaction failed',
        ]);

        if ($responseData['data']['status'] !== 'Gagal') {
            // Kurangi saldo hanya jika status tidak gagal
            $user->balance -= $price_product;
            $user->save();

            // Perbarui saldo transaksi
            $transaction->buyer_last_saldo = $user->balance;
            $transaction->save();

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
        return Inertia::render('History', [
            'transactions' => $transactionsHistory,
        ]);
    }


    public function updateTransactionStatus(Request $request)
    {
        $transactionId = $request->input('transaction_id');

        // Cari transaksi dengan status Pending
        $transaction = Transaction::where('ref_id', $transactionId)->where('status', 'Pending')->first();

        if (!$transaction) {
            return response()->json([
                'message' => 'No pending transaction found or invalid ID',
            ], 404);
        }

        // Data untuk validasi transaksi
        $username = env('P_U');
        $apiKey = env('P_AK');
        $sign = md5($username . $apiKey . $transaction->ref_id);

        $data = [
            'username' => $username,
            'ref_id' => $transaction->ref_id,
            'sign' => $sign,
        ];

        // Kirim permintaan ke API
        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post('https://api.digiflazz.com/v1/transaction', $data);
        
            $responseData = $response->json();
        } catch (\Exception $e) {
            Log::error('API request failed', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Failed to connect to Digiflazz API',
            ], 500);
        }
        

        // Periksa apakah respons API valid
        $apiData = $responseData['data'] ?? null;

        if (!$apiData) {
            return response()->json([
                'message' => 'Invalid response from API',
            ], 500);
        }

        // Update data transaksi di database
        $transaction->update([
            'status' => $apiData['status'] ?? 'Failed',
            'rc' => $apiData['rc'] ?? 'UNKNOWN_ERROR',
            'sn' => $apiData['sn'] ?? null,
            'message' => $apiData['message'] ?? 'Transaction failed',
        ]);

        // Jika status transaksi gagal, kembalikan saldo pengguna
        if ($apiData['status'] === 'Gagal') {
            $user = $transaction->user;
            $user->balance += $transaction->price_product;
            $user->save();
        }

        return response()->json([
            'message' => 'Transaction status updated successfully',
            'data' => $apiData,
            'balance' => $transaction->user->balance,
        ], 200);
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