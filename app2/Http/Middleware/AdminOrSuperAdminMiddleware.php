<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;

class AdminOrSuperAdminMiddleware
{
    public function handle($request, Closure $next)
    {
        if (Auth::check() && (Auth::user()->hasRole('super-admin') || Auth::user()->hasRole('admin'))) {
            return $next($request);
        }

        abort(403, 'Unauthorized');
    }
}
