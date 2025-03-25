<?php

namespace App\Services;

use App\Models\PriceList;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Type;
use App\Models\InputType;
use App\Models\Barang;
class PriceListService
{
    /**
     * Fetch and update the price list from the external API.
     */
    public function fetchAndUpdatePriceList()
    {
        // Ambil waktu pembaruan terakhir dari tabel produk
        $lastUpdated = Product::max('updated_at');

        if ($lastUpdated) {
            // Konversi ke instance Carbon
            $lastUpdatedCarbon = Carbon::parse($lastUpdated);

            // Hitung waktu pembaruan berikutnya (minimal 1 menit)
            $nextUpdateTime = $lastUpdatedCarbon->addMinutes(1);

            // Jika sekarang kurang dari waktu pembaruan berikutnya, log pesan error
            if (now()->lt($nextUpdateTime)) {
                $timeRemaining = now()->diffInSeconds($nextUpdateTime, false);

                Log::info("Pembaruan data ditunda. Data baru bisa diperbarui dalam {$timeRemaining} detik. Waktu update berikutnya: {$nextUpdateTime->toDateTimeString()}.");

                // Berhenti tanpa melanjutkan proses update
                return false;
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
            return true;
        }

        // Jika API tidak berhasil, log pesan error
        Log::error("Gagal memperbarui data dari API.");
        return false;
    }
}
