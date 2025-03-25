<?php

namespace App\Http\Controllers;

use App\Models\AffiliateProduct;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AffiliateProductController extends Controller
{
    // Menampilkan semua produk afiliasi
    public function index()
    {
        $affiliateProducts = AffiliateProduct::all();

        return Inertia::render('AffiliateProducts/Index', [
            'affiliateProducts' => $affiliateProducts,
        ]);
    }

    // Menampilkan produk afiliasi berdasarkan ID
    public function show($id)
    {
        $affiliateProduct = AffiliateProduct::findOrFail($id);

        return Inertia::render('AffiliateProducts/Show', [
            'affiliateProduct' => $affiliateProduct,
        ]);
    }
}
