<?php

// namespace App\Http\Controllers\User;

// use App\Http\Controllers\Controller;
// use Illuminate\Http\Request;
// use App\Models\User\Affiliator;
// use Illuminate\Support\Facades\Auth;
// use Inertia\Inertia;

// class AffiliateFriendController extends Controller
// {
//     public function index()
//     {
//         $user = Auth::user();

//         // Cari affiliator berdasarkan user
//         $affiliator = Affiliator::where('user_id', $user->id)->first();

//         // Jika user belum jadi affiliator
//         if (!$affiliator) {
//             return redirect()->route('affiliator.index');
//         }

//         // Ambil referral yang direferensikan oleh affiliator
//         $referrals = $affiliator->referrals()->with('user')->get();

//         return Inertia::render('User/AffiliateFriends', [
//             'referrals' => $referrals,
//         ]);
//     }
// }


























namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User\Affiliator;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AffiliateFriendController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $affiliator = Affiliator::where('user_id', $user->id)->first();

        if (!$affiliator) {
            return redirect()->route('affiliator.index');
        }

        // Ambil referrals dan hitung jumlah transaksi mereka
        $referrals = $affiliator->referrals()
        ->with(['user' => function ($query) {
            $query->withCount('transactions');
        }])
        ->get()
        ->map(function ($referral) {
            return [
                'id' => $referral->id,
                'name' => $referral->user->name ?? '-',
                'transactions_count' => $referral->user->transactions_count ?? 0,
                'created_at' => $referral->user->created_at,
            ];
        });
    
    
        return Inertia::render('User/AffiliateFriends', [
            'referrals' => $referrals,
        ]);
    }
}