<?php

namespace App\Http\Controllers;

use App\Models\Deposit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KelolaDepositController extends Controller
{
    // Halaman index admin deposit
    public function index()
    {
        // Ambil semua data deposit dan tampilkan dengan Inertia
        $deposits = Deposit::with('user')->orderBy('created_at', 'desc')->get();
        return Inertia::render('KelolaDeposits', [
            'deposits' => $deposits
        ]);
    }

    // Konfirmasi deposit
    public function confirm($id)
    {
        $deposit = Deposit::findOrFail($id);

        // Pastikan status deposit adalah 'pending' sebelum diproses
        if ($deposit->status !== 'pending') {
            // Tambahkan pesan flash untuk error
            session()->flash('error', 'Deposit sudah diproses.');
            return redirect()->back();
        }

        $user = $deposit->user;

        // Tambahkan saldo ke user
        $user->balance += $deposit->get_saldo;
        $user->save();

        // Perbarui status deposit
        $deposit->status = 'confirmed';
        $deposit->save();

        // Tambahkan pesan flash untuk success
        session()->flash('success', 'Deposit berhasil dikonfirmasi.');
        return redirect()->back();
    }

    public function cancelConfirm($id)
    {
        $deposit = Deposit::findOrFail($id);

        if ($deposit->status !== 'confirmed') {
            // Tambahkan pesan flash untuk error
            session()->flash('error', 'Deposit belum dikonfirmasi.');
            return redirect()->back();
        }

        $user = $deposit->user;

        // Kurangi saldo user
        $user->balance -= $deposit->get_saldo;
        $user->save();

        // Ubah status kembali ke pending
        $deposit->status = 'pending';
        $deposit->save();

        // Tambahkan pesan flash untuk success
        session()->flash('success', 'Konfirmasi deposit dibatalkan.');
        return redirect()->back();
    }
}
