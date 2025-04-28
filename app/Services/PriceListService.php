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
    public function fetchAndUpdatePriceList()
    {
        $lastUpdated = Product::max('updated_at');

        if ($lastUpdated) {
            $lastUpdatedCarbon = Carbon::parse($lastUpdated);
            $nextUpdateTime = $lastUpdatedCarbon->addMinutes(1);

            if (now()->lt($nextUpdateTime)) {
                $timeRemaining = now()->diffInSeconds($nextUpdateTime, false);
                Log::info("Pembaruan data ditunda. Data baru bisa diperbarui dalam {$timeRemaining} detik. Waktu update berikutnya: {$nextUpdateTime->toDateTimeString()}.");
                return false;
            }
        }

        $username = env('P_U');
        $apiKey = env('P_AK');
        $sign = md5($username . $apiKey . "pricelist");

        $response = Http::post('https://api.digiflazz.com/v1/price-list', [
            'cmd' => 'prepaid',
            'username' => $username,
            'sign' => $sign,
        ]);

        if ($response->successful()) {
            $apiSkuList = [];

            foreach ($response->json()['data'] as $item) {
                $apiSkuList[] = $item['buyer_sku_code'];

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
                        'desc' => $item['desc'] ?? null,
                        'updated_at' => now(),
                    ]
                );

                // Update category
                if (!empty($item['category'])) {
                    Category::updateOrCreate(['name' => trim($item['category'])], ['updated_at' => now()]);
                }

                // Update brand
                if (!empty($item['brand']) && !empty($item['category'])) {
                    $category = Category::where('name', trim($item['category']))->first();
                    if ($category) {
                        $brandName = trim($item['brand']) . ' - ' . trim($category->name);
                        Brand::updateOrCreate(
                            ['name' => $brandName, 'category_id' => $category->id],
                            ['updated_at' => now()]
                        );
                    }
                }

                // Update type
                if (!empty($item['type']) && !empty($item['brand']) && !empty($item['category'])) {
                    $category = Category::where('name', trim($item['category']))->first();
                    if ($category) {
                        $brandName = trim($item['brand']) . ' - ' . trim($category->name);
                        $brand = Brand::where('name', $brandName)
                            ->where('category_id', $category->id)
                            ->first();

                        if ($brand) {
                            $typeName = trim($item['type']) . ' - ' . $brand->name;
                            Type::updateOrCreate(
                                ['name' => $typeName, 'brand_id' => $brand->id, 'category_id' => $category->id],
                                ['updated_at' => now()]
                            );
                        }
                    }
                }
            }

            // Update produk lama yang SKU-nya tidak ada di API
            PriceList::whereNotIn('buyer_sku_code', $apiSkuList)
                ->chunkById(500, function ($priceLists) {
                    foreach ($priceLists as $priceList) {
                        $priceList->update([
                            'seller_product_status' => 0,
                            'updated_at' => now(),
                        ]);
                    }
                });

            $this->syncBarangFromPriceList();

            Log::info("Data berhasil diperbarui dan Barang disinkronkan pada " . now()->toDateTimeString() . ".");
            return true;
        }

        Log::error("Gagal memperbarui data dari API.");
        return false;
    }

    /**
     * Sinkronisasi Barang berdasarkan PriceList
     */
    private function syncBarangFromPriceList()
    {
        $priceListItems = PriceList::select(
            'buyer_sku_code', 
            'product_name', 
            'category', 
            'brand', 
            'type', 
            'seller_name', 
            'price', 
            'buyer_product_status', 
            'seller_product_status', 
            'unlimited_stock', 
            'stock', 
            'multi', 
            'start_cut_off', 
            'end_cut_off', 
            'desc'
        )
        ->whereNotNull('buyer_sku_code')
        ->whereNotNull('category')
        ->whereNotNull('brand')
        ->whereNotNull('type')
        ->distinct()
        ->get();

        foreach ($priceListItems as $item) {
            $categoryName = trim($item->category);
            $category = Category::where('name', $categoryName)->first();
            if (!$category) continue;

            $brandName = trim($item->brand) . ' - ' . $category->name;
            $brand = Brand::where('name', $brandName)
                ->where('category_id', $category->id)
                ->first();
            if (!$brand) continue;

            $typeName = trim($item->type) . ' - ' . $brand->name;
            $type = Type::where('name', $typeName)
                ->where('brand_id', $brand->id)
                ->first();
            if (!$type) continue;

            Barang::updateOrCreate(
                [
                    'buyer_sku_code' => trim($item->buyer_sku_code),
                ],
                [
                    'product_name' => trim($item->product_name),
                    'category_id' => $category->id,
                    'brand_id' => $brand->id,
                    'type_id' => $type->id,
                    'price' => $item->price ?? 0,
                    'buyer_product_status' => $item->buyer_product_status,
                    'seller_product_status' => $item->seller_product_status,
                    'unlimited_stock' => $item->unlimited_stock,
                    'stock' => $item->stock,
                    'multi' => $item->multi,
                    'start_cut_off' => $item->start_cut_off,
                    'end_cut_off' => $item->end_cut_off,
                    'desc' => trim($item->desc) ?? '',
                    'updated_at' => now(),
                ]
            );
        }
    }
}
