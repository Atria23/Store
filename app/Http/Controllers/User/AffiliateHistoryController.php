<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\User\AffiliateHistory;
use App\Models\User\Affiliator;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AffiliateHistoryController extends Controller
{
    /**
     * User biasa melihat riwayat affiliate history berdasarkan affiliator miliknya sendiri.
     */
    public function show(Request $request)
    {
        $user = Auth::user();

        // Cari affiliator berdasarkan user yang login
        $affiliator = Affiliator::where('user_id', $user->id)->first();

        // Jika user tidak memiliki affiliator, tolak akses
        if (!$affiliator) {
            abort(403, 'Unauthorized action.');
        }

        return $this->getAffiliateHistory($affiliator->id);
    }

    /**
     * Admin atau Super Admin melihat riwayat affiliate history berdasarkan affiliator_id yang dipilih.
     */
    public function showForAdmin($affiliator_id)
    {
        return $this->getAffiliateHistory($affiliator_id);
    }

    /**
     * Fungsi utama untuk mengambil data affiliate history berdasarkan affiliator_id.
     */
    private function getAffiliateHistory($affiliator_id)
    {
        $transactions = AffiliateHistory::where('affiliator_id', $affiliator_id)
    ->with(['transaction.user']) // Tambahkan 'user' di dalam relasi transaction
    ->get()
    ->map(function ($record) {
        $record->affiliate_product = DB::table('affiliate_products')->where('id', $record->affiliate_product_id)->first();
        return $record;
    });


        // Ambil store berdasarkan user_id dari affiliator
        $affiliator = Affiliator::where('id', $affiliator_id)->first();
        if (!$affiliator) {
            abort(404, 'Affiliator not found.');
        }

        $store = Store::where('user_id', $affiliator->user_id)->first();

        return Inertia::render('User/AffiliateHistory', [
            'transactions' => $transactions,
            'params' => ['affiliator_id' => $affiliator_id],
            'store' => $store ? [
                'name' => $store->name,
                'address' => $store->address,
                'phone_number' => $store->phone_number,
                'image' => $store->image ? asset('storage/' . $store->image) : null,
            ] : null, 
        ]);
    }

    public function showDetail($id)
{
    $user = Auth::user();
    $affiliator = Affiliator::where('user_id', $user->id)->firstOrFail();

    $transaction = AffiliateHistory::with(['transaction.user'])
        ->where('id', $id)
        ->where('affiliator_id', $affiliator->id)
        ->firstOrFail();

    $transaction->affiliate_product = DB::table('affiliate_products')
        ->where('id', $transaction->affiliate_product_id)
        ->first();

    return Inertia::render('User/AffiliateHistoryDetail', [
        'transaction' => $transaction,
    ]);
}


}
