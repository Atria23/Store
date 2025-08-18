<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Models\User;
use Inertia\Inertia;

class EnsureOtpNotExpired
{

    protected $otpTimeoutMinutes;    //jika ini diganti, maka app\Http\Controllers\Auth\AuthenticatedSessionController.php juga diganti

    public function __construct()
    {
        $this->otpTimeoutMinutes = config('otp.timeout_minutes');
    }

    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();

         if ($user && $user->otp_verified_at) {
            // Jika waktu terakhir verifikasi OTP sudah lewat dari batas waktu
            if ($user->otp_verified_at->addMinutes($this->otpTimeoutMinutes)->isPast()) {
                Auth::logout();
                return redirect()->route('login')->withErrors([
                    'otp' => 'Session Anda telah kadaluarsa. Silakan verifikasi ulang.'
                ]);
            }
        }

        return $next($request);
    }
}
