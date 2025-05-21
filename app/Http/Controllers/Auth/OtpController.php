<?php

// app/Http/Controllers/Auth/OtpController.php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

use App\Notifications\SendOtpNotification;

class OtpController extends Controller
{

    public function showForm()
    {
        return Inertia::render('Auth/Otp', [
            'status' => session('status'),  // pastikan ini ada
        ]);
    }

    public function verify(Request $request)
    {
        $request->validate([
            'otp' => 'required|digits:6',
        ]);

        $userId = session()->get('otp_user_id');

        if (!$userId) {
            return back()->withErrors(['otp' => 'Session OTP tidak ditemukan.']);
        }

        $user = User::find($userId);

        if (!$user || !$user->otp || !$user->otp_expires_at || $user->otp_expires_at->isPast()) {
            return back()->withErrors(['otp' => 'OTP tidak valid atau kadaluarsa.']);
        }

        if (!Hash::check($request->otp, $user->otp)) {
            return back()->withErrors(['otp' => 'OTP salah.']);
        }

        // Reset OTP
        $user->otp = null;
        $user->otp_expires_at = null;
        $user->save();

        Auth::login($user);
        session()->forget('otp_user_id');

        // Redirect berdasarkan role user
        if ($user->hasRole('super-admin')) {
            return redirect()->intended(route('mimin.dashboard'));
        } elseif ($user->hasRole('admin')) {
            return redirect()->intended(route('admin.dashboard'));
        } else {
            return redirect()->intended(route('user.dashboard'));
        }

        return redirect()->intended('/');
    }

    // app/Http/Controllers/OtpController.php
    public function resend(Request $request)
    {
        $userId = session()->get('otp_user_id');
        $user = User::find($userId);
    
        if (!$user) {
            return back()->withErrors(['otp' => 'Pengguna tidak ditemukan.']);
        }
    
        // Cek OTP expired dari database, bukan session
        if ($user->otp_expires_at && now()->lt($user->otp_expires_at)) {
            return back()->withErrors([
                'otp' => 'Tunggu sampai OTP sebelumnya berakhir.'
            ]);
        }
    
        // Buat kode OTP baru
        $otpCode = rand(100000, 999999);
    
        // Simpan ke database
        $user->otp = Hash::make($otpCode);
        $user->otp_expires_at = now()->addMinutes(5);
        $user->save();
    
        // Kirim OTP
        $user->notify(new SendOtpNotification($otpCode));
    
        return redirect()->route('otp.form')->with('status', 'Kode OTP telah dikirim ke emailmu.');
    }
    
}
