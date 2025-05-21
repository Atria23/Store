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
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();

        if ($user && $user->otp_expires_at && $user->otp_expires_at->isPast()) {
            Auth::logout();
            return redirect()->route('otp.form')->withErrors([
                'otp' => 'Session OTP Anda telah kadaluarsa. Silakan login ulang.'
            ]);
        }

        return $next($request);
    }
}
