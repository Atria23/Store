<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Wallet;

class WalletController extends Controller
{
    public function edit()
    {
        // Ambil wallet milik user yang login
        $wallet = Wallet::where('user_id', auth()->id())->first();

        return inertia('Wallet', ['wallet' => $wallet]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'shopeepay' => 'nullable|string',
            'dana' => 'nullable|string',
            'gopay' => 'nullable|string',
            'ovo' => 'nullable|string',
            'linkaja' => 'nullable|string',
        ]);

        // Ambil wallet milik user yang login
        $wallet = Wallet::where('user_id', auth()->id())->first();

        // Jika wallet belum ada, buat baru
        if (!$wallet) {
            $wallet = Wallet::create([
                'user_id' => auth()->id(),
                'shopeepay' => $request->shopeepay,
                'dana' => $request->dana,
                'gopay' => $request->gopay,
                'ovo' => $request->ovo,
                'linkaja' => $request->linkaja,
            ]);
        } else {
            // Update wallet yang sudah ada
            $wallet->update($request->only([
                'shopeepay',
                'dana',
                'gopay',
                'ovo',
                'linkaja',
            ]));
        }

        return redirect()->route('wallet.edit')->with('success', 'Wallet updated successfully.');
    }

    public function editQris()
    {
        // Ambil wallet milik user yang login
        $wallet = Wallet::where('user_id', auth()->id())->first();

        // Kirim data wallet ke halaman QRIS
        return inertia('Qris', ['wallet' => $wallet]);
    }

    public function updateQris(Request $request)
    {
        $request->validate([
            'qris' => 'nullable|string',
            'qris_manual' => 'nullable|string',
        ]);

        // Update kolom qris dan qris_manual untuk semua pengguna
        Wallet::query()->update([
            'qris' => $request->qris,
            'qris_manual' => $request->qris_manual,
        ]);

        return redirect()->route('wallet.edit')->with('success', 'QRIS updated successfully for all users.');
    }
}
