<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User\Affiliator;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ManageAffiliatorController extends Controller
{
    public function index(Request $request)
    {
        $affiliators = Affiliator::with([
            'user',
            'referrals.user' => function ($query) {
                $query->withCount('transactions');
            }
        ])
        ->get()
        ->map(function ($affiliator) {
            return [
                'id' => $affiliator->id,
                'referral_code' => $affiliator->referral_code,
                'name' => $affiliator->user->name ?? '-',
                'email' => $affiliator->user->email ?? '-',
                'joined_at' => $affiliator->user->created_at,
                'referrals' => $affiliator->referrals->map(function ($referral) {
                    return [
                        'id' => $referral->id,
                        'name' => $referral->user->name ?? '-',
                        'email' => $referral->user->email ?? '-',
                        'transactions_count' => $referral->user->transactions_count ?? 0,
                        'joined_at' => $referral->user->created_at,
                    ];
                }),
            ];
        });

        return Inertia::render('ManageAffiliators', [
            'affiliators' => $affiliators,
        ]);
    }
}
