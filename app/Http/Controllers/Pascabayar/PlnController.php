<?php

// Namespace sekarang ada di dalam Pascabayar
namespace App\Http\Controllers\Pascabayar;

// Class-class yang di-import ini tidak berubah karena mereka menggunakan path absolut
use App\Http\Controllers\Controller; // Import Controller dasar
use App\Models\Barang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class PlnController extends Controller // Pastikan extends Controller
{
    /**
     * Menampilkan halaman inquiry PLN.
     */
    public function show()
    {
        $plnProducts = Barang::whereHas('brand', function ($query) {
                $query->where('name', 'like', 'PLN%');
            })
            ->where('buyer_product_status', true)
            ->orderBy('price', 'asc')
            ->get()
            // ... mapping ...
            ->map(function ($barang) {
                return [
                    'product_name' => $barang->product_name,
                    'price' => $barang->price,
                    'sell_price' => $barang->product_price ?? $barang->price,
                    'buyer_sku_code' => $barang->buyer_sku_code,
                ];
            });

        // Menyesuaikan path render agar cocok dengan struktur folder
        return Inertia::render('Pascabayar/PLN/Inquiry', [
            'products' => $plnProducts,
        ]);
    }

    /**
     * Menangani request inquiry (versi Inertia).
     */
    public function inquiry(Request $request)
    {
        $request->validate([
            'customer_no' => 'required|string|min:10',
        ]);

        $username = env('P_U');
        $apiKey = env('P_AK');
        $customerNo = $request->input('customer_no');
        $signature = md5($username . $apiKey . $customerNo);

        $response = Http::post(config('services.api_server') . '/v1/inquiry-pln', [
            'username' => $username,
            'customer_no' => $customerNo,
            'sign' => $signature,
        ]);

        if ($response->failed()) {
            return Redirect::back()->withErrors(['customer_no' => 'Gagal terhubung ke server provider.']);
        }

        $data = $response->json()['data'];

        if ($data['rc'] !== '00') {
            return Redirect::back()->withErrors(['customer_no' => $data['message'] ?? 'Nomor pelanggan tidak valid.']);
        }

        return Redirect::back()->with('inquiryResult', [
            'name' => $data['name'],
            'customer_no' => $data['customer_no'],
            'segment_power' => $data['segment_power'],
        ]);
    }
}