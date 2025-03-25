<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PriceList;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Type;
use App\Models\Barang;
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
            $lastUpdatedCarbon = Carbon::parse($lastUpdated);
            $nextUpdateTime = $lastUpdatedCarbon->addMinutes(1);

            if (now()->lt($nextUpdateTime)) {
                $timeRemaining = now()->diffInSeconds($nextUpdateTime, false);
                Log::info("Pembaruan data ditunda. Update berikutnya dalam {$timeRemaining} detik.");
                return;
            }
        }

        // Ambil API credentials
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
                // Update atau buat ulang data produk
                PriceList::updateOrCreate(
                    ['buyer_sku_code' => $item['buyer_sku_code']],
                    [
                        'product_name' => $item['product_name'],
                        'category' => $item['category'],
                        'brand' => $item['brand'],
                        'type' => $item['type'],
                        'seller_name' => $item['seller_name'],
                        'price' => $item['price'],
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

                // Update kategori jika ada
                if (!empty($item['category'])) {
                    Category::updateOrCreate(
                        ['name' => $item['category']],
                        ['updated_at' => now()]
                    );
                };

                // Update brand jika ada
                if (!empty($item['brand']) && !empty($item['category'])) {
                    $category = Category::where('name', $item['category'])->first();

                    if ($category) {
                        Brand::updateOrCreate(
                            [
                                'name' => $item['brand'],
                                'category_id' => $category->id, // Pastikan category_id selalu ada
                            ],
                            [
                                'updated_at' => now(),
                            ]
                        );
                    }
                };

                if (!empty($item['type']) && !empty($item['brand']) && !empty($item['category'])) {
                    $brand = Brand::where('name', $item['brand'])->first();
                    $category = Category::where('name', $item['category'])->first();
                
                    if ($brand && $category) {
                        Type::updateOrCreate(
                            [
                                'name' => $item['type'],
                                'brand_id' => $brand->id,
                                'category_id' => $category->id,
                            ],
                            [
                                'updated_at' => now(),
                            ]
                        );
                    }
                };
                
                if (!empty($item['type']) && !empty($item['brand']) && !empty($item['category']) && !empty($item['buyer_sku_code'])) {
                    $brand = Brand::where('name', $item['brand'])->first();
                    $category = Category::where('name', $item['category'])->first();
                    $type = Type::where('name', $item['type'])->first();
                    
                    // Ambil data dari PriceList menggunakan Eloquent
                    PriceList::all();

                    if ($brand && $category && $type) {
                        Barang::updateOrCreate(
                            [
                                'buyer_sku_code' => $item['buyer_sku_code'], // Identifikasi unik
                            ],
                            [
                                'product_name' => $item['product_name'], // Menggunakan type sebagai nama barang
                                'brand_id' => $brand->id,
                                'category_id' => $category->id,
                                'type_id' => $type->id,
                                'input_type_id' => $inputType->id ?? null, // InputType opsional
                                'price' => $item['price'], // Harga sebagai string
                                'buyer_product_status' => $item['buyer_product_status'], // Boolean
                                'seller_product_status' => $item['seller_product_status'], // Boolean
                                'unlimited_stock' => !empty($item['unlimited_stock']) ? (bool) $item['unlimited_stock'] : false, // Boolean
                                'stock' => !empty($item['stock']) ? (string) $item['stock'] : null, // Stok sebagai string atau null
                                'multi' => !empty($item['multi']) ? (bool) $item['multi'] : false, // Boolean
                                'start_cut_off' => $item['start_cut_off'], // Ambil dari item atau PriceList
                                'end_cut_off' => $item['end_cut_off'], // Ambil dari item atau PriceList
                                'desc' => $item['desc'] ?? null, // Deskripsi
                                'updated_at' => now(),
                            ]
                        );
                    }
                };               
            }

            Log::info("Data berhasil diperbarui pada " . now()->toDateTimeString() . ".");
            return;
        }

        Log::error("Gagal memperbarui data dari API.");
    }

    /**
     * Show all products
     */
    public function showAllProducts()
    {
        $this->fetchPriceList();
        $products = Product::all();

        return Inertia::render('AllProducts', [
            'products' => $products
        ]);
    }

    /**
     * Show pulsa products
     */
    public function showPulsaProducts()
    {
        $this->fetchPriceList();
        $products = Product::where('category', 'pulsa')->get();

        return Inertia::render('PulsaPriceList', [
            'products' => $products
        ]);
    }

    /**
     * Show Free Fire products
     */
    public function showFreeFireProducts()
    {
        $this->fetchPriceList();
        $products = Product::where('brand', 'free fire')->get();

        return Inertia::render('FreeFirePriceList', [
            'products' => $products
        ]);
    }
}
