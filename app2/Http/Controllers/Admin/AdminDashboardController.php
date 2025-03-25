<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function index()
    {
        $admin = Auth::user(); // Ambil admin yang sedang login
        return Inertia::render('Admin/Dashboard', [
            'admin' => $admin, // Kirim data admin ke tampilan
        ]);
    }
}
