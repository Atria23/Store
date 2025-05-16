<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\TransactionsHistory;

class HistoryController extends Controller
{
    public function getUserHistory()
    {
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('login')->with('error', 'Please log in first.');
        }

        $history = TransactionsHistory::where('user_id', $user->id)
            ->get(['ref_id', 'product_name', 'customer_no', 'price', 'status', 'created_at']);

        return Inertia::render('History', [
            'history' => $history,
        ]);
    }

    public function getAllHistory()
    {
        $history = TransactionsHistory::select('id', 'sn', 'ref_id', 'product_name', 'customer_no', 'price', 'status', 'created_at', 'user_id')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('ManageHistory', [
            'transactions' => $history,
        ]);
    }

}
