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
    
    
    
    
    
    
    
//     public function store(LoginRequest $request): RedirectResponse
// {
//     $request->authenticate(); // Autentikasi email & password
//     $request->session()->regenerate();

//     $user = Auth::user();

//     // Ambil device token dari cookie
//     $deviceToken = $request->cookie('device_token');

//     // Jika device token cocok, login langsung
//     if ($deviceToken && $user->device_token && hash_equals($user->device_token, $deviceToken)) {
//         Auth::login($user);
//         $request->session()->regenerate();
//         return redirect()->intended('/'); // Arahkan ke dashboard
//     }

//     // Jika tidak cocok, logout dan kirim OTP
//     Auth::logout();
//     $otp = random_int(100000, 999999);
//     $user->otp = Hash::make($otp);
//     $user->otp_expires_at = now()->addMinutes(5);
//     $user->save();

//     $user->notify(new SendOtpNotification($otp));

//     session(['otp_user_id' => $user->id]);

//     return redirect()->route('otp.form')->with('status', 'Kode OTP telah dikirim ke emailmu.');
// }












//     public function store(LoginRequest $request): RedirectResponse
// {
//     $request->authenticate();    
//     $request->session()->regenerate();

//     $user = Auth::user();
//     $deviceToken = $request->cookie('device_token'); // token device lama (jika ada)

//     // Jika device_token cocok dan masih dalam 30 hari, login langsung
//     // if (
//     //     $deviceToken &&
//     //     $user->device_token === $deviceToken &&
//     //     $user->otp_verified_at &&
//     //     $user->otp_verified_at->gt(now()->subDays(30))
//     // ) {
//     //     if ($user->hasRole('super-admin')) {
//     //         return redirect()->intended(route('mimin.dashboard'));
//     //     } elseif ($user->hasRole('admin')) {
//     //         return redirect()->intended(route('admin.dashboard'));
//     //     } else {
//     //         return redirect()->intended(route('user.dashboard'));
//     //     }    }
//     if (
//         $deviceToken &&
//         $user->device_token === $deviceToken &&
//         $user->otp_verified_at &&
//         $user->otp_verified_at->gt(now()->subDays(30))
//     ) {
//         if ($user->hasRole('super-admin')) {
//             return redirect()->intended(route('mimin.dashboard'));
//         } elseif ($user->hasRole('admin')) {
//             return redirect()->intended(route('admin.dashboard'));
//         } else {
//             return redirect()->intended(route('user.dashboard'));
//         }
//     } else {
//         // Redirect ke halaman verifikasi OTP jika device token tidak valid atau OTP kadaluarsa
//         return redirect()->route('otp.form')->with('error', 'Silakan verifikasi OTP untuk melanjutkan.');
//     }
    

//     // Device baru → butuh OTP
//     Auth::logout(); // logout sementara, tunggu OTP

//     // Generate OTP baru
//     $otp = random_int(100000, 999999);

//     $user->otp = Hash::make($otp);
//     $user->otp_expires_at = now()->addMinutes(5);
//     $user->otp_verified_at = null; // reset verifikasi
//     $user->device_token = null;    // reset device lama
//     $user->save();

//     // Kirim OTP
//     $user->notify(new SendOtpNotification($otp));

//     session(['otp_user_id' => $user->id]);

//     return redirect()->route('otp.form')->with('status', 'Kode OTP telah dikirim ke emailmu.');
// }











// public function store(LoginRequest $request): RedirectResponse
// {
//     $request->authenticate();    
//     $request->session()->regenerate();

//     $user = Auth::user();
//     $deviceToken = $request->cookie('device_token'); // token device lama (jika ada)

//     // Jika device_token cocok dan masih dalam 30 hari, login langsung
//     if (
//         $user->device_token === $deviceToken &&
//         $user->otp_verified_at->gt(now()->subDays(30))
//     ) {
//         // Device cocok dan OTP masih berlaku
//         if ($user->hasRole('super-admin')) {
//             return redirect()->intended(route('mimin.dashboard'));
//         } elseif ($user->hasRole('admin')) {
//             return redirect()->intended(route('admin.dashboard'));
//         } else {
//             return redirect()->intended(route('user.dashboard'));
//         }
//     } else {
//         Auth::logout();
    
//         // Generate OTP baru
//         $otp = random_int(100000, 999999);
    
//         $user->otp = Hash::make($otp);
//         $user->otp_expires_at = now()->addMinutes(5);
//         $user->otp_verified_at = null; // reset verifikasi
//         $user->device_token = null;    // reset device lama
//         $user->save();
    
//         // Kirim OTP
//         $user->notify(new SendOtpNotification($otp));
    
//         session(['otp_user_id' => $user->id]);
    
//         return redirect()->route('otp.form')->with('status', 'Kode OTP telah dikirim ke emailmu.');
//     }
    
// }










// public function store(LoginRequest $request): RedirectResponse
// {
//     $request->authenticate();    
//     $request->session()->regenerate();

//     $user = Auth::user();
//     $deviceToken = $request->cookie('device_token');

//     $otpMasihValid = $user->otp_verified_at && $user->otp_verified_at->gt(now()->subDays(30));
//     $deviceSama = $user->device_token && $user->device_token === $deviceToken;

//     if ($deviceSama && $otpMasihValid) {
//         // ✅ Device cocok dan OTP masih berlaku
//         return $this->redirectByRole($user);
//     }

//     // ❌ Device beda atau OTP expired
//     Auth::logout(); // keluarin dulu

//     // Generate dan kirim OTP
//     $otp = random_int(100000, 999999);
//     $user->otp = Hash::make($otp);
//     $user->otp_expires_at = now()->addMinutes(5);
//     $user->otp_verified_at = null;
//     $user->device_token = null;
//     $user->save();

//     $user->notify(new SendOtpNotification($otp));

//     session(['otp_user_id' => $user->id]);

//     return redirect()->route('otp.form')->with('status', 'Kode OTP telah dikirim ke emailmu.');
// }
// private function redirectByRole($user)
// {
//     if ($user->hasRole('super-admin')) {
//         return redirect()->intended(route('mimin.dashboard'));
//     } elseif ($user->hasRole('admin')) {
//         return redirect()->intended(route('admin.dashboard'));
//     }
//     return redirect()->intended(route('user.dashboard'));
// }















// public function store(LoginRequest $request): RedirectResponse
// {
//     $request->authenticate();    
//     $request->session()->regenerate();

//     $user = Auth::user();
//     $deviceToken = $request->cookie('device_token');

//     // DEBUGGING

//     $otpMasihValid = $user->otp_verified_at && $user->otp_verified_at->gt(now()->subDays(30));
//     $deviceSama = $user->device_token && $user->device_token === $deviceToken;

//     // if ($deviceSama && $otpMasihValid) {
//     //     return $this->redirectByRole($user);
//     // }
//     if ($deviceSama && $otpMasihValid) {
//         return redirect()->intended('/'); // arahkan ke route root
//     }
    

//     Auth::logout();

//     $otp = random_int(100000, 999999);
//     $user->otp = Hash::make($otp);
//     $user->otp_expires_at = now()->addMinutes(5);
//     $user->otp_verified_at = null;
//     $user->device_token = null;
//     $user->save();

//     $user->notify(new SendOtpNotification($otp));

//     session(['otp_user_id' => $user->id]);

//     return redirect()->route('otp.form')->with('status', 'Kode OTP telah dikirim ke emailmu.');
// }
// public function store(LoginRequest $request): RedirectResponse
// {
//     $request->authenticate();    
//     $request->session()->regenerate();

//     $user = Auth::user();
//     $deviceToken = $request->cookie('device_token');

//     $otpMasihValid = $user->otp_verified_at && $user->otp_verified_at->gt(now()->subDays(30));
//     $deviceSama = $user->device_token && $user->device_token === $deviceToken;
//     // dd([
//     //     'user_id' => $user->id,
//     //     'user_email' => $user->email,
//     //     'user_device_token' => $user->device_token,
//     //     'request_device_token' => $deviceToken,
//     //     'otp_verified_at' => $user->otp_verified_at,
//     //     'otpMasihValid' => $user->otp_verified_at && $user->otp_verified_at->gt(now()->subDays(30)),
//     //     'deviceSama' => $user->device_token && $user->device_token === $deviceToken,
//     // ]);
//     if ($deviceSama && $otpMasihValid) {
//         // Langsung redirect ke tujuan tanpa minta OTP
//         return redirect()->intended('/');
//     }

//     Auth::logout();

//     $otp = random_int(100000, 999999);
//     $user->otp = Hash::make($otp);
//     $user->otp_expires_at = now()->addMinutes(5);
//     $user->otp_verified_at = null;
//     $user->device_token = null;
//     $user->save();

//     $user->notify(new SendOtpNotification($otp));

//     session(['otp_user_id' => $user->id]);

//     return redirect()->route('otp.form')->with('status', 'Kode OTP telah dikirim ke emailmu.');
// }



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

