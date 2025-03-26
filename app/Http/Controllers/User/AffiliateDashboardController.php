<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\User\AffiliateHistory;
use App\Models\User\Affiliator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AffiliateDashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Ambil data affiliator berdasarkan user yang sedang login
        $affiliator = Affiliator::where('user_id', $user->id)->first();

        // Jika user tidak memiliki affiliator, tampilkan pesan error
        if (!$affiliator) {
            return redirect()->route('affiliator.index');
        }        

        // Ambil semua referral (orang yang direferensikan user ini)
        $referrals = $affiliator->referrals()->with('user')->get();

        // Ambil riwayat affiliate berdasarkan affiliator yang sedang login
        $affiliateHistory = AffiliateHistory::where('affiliator_id', $affiliator->id)
            ->with(['transaction', 'affiliateProduct'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('User/AffiliateDashboard', [
            'affiliator' => $affiliator,
            'referrals' => $referrals,
            'affiliateHistory' => $affiliateHistory,
        ]);
    }
}
