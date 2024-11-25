<?php

namespace App\Http\Controllers;

use App\Models\Deposit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminDepositController extends Controller
{
    // Halaman index admin deposit
    public function index()
    {
        // Ambil semua data deposit dan tampilkan dengan Inertia
        $deposits = Deposit::with('user')->orderBy('created_at', 'desc')->get();
        return Inertia::render('AdminDeposits', [
            'deposits' => $deposits
        ]);
    }

    // Konfirmasi deposit
    public function confirm($id)
    {
        $deposit = Deposit::findOrFail($id);

        // Pastikan status deposit adalah 'pending' sebelum diproses
        if ($deposit->status !== 'pending') {
            return response()->json(['message' => 'Deposit sudah diproses.'], 400);
        }

        $user = $deposit->user;

        // Tambahkan saldo ke user
        $user->balance += $deposit->get_saldo;
        $user->save();

        // Perbarui status deposit
        $deposit->status = 'confirmed';
        $deposit->save();

        return response()->json(['message' => 'Deposit berhasil dikonfirmasi.'], 200);
    }

    public function cancelConfirm($id)
    {
        $deposit = Deposit::findOrFail($id);

        if ($deposit->status !== 'confirmed') {
            return response()->json(['message' => 'Deposit belum dikonfirmasi.'], 400);
        }

        $user = $deposit->user;

        // Kurangi saldo user
        $user->balance -= $deposit->get_saldo;
        $user->save();

        // Ubah status kembali ke pending
        $deposit->status = 'pending';
        $deposit->save();

        return response()->json(['message' => 'Konfirmasi deposit dibatalkan.'], 200);
    }

}
