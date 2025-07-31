<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\RedeemAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RedeemAccountController extends Controller
{
    public function index()
    {
        $accounts = RedeemAccount::where('user_id', Auth::id())->get();

        return Inertia::render('User/RedeemAccount/Index', [
            'accounts' => $accounts,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'method' => 'required|in:dana,shopeepay,seabank,bri',
            'account_name' => 'required|string|max:100',
            'account_number' => 'required|string|max:100',
        ]);

        RedeemAccount::create([
            'user_id' => Auth::id(),
            'method' => $request->method,
            'account_name' => $request->account_name,
            'account_number' => $request->account_number,
        ]);

        return redirect()->back()->with('success', 'Akun berhasil disimpan.');
    }

    public function update(Request $request, RedeemAccount $redeemAccount)
    {
        $this->authorize('update', $redeemAccount);

        $request->validate([
            'method' => 'required|in:dana,shopeepay,seabank,bri',
            'account_name' => 'required|string|max:100',
            'account_number' => 'required|string|max:100',
        ]);

        $redeemAccount->update($request->only(['method', 'account_name', 'account_number']));

        return redirect()->back()->with('success', 'Akun berhasil diperbarui.');
    }

    public function destroy(RedeemAccount $redeemAccount)
    {
        $this->authorize('delete', $redeemAccount);
        $redeemAccount->delete();

        return redirect()->back()->with('success', 'Akun berhasil dihapus.');
    }
}
