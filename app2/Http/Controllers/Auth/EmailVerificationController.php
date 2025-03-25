<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use App\Http\Controllers\Controller;

class EmailVerificationController extends Controller
{
    /**
     * Menampilkan halaman verifikasi email.
     */
    public function show(Request $request)
    {
        return inertia('Auth/VerifyEmail', [
            'status' => session('status'),
            'isVerified' => $request->user()->hasVerifiedEmail(),
        ]);
    }

    /**
     * Mengirim ulang link verifikasi email.
     */
    public function send(Request $request)
    {
        $request->user()->sendEmailVerificationNotification();

        return back()->with('status', 'verification-link-sent');
    }
}
