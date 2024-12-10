<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UserDashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Menyiapkan data dengan nilai default jika kosong
        $userData = [
            'name' => optional($user)->name ?? 'Guest',
            'transactions' => optional($user)->transactions ?? 0,
            'balance' => optional($user)->balance ?? 0,
            'points' => optional($user)->points ?? 0,
            'depositHistory' => optional($user)->depositHistory ?? [],
        ];

        return Inertia::render('User/Dashboard', [
            'user' => $userData, // Kirim data user dengan nilai default
        ]);
    }
}
