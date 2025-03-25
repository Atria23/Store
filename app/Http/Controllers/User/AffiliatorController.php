<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\User\Affiliator;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class AffiliatorController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $affiliator = Affiliator::where('user_id', $user->id)->first();
    
        // Ambil referral_code dari affiliator teman jika ada
        $affiliateByCode = null;
        if ($affiliator && $affiliator->affiliate_by) {
            $affiliateByCode = Affiliator::where('id', $affiliator->affiliate_by)->value('referral_code');
        }
    
        return Inertia::render('User/Affiliator/Form', [
            'affiliator' => [
                'referral_code' => $affiliator->referral_code ?? null,
                'affiliate_by' => $affiliator->affiliate_by ?? null, // Masih simpan sebagai ID
                'affiliate_by_code' => $affiliateByCode, // Kirim referral_code untuk ditampilkan
            ]
        ]);
    }
    public function save(Request $request)
    {
        $user = Auth::user();
        $affiliator = Affiliator::firstOrNew(['user_id' => $user->id]);

        // Validasi referral_code hanya jika berubah
        $rules = [
            'referral_code' => 'nullable|string|unique:affiliators,referral_code,' . $user->id . ',user_id',
        ];

        // Validasi affiliate_by hanya jika berubah
        if ($request->affiliate_by !== $affiliator->affiliate_by) {
            $rules['affiliate_by'] = 'nullable|exists:affiliators,referral_code';
        }

        $request->validate($rules);

        // Set nilai baru jika ada perubahan
        $affiliator->referral_code = $request->referral_code;
        
        if ($request->affiliate_by !== $affiliator->affiliate_by) {
            $affiliateBy = Affiliator::where('referral_code', $request->affiliate_by)->value('id');
            $affiliator->affiliate_by = $affiliateBy;
        }

        // Simpan ke database
        $affiliator->save();

        return redirect()->route('affiliator.index')->with('success', 'Data affiliator berhasil disimpan!');
    }

}
