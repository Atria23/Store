<?php

// >>>>>>>>>>     REAL MODE       <<<<<<<<<<

namespace App\Http\Controllers;

use App\Models\PostpaidTransaction;
use App\Models\PostpaidProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Http\Traits\TransactionMapper;

class PascaPlnController extends Controller
{
    use TransactionMapper;

    // Fungsi index() dan fetchPlnProducts() tidak berubah
    public function index()
    {
        $products = $this->fetchPlnProducts();
        return Inertia::render('Pascabayar/Pln', [
            'products' => $products,
        ]);
    }

    private function fetchPlnProducts()
    {
        $plnProducts = PostpaidProduct::where('brand', 'PLN PASCABAYAR')->get();
        return $plnProducts->map(function ($product) {
            $commission = $product->commission ?? 0;
            $commission_sell_percentage = $product->commission_sell_percentage ?? 0;
            $commission_sell_fixed = $product->commission_sell_fixed ?? 0;
            $adminFromServer = $product->admin ?? 0;
            $markupForClient = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;
            $product->calculated_admin = $adminFromServer - $markupForClient;
            return $product;
        })->values()->all();
    }

    public function inquiry(Request $request)
    {
        $request->validate(['customer_no' => 'required|string|min:10']);
        $customerNo = $request->customer_no;

        $availableProducts = PostpaidProduct::where('brand', 'PLN PASCABAYAR')
                                            ->where('seller_product_status', true)
                                            ->orderBy('buyer_sku_code', 'asc')
                                            ->get();

        if ($availableProducts->isEmpty()) {
            Log::warning("Inquiry PLN: Tidak ada produk PLN Pascabayar yang aktif ditemukan.");
            return response()->json(['message' => 'Layanan PLN Pascabayar tidak tersedia saat ini.'], 503);
        }

        $successfulInquiryData = null;
        $lastErrorMessage = 'Gagal melakukan pengecekan tagihan setelah mencoba semua provider.';

        foreach ($availableProducts as $product) {
            $current_sku = $product->buyer_sku_code;
            $responseData = [];

            $ref_id = 'pln-' . substr(str_replace('-', '', Str::uuid()->toString()), 0, 15);
            $username = env('P_U');
            $apiKey = env('P_AK');
            $sign = md5($username . $apiKey . $ref_id);

            try {
                $response = Http::post(config('services.api_server') . '/v1/transaction', [
                    'commands' => 'inq-pasca', 'username' => $username, 'buyer_sku_code' => $current_sku,
                    'customer_no' => $customerNo, 'ref_id' => $ref_id, 'sign' => $sign, 'testing' => false,
                ]);
                $responseData = $response->json();
            } catch (\Exception $e) {
                $lastErrorMessage = 'Gagal terhubung ke server provider.';
                Log::error("Inquiry PLN Gagal Koneksi API untuk SKU: {$current_sku}. Customer No: {$customerNo}. Error: " . $e->getMessage(), [
                    'customer_no' => $customerNo,
                    'sku' => $current_sku,
                    'ref_id' => $ref_id,
                    'exception_message' => $e->getMessage(),
                    'exception_trace' => $e->getTraceAsString(),
                ]);
                continue;
            }
            
            if (isset($responseData['data']) && $responseData['data']['status'] === 'Sukses') {
                $inquiryDataFromApi = $responseData['data'];
                
                $totalNilaiTagihan = 0;
                $totalDenda = 0;
                $totalAdminFromDetails = 0;
                $jumlahLembarTagihan = 0;

                if (isset($inquiryDataFromApi['desc']['lembar_tagihan'])) {
                    $jumlahLembarTagihan = (int) $inquiryDataFromApi['desc']['lembar_tagihan'];
                } elseif (isset($inquiryDataFromApi['desc']['detail']) && is_array($inquiryDataFromApi['desc']['detail'])) {
                    $jumlahLembarTagihan = count($inquiryDataFromApi['desc']['detail']);
                } else {
                    $jumlahLembarTagihan = 1;
                }

                if (isset($inquiryDataFromApi['desc']['detail']) && is_array($inquiryDataFromApi['desc']['detail'])) {
                    foreach ($inquiryDataFromApi['desc']['detail'] as $detail) {
                        $totalNilaiTagihan += (float) ($detail['nilai_tagihan'] ?? 0);
                        $totalDenda += (float) ($detail['denda'] ?? 0); 
                        $totalAdminFromDetails += (float) ($detail['admin'] ?? 0);
                    }
                } else {
                    $totalNilaiTagihan = (float) ($inquiryDataFromApi['price'] ?? 0);
                    $totalDenda = (float) ($inquiryDataFromApi['desc']['denda'] ?? 0); 
                    $totalAdminFromDetails = (float) ($inquiryDataFromApi['admin'] ?? 0);
                }

                $inquiryDataFromApi['admin'] = $totalAdminFromDetails; 
                
                $commission = $product->commission ?? 0;
                $commission_sell_percentage = $product->commission_sell_percentage ?? 0;
                $commission_sell_fixed = $product->commission_sell_fixed ?? 0;
                $diskonPerLembar = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;

                $finalDiskon = $diskonPerLembar * $jumlahLembarTagihan;

                // Hitung Total Pembayaran Akhir (dengan Diskon) sebelum override
                $finalSellingPrice = $totalNilaiTagihan + $totalAdminFromDetails + $totalDenda - $finalDiskon;

                // --- START OF NEW LOGIC FOR OVERRIDE ---
                // Ambil 'price' dan 'selling_price' asli dari respons API root
                $apiOriginalPrice = (float) ($responseData['data']['price'] ?? 0);
                $apiOriginalSellingPrice = (float) ($responseData['data']['selling_price'] ?? 0);

                // Jika 'price' dari respons API provider lebih besar dari $finalSellingPrice (harga jual yang kita hitung),
                // DAN 'selling_price' dari respons API provider tersedia dan lebih besar dari 0,
                // maka $finalSellingPrice akan di-override menggunakan $apiOriginalSellingPrice.
                if ($apiOriginalPrice > $finalSellingPrice && $apiOriginalSellingPrice > 0) {
                    Log::info("Override finalSellingPrice (REAL MODE): Original API Price ({$apiOriginalPrice}) > Calculated Selling Price ({$finalSellingPrice}) AND Original API Selling Price ({$apiOriginalSellingPrice}) > 0. Using Original API Selling Price.");
                    $finalSellingPrice = $apiOriginalSellingPrice;
                }
                // --- END OF NEW LOGIC FOR OVERRIDE ---

                // Pembulatan $finalSellingPrice setelah potensi override
                $finalSellingPrice = ceil($finalSellingPrice);

                $inquiryDataFromApi['price']         = $totalNilaiTagihan;
                $inquiryDataFromApi['denda']         = $totalDenda;
                $inquiryDataFromApi['diskon']        = $finalDiskon;
                $inquiryDataFromApi['jumlah_lembar_tagihan'] = $jumlahLembarTagihan;
                $inquiryDataFromApi['selling_price'] = $finalSellingPrice;
                $inquiryDataFromApi['buyer_sku_code'] = $current_sku;
                $inquiryDataFromApi['ref_id'] = $ref_id;

                $successfulInquiryData = $inquiryDataFromApi;

                Log::info("Inquiry PLN Sukses untuk SKU: {$current_sku}. Customer No: {$customerNo}", [
                    'customer_no' => $customerNo,
                    'sku' => $current_sku,
                    'ref_id' => $ref_id,
                    'api_response' => $responseData,
                    'processed_data' => $successfulInquiryData,
                ]);

                break;
            } else {
                $lastErrorMessage = $responseData['data']['message'] ?? 'Provider sedang sibuk.';
                Log::warning("Inquiry PLN Gagal dari Provider SKU: {$current_sku}. Customer No: {$customerNo}. Pesan: {$lastErrorMessage}", [
                    'customer_no' => $customerNo,
                    'sku' => $current_sku,
                    'ref_id' => $ref_id,
                    'api_response' => $responseData,
                ]);
            }
        }

        if ($successfulInquiryData) {
            session(['postpaid_inquiry_data' => $successfulInquiryData]);
            return response()->json($successfulInquiryData);
        } else {
            Log::error("Inquiry PLN Total Gagal untuk Customer No: {$customerNo}. Pesan terakhir: {$lastErrorMessage}");
            return response()->json(['message' => $lastErrorMessage], 400);
        }
    }
    
    public function payment(Request $request)
    {
        $user = Auth::user();
        $inquiryData = session('postpaid_inquiry_data');

        if (!$inquiryData || $inquiryData['customer_no'] !== $request->customer_no) {
            return response()->json(['message' => 'Sesi tidak valid atau nomor pelanggan tidak cocok.'], 400);
        }

        $totalPriceToPay     = $inquiryData['selling_price'];
        $finalAdmin          = $inquiryData['admin'];
        $pureBillPrice       = $inquiryData['price'];
        $diskon              = $inquiryData['diskon'] ?? 0;
        $jumlahLembarTagihan = $inquiryData['jumlah_lembar_tagihan'] ?? 0;
        
        if ($user->balance < $totalPriceToPay) {
            return response()->json(['message' => 'Saldo Anda tidak mencukupi.'], 402);
        }

        $user->decrement('balance', $totalPriceToPay);

        $initialData = $this->mapToUnifiedTransaction($inquiryData, 'PLN', $pureBillPrice, $finalAdmin);
        $initialData['selling_price'] = $totalPriceToPay;
        $initialData['status'] = 'Pending';
        $initialData['message'] = 'Menunggu konfirmasi pembayaran dari provider';
        
        $initialData['rc'] = $inquiryData['rc'] ?? null;
        $initialData['sn'] = null; 

        $initialData['details'] = [
            'diskon' => $diskon,
            'jumlah_lembar_tagihan' => $jumlahLembarTagihan,
        ];
        
        $unifiedTransaction = PostpaidTransaction::create($initialData);

        $apiResponseData = [];

        $username = env('P_U');
        $apiKey = env('P_AK');
        $sign = md5($username . $apiKey . $inquiryData['ref_id']);

        try {
            $response = Http::post(config('services.api_server') . '/v1/transaction', [
                'commands' => 'pay-pasca', 'username' => $username, 'buyer_sku_code' => $inquiryData['buyer_sku_code'],
                'customer_no' => $inquiryData['customer_no'], 'ref_id' => $inquiryData['ref_id'], 'sign' => $sign, 'testing' => false,
            ]);
            $apiResponseData = $response->json()['data'];

            Log::info('PLN Payment API Response:', ['response_data' => $apiResponseData, 'transaction_id' => $unifiedTransaction->id]);

        } catch (\Exception $e) {
            $user->increment('balance', $totalPriceToPay);
            $errorMessage = ['status' => 'Gagal', 'message' => 'Gagal terhubung ke server provider.'];
            
            $unifiedTransaction->update(array_merge($errorMessage, ['rc' => null, 'sn' => null]));

            Log::error('PLN Payment Error: ' . $e->getMessage(), ['transaction_id' => $unifiedTransaction->id, 'inquiry_data' => $inquiryData]);
            return response()->json(['message' => 'Terjadi kesalahan pada server provider.'], 500);
        }
        
        $fullResponseData = array_merge($inquiryData, $apiResponseData);

        $updatePayload = $this->mapToUnifiedTransaction($fullResponseData, 'PLN', $pureBillPrice, $finalAdmin);
        $updatePayload['selling_price'] = $totalPriceToPay;
        
        $updatePayload['rc'] = $apiResponseData['rc'] ?? null;
        $updatePayload['sn'] = $apiResponseData['sn'] ?? null;

        $keysToExcludeFromDetails = [
            'ref_id', 'customer_no', 'customer_name', 'buyer_sku_code', 'message',
            'rc', 'sn', 'buyer_last_saldo', 'price', 'selling_price', 'admin', 'status',
            'diskon', 'jumlah_lembar_tagihan'
        ];

        $detailsFromApiResponse = [];
        foreach ($apiResponseData as $key => $value) {
            if (!in_array($key, $keysToExcludeFromDetails)) {
                $detailsFromApiResponse[$key] = $value;
            }
        }
        
        $updatePayload['details'] = array_merge(
            $detailsFromApiResponse,
            ['diskon' => $diskon, 'jumlah_lembar_tagihan' => $jumlahLembarTagihan]
        );

        unset($updatePayload['user_id'], $updatePayload['ref_id'], $updatePayload['type'], $updatePayload['price'], $updatePayload['admin_fee']);
        
        $unifiedTransaction->update($updatePayload);

        $unifiedTransaction->refresh(); 

        $fullResponseData['selling_price'] = $unifiedTransaction->selling_price;
        $fullResponseData['status'] = $unifiedTransaction->status;
        $fullResponseData['customer_name'] = $unifiedTransaction->customer_name;
        $fullResponseData['customer_no'] = $unifiedTransaction->customer_no;
        $fullResponseData['diskon'] = $unifiedTransaction->details['diskon'] ?? 0;

        if (($apiResponseData['status'] ?? 'Gagal') === 'Gagal') {
            $user->increment('balance', $totalPriceToPay);
        }

        session()->forget('postpaid_inquiry_data');
        return response()->json($fullResponseData);
    }
}

// // >>>>>>>>>>>>>>>       TESTING MODE        <<<<<<<<<<<<<<<<

// namespace App\Http\Controllers;

// use App\Models\PostpaidTransaction;
// use App\Models\PostpaidProduct;
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Auth;
// use Illuminate\Support\Facades\Http;
// use Illuminate\Support\Facades\Log;
// use Illuminate\Support\Str;
// use Inertia\Inertia;
// use App\Http\Traits\TransactionMapper;

// class PascaPlnController extends Controller
// {
//     use TransactionMapper;

//     // Fungsi index() dan fetchPlnProducts() tidak berubah
//     public function index()
//     {
//         $products = $this->fetchPlnProducts();
//         return Inertia::render('Pascabayar/Pln', [
//             'products' => $products,
//         ]);
//     }

//     private function fetchPlnProducts()
//     {
//         $plnProducts = PostpaidProduct::where('brand', 'PLN PASCABAYAR')->get();
//         return $plnProducts->map(function ($product) {
//             $commission = $product->commission ?? 0;
//             $commission_sell_percentage = $product->commission_sell_percentage ?? 0;
//             $commission_sell_fixed = $product->commission_sell_fixed ?? 0;
//             $adminFromServer = $product->admin ?? 0;
//             $markupForClient = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;
//             $product->calculated_admin = $adminFromServer - $markupForClient;
//             return $product;
//         })->values()->all();
//     }

//     public function inquiry(Request $request)
//     {
//         $request->validate(['customer_no' => 'required|string|min:10']);
//         $customerNo = $request->customer_no;

//         $availableProducts = PostpaidProduct::where('brand', 'PLN PASCABAYAR')
//                                             ->where('seller_product_status', true)
//                                             ->orderBy('buyer_sku_code', 'asc')
//                                             ->get();

//         if ($availableProducts->isEmpty()) {
//             Log::warning("Inquiry PLN: Tidak ada produk PLN Pascabayar yang aktif ditemukan.");
//             return response()->json(['message' => 'Layanan PLN Pascabayar tidak tersedia saat ini.'], 503);
//         }

//         $successfulInquiryData = null;
//         $lastErrorMessage = 'Gagal melakukan pengecekan tagihan setelah mencoba semua provider.';

//         foreach ($availableProducts as $product) {
//             $current_sku = $product->buyer_sku_code;
//             $responseData = [];

//             $ref_id = 'pln-' . substr(str_replace('-', '', Str::uuid()->toString()), 0, 15);
//             $username = env('P_U');
//             $apiKey = env('P_AKD');
//             $sign = md5($username . $apiKey . $ref_id);

//             try {
//                 $response = Http::post(config('services.api_server') . '/v1/transaction', [
//                     'commands' => 'inq-pasca', 'username' => $username, 'buyer_sku_code' => 'pln',
//                     'customer_no' => $customerNo, 'ref_id' => $ref_id, 'sign' => $sign, 'testing' => true,
//                 ]);
//                 $responseData = $response->json();
//             } catch (\Exception $e) {
//                 $lastErrorMessage = 'Gagal terhubung ke server provider.';
//                 Log::error("Inquiry PLN Gagal Koneksi API untuk SKU: {$current_sku}. Customer No: {$customerNo}. Error: " . $e->getMessage(), [
//                     'customer_no' => $customerNo,
//                     'sku' => $current_sku,
//                     'ref_id' => $ref_id,
//                     'exception_message' => $e->getMessage(),
//                     'exception_trace' => $e->getTraceAsString(),
//                 ]);
//                 continue;
//             }
            
//             if (isset($responseData['data']) && $responseData['data']['status'] === 'Sukses') {
//                 $inquiryDataFromApi = $responseData['data'];
                
//                 $totalNilaiTagihan = 0;
//                 $totalDenda = 0;
//                 $totalAdminFromDetails = 0;
//                 $jumlahLembarTagihan = 0;

//                 if (isset($inquiryDataFromApi['desc']['lembar_tagihan'])) {
//                     $jumlahLembarTagihan = (int) $inquiryDataFromApi['desc']['lembar_tagihan'];
//                 } elseif (isset($inquiryDataFromApi['desc']['detail']) && is_array($inquiryDataFromApi['desc']['detail'])) {
//                     $jumlahLembarTagihan = count($inquiryDataFromApi['desc']['detail']);
//                 } else {
//                     $jumlahLembarTagihan = 1;
//                 }

//                 if (isset($inquiryDataFromApi['desc']['detail']) && is_array($inquiryDataFromApi['desc']['detail'])) {
//                     foreach ($inquiryDataFromApi['desc']['detail'] as $detail) {
//                         $totalNilaiTagihan += (float) ($detail['nilai_tagihan'] ?? 0);
//                         $totalDenda += (float) ($detail['denda'] ?? 0); 
//                         $totalAdminFromDetails += (float) ($detail['admin'] ?? 0);
//                     }
//                 } else {
//                     $totalNilaiTagihan = (float) ($inquiryDataFromApi['price'] ?? 0);
//                     $totalDenda = (float) ($inquiryDataFromApi['desc']['denda'] ?? 0); 
//                     $totalAdminFromDetails = (float) ($inquiryDataFromApi['admin'] ?? 0);
//                 }

//                 $inquiryDataFromApi['admin'] = $totalAdminFromDetails; 
                
//                 $commission = $product->commission ?? 0;
//                 $commission_sell_percentage = $product->commission_sell_percentage ?? 0;
//                 $commission_sell_fixed = $product->commission_sell_fixed ?? 0;
//                 $diskonPerLembar = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;

//                 $finalDiskon = $diskonPerLembar * $jumlahLembarTagihan;

//                 // Hitung Total Pembayaran Akhir (dengan Diskon) sebelum override
//                 $finalSellingPrice = $totalNilaiTagihan + $totalAdminFromDetails + $totalDenda - $finalDiskon;

//                 // --- START OF NEW LOGIC FOR OVERRIDE ---
//                 // Ambil 'price' dan 'selling_price' asli dari respons API root
//                 $apiOriginalPrice = (float) ($responseData['data']['price'] ?? 0);
//                 $apiOriginalSellingPrice = (float) ($responseData['data']['selling_price'] ?? 0);

//                 // Jika 'price' dari respons API provider lebih besar dari $finalSellingPrice (harga jual yang kita hitung),
//                 // DAN 'selling_price' dari respons API provider tersedia dan lebih besar dari 0,
//                 // maka $finalSellingPrice akan di-override menggunakan $apiOriginalSellingPrice.
//                 if ($apiOriginalPrice > $finalSellingPrice && $apiOriginalSellingPrice > 0) {
//                     Log::info("Override finalSellingPrice (REAL MODE): Original API Price ({$apiOriginalPrice}) > Calculated Selling Price ({$finalSellingPrice}) AND Original API Selling Price ({$apiOriginalSellingPrice}) > 0. Using Original API Selling Price.");
//                     $finalSellingPrice = $apiOriginalSellingPrice;
//                 }
//                 // --- END OF NEW LOGIC FOR OVERRIDE ---

//                 // Pembulatan $finalSellingPrice setelah potensi override
//                 $finalSellingPrice = ceil($finalSellingPrice);

//                 $inquiryDataFromApi['price']         = $totalNilaiTagihan;
//                 $inquiryDataFromApi['denda']         = $totalDenda;
//                 $inquiryDataFromApi['diskon']        = $finalDiskon;
//                 $inquiryDataFromApi['jumlah_lembar_tagihan'] = $jumlahLembarTagihan;
//                 $inquiryDataFromApi['selling_price'] = $finalSellingPrice;
//                 $inquiryDataFromApi['buyer_sku_code'] = $current_sku;
//                 $inquiryDataFromApi['ref_id'] = $ref_id;

//                 $successfulInquiryData = $inquiryDataFromApi;

//                 Log::info("Inquiry PLN Sukses untuk SKU: {$current_sku}. Customer No: {$customerNo}", [
//                     'customer_no' => $customerNo,
//                     'sku' => $current_sku,
//                     'ref_id' => $ref_id,
//                     'api_response' => $responseData,
//                     'processed_data' => $successfulInquiryData,
//                 ]);

//                 break;
//             } else {
//                 $lastErrorMessage = $responseData['data']['message'] ?? 'Provider sedang sibuk.';
//                 Log::warning("Inquiry PLN Gagal dari Provider SKU: {$current_sku}. Customer No: {$customerNo}. Pesan: {$lastErrorMessage}", [
//                     'customer_no' => $customerNo,
//                     'sku' => $current_sku,
//                     'ref_id' => $ref_id,
//                     'api_response' => $responseData,
//                 ]);
//             }
//         }

//         if ($successfulInquiryData) {
//             session(['postpaid_inquiry_data' => $successfulInquiryData]);
//             return response()->json($successfulInquiryData);
//         } else {
//             Log::error("Inquiry PLN Total Gagal untuk Customer No: {$customerNo}. Pesan terakhir: {$lastErrorMessage}");
//             return response()->json(['message' => $lastErrorMessage], 400);
//         }
//     }
    
//     public function payment(Request $request)
//     {
//         $user = Auth::user();
//         $inquiryData = session('postpaid_inquiry_data');

//         if (!$inquiryData || $inquiryData['customer_no'] !== $request->customer_no) {
//             return response()->json(['message' => 'Sesi tidak valid atau nomor pelanggan tidak cocok.'], 400);
//         }

//         $totalPriceToPay     = $inquiryData['selling_price'];
//         $finalAdmin          = $inquiryData['admin'];
//         $pureBillPrice       = $inquiryData['price'];
//         $diskon              = $inquiryData['diskon'] ?? 0;
//         $jumlahLembarTagihan = $inquiryData['jumlah_lembar_tagihan'] ?? 0;
        
//         if ($user->balance < $totalPriceToPay) {
//             return response()->json(['message' => 'Saldo Anda tidak mencukupi.'], 402);
//         }

//         $user->decrement('balance', $totalPriceToPay);

//         $initialData = $this->mapToUnifiedTransaction($inquiryData, 'PLN', $pureBillPrice, $finalAdmin);
//         $initialData['selling_price'] = $totalPriceToPay;
//         $initialData['status'] = 'Pending';
//         $initialData['message'] = 'Menunggu konfirmasi pembayaran dari provider';
        
//         $initialData['rc'] = $inquiryData['rc'] ?? null;
//         $initialData['sn'] = null; 

//         $initialData['details'] = [
//             'diskon' => $diskon,
//             'jumlah_lembar_tagihan' => $jumlahLembarTagihan,
//         ];
        
//         $unifiedTransaction = PostpaidTransaction::create($initialData);

//         $apiResponseData = [];

//         $username = env('P_U');
//         $apiKey = env('P_AKD');
//         $sign = md5($username . $apiKey . $inquiryData['ref_id']);

//         try {
//             $response = Http::post(config('services.api_server') . '/v1/transaction', [
//                 'commands' => 'pay-pasca', 'username' => $username, 'buyer_sku_code' => $inquiryData['buyer_sku_code'],
//                 'customer_no' => $inquiryData['customer_no'], 'ref_id' => $inquiryData['ref_id'], 'sign' => $sign, 'testing' => true,
//             ]);
//             $apiResponseData = $response->json()['data'];

//             Log::info('PLN Payment API Response:', ['response_data' => $apiResponseData, 'transaction_id' => $unifiedTransaction->id]);

//         } catch (\Exception $e) {
//             $user->increment('balance', $totalPriceToPay);
//             $errorMessage = ['status' => 'Gagal', 'message' => 'Gagal terhubung ke server provider.'];
            
//             $unifiedTransaction->update(array_merge($errorMessage, ['rc' => null, 'sn' => null]));

//             Log::error('PLN Payment Error: ' . $e->getMessage(), ['transaction_id' => $unifiedTransaction->id, 'inquiry_data' => $inquiryData]);
//             return response()->json(['message' => 'Terjadi kesalahan pada server provider.'], 500);
//         }
        
//         $fullResponseData = array_merge($inquiryData, $apiResponseData);

//         $updatePayload = $this->mapToUnifiedTransaction($fullResponseData, 'PLN', $pureBillPrice, $finalAdmin);
//         $updatePayload['selling_price'] = $totalPriceToPay;
        
//         $updatePayload['rc'] = $apiResponseData['rc'] ?? null;
//         $updatePayload['sn'] = $apiResponseData['sn'] ?? null;

//         $keysToExcludeFromDetails = [
//             'ref_id', 'customer_no', 'customer_name', 'buyer_sku_code', 'message',
//             'rc', 'sn', 'buyer_last_saldo', 'price', 'selling_price', 'admin', 'status',
//             'diskon', 'jumlah_lembar_tagihan'
//         ];

//         $detailsFromApiResponse = [];
//         foreach ($apiResponseData as $key => $value) {
//             if (!in_array($key, $keysToExcludeFromDetails)) {
//                 $detailsFromApiResponse[$key] = $value;
//             }
//         }
        
//         $updatePayload['details'] = array_merge(
//             $detailsFromApiResponse,
//             ['diskon' => $diskon, 'jumlah_lembar_tagihan' => $jumlahLembarTagihan]
//         );

//         unset($updatePayload['user_id'], $updatePayload['ref_id'], $updatePayload['type'], $updatePayload['price'], $updatePayload['admin_fee']);
        
//         $unifiedTransaction->update($updatePayload);

//         $unifiedTransaction->refresh(); 

//         $fullResponseData['selling_price'] = $unifiedTransaction->selling_price;
//         $fullResponseData['status'] = $unifiedTransaction->status;
//         $fullResponseData['customer_name'] = $unifiedTransaction->customer_name;
//         $fullResponseData['customer_no'] = $unifiedTransaction->customer_no;
//         $fullResponseData['diskon'] = $unifiedTransaction->details['diskon'] ?? 0;

//         if (($apiResponseData['status'] ?? 'Gagal') === 'Gagal') {
//             $user->increment('balance', $totalPriceToPay);
//         }

//         session()->forget('postpaid_inquiry_data');
//         return response()->json($fullResponseData);
//     }
// }