<?php

namespace App\Http\Controllers;

use App\Models\PostpaidTransaction;
use App\Models\PostpaidProduct; // Import model PostpaidProduct Anda
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PostpaidHistoryController extends Controller
{
    /**
     * Menampilkan daftar semua transaksi pascabayar.
     */
    public function index()
    {
        $transactions = PostpaidTransaction::where('user_id', Auth::id())
            // Pastikan 'buyer_sku_code' juga dipilih agar relasi dapat berfungsi
            ->select('ref_id', 'type', 'customer_no', 'selling_price', 'status', 'created_at', 'buyer_sku_code')
            // Eager load relasi 'product' dan pilih kolom yang relevan saja
            // Selalu sertakan kunci primer (id) dan kunci asing (buyer_sku_code) dari model terkait
            ->with('product:id,buyer_sku_code,product_name,category,brand')
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Pascabayar/History', [
            'transactions' => $transactions,
        ]);
    }

    /**
     * Menampilkan detail satu transaksi.
     */
    public function show($ref_id)
{
    $user = Auth::user(); // Dapatkan user yang sedang login

    $transaction = PostpaidTransaction::where('ref_id', $ref_id)
        ->where('user_id', $user->id) // Menggunakan $user->id daripada Auth::id() untuk konsistensi
        // Eager load relasi 'product' dan pilih kolom yang relevan saja
        // Selalu sertakan kunci primer (id) dan kunci asing (buyer_sku_code) dari model terkait
        ->with('product:id,buyer_sku_code,product_name,category,brand')
        ->firstOrFail();

    // Ambil store milik user (jika ada relasi)
    $store = $user->store;

    return Inertia::render('Pascabayar/HistoryDetail', [
        'transaction' => $transaction,
        'store' => $store ? [
            'name' => $store->name,
            'address' => $store->address,
            'phone_number' => $store->phone_number,
            'image' => $store->image ? asset('storage/' . $store->image) : null,
        ] : null,
    ]);
}
}