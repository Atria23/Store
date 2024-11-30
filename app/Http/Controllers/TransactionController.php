<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth; // Untuk autentikasi
use App\Models\User; // Model User untuk memanipulasi data user
use App\Models\Transaction; // Pastikan Model Transaction sudah ada
use App\Models\Product; // Model untuk mengambil data produk
use Inertia\Inertia;

class TransactionController extends Controller
{
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

        // Ambil data produk dari tabel products berdasarkan buyer_sku_code
        $product = Product::where('buyer_sku_code', $buyer_sku_code)->first();

        if (!$product) {
            return response()->json([
                'message' => 'Product not found',
            ], 404);
        }

        $price_product = $product->price;
        $product_name = $product->product_name;

        // Periksa apakah saldo cukup
        if ($user->balance < $price_product) {
            Transaction::create([
                'user_id' => $user->id,
                'ref_id' => $ref_id,
                'buyer_sku_code' => $buyer_sku_code,
                'customer_no' => $customer_no,
                'status' => 'Failed',
                'price' => $price,
                'price_product' => $price_product,
                'product_name' => $product_name,
                'rc' => 'INSUFFICIENT_BALANCE',
                'sn' => null,
                'buyer_last_saldo' => $user->balance,
                'message' => 'Insufficient balance',
            ]);

            return response()->json([
                'message' => 'Insufficient balance',
                'balance' => $user->balance,
            ], 400);
        }

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
        $transactions = Transaction::all(['ref_id', 'product_name', 'customer_no', 'price', 'status']);

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
            ->get(['ref_id', 'product_name', 'customer_no', 'price', 'status', 'sn']);

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
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post('https://api.digiflazz.com/v1/transaction', $data);

        $responseData = $response->json();

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
}