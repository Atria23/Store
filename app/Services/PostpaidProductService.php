<?php

namespace App\Services;

use App\Models\PostpaidProduct;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class PostpaidProductService
{
    /**
     * Mengambil, memproses, dan memperbarui daftar produk postpaid dari API.
     *
     * @return bool True jika berhasil, false jika gagal.
     */
    public function fetchAndUpdateProducts(): bool
    {
        $username = env('P_U');
        $apiKey = env('P_AK');
        $sign = md5($username . $apiKey . "pricelist");

        try {
            $response = Http::post(config('services.api_server') . '/v1/price-list', [
                'cmd' => 'pasca',
                'username' => $username,
                'sign' => $sign,
            ]);

            if (!$response->successful()) {
                Log::error('Failed to fetch data from API: ' . $response->body());
                return false;
            }

            $data = $response->json();

            if (!isset($data['data']) || !is_array($data['data'])) {
                Log::error('API response data is not in expected format: ' . json_encode($data));
                // Jika data tidak valid, mungkin lebih baik tidak menghapus apa pun
                return false;
            }

            // --- PERUBAHAN 1: Kumpulkan semua SKU dari respons API ---
            $apiSkuCodes = array_column($data['data'], 'buyer_sku_code');

            foreach ($data['data'] as $productData) {
                
                $existingProduct = PostpaidProduct::firstWhere('buyer_sku_code', $productData['buyer_sku_code']);

                if ($existingProduct) {
                    $commissionSellPercentage = $existingProduct->commission_sell_percentage;
                    $commissionSellFixed = $existingProduct->commission_sell_fixed;
                    if ($commissionSellPercentage === null && $commissionSellFixed === null) {
                        $commissionSellPercentage = 90;
                    }
                } else {
                    $commissionSellPercentage = 90;
                    $commissionSellFixed = null;
                }

                if ($productData['product_name'] === 'Pln Postpaid') {
                    $commissionSellPercentage = 5.00;
                    $commissionSellFixed = null; 
                } elseif ($productData['product_name'] === 'aetra') {
                    $commissionSellFixed = min(1000, $productData['commission']);
                    $commissionSellPercentage = null; 
                }

                if ($commissionSellPercentage !== null && $commissionSellPercentage > 99) {
                    $commissionSellPercentage = 99.00;
                }
                if ($commissionSellFixed !== null && $commissionSellFixed > $productData['commission']) {
                    $commissionSellFixed = $productData['commission'];
                }
                
                $imageUrl = $productData['image_url'] ?? null;
                $imagePath = null;
                if ($imageUrl) {
                    try {
                        $imageContent = Http::get($imageUrl)->body();
                        $fileName = 'product_images/' . basename($imageUrl);
                        Storage::disk('public')->put($fileName, $imageContent);
                        $imagePath = $fileName;
                    } catch (\Exception $e) {
                        Log::warning('Failed to download image for product ' . $productData['buyer_sku_code'] . ': ' . $e->getMessage());
                    }
                }

                PostpaidProduct::updateOrCreate(
                    ['buyer_sku_code' => $productData['buyer_sku_code']],
                    [
                        'product_name' => $productData['product_name'],
                        'category' => $productData['category'],
                        'brand' => $productData['brand'],
                        'seller_name' => 'Muvausa Main',
                        'admin' => $productData['admin'],
                        'commission' => $productData['commission'],
                        'commission_sell_percentage' => $commissionSellPercentage,
                        'commission_sell_fixed' => $commissionSellFixed,
                        'buyer_product_status' => $productData['buyer_product_status'],
                        'seller_product_status' => $productData['seller_product_status'],
                        'desc' => $productData['desc'] ?? null,
                        'image' => $imagePath ?? $existingProduct->image ?? null,
                    ]
                );
            }

            // --- PERUBAHAN 2: Hapus produk dari database yang SKU-nya tidak ada di daftar API ---
            // Pastikan $apiSkuCodes tidak kosong untuk mencegah penghapusan massal jika API gagal total
            if (!empty($apiSkuCodes)) {
                PostpaidProduct::whereNotIn('buyer_sku_code', $apiSkuCodes)->delete();
            }

            return true; // Sukses

        } catch (\Exception $e) {
            Log::error('Error fetching postpaid products: ' . $e->getMessage());
            return false; // Gagal
        }
    }
}