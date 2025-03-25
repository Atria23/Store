<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\TransactionsHistory;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class UserDashboardController extends Controller
{
    public function index()
    {
        // Ambil user yang sedang login
        $user = Auth::user();

        // Ambil jumlah transaksi sukses untuk user tertentu
        $transactionsCount = TransactionsHistory::where('user_id', $user->id)
            ->where('status', 'Sukses')
            ->count();

        // Menyiapkan data user dengan nilai default jika kosong
        $userData = [
            'name' => optional($user)->name ?? 'Guest',
            'transactions' => $transactionsCount, // Gunakan jumlah transaksi sukses
            'balance' => optional($user)->balance ?? 0,
            'points' => optional($user)->points ?? 0,
            'depositHistory' => optional($user)->depositHistory ?? [],
        ];

        $categories = DB::table('categories')
            ->select('id', 'name', 'image')
            ->get();

        // Kirimkan data user dengan jumlah transaksi sukses ke komponen React
        return Inertia::render('User/Dashboard', [
            'categories' => $categories,
            'user' => $userData, // Kirim data user dengan jumlah transaksi sukses
        ]);
    }
}
