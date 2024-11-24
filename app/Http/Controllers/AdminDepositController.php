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
        // Pastikan hanya super-admin yang dapat mengakses halaman ini
        $user = auth()->user();
        if (!$user->hasRole('super-admin')) {
            abort(403, 'You are not authorized to view this page.');
        }

        // Ambil semua data deposit dan tampilkan dengan Inertia
        $deposits = Deposit::with('user')->orderBy('created_at', 'desc')->get();
        return Inertia::render('AdminDeposits', [
            'deposits' => $deposits
        ]);
    }

    // Konfirmasi deposit
    public function confirm($id)
    {
        // Pastikan hanya super-admin yang dapat mengonfirmasi deposit
        $user = auth()->user();
        if (!$user->hasRole('super-admin')) {
            abort(403, 'You are not authorized to perform this action.');
        }

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
}
