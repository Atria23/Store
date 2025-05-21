<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class GuestDashboardController extends Controller
{
    public function index()
    {
        // Data default untuk guest
        $userData = [
            'name' => 'Guest',
            'transactions' => 0,
            'balance' => 0,
            'points' => 0,
            'depositHistory' => [],
        ];

        // Ambil semua kategori, tanpa filter role karena guest
        $categories = DB::table('categories')
            ->select('id', 'name', 'image')
            ->where('name', '!=', 'e-money') // sembunyikan kategori "e-money" untuk guest
            ->get();

        return Inertia::render('GuestDashboard', [
            'categories' => $categories,
            'user' => $userData,
        ]);
    }
}
