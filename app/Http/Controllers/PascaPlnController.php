<?php

// // >>>>>>>>>>     REAL MODE       <<<<<<<<<<

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
//             $apiKey = env('P_AK');
//             $sign = md5($username . $apiKey . $ref_id);

//             try {
//                 $response = Http::post(config('services.api_server') . '/v1/transaction', [
//                     'commands' => 'inq-pasca', 'username' => $username, 'buyer_sku_code' => $current_sku,
//                     'customer_no' => $customerNo, 'ref_id' => $ref_id, 'sign' => $sign, 'testing' => false,
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
//         $apiKey = env('P_AK');
//         $sign = md5($username . $apiKey . $inquiryData['ref_id']);

//         try {
//             $response = Http::post(config('services.api_server') . '/v1/transaction', [
//                 'commands' => 'pay-pasca', 'username' => $username, 'buyer_sku_code' => $inquiryData['buyer_sku_code'],
//                 'customer_no' => $inquiryData['customer_no'], 'ref_id' => $inquiryData['ref_id'], 'sign' => $sign, 'testing' => false,
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

    /**
     * Helper method to perform a single PLN inquiry.
     * Handles API calls and data processing for a given customer number.
     *
     * @param string $customerNo The customer number to inquire.
     * @return array|null Returns processed inquiry data on success, null on failure.
     */
    private function _performSingleInquiry(string $customerNo): ?array
    {
        $availableProducts = PostpaidProduct::where('brand', 'PLN PASCABAYAR')
                                            ->where('seller_product_status', true)
                                            ->orderBy('buyer_sku_code', 'asc')
                                            ->get();

        if ($availableProducts->isEmpty()) {
            Log::warning("Inquiry PLN: Tidak ada produk PLN Pascabayar yang aktif ditemukan untuk {$customerNo}.");
            return null; // Indicates no active products
        }

        $successfulInquiryData = null;
        $lastErrorMessage = 'Gagal melakukan pengecekan tagihan setelah mencoba semua provider.';

        foreach ($availableProducts as $product) {
            $current_sku = $product->buyer_sku_code;
            $responseData = [];

            $ref_id = 'pln-' . substr(str_replace('-', '', Str::uuid()->toString()), 0, 15);
            $username = env('P_U');
            $apiKey = env('P_AKD');
            $sign = md5($username . $apiKey . $ref_id);

            try {
                $response = Http::post(config('services.api_server') . '/v1/transaction', [
                    'commands' => 'inq-pasca', 'username' => $username, 'buyer_sku_code' => 'pln',
                    'customer_no' => $customerNo, 'ref_id' => $ref_id, 'sign' => $sign, 'testing' => true,
                ]);
                $responseData = $response->json();
            } catch (\Exception $e) {
                $lastErrorMessage = 'Gagal terhubung ke server provider.';
                Log::error("Inquiry PLN Gagal Koneksi API untuk SKU: {$current_sku}. Customer No: {$customerNo}. Error: " . $e->getMessage(), [
                    'customer_no' => $customerNo, 'sku' => $current_sku, 'ref_id' => $ref_id, 'exception_message' => $e->getMessage(),
                ]);
                continue; // Try next product/provider
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
                    // Fallback if 'detail' is not an array, use top-level 'price', 'denda', 'admin'
                    $totalNilaiTagihan = (float) ($inquiryDataFromApi['price'] ?? 0);
                    $totalDenda = (float) ($inquiryDataFromApi['desc']['denda'] ?? 0);
                    $totalAdminFromDetails = (float) ($inquiryDataFromApi['admin'] ?? 0);
                }

                $inquiryDataFromApi['admin'] = $totalAdminFromDetails; // Ensure this reflects sum from details or top-level

                $commission = $product->commission ?? 0;
                $commission_sell_percentage = $product->commission_sell_percentage ?? 0;
                $commission_sell_fixed = $product->commission_sell_fixed ?? 0;
                $diskonPerLembar = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;

                $finalDiskon = $diskonPerLembar * $jumlahLembarTagihan;

                $finalSellingPrice = $totalNilaiTagihan + $totalAdminFromDetails + $totalDenda - $finalDiskon;

                $apiOriginalPrice = (float) ($responseData['data']['price'] ?? 0);
                $apiOriginalSellingPrice = (float) ($responseData['data']['selling_price'] ?? 0);

                if ($apiOriginalPrice > $finalSellingPrice && $apiOriginalSellingPrice > 0) {
                    Log::info("Override finalSellingPrice (REAL MODE): Original API Price ({$apiOriginalPrice}) > Calculated Selling Price ({$finalSellingPrice}) AND Original API Selling Price ({$apiOriginalSellingPrice}) > 0. Using Original API Selling Price.");
                    $finalSellingPrice = $apiOriginalSellingPrice;
                }

                $finalSellingPrice = ceil($finalSellingPrice);

                $inquiryDataFromApi['price']         = $totalNilaiTagihan; // This is pure bill price
                $inquiryDataFromApi['denda']         = $totalDenda;
                $inquiryDataFromApi['diskon']        = $finalDiskon;
                $inquiryDataFromApi['jumlah_lembar_tagihan'] = $jumlahLembarTagihan;
                $inquiryDataFromApi['selling_price'] = $finalSellingPrice; // This is what the user pays
                $inquiryDataFromApi['buyer_sku_code'] = $current_sku;
                $inquiryDataFromApi['ref_id'] = $ref_id;
                $inquiryDataFromApi['original_api_response'] = $responseData; // Store full API response for later debugging

                $successfulInquiryData = $inquiryDataFromApi;

                Log::info("Inquiry PLN Sukses untuk SKU: {$current_sku}. Customer No: {$customerNo}", [
                    'customer_no' => $customerNo, 'sku' => $current_sku, 'ref_id' => $ref_id,
                    'api_response_status' => $responseData['data']['status'] ?? 'N/A',
                    'processed_data' => $successfulInquiryData,
                ]);
                break; // Break on first successful inquiry
            } else {
                $lastErrorMessage = $responseData['data']['message'] ?? 'Provider sedang sibuk.';
                Log::warning("Inquiry PLN Gagal dari Provider SKU: {$current_sku}. Customer No: {$customerNo}. Pesan: {$lastErrorMessage}", [
                    'customer_no' => $customerNo, 'sku' => $current_sku, 'ref_id' => $ref_id, 'api_response' => $responseData,
                ]);
            }
        }
        return $successfulInquiryData; // Return null if all providers failed
    }

    /**
     * Helper method to process a single PLN payment after balance has been debited.
     * This method creates the transaction record, calls the provider API, and updates the transaction.
     * It DOES NOT handle user balance debit/credit, that is done by the calling public methods.
     *
     * @param array $inquiryData Processed inquiry data for a single customer.
     * @param \App\Models\User $user The authenticated user (for logging/context, not balance modification).
     * @return array Returns an array with transaction status and details.
     * @throws \Exception If the API call or transaction update fails critically.
     */
    private function _processIndividualPlnPayment(array $inquiryData, \App\Models\User $user): array
    {
        // Extract necessary data for transaction creation and API call
        $totalPriceToPay     = $inquiryData['selling_price'];
        $finalAdmin          = $inquiryData['admin'];
        $pureBillPrice       = $inquiryData['price'];
        $diskon              = $inquiryData['diskon'] ?? 0;
        $jumlahLembarTagihan = $inquiryData['jumlah_lembar_tagihan'] ?? 0;

        // Create initial transaction record with 'Pending' status
        $initialData = $this->mapToUnifiedTransaction($inquiryData, 'PLN', $pureBillPrice, $finalAdmin);
        $initialData['user_id'] = $user->id; // Ensure user_id is set
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
        $apiKey = env('P_AKD');
        $sign = md5($username . $apiKey . $inquiryData['ref_id']);

        try {
            $response = Http::post(config('services.api_server') . '/v1/transaction', [
                'commands' => 'pay-pasca', 'username' => $username, 'buyer_sku_code' => $inquiryData['buyer_sku_code'],
                'customer_no' => $inquiryData['customer_no'], 'ref_id' => $inquiryData['ref_id'], 'sign' => $sign, 'testing' => true,
            ]);
            $apiResponseData = $response->json()['data'] ?? []; // Ensure 'data' key exists, default to empty array
            if (!isset($response->json()['data'])) {
                 Log::error('PLN Payment API Response did not contain "data" key.', ['full_response' => $response->json(), 'transaction_id' => $unifiedTransaction->id]);
                 throw new \Exception('Respon API provider tidak lengkap.');
            }

            Log::info('PLN Payment API Response (Individual):', ['response_data' => $apiResponseData, 'transaction_id' => $unifiedTransaction->id]);

        } catch (\Exception $e) {
            // Update transaction status to Failed and log error
            $errorMessage = ['status' => 'Gagal', 'message' => 'Gagal terhubung ke server provider atau respon tidak valid.'];
            $unifiedTransaction->update(array_merge($errorMessage, ['rc' => null, 'sn' => null]));
            Log::error('PLN Payment Error (Individual): ' . $e->getMessage(), ['transaction_id' => $unifiedTransaction->id, 'inquiry_data' => $inquiryData]);
            throw new \Exception('Terjadi kesalahan pada server provider untuk tagihan ID Pelanggan: ' . $inquiryData['customer_no'] . '.');
        }

        $fullResponseData = array_merge($inquiryData, $apiResponseData);

        // Map and update the transaction with final status from API
        $updatePayload = $this->mapToUnifiedTransaction($fullResponseData, 'PLN', $pureBillPrice, $finalAdmin);
        $updatePayload['selling_price'] = $totalPriceToPay; // Preserve calculated selling price
        $updatePayload['rc'] = $apiResponseData['rc'] ?? null;
        $updatePayload['sn'] = $apiResponseData['sn'] ?? null;

        // Exclude specific keys from 'details' to avoid duplication or unnecessary data
        $keysToExcludeFromDetails = [
            'ref_id', 'customer_no', 'customer_name', 'buyer_sku_code', 'message',
            'rc', 'sn', 'buyer_last_saldo', 'price', 'selling_price', 'admin', 'status',
            'diskon', 'jumlah_lembar_tagihan', 'original_api_response'
        ];

        $detailsFromApiResponse = [];
        foreach ($apiResponseData as $key => $value) {
            if (!in_array($key, $keysToExcludeFromDetails)) {
                $detailsFromApiResponse[$key] = $value;
            }
        }

        $updatePayload['details'] = array_merge(
            $unifiedTransaction->details, // Preserve initial details if any
            $detailsFromApiResponse,
            ['diskon' => $diskon, 'jumlah_lembar_tagihan' => $jumlahLembarTagihan]
        );

        // Remove user_id, ref_id, type, price, admin_fee if TransactionMapper sets them explicitly or they are part of initial create
        unset($updatePayload['user_id'], $updatePayload['ref_id'], $updatePayload['type'], $updatePayload['price'], $updatePayload['admin_fee']);

        $unifiedTransaction->update($updatePayload);
        $unifiedTransaction->refresh();

        // Return a structured result for the calling method
        return [
            'transaction_id' => $unifiedTransaction->id,
            'ref_id' => $unifiedTransaction->ref_id,
            'customer_no' => $unifiedTransaction->customer_no,
            'customer_name' => $unifiedTransaction->customer_name,
            'selling_price' => $unifiedTransaction->selling_price,
            'status' => $unifiedTransaction->status,
            'message' => $unifiedTransaction->message,
            'diskon' => $unifiedTransaction->details['diskon'] ?? 0,
            'jumlah_lembar_tagihan' => $unifiedTransaction->details['jumlah_lembar_tagihan'] ?? 0,
            'rc' => $unifiedTransaction->rc,
            'sn' => $unifiedTransaction->sn,
            'original_inquiry_data' => $inquiryData, // For debugging/context
            'final_details' => $unifiedTransaction->details, // Full updated details
        ];
    }

    // Existing single inquiry endpoint, now using the helper
    public function inquiry(Request $request)
    {
        $request->validate(['customer_no' => 'required|string|min:10']);
        $customerNo = $request->customer_no;

        $inquiryData = $this->_performSingleInquiry($customerNo);

        if ($inquiryData) {
            session(['postpaid_inquiry_data' => $inquiryData]);
            return response()->json($inquiryData);
        } else {
            // Error message from _performSingleInquiry is already logged.
            // Provide a generic message to the user.
            return response()->json(['message' => 'Gagal melakukan pengecekan tagihan. Silakan coba lagi nanti.'], 400);
        }
    }

    // Existing single payment endpoint, now using the helper and managing balance
    public function payment(Request $request)
    {
        $user = Auth::user();
        $inquiryData = session('postpaid_inquiry_data');

        if (!$inquiryData || $inquiryData['customer_no'] !== $request->customer_no) {
            return response()->json(['message' => 'Sesi tidak valid atau nomor pelanggan tidak cocok.'], 400);
        }

        $totalPriceToPay = $inquiryData['selling_price'];

        if ($user->balance < $totalPriceToPay) {
            return response()->json(['message' => 'Saldo Anda tidak mencukupi.'], 402);
        }

        // Debit balance before attempting payment
        $user->decrement('balance', $totalPriceToPay);

        try {
            $paymentResult = $this->_processIndividualPlnPayment($inquiryData, $user);

            // If the payment API call resulted in a 'Gagal' status, refund the balance
            if (($paymentResult['status'] ?? 'Gagal') === 'Gagal') {
                $user->increment('balance', $totalPriceToPay);
                Log::warning("PLN Single Payment: Transaction {$paymentResult['transaction_id']} failed according to provider API, balance refunded.");
            }
            session()->forget('postpaid_inquiry_data');
            return response()->json($paymentResult);
        } catch (\Exception $e) {
            // If any exception occurred during the payment process, refund the balance
            $user->increment('balance', $totalPriceToPay);
            Log::error('PLN Single Payment Error (Controller): ' . $e->getMessage(), ['customer_no' => $request->customer_no, 'inquiry_data' => $inquiryData]);
            return response()->json(['message' => 'Terjadi kesalahan saat memproses pembayaran: ' . $e->getMessage()], 500);
        }
    }

    /**
     * NEW: Handles bulk PLN inquiry for multiple customer numbers.
     *
     * @param Request $request Contains 'customer_nos' array.
     * @return \Illuminate\Http\JsonResponse
     */
    public function bulkInquiry(Request $request)
    {
        $request->validate(['customer_nos' => 'required|array', 'customer_nos.*' => 'required|string|min:10']);
        $customerNos = array_unique($request->customer_nos); // Ensure unique customer numbers

        $results = [
            'successful' => [],
            'failed' => [],
        ];

        foreach ($customerNos as $customerNo) {
            try {
                $inquiryData = $this->_performSingleInquiry($customerNo);
                if ($inquiryData) {
                    $results['successful'][] = $inquiryData;
                } else {
                    $results['failed'][] = [
                        'customer_no' => $customerNo,
                        'message' => 'Tidak dapat menemukan tagihan atau layanan tidak tersedia.',
                    ];
                }
            } catch (\Exception $e) {
                // Catch any unexpected exceptions from _performSingleInquiry
                Log::error("Bulk Inquiry PLN: Unexpected error for customer {$customerNo}. Error: " . $e->getMessage());
                $results['failed'][] = [
                    'customer_no' => $customerNo,
                    'message' => 'Terjadi kesalahan saat pengecekan tagihan: ' . $e->getMessage(),
                ];
            }
        }

        if (empty($results['successful']) && empty($results['failed'])) {
            return response()->json(['message' => 'Tidak ada nomor pelanggan yang diproses.'], 400);
        }

        // Store only successful inquiries for bulk payment in session
        if (!empty($results['successful'])) {
            session(['postpaid_bulk_inquiry_data' => $results['successful']]);
        } else {
            session()->forget('postpaid_bulk_inquiry_data');
        }

        return response()->json($results);
    }

    /**
     * NEW: Handles bulk PLN payment for multiple previously inquired customer numbers.
     *
     * @param Request $request Contains 'customer_nos_to_pay' array (for validation against session).
     * @return \Illuminate\Http\JsonResponse
     */
    public function bulkPayment(Request $request)
    {
        $user = Auth::user();
        $inquiryDataForPayment = session('postpaid_bulk_inquiry_data'); // Retrieve all successful inquiries from session

        if (!$inquiryDataForPayment || empty($inquiryDataForPayment)) {
            return response()->json(['message' => 'Sesi pembayaran massal tidak valid atau kosong. Silakan lakukan pengecekan tagihan ulang.'], 400);
        }

        // Validate that customer_nos in the request match those in the session for security
        // This prevents a user from trying to pay for different bills than what was inquired in the session.
        $requestCustomerNos = collect($request->customer_nos_to_pay)->unique()->sort()->values()->all();
        $sessionCustomerNos = collect($inquiryDataForPayment)->pluck('customer_no')->unique()->sort()->values()->all();

        if ($requestCustomerNos != $sessionCustomerNos) { // Use non-strict comparison for array content, but types should match
             Log::warning("Bulk Payment PLN: Mismatch between requested customer_nos and session data.", [
                'request_customer_nos' => $requestCustomerNos,
                'session_customer_nos' => $sessionCustomerNos,
                'user_id' => $user->id,
            ]);
            return response()->json(['message' => 'Data pelanggan untuk pembayaran tidak cocok dengan sesi. Silakan coba lagi.'], 400);
        }

        // Calculate total price for all successful inquiries that are to be paid
        $totalPriceForBulkPayment = collect($inquiryDataForPayment)->sum('selling_price');

        if ($user->balance < $totalPriceForBulkPayment) {
            return response()->json(['message' => 'Saldo Anda tidak mencukupi untuk semua transaksi ini.'], 402);
        }

        // Debit user's balance ONCE for the total sum before processing individual payments
        $user->decrement('balance', $totalPriceForBulkPayment);
        Log::info("Bulk Payment PLN: User {$user->id} debited total {$totalPriceForBulkPayment} for bulk payment.");

        $paymentResults = [];
        $totalRefundAmount = 0; // To track balance to refund for failed individual payments

        foreach ($inquiryDataForPayment as $inquiryData) {
            try {
                // Process each individual payment. The helper does not manage balance.
                $individualPaymentResult = $this->_processIndividualPlnPayment($inquiryData, $user);
                $paymentResults[] = $individualPaymentResult; // Add the full individual result

                // If an individual payment fails (status 'Gagal' from provider API), mark its amount for refund
                if (($individualPaymentResult['status'] ?? 'Gagal') === 'Gagal') {
                    $totalRefundAmount += $inquiryData['selling_price'];
                    Log::warning("Bulk Payment PLN: Individual transaction for {$inquiryData['customer_no']} failed, adding {$inquiryData['selling_price']} to refund amount.");
                }

            } catch (\Exception $e) {
                // If an unexpected exception occurs during individual payment, treat it as failed and add to refund
                Log::error('PLN Bulk Payment Error for customer ' . $inquiryData['customer_no'] . ': ' . $e->getMessage(), ['inquiry_data' => $inquiryData, 'user_id' => $user->id]);
                $paymentResults[] = array_merge($inquiryData, [ // Add simplified error result
                    'customer_no' => $inquiryData['customer_no'],
                    'customer_name' => $inquiryData['customer_name'] ?? 'N/A',
                    'selling_price' => $inquiryData['selling_price'],
                    'status' => 'Gagal',
                    'message' => 'Terjadi kesalahan saat memproses tagihan ini: ' . $e->getMessage(),
                ]);
                $totalRefundAmount += $inquiryData['selling_price'];
            }
        }

        // Refund any failed payments from the initial bulk debit
        if ($totalRefundAmount > 0) {
            $user->increment('balance', $totalRefundAmount);
            Log::info("Bulk Payment PLN: Refunded {$totalRefundAmount} to user {$user->id} for failed transactions.");
        }

        session()->forget('postpaid_bulk_inquiry_data'); // Clear session after bulk payment attempt
        return response()->json(['results' => $paymentResults, 'total_refund_amount' => $totalRefundAmount]);
    }
}