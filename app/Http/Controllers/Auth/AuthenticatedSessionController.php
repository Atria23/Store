<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Notifications\SendOtpNotification;


class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();    // Ini akan cek login email & password
        $request->session()->regenerate();

        $user = Auth::user();

        // Logout sementara supaya belum dianggap fully logged in sebelum OTP verified
        Auth::logout();

        // Generate OTP 6 digit random
        $otp = random_int(100000, 999999);

        // Hash OTP dan simpan di user, plus expiry 5 menit
        $user->otp = Hash::make($otp);
        $user->otp_expires_at = now()->addMinutes(5);
        $user->save();

        // Kirim OTP via email (pakai Notification)
        $user->notify(new SendOtpNotification($otp));

        // Simpan ID user di session untuk validasi OTP nanti
        session(['otp_user_id' => $user->id]);

        // Redirect ke halaman input OTP
        return redirect()->route('otp.form')->with('status', 'Kode OTP telah dikirim ke emailmu.');
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}

