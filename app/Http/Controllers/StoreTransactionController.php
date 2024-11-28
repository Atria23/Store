<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;

class StoreTransactionController extends Controller
{
    // Menampilkan form transaksi (optional)
    public function create()
    {
        return view('transactions.create'); // Pastikan untuk membuat view ini
    }

    // Proses transaksi
    public function handleTransaction(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'buyer_sku_code' => 'required|exists:products,buyer_sku_code',
            'customer_no' => 'required|string',
        ]);
    
        $user = User::find($request->user_id);
        $product = Product::where('buyer_sku_code', $request->buyer_sku_code)->first();
    
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }
    
        // Pastikan saldo cukup
        if ($user->balance < $product->price) {
            return response()->json(['message' => 'Insufficient balance'], 400);
        }
    
        // Kurangi saldo pengguna
        $user->balance -= $product->price;
        $user->save();
    
        // Membuat ref_id unik
        $ref_id = uniqid();
        $sign = md5(env('P_U') . env('P_AK') . $ref_id);
    
        // Kirim permintaan ke API Digiflazz
        $response = Http::withHeaders(['Content-Type' => 'application/json'])
            ->post('https://api.digiflazz.com/v1/transaction', [
                'username' => env('P_U'),
                'buyer_sku_code' => $product->buyer_sku_code,
                'customer_no' => $request->customer_no,
                'ref_id' => $ref_id,
                'sign' => $sign,
            ]);
    
        if ($response->successful()) {
            // Simpan transaksi ke database jika sukses
            $transaction = Transaction::create([
                'ref_id' => $ref_id,
                'buyer_sku_code' => $product->buyer_sku_code,
                'customer_no' => $request->customer_no,
                'status' => 'success',
                'price' => $product->price,
                'rc' => uniqid(),
                'message' => 'Transaksi berhasil.',
            ]);
    
            return response()->json(['message' => 'Transaction successful', 'transaction' => $transaction]);
        } else {
            // Rollback saldo jika API gagal
            $user->balance += $product->price; // Kembalikan saldo pengguna
            $user->save();
    
            return response()->json([
                'message' => 'Transaction failed at API level.',
                'error' => $response->json(),
            ], $response->status());
        }
    }
    
}
