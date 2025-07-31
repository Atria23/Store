<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\User\PoinmuHistory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\RedeemAccount;

use Illuminate\Support\Facades\DB;

class PoinmuHistoryController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        // Ambil history poin pengguna yang sedang login
        $poinmuHistory = PoinmuHistory::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

             $redeemAccounts = RedeemAccount::where('user_id', auth()->id())->get()->keyBy('redeem_method');

        return Inertia::render('User/PoinmuHistory', [
            'user' => $user->only(['id', 'name', 'points', 'balance']),
            'poinmuHistory' => $poinmuHistory,
            'redeemAccounts' => $redeemAccounts, // ← kirim ke frontend
        ]);
    }

    // public function show($id)
    // {
    //     $user = auth()->user();

    //     $history = PoinmuHistory::where('user_id', $user->id)
    //         ->where('id', $id)
    //         ->firstOrFail();

    //     $redeemAccounts = RedeemAccount::where('user_id', auth()->id())->get()->keyBy('redeem_method');

    //     return Inertia::render('User/PoinmuHistoryDetail', [
    //         'history' => $history,
    //         'redeemAccounts' => $redeemAccounts,
    //     ]);
    // }
    public function show($id)
{
    $user = auth()->user();

    $history = PoinmuHistory::with('user')->findOrFail($id);

    // Validasi akses: hanya pemilik atau super-admin atau admin
    if (!($user->id == $history->user_id || $user->hasRole('super-admin'))) {
        abort(403, 'Unauthorized');
    }

    $redeemAccounts = RedeemAccount::where('user_id', $history->user_id)
        ->get()
        ->keyBy('redeem_method');

    return Inertia::render('User/PoinmuHistoryDetail', [
        'history' => $history,
        'redeemAccounts' => $redeemAccounts,
    ]);
}


    public function manage()
    {
        // Ambil semua riwayat poinmu dari semua user tanpa pagination
        $poinmuHistory = PoinmuHistory::with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('ManagePoinmuHistory', [
            'poinmuHistory' => $poinmuHistory,
        ]);
    }

    // public function updateStatus(Request $request, $id)
    // {
    //     $history = PoinmuHistory::findOrFail($id);
    //     $history->status = $request->status;
    //     $history->save();

    //     return redirect()->back()->with('success', 'Status berhasil diperbarui.');
    // }

    public function updateStatus(Request $request, $id)
{
    $history = PoinmuHistory::findOrFail($id);
    $user = $history->user;

    $oldStatus = $history->status;
    $newStatus = $request->status;

    // Jika status diubah ke gagal dan sebelumnya bukan gagal
    if ($newStatus === 'gagal' && $oldStatus !== 'gagal') {
        DB::transaction(function () use ($history, $user, $newStatus) {
            // Hitung poin saat ini
            $currentPoints = $user->points;
            $restoredPoints = abs($history->points); // pastikan positif (karena sebelumnya dikurang)

            // Update user
            $user->update([
                'points' => $currentPoints + $restoredPoints,
            ]);

            // Update history (status & points user)
            $history->update([
                'status' => $newStatus,
                'description' => $history->description . ' (dibatalkan dan poin dikembalikan)',
            ]);
        });
    } else {
        // Status biasa tanpa pengembalian
        $history->update([
            'status' => $newStatus,
        ]);
    }

    return redirect()->back()->with('success', 'Status berhasil diperbarui.');
}


}
