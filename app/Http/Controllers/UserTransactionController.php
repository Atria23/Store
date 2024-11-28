<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Product;
use App\Models\Transaction;
use Illuminate\Http\Request;

class UserTransactionController extends Controller
{
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

        // Simpan transaksi sementara
        $transaction = Transaction::create([
            'ref_id' => uniqid(),
            'buyer_sku_code' => $request->buyer_sku_code,
            'customer_no' => $request->customer_no,
            'status' => 'Pending',
            'price' => $product->price,
            'rc' => '',
            'message' => 'Transaction initiated.',
        ]);

        return response()->json([
            'message' => 'Transaction initiated.',
            'transaction' => $transaction,
        ]);
    }
}
