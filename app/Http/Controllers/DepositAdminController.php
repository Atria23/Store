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
        return Inertia::render('DepositAdmin'); // previously: RequestDeposit
    }

    public function store(Request $request)
{
    // Validate the input data
    $request->validate([
        'amount' => 'required|integer|min:200000',
        'bank' => 'required|in:BCA,MANDIRI,BRI,BNI',
        'owner_name' => 'required|string|max:100',
    ]);

    // Log the request data to verify the amount
    Log::info('Request Data:', [
        'amount' => $request->amount,
        'bank' => $request->bank,
        'owner_name' => $request->owner_name,
    ]);

    $username = env('P_U');
    $apiKey = env('P_AK');
    $sign = md5($username . $apiKey . "deposit");

    // Log the payload before sending it
    Log::info('Deposit Request Payload:', [
        'amount' => $request->amount,
        'bank' => strtoupper($request->bank),
        'owner_name' => $request->owner_name,
    ]);

    // Send request to the API
    $response = Http::post('https://api.digiflazz.com/v1/deposit', [
        'username' => $username,
        'amount' => intval($request->input('amount')),
        'bank' => strtoupper($request->bank),
        'owner_name' => $request->owner_name,
        'sign' => $sign,
    ]);

    // Log the full response for debugging
    Log::info('Deposit Response:', ['response' => $response->json()]);

    // Check if the response was successful
    if ($response->successful() && $response->json('data.rc') === '00') {
        // return redirect()->route('deposit-admin.create')->with('success', [
        //     'amount' => $response->json('data.amount'),
        //     'notes' => $response->json('data.notes'),
        // ]);
        return Inertia::render('DepositAdmin', [
            'alert' => [
                'type' => 'success',
                'message' => 'Deposit berhasil!',
                'amount' => $response->json('data.amount'),
                'notes' => $response->json('data.notes'),
            ]
        ]);
    }
    

    // Log the error if the request failed
    Log::error('Deposit request failed', ['response' => $response->json()]);
    return back()->withErrors(['api' => 'Gagal mengirim permintaan deposit.']);
}



}
