<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Models\TransactionsHistory;
use Inertia\Inertia;

class ProfileController extends Controller
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
            'avatar' => $user->avatar ? '/storage/avatars/' . basename($user->avatar) : null,
            'email' => optional($user)->email ?? '@gmail.com', 
            'transactions' => $transactionsCount,
            'balance' => optional($user)->balance ?? 0,
            'points' => optional($user)->points ?? 0,
            'depositHistory' => optional($user)->depositHistory ?? [],
            'isSuperAdmin' => $user->hasRole('super-admin'),
        ];

        return Inertia::render('Profile', [
            'user' => $userData,
        ]);
    }
}
