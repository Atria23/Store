<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DepositAdminController extends Controller
{
    public function create()
    {
        return Inertia::render('DepositAdmin'); // sebelumnya: RequestDeposit
    }

    public function store(Request $request)
    {
        $request->validate([
            'amount' => 'required|integer|min:200000',
            'bank' => 'required|in:BCA,MANDIRI,BRI,BNI',
            'owner_name' => 'required|string|max:100',
        ]);

        $username = env('P_U');
        $apiKey = env('P_AK');
        $sign = md5($username . $apiKey . "deposit");

        $response = Http::post('https://api.digiflazz.com/v1/deposit', [
            'username' => $username,
            'amount' => $request->amount,
            'bank' => strtoupper($request->bank),
            'owner_name' => $request->owner_name,
            'sign' => $sign,
        ]);

        if ($response->successful() && $response->json('data.rc') === '00') {
            $amount = number_format($response->json('data.amount'));
            $notes = $response->json('data.notes');
            $message = "Silakan transfer sebesar Rp{$amount} dengan berita: {$notes}";
            
            return redirect()->route('deposit-admin.create')->with('success', $message);
            
        }

        Log::error('Deposit request failed', ['response' => $response->json()]);
        return back()->withErrors(['api' => 'Gagal mengirim permintaan deposit.']);
    }
}
