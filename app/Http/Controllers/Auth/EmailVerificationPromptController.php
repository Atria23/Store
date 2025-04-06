<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationPromptController extends Controller
{
    /**
     * Display the email verification prompt.
     */

    // public function __invoke(Request $request): RedirectResponse|Response
    // {
    //     return $request->user()->hasVerifiedEmail()
    //                 ? redirect()->intended(route('user.dashboard', absolute: false))
    //                 : Inertia::render('Auth/VerifyEmail', ['status' => session('status')]);
    // }

    public function __invoke(Request $request): RedirectResponse|Response
    {
        return $request->user()->hasVerifiedEmail()
                    ? redirect()->intended(route('verification.notice', absolute: false))
                    : Inertia::render('Auth/VerifyEmail', ['status' => session('status')]);
    }
}
