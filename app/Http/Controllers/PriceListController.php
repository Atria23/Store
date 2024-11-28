<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PriceList;
use App\Models\Product;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class PriceListController extends Controller
{
    /**
     * Fetch the price list from the external API and update the database.
     */

    public function fetchPriceList()
    {
        // Ambil waktu pembaruan terakhir dari tabel produk
        $lastUpdated = Product::max('updated_at');

        if ($lastUpdated) {
            // Konversi ke instance Carbon
            $lastUpdatedCarbon = Carbon::parse($lastUpdated);

            // Hitung waktu pembaruan berikutnya (minimal 2 menit)
            $nextUpdateTime = $lastUpdatedCarbon->addMinutes(2);

            // Jika sekarang kurang dari waktu pembaruan berikutnya, log pesan error
            if (now()->lt($nextUpdateTime)) {
                $timeRemaining = now()->diffInSeconds($nextUpdateTime, false);

                Log::info("Pembaruan data ditunda. Data baru bisa diperbarui dalam {$timeRemaining} detik. Waktu update berikutnya: {$nextUpdateTime->toDateTimeString()}.");

                // Berhenti tanpa melanjutkan proses update
                return;
            }
        }

        // Lakukan pembaruan data
        $username = env('P_U');
        $apiKey = env('P_AK');
        $sign = md5($username . $apiKey . "pricelist");

        $response = Http::post('https://api.digiflazz.com/v1/price-list', [
            'cmd' => 'prepaid',
            'username' => $username,
            'sign' => $sign,
        ]);

        if ($response->successful()) {
            foreach ($response->json()['data'] as $item) {
                PriceList::updateOrCreate(
                    ['buyer_sku_code' => $item['buyer_sku_code']],  // Unik berdasarkan buyer_sku_code
                    [
                        'product_name' => $item['product_name'],
                        'category' => $item['category'],
                        'brand' => $item['brand'],
                        'type' => $item['type'],
                        'seller_name' => $item['seller_name'],
                        'price' => $item['price'],
                        'buyer_sku_code' => $item['buyer_sku_code'],
                        'buyer_product_status' => $item['buyer_product_status'],
                        'seller_product_status' => $item['seller_product_status'],
                        'unlimited_stock' => $item['unlimited_stock'],
                        'stock' => $item['stock'],
                        'multi' => $item['multi'],
                        'start_cut_off' => $item['start_cut_off'],
                        'end_cut_off' => $item['end_cut_off'],
                        'desc' => $item['desc'],
                        'updated_at' => now(),
                    ]
                );
            }

            Log::info("Data berhasil diperbarui pada " . now()->toDateTimeString() . ".");
            return;
        }

        // Jika API tidak berhasil, log pesan error
        Log::error("Gagal memperbarui data dari API.");
    }
     
     
    /**
     * Show the page with Pulsa products, ensuring data is updated first.
     */

    public function showAllProducts()
    {
        // Perbarui data hanya sekali sebelum menampilkan
        $this->fetchPriceList();
    
        // Ambil semua data produk
        $products = Product::all();
    
        // Kirim data ke komponen React menggunakan Inertia
        return Inertia::render('AllProducts', [
            'products' => $products
        ]);
    }
    
    public function showPulsaProducts()
    {
        // Perbarui data hanya sekali sebelum menampilkan
        $this->fetchPriceList();

        // Ambil data produk dengan kategori 'pulsa'
        $products = Product::where('category', 'pulsa')->get();

        // Kirim data ke komponen React menggunakan Inertia
        return Inertia::render('PulsaPriceList', [
            'products' => $products
        ]);
    }

    public function showFreeFireProducts()
    {
        // Perbarui data hanya sekali sebelum menampilkan
        $this->fetchPriceList();

        // Ambil data produk dengan brand 'free fire'
        $products = Product::where('brand', 'free fire')->get();

        // Kirim data ke komponen React menggunakan Inertia
        return Inertia::render('FreeFirePriceList', [
            'products' => $products
        ]);
    }

}