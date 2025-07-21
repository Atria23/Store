<?php 

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $username = env('P_U');
        $apiKey = env('P_AK');
        $sign = md5($username . $apiKey . 'depo');

        $deposit = null;

        $data = [
            'cmd' => 'deposit',
            'username' => $username,
            'sign' => $sign,
        ];

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post(config('services.api_server') . '/v1/cek-saldo', $data);

            if ($response->successful()) {
                $deposit = $response['data']['deposit'] ?? null;
            }
        } catch (\Exception $e) {
            // Anda bisa log error jika perlu
            $deposit = null;
        }

        return Inertia::render('Dashboard', [
            'title' => 'Dashboard Admin',
            'deposit_balance' => $deposit,
            'menus' => [
                ['name' => 'Kelola Pengguna', 'route' => route('manage-users.index'), 'icon' => 'users'],
                ['name' => 'Kelola Kategori', 'route' => route('categories.index'), 'icon' => 'box'],
                ['name' => 'Kelola Brand', 'route' => route('brands.index'), 'icon' => 'box'],
                ['name' => 'Kelola Tipe', 'route' => route('types.index'), 'icon' => 'box'],
                ['name' => 'Kelola Tipe Input', 'route' => route('input-types.index'), 'icon' => 'box'],
                ['name' => 'Kelola Produk', 'route' => route('products.index'), 'icon' => 'box'],
                ['name' => 'Kelola Rekening Pembayaran', 'route' => route('admin.edit'), 'icon' => 'box'],
                ['name' => 'Kelola QRIS', 'route' => route('admin.editQris'), 'icon' => 'box'],
                ['name' => 'Mutasi QRIS', 'route' => route('mutasi-qris.index'), 'icon' => 'box'],
                ['name' => 'Kelola Deposit', 'route' => route('admin.deposit'), 'icon' => 'box'],
                ['name' => 'Kelola Riwayat Transaksi', 'route' => route('manage.history'), 'icon' => 'box'],
                ['name' => 'Kelola Affiliator', 'route' => route('manage-affiliators'), 'icon' => 'box'],
                ['name' => 'Deposit Admin', 'route' => route('deposit-admin.create'), 'icon' => 'box'],
            ]
        ]);
    }
}
