<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UserDashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user(); // Ambil user yang sedang login
        return Inertia::render('User/Dashboard', [
            'user' => $user, // Kirim data user ke tampilan
        ]);
    }
}
