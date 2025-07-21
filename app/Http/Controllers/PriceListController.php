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
                return;
            }
        }

        // Ambil API credentials
        $username = env('P_U');
        $apiKey = env('P_AK');
        $sign = md5($username . $apiKey . "pricelist");

        $response = Http::post(config('services.api_server') . '/v1/price-list', [
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

                if (!empty($item['brand']) && !empty($item['category'])) {
                    $category = Category::where('name', $item['category'])->first();
                
                    if ($category) {
                        // Gabungkan nama brand dengan kategori (Brand - Category)
                        $brandName = "{$item['brand']} - {$item['category']}";
                
                        Brand::updateOrCreate(
                            [
                                'name' => $brandName, // Nama brand harus mengikuti format "Brand - Category"
                            ],
                            [
                                'category_id' => $category->id, // Pastikan category_id sesuai
                                'updated_at' => now(),
                            ]
                        );
                    }
                }

                if (!empty($item['type']) && !empty($item['brand']) && !empty($item['category'])) {
                    $categoryName = trim($item['category']);
                    $brandFullName = trim($item['brand']);
                    $typeNameOnly = trim($item['type']);
                
                    // Ambil bagian pertama dari nama brand sebelum " - "
                    $brandBaseName = explode(' - ', $brandFullName)[0];
                
                    // Cari kategori berdasarkan nama
                    $category = Category::where('name', $categoryName)->first();
                
                    // Cari brand berdasarkan bagian pertama dari nama
                    $brand = Brand::whereRaw("LEFT(name, LENGTH(?)) = ?", [$brandBaseName, $brandBaseName])
                        ->where('category_id', optional($category)->id) // Pastikan kategori cocok
                        ->first();
                
                    if ($brand && $category) {
                        // Format nama type menjadi "Type - Brand - Category"
                        $typeFullName = "{$typeNameOnly} - {$brand->name} - {$category->name}";
                
                        Type::updateOrCreate(
                            [
                                'name' => $typeFullName, // Simpan dalam format "Type - Brand - Category"
                            ],
                            [
                                'brand_id' => $brand->id,
                                'category_id' => $category->id,
                                'updated_at' => now(),
                            ]
                        );
                    }
                }
                
                if (!empty($item['type']) && !empty($item['brand']) && !empty($item['category']) && !empty($item['buyer_sku_code'])) {
                    $categoryName = trim($item['category']);
                    $brandFullName = trim($item['brand']);
                    $typeFullName = trim($item['type']);
                
                    // Ambil bagian pertama dari nama brand dan type sebelum " - "
                    $brandBaseName = explode(' - ', $brandFullName)[0];
                    $typeBaseName = explode(' - ', $typeFullName)[0];
                
                    // Cari kategori berdasarkan nama
                    $category = Category::where('name', $categoryName)->first();
                
                    // Cari brand berdasarkan nama depannya dan kategori terkait
                    $brand = Brand::whereRaw("LEFT(name, LENGTH(?)) = ?", [$brandBaseName, $brandBaseName])
                        ->where('category_id', optional($category)->id)
                        ->first();
                
                    // Cari type berdasarkan nama depannya dan brand terkait
                    $type = Type::whereRaw("LEFT(name, LENGTH(?)) = ?", [$typeBaseName, $typeBaseName])
                        ->where('brand_id', optional($brand)->id)
                        ->first();
                
                    if ($brand && $category && $type) {
                        Barang::updateOrCreate(
                            [
                                'buyer_sku_code' => trim($item['buyer_sku_code']),
                            ],
                            [
                                'product_name' => trim($item['product_name']),
                                'brand_id' => $brand->id,
                                'category_id' => $category->id,
                                'type_id' => $type->id,
                                'input_type_id' => $inputType->id ?? null, // InputType opsional
                                'price' => $item['price'] ?? 0,
                                'buyer_product_status' => $item['buyer_product_status'],
                                'seller_product_status' => $item['seller_product_status'],
                                'unlimited_stock' => !empty($item['unlimited_stock']) ? (bool) $item['unlimited_stock'] : false,
                                'stock' => !empty($item['stock']) ? (string) $item['stock'] : null,
                                'multi' => !empty($item['multi']) ? (bool) $item['multi'] : false,
                                'start_cut_off' => $item['start_cut_off'],
                                'end_cut_off' => $item['end_cut_off'],
                                'desc' => trim($item['desc']) ?? '',
                                'updated_at' => now(),
                            ]
                        );
                    }
                }
            }

            Log::info("Data berhasil diperbarui pada " . now()->toDateTimeString() . ".");
            return;
        }

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
