<?php

namespace App\Http\Controllers;

use App\Models\PostpaidTransaction;
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
            ->select('ref_id', 'type', 'customer_no', 'selling_price', 'status', 'created_at') // Pilih kolom yang perlu saja
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
        $transaction = PostpaidTransaction::where('ref_id', $ref_id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        return Inertia::render('Pascabayar/HistoryDetail', [
            'transaction' => $transaction,
        ]);
    }
}