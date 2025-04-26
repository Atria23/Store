<?php 
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Dashboard', [
            'title' => 'Dashboard Admin',
            'menus' => [
                ['name' => 'Pengguna', 'route' => route('manage-users.index'), 'icon' => 'users'],
                ['name' => 'Kategori', 'route' => route('categories.index'), 'icon' => 'box'],
                ['name' => 'Brand', 'route' => route('brands.index'), 'icon' => 'box'],
                ['name' => 'Tipe', 'route' => route('types.index'), 'icon' => 'box'],
                ['name' => 'Tipe Input', 'route' => route('input-types.index'), 'icon' => 'box'],
                ['name' => 'Produk', 'route' => route('products.index'), 'icon' => 'box'],
                ['name' => 'Rekening Pembayaran', 'route' => route('admin.edit'), 'icon' => 'box'],
                ['name' => 'QRIS', 'route' => route('admin.editQris'), 'icon' => 'box'],
                ['name' => 'Mutasi QRIS', 'route' => route('mutasi-qris.index'), 'icon' => 'box'], 
                ['name' => 'Kelola Deposit', 'route' => route('admin.deposit'), 'icon' => 'box'],
            ]
        ]);
    }
}
