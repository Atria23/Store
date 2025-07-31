<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User\PoinmuHistory;
use App\Models\User;
use App\Models\RedeemAccount;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PoinmuController extends Controller
{
    // Menampilkan dashboard poinmu
    public function index()
    {
        $user = Auth::user();

        // return Inertia::render('User/PoinmuDashboard', [
        //     'user' => $user->only(['id', 'name', 'points', 'balance']),
        //     'poinmuHistory' => PoinmuHistory::where('user_id', $user->id)->latest()->get(),
        // ]);
        $redeemAccounts = RedeemAccount::where('user_id', auth()->id())->get()->keyBy('redeem_method');

        return Inertia::render('User/PoinmuDashboard', [
            'user' => $user->only(['id', 'name', 'points', 'balance']),
            'poinmuHistory' => PoinmuHistory::where('user_id', $user->id)->latest()->get(),
            'redeemAccounts' => $redeemAccounts, // ← kirim ke frontend
        ]);
    }

    // Proses redeem poin
    // public function redeem(Request $request)
    // {
    //     $user = Auth::user();
    //     $request->validate([
    //         'points' => 'required|integer|min:1',
    //     ]);

    //     $redeemPoints = $request->points;

    //     if ($redeemPoints > $user->points) {
    //         return redirect()->back()->withErrors(['error' => 'Poin tidak cukup untuk diredeem.']);
    //     }

    //     DB::transaction(function () use ($user, $redeemPoints) {
    //         // Kurangi poin pengguna
    //         $previousPoints = $user->points;
    //         $newPoints = $previousPoints - $redeemPoints;

    //         // Tambahkan saldo pengguna
    //         $previousBalance = $user->balance;
    //         $newBalance = $previousBalance + $redeemPoints;

    //         // Perbarui user data
    //         $user->update([
    //             'points' => $newPoints,
    //             'balance' => $newBalance,
    //         ]);

    //         // Catat ke riwayat poinmu
    //         PoinmuHistory::create([
    //             'user_id' => $user->id,
    //             'transaction_id' => null, // Tidak terkait transaksi
    //             'type' => 'redeem',
    //             'points' => -$redeemPoints,
    //             'previous_points' => $previousPoints,
    //             'new_points' => $newPoints,
    //             'description' => "Menukarkan $redeemPoints poin menjadi saldo.",
    //         ]);
    //     });

    //     return redirect()->back()->with('success', 'Poin berhasil diredeem!');
    // }
    public function redeem(Request $request)
    {
        $user = Auth::user();
        $validated = $request->validate([
            'points' => 'required|integer|min:1',
            'redeem_method' => 'required|string',
            'destination' => 'nullable|string',
            'account_name' => 'nullable|string',
        ]);

        $redeemPoints = $validated['points'];
        $method = $validated['redeem_method'];
        $destination = $validated['destination'];
        $accountName = $validated['account_name'];

        if ($redeemPoints > $user->points) {
            return redirect()->back()->withErrors(['error' => 'Poin tidak cukup untuk diredeem.']);
        }

        DB::transaction(function () use ($user, $redeemPoints, $method, $destination, $accountName) {
            $previousPoints = $user->points;
            $newPoints = $previousPoints - $redeemPoints;

            $updateData = ['points' => $newPoints];

            if ($method === 'dompetmu') {
                $updateData['balance'] = $user->balance + $redeemPoints;
            }

            $user->update($updateData);

            if ($method !== 'dompetmu') {
                RedeemAccount::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'redeem_method' => $method,
                    ],
                    [
                        'destination' => $destination,
                        'account_name' => $accountName,
                    ]
                );
            }

            PoinmuHistory::create([
                'user_id' => $user->id,
                'transaction_id' => null,
                'type' => 'redeem',
                'points' => -$redeemPoints,
                'previous_points' => $previousPoints,
                'new_points' => $newPoints,
                'redeem_method' => $method,
                'destination' => $method === 'dompetmu' ? null : $destination,
                'status' => $method === 'dompetmu' ? 'sukses' : 'pending', // ← status dinamis
                'description' => match ($method) {
                    'dompetmu' => "Menukarkan " . number_format($redeemPoints, 0, ',', '.') . " poin ke DompetMu .",
                    default => "Menukarkan " . number_format($redeemPoints, 0, ',', '.') . " poin ke $method: $destination a.n. $accountName.",
                },

            ]);

        });


        return redirect()->back()->with('success', 'Poin berhasil diredeem!');
    }



}
