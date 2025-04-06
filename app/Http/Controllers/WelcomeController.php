<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Transaction;
use App\Models\User\Affiliator;
use App\Models\Product;
use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;

class WelcomeController extends Controller
{
    public function index()
    {
        if (Auth::check()) {
            $user = Auth::user();
    
            if ($user->roles()->where('role_id', 4)->exists()) {
                return redirect()->route('apps.dashboard');
            }
    
            if ($user->roles()->where('role_id', 6)->exists()) {
                return redirect()->route('admin.dashboard');
            }
    
            return redirect()->route('user.dashboard');
        }

        $statsData = [
            [
                'value' => number_format(User::count() + 1998, 0, ',', '.'),
                'label' => 'Pembeli',
            ],
            [
                'value' => number_format(Transaction::count() + 10115, 0, ',', '.'),
                'label' => 'Transaksi',
            ],
            [
                'value' => number_format(Affiliator::count(), 0, ',', '.'),
                'label' => 'Affiliator',
            ],
            [
                'value' => number_format(Product::count(), 0, ',', '.'),
                'label' => 'Produk',
            ],
        ];

        return Inertia::render('Welcome', [
            'statsData' => $statsData,
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
            ]);
    }
}
