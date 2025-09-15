<?php


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

// class PascaBpjsController extends Controller // Renamed controller for clarity
// {
//     use TransactionMapper;

//     /**
//      * Display a listing of BPJS Kesehatan postpaid products.
//      *
//      * @return \Inertia\Response
//      */
//     public function index()
//     {
//         $products = $this->fetchBpjsKesehatanProducts();
//         // Assuming you have an Inertia component for BPJS Kesehatan like 'Pascabayar/BpjsKesehatan.vue'
//         return Inertia::render('Pascabayar/Bpjs', [
//             'products' => $products,
//         ]);
//     }

//     /**
//      * Fetches BPJS Kesehatan postpaid products from the database.
//      *
//      * @return array
//      */
//     private function fetchBpjsKesehatanProducts()
//     {
//         // Fetch products specifically for BPJS KESEHATAN brand
//         $bpjsProducts = PostpaidProduct::where('brand', 'BPJS KESEHATAN')->get();
//         return $bpjsProducts->map(function ($product) {
//             $commission = $product->commission ?? 0;
//             $commission_sell_percentage = $product->commission_sell_percentage ?? 0;
//             $commission_sell_fixed = $product->commission_sell_fixed ?? 0;
//             $adminFromServer = $product->admin ?? 0;
//             $markupForClient = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;
//             $product->calculated_admin = $adminFromServer - $markupForClient;
//             return $product;
//         })->values()->all();
//     }

//     // getDummyBpjsKesehatanInquiryResponse method removed

//     /**
//      * Handles BPJS Kesehatan inquiry requests by calling a real external API.
//      *
//      * @param \Illuminate\Http\Request $request
//      * @return \Illuminate\Http\JsonResponse
//      */
//     public function inquiry(Request $request)
//     {
//         $request->validate(['customer_no' => 'required|string|min:10']);
//         $customerNo = $request->customer_no;

//         // Fetch BPJS KESEHATAN products
//         $availableProducts = PostpaidProduct::where('brand', 'BPJS KESEHATAN')
//                                             ->where('seller_product_status', true)
//                                             ->orderBy('buyer_sku_code', 'asc')
//                                             ->get();

//         if ($availableProducts->isEmpty()) {
//             Log::warning("Inquiry BPJS Kesehatan: Tidak ada produk BPJS Kesehatan yang aktif ditemukan.");
//             return response()->json(['message' => 'Layanan BPJS Kesehatan tidak tersedia saat ini.'], 503);
//         }

//         $successfulInquiryData = null;
//         $lastErrorMessage = 'Gagal melakukan pengecekan tagihan setelah mencoba semua provider.';

//         foreach ($availableProducts as $product) {
//             $current_sku = $product->buyer_sku_code;
//             $responseData = [];

//             $ref_id = 'bpjs-' . substr(str_replace('-', '', Str::uuid()->toString()), 0, 15);
//             $username = env('P_U');
//             $apiKey = env('P_AK');
//             $sign = md5($username . $apiKey . $ref_id);

//             try {
//                 // --- MODIFICATION: Call real API here ---
//                 $response = Http::post(config('services.api_server') . '/v1/transaction', [
//                     'commands' => 'inq-pasca',
//                     'username' => $username,
//                     'buyer_sku_code' => $current_sku,
//                     'customer_no' => $customerNo,
//                     'ref_id' => $ref_id,
//                     'sign' => $sign,
//                     'testing' => false, // Set to true if you want to test with the provider's test mode
//                 ]);
//                 $responseData = $response->json();
//                 // --- END MODIFICATION ---

//             } catch (\Exception $e) {
//                 $lastErrorMessage = 'Gagal terhubung ke server provider BPJS Kesehatan.';
//                 Log::error("Inquiry BPJS Kesehatan Gagal Koneksi API untuk SKU: {$current_sku}. Customer No: {$customerNo}. Error: " . $e->getMessage(), [
//                     'customer_no' => $customerNo,
//                     'sku' => $current_sku,
//                     'ref_id' => $ref_id,
//                     'exception_message' => $e->getMessage(),
//                     'exception_trace' => $e->getTraceAsString(),
//                 ]);
//                 continue; // Try next provider if available
//             }
            
//             // Logika pemrosesan respons
//             if (isset($responseData['data']) && ($responseData['data']['status'] ?? null) === 'Sukses') {
//                 $inquiryDataFromApi = $responseData['data'];
                
//                 if (!isset($inquiryDataFromApi['desc']) || !is_array($inquiryDataFromApi['desc'])) {
//                     $inquiryDataFromApi['desc'] = [];
//                 }

//                 // BPJS typically has total price and admin at the root,
//                 // and 'detail' might not contain individual prices/admins like PLN.
//                 $totalNilaiTagihan = (float) ($inquiryDataFromApi['price'] ?? 0);
//                 $totalAdminFromProvider = (float) ($inquiryDataFromApi['admin'] ?? 0);
//                 $totalDenda = (float) ($inquiryDataFromApi['desc']['denda'] ?? 0); // Assuming denda might be in desc
//                 $totalBiayaLain = (float) ($inquiryDataFromApi['desc']['biaya_lain'] ?? 0); // Assuming other fees might be in desc

//                 $jumlahLembarTagihan = (int) ($inquiryDataFromApi['desc']['lembar_tagihan'] ?? 1);

//                 // Set the 'admin' in inquiryDataFromApi to the total admin from provider
//                 $inquiryDataFromApi['admin'] = $totalAdminFromProvider; 
                
//                 // 1. Calculate base discount per bill based on product commission
//                 $commission = $product->commission ?? 0;
//                 $commission_sell_percentage = $product->commission_sell_percentage ?? 0;
//                 $commission_sell_fixed = $product->commission_sell_fixed ?? 0;
//                 $diskonPerLembar = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;

//                 // 2. Multiply discount per bill by the number of bills
//                 $finalDiskon = $diskonPerLembar * $jumlahLembarTagihan;
//                 $finalDiskon = ceil($finalDiskon); // Round up the discount

//                 // 3. Calculate Final Selling Price (with our platform's discount)
//                 $finalSellingPrice = ($totalNilaiTagihan + $totalBiayaLain) + $totalAdminFromProvider + $totalDenda - $finalDiskon;
//                 $finalSellingPrice = ceil($finalSellingPrice); // Round up the final selling price

//                 // 4. Reconstruct data for frontend and session storage
//                 $inquiryDataFromApi['price']         = $totalNilaiTagihan + $totalBiayaLain;
//                 $inquiryDataFromApi['denda']         = $totalDenda;
//                 $inquiryDataFromApi['diskon']        = $finalDiskon;
//                 $inquiryDataFromApi['jumlah_lembar_tagihan'] = $jumlahLembarTagihan;
//                 $inquiryDataFromApi['selling_price'] = $finalSellingPrice;
//                 $inquiryDataFromApi['buyer_sku_code'] = $current_sku;
//                 $inquiryDataFromApi['ref_id'] = $ref_id;

//                 // Add BPJS specific details to inquiry data for consistency
//                 $inquiryDataFromApi['jumlah_peserta'] = $inquiryDataFromApi['desc']['jumlah_peserta'] ?? null;
//                 $inquiryDataFromApi['alamat'] = $inquiryDataFromApi['desc']['alamat'] ?? null;

//                 $successfulInquiryData = $inquiryDataFromApi;

//                 Log::info("Inquiry BPJS Kesehatan Sukses untuk SKU: {$current_sku}. Customer No: {$customerNo}", [
//                     'customer_no' => $customerNo,
//                     'sku' => $current_sku,
//                     'ref_id' => $ref_id,
//                     'api_response' => $responseData,
//                     'processed_data' => $successfulInquiryData,
//                 ]);

//                 break; // Stop loop if inquiry is successful
//             } else {
//                 $lastErrorMessage = $responseData['data']['message'] ?? 'Provider BPJS Kesehatan sedang sibuk atau data tidak valid.';
//                 Log::warning("Inquiry BPJS Kesehatan Gagal dari Provider SKU: {$current_sku}. Customer No: {$customerNo}. Pesan: {$lastErrorMessage}", [
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
//             Log::error("Inquiry BPJS Kesehatan Total Gagal untuk Customer No: {$customerNo}. Pesan terakhir: {$lastErrorMessage}");
//             return response()->json(['message' => $lastErrorMessage], 400);
//         }
//     }
    
//     /**
//      * Handles BPJS Kesehatan payment requests by calling a real external API.
//      *
//      * @param \Illuminate\Http\Request $request
//      * @return \Illuminate\Http\JsonResponse
//      */
//     public function payment(Request $request)
//     {
//         $user = Auth::user(); 
//         // For testing without login, you can create a dummy user (uncomment if needed for direct testing):
//         // if (!$user) { $user = (object)['id' => 1, 'balance' => 10000000, 'decrement' => function($attr, $val){}, 'increment' => function($attr, $val){}]; }

//         $inquiryData = session('postpaid_inquiry_data');

//         // Validate session data consistency
//         if (!$inquiryData || ($inquiryData['customer_no'] ?? null) !== $request->customer_no) {
//             return response()->json(['message' => 'Sesi tidak valid atau nomor pelanggan tidak cocok.'], 400);
//         }

//         $totalPriceToPay     = $inquiryData['selling_price'];
//         $finalAdmin          = $inquiryData['admin'];
//         $pureBillPrice       = $inquiryData['price'];
//         $diskon              = $inquiryData['diskon'] ?? 0;
//         $jumlahLembarTagihan = $inquiryData['jumlah_lembar_tagihan'] ?? 0;
        
//         // Check user balance
//         if ($user->balance < $totalPriceToPay) {
//             return response()->json(['message' => 'Saldo Anda tidak mencukupi.'], 402);
//         }

//         // Decrement user balance
//         $user->decrement('balance', $totalPriceToPay);

//         // Map inquiry data to initial transaction record
//         $initialData = $this->mapToUnifiedTransaction($inquiryData, 'BPJS KESEHATAN', $pureBillPrice, $finalAdmin);
//         $initialData['selling_price'] = $totalPriceToPay;
//         $initialData['status'] = 'Pending';
//         $initialData['message'] = 'Menunggu konfirmasi pembayaran dari provider';
        
//         $initialData['rc'] = $inquiryData['rc'] ?? null;
//         $initialData['sn'] = null; // SN is expected from payment response

//         // Store BPJS specific details in the 'details' JSON column
//         $initialData['details'] = [
//             'diskon' => $diskon,
//             'jumlah_lembar_tagihan' => $jumlahLembarTagihan,
//             'jumlah_peserta' => $inquiryData['jumlah_peserta'] ?? null,
//             'alamat' => $inquiryData['alamat'] ?? null,
//         ];
        
//         $unifiedTransaction = PostpaidTransaction::create($initialData);

//         $apiResponseData = [];
//         $username = env('P_U');
//         $apiKey = env('P_AK');
//         $sign = md5($username . $apiKey . $inquiryData['ref_id']);

//         try {
//             // --- MODIFICATION: Call real API here ---
//             $response = Http::post(config('services.api_server') . '/v1/transaction', [
//                 'commands' => 'pay-pasca',
//                 'username' => $username,
//                 'buyer_sku_code' => $inquiryData['buyer_sku_code'],
//                 'customer_no' => $inquiryData['customer_no'],
//                 'ref_id' => $inquiryData['ref_id'],
//                 'sign' => $sign,
//                 'testing' => false, // Set to true if you want to test with the provider's test mode
//             ]);
//             $apiResponseData = $response->json()['data'];
//             // --- END MODIFICATION ---

//             Log::info('BPJS Kesehatan Payment API Response:', ['response_data' => $apiResponseData, 'transaction_id' => $unifiedTransaction->id]);

//         } catch (\Exception $e) {
//             // If API call fails, increment user balance back
//             $user->increment('balance', $totalPriceToPay);
//             $errorMessage = ['status' => 'Gagal', 'message' => 'Gagal terhubung ke server provider BPJS Kesehatan.'];
            
//             // Update transaction status to failed
//             $unifiedTransaction->update(array_merge($errorMessage, ['rc' => null, 'sn' => null]));

//             Log::error('BPJS Kesehatan Payment Error: ' . $e->getMessage(), ['transaction_id' => $unifiedTransaction->id, 'inquiry_data' => $inquiryData]);
//             return response()->json(['message' => 'Terjadi kesalahan pada server provider BPJS Kesehatan.'], 500);
//         }
        
//         // Merge inquiry data with actual API payment response data
//         $fullResponseData = array_merge($inquiryData, $apiResponseData);

//         // Prepare payload for updating the transaction based on the real API response
//         $updatePayload = $this->mapToUnifiedTransaction($fullResponseData, 'BPJS KESEHATAN', $pureBillPrice, $finalAdmin);
//         $updatePayload['selling_price'] = $totalPriceToPay; // Ensure selling_price remains consistent
        
//         $updatePayload['rc'] = $apiResponseData['rc'] ?? null;
//         $updatePayload['sn'] = $apiResponseData['sn'] ?? null;
//         $updatePayload['status'] = $apiResponseData['status'] ?? 'Gagal'; // Update status from real API response
//         $updatePayload['message'] = $apiResponseData['message'] ?? 'Gagal melakukan pembayaran.'; // Update message from real API response

//         // Define keys to exclude from the 'details' array, as they are stored in other columns
//         $keysToExcludeFromDetails = [
//             'ref_id', 'customer_no', 'customer_name', 'buyer_sku_code', 'message',
//             'rc', 'sn', 'buyer_last_saldo', 'price', 'selling_price', 'admin', 'status',
//             'diskon', 'jumlah_lembar_tagihan', 'jumlah_peserta', 'alamat', // Exclude BPJS-specific fields from being duplicated in root details
//         ];

//         $detailsFromApiResponse = [];
//         foreach ($apiResponseData as $key => $value) {
//             if (!in_array($key, $keysToExcludeFromDetails)) {
//                 $detailsFromApiResponse[$key] = $value;
//             }
//         }
        
//         // Merge original details with any new details from API response
//         $updatePayload['details'] = array_merge(
//             $detailsFromApiResponse,
//             [
//                 'diskon' => $diskon,
//                 'jumlah_lembar_tagihan' => $jumlahLembarTagihan,
//                 'jumlah_peserta' => $inquiryData['jumlah_peserta'] ?? null,
//                 'alamat' => $inquiryData['alamat'] ?? null,
//             ]
//         );

//         // Unset fields that are not part of the `update` method or are already correctly set
//         unset($updatePayload['user_id'], $updatePayload['ref_id'], $updatePayload['type'], $updatePayload['price'], $updatePayload['admin_fee']);
        
//         $unifiedTransaction->update($updatePayload);

//         // Refresh the model to get the very latest data from the database
//         $unifiedTransaction->refresh(); 

//         // Update the $fullResponseData with the actual values saved in the database
//         // This ensures the frontend displays exactly what's recorded.
//         $fullResponseData['selling_price'] = $unifiedTransaction->selling_price;
//         $fullResponseData['status'] = $unifiedTransaction->status;
//         $fullResponseData['customer_name'] = $unifiedTransaction->customer_name;
//         $fullResponseData['customer_no'] = $unifiedTransaction->customer_no;
//         $fullResponseData['diskon'] = $unifiedTransaction->details['diskon'] ?? 0;
//         $fullResponseData['sn'] = $unifiedTransaction->sn;
//         $fullResponseData['jumlah_peserta'] = $unifiedTransaction->details['jumlah_peserta'] ?? null;
//         $fullResponseData['alamat'] = $unifiedTransaction->details['alamat'] ?? null;

//         // If the transaction status from the API is 'Gagal', refund the balance.
//         // This handles cases where the API responds but indicates failure.
//         if (($apiResponseData['status'] ?? 'Gagal') === 'Gagal') {
//             $user->increment('balance', $totalPriceToPay);
//         }

//         session()->forget('postpaid_inquiry_data'); // Clear session after transaction
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

class PascaBpjsController extends Controller
{
    use TransactionMapper;

    /**
     * Display a listing of BPJS postpaid products.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $products = $this->fetchBpjsProducts();
        // Assuming you have an Inertia component for BPJS like 'Pascabayar/Bpjs.vue'
        return Inertia::render('Pascabayar/Bpjs', [
            'products' => $products,
        ]);
    }

    /**
     * Fetches BPJS postpaid products from the database.
     *
     * @return array
     */
    private function fetchBpjsProducts()
    {
        // Fetch products specifically for BPJS KESEHATAN brand
        $bpjsProducts = PostpaidProduct::where('brand', 'BPJS KESEHATAN')->get();
        return $bpjsProducts->map(function ($product) {
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
     * Generates a dummy BPJS inquiry response for testing purposes.
     * This method provides a hardcoded dummy response based on the given example.
     *
     * @param string $customerNo
     * @param string $buyerSkuCode
     * @param string $refId
     * @return array
     */
    private function getDummyBpjsInquiryResponse(string $customerNo, string $buyerSkuCode, string $refId): array
    {
        // Using the provided dummy JSON structure as a base
        // Note: 'selling_price' is removed from this dummy response as it will be calculated by our system
        // based on 'price', 'admin', and our internal commission/discount logic.
        return [
            "data" => [
                "ref_id" => $refId, // Dynamically set
                "customer_no" => $customerNo, // Dynamically set
                "customer_name" => "Nama Pelanggan BPJS " . Str::upper(substr(md5($customerNo), 0, 5)), // Dynamic dummy name
                "buyer_sku_code" => $buyerSkuCode, // Dynamically set
                "admin" => 2500, // Admin fee from the dummy example
                "message" => "Transaksi Sukses",
                "status" => "Sukses",
                "rc" => "00",
                "buyer_last_saldo" => 1000000, // Dummy balance
                "price" => 24700, // Base bill amount from the dummy example
                "desc" => [
                    "jumlah_peserta" => "2",
                    "lembar_tagihan" => 1,
                    "alamat" => "JAKARTA PUSAT",
                    "detail" => [
                        [
                            "periode" => date('Ym', strtotime("-0 month")), // Example: current month period
                        ]
                    ]
                ]
            ]
        ];
    }

    /**
     * Handles BPJS inquiry requests, using a dummy response.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function inquiry(Request $request)
    {
        $request->validate(['customer_no' => 'required|string|min:10']);
        $customerNo = $request->customer_no;

        // Fetch BPJS KESEHATAN products
        $availableProducts = PostpaidProduct::where('brand', 'BPJS KESEHATAN')
                                            ->where('seller_product_status', true)
                                            ->orderBy('buyer_sku_code', 'asc')
                                            ->get();

        if ($availableProducts->isEmpty()) {
            Log::warning("Inquiry BPJS: Tidak ada produk BPJS Kesehatan yang aktif ditemukan (Dummy Mode).");
            return response()->json(['message' => 'Layanan BPJS Kesehatan tidak tersedia saat ini.'], 503);
        }

        $successfulInquiryData = null;
        $productForCommission = $availableProducts->first(); // Use the first active product for commission calculation
        $current_sku = $productForCommission->buyer_sku_code;
        $ref_id = 'bpjs-' . substr(str_replace('-', '', Str::uuid()->toString()), 0, 15);
        
        // --- MODIFICATION: Directly use dummy response here ---
        $responseData = $this->getDummyBpjsInquiryResponse($customerNo, $current_sku, $ref_id);
        // --- END MODIFICATION ---

        // Process the dummy response as if it came from a real API
        if (isset($responseData['data']) && $responseData['data']['status'] === 'Sukses') {
            $inquiryDataFromApi = $responseData['data'];
            
            if (!isset($inquiryDataFromApi['desc']) || !is_array($inquiryDataFromApi['desc'])) {
                $inquiryDataFromApi['desc'] = [];
            }

            $totalNilaiTagihan = (float) ($inquiryDataFromApi['price'] ?? 0);
            $totalAdminFromProvider = (float) ($inquiryDataFromApi['admin'] ?? 0);
            $totalDenda = 0; // BPJS dummy does not specify denda explicitly at this level
            $totalBiayaLain = 0; // BPJS dummy does not specify biaya_lain explicitly

            $jumlahLembarTagihan = (int) ($inquiryDataFromApi['desc']['lembar_tagihan'] ?? 1);

            // Set the 'admin' in inquiryDataFromApi to the total admin from provider
            $inquiryDataFromApi['admin'] = $totalAdminFromProvider; 
            
            // 1. Calculate base discount per bill based on product commission
            $commission = $productForCommission->commission ?? 0;
            $commission_sell_percentage = $productForCommission->commission_sell_percentage ?? 0;
            $commission_sell_fixed = $productForCommission->commission_sell_fixed ?? 0;
            $diskonPerLembar = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;

            // 2. Multiply discount per bill by the number of bills
            $finalDiskon = $diskonPerLembar * $jumlahLembarTagihan;
            $finalDiskon = ceil($finalDiskon); // Round up the discount

            // 3. Calculate Final Selling Price (with our platform's discount)
            // selling_price = (pure bill price + other charges) + provider's total admin + total penalty - our platform's total discount
            $finalSellingPrice = ($totalNilaiTagihan + $totalBiayaLain) + $totalAdminFromProvider + $totalDenda - $finalDiskon;
            $finalSellingPrice = ceil($finalSellingPrice); // Round up the final selling price

            // 4. Reconstruct data for frontend and session storage
            $inquiryDataFromApi['price']         = $totalNilaiTagihan + $totalBiayaLain; // Total pure bill price + other charges
            $inquiryDataFromApi['denda']         = $totalDenda;
            $inquiryDataFromApi['diskon']        = $finalDiskon; // Our platform's calculated discount
            $inquiryDataFromApi['jumlah_lembar_tagihan'] = $jumlahLembarTagihan;
            $inquiryDataFromApi['selling_price'] = $finalSellingPrice; // Total to be paid by the customer
            $inquiryDataFromApi['buyer_sku_code'] = $current_sku;
            $inquiryDataFromApi['ref_id'] = $ref_id;

            // Add BPJS specific details to inquiry data for consistency
            $inquiryDataFromApi['jumlah_peserta'] = $inquiryDataFromApi['desc']['jumlah_peserta'] ?? null;
            $inquiryDataFromApi['alamat'] = $inquiryDataFromApi['desc']['alamat'] ?? null;

            $successfulInquiryData = $inquiryDataFromApi;

            Log::info("Inquiry BPJS Sukses (Dummy) untuk SKU: {$current_sku}. Customer No: {$customerNo}", [
                'customer_no' => $customerNo,
                'sku' => $current_sku,
                'ref_id' => $ref_id,
                'api_response' => $responseData,
                'processed_data' => $successfulInquiryData,
            ]);

            session(['postpaid_inquiry_data' => $successfulInquiryData]);
            return response()->json($successfulInquiryData);
        } else {
            $errorMessage = $responseData['data']['message'] ?? 'Gagal melakukan pengecekan tagihan dummy BPJS.';
            Log::warning("Inquiry BPJS Gagal (Dummy) untuk SKU: {$current_sku}. Customer No: {$customerNo}. Pesan: {$errorMessage}", [
                'customer_no' => $customerNo,
                'sku' => $current_sku,
                'ref_id' => $ref_id,
                'api_response' => $responseData,
            ]);
            return response()->json(['message' => $errorMessage], 400);
        }
    }
    
    /**
     * Handles BPJS payment requests, using a dummy response.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function payment(Request $request)
    {
        $user = Auth::user(); 
        // For testing without login, you can create a dummy user (uncomment if needed for direct testing):
        // if (!$user) { $user = (object)['id' => 1, 'balance' => 10000000, 'decrement' => function($attr, $val){}, 'increment' => function($attr, $val){}]; }

        $inquiryData = session('postpaid_inquiry_data');

        // Validate session data consistency
        if (!$inquiryData || ($inquiryData['customer_no'] ?? null) !== $request->customer_no) {
            return response()->json(['message' => 'Sesi tidak valid atau nomor pelanggan tidak cocok.'], 400);
        }

        $totalPriceToPay     = $inquiryData['selling_price'];
        $finalAdmin          = $inquiryData['admin'];
        $pureBillPrice       = $inquiryData['price'];
        $diskon              = $inquiryData['diskon'] ?? 0;
        $jumlahLembarTagihan = $inquiryData['jumlah_lembar_tagihan'] ?? 0;
        
        // Check user balance
        if ($user->balance < $totalPriceToPay) {
            return response()->json(['message' => 'Saldo Anda tidak mencukupi.'], 402);
        }

        // Decrement user balance
        $user->decrement('balance', $totalPriceToPay);

        // Map inquiry data to initial transaction record
        $initialData = $this->mapToUnifiedTransaction($inquiryData, 'BPJS', $pureBillPrice, $finalAdmin);
        $initialData['selling_price'] = $totalPriceToPay;
        $initialData['status'] = 'Pending';
        $initialData['message'] = 'Menunggu konfirmasi pembayaran dari provider';
        
        $initialData['rc'] = $inquiryData['rc'] ?? null;
        $initialData['sn'] = null; // SN is expected from payment response

        // Store BPJS specific details in the 'details' JSON column
        $initialData['details'] = [
            'diskon' => $diskon,
            'jumlah_lembar_tagihan' => $jumlahLembarTagihan,
            'jumlah_peserta' => $inquiryData['desc']['jumlah_peserta'] ?? null,
            'alamat' => $inquiryData['desc']['alamat'] ?? null,
        ];
        
        $unifiedTransaction = PostpaidTransaction::create($initialData);

        // --- MODIFICATION: Directly use dummy response for payment ---
        $apiResponseData = [
            "ref_id" => $inquiryData['ref_id'],
            "customer_no" => $inquiryData['customer_no'],
            "customer_name" => $inquiryData['customer_name'] ?? "PELANGGAN DUMMY BPJS",
            "buyer_sku_code" => $inquiryData['buyer_sku_code'],
            "admin" => $inquiryData['admin'],
            "message" => "Pembayaran Sukses. BPJS dummy SN: BP" . Str::upper(substr(md5($inquiryData['ref_id']), 0, 10)) . "JS",
            "status" => "Sukses",
            "rc" => "00",
            "sn" => "BP" . Str::upper(substr(md5($inquiryData['ref_id']), 0, 10)) . "JS", // Dummy serial number
            "buyer_last_saldo" => $user->balance, // Reflect new balance after decrement
            "price" => $inquiryData['price'],
            "selling_price" => $inquiryData['selling_price'], // This should be the same as totalPriceToPay
            "desc" => $inquiryData['desc'] ?? [], // Use desc from inquiry data
        ];
        Log::info('BPJS Payment DUMMY API Response:', ['response_data' => $apiResponseData, 'transaction_id' => $unifiedTransaction->id]);
        // --- END MODIFICATION ---
        
        $fullResponseData = array_merge($inquiryData, $apiResponseData);

        // Prepare payload for updating the transaction based on the (dummy) API response
        $updatePayload = $this->mapToUnifiedTransaction($fullResponseData, 'BPJS', $pureBillPrice, $finalAdmin);
        $updatePayload['selling_price'] = $totalPriceToPay; // Ensure selling_price remains consistent
        
        $updatePayload['rc'] = $apiResponseData['rc'] ?? null;
        $updatePayload['sn'] = $apiResponseData['sn'] ?? null;
        $updatePayload['status'] = $apiResponseData['status'] ?? 'Gagal'; // Update status from dummy response
        $updatePayload['message'] = $apiResponseData['message'] ?? 'Gagal melakukan pembayaran dummy.'; // Update message from dummy response

        // Define keys to exclude from the 'details' array, as they are stored in other columns
        $keysToExcludeFromDetails = [
            'ref_id', 'customer_no', 'customer_name', 'buyer_sku_code', 'message',
            'rc', 'sn', 'buyer_last_saldo', 'price', 'selling_price', 'admin', 'status',
            'diskon', 'jumlah_lembar_tagihan', 'jumlah_peserta', 'alamat'
        ];

        $detailsFromApiResponse = [];
        foreach ($apiResponseData as $key => $value) {
            if (!in_array($key, $keysToExcludeFromDetails)) {
                $detailsFromApiResponse[$key] = $value;
            }
        }
        
        // Merge original details with any new details from API response
        $updatePayload['details'] = array_merge(
            $detailsFromApiResponse,
            [
                'diskon' => $diskon,
                'jumlah_lembar_tagihan' => $jumlahLembarTagihan,
                'jumlah_peserta' => $inquiryData['desc']['jumlah_peserta'] ?? null,
                'alamat' => $inquiryData['desc']['alamat'] ?? null,
            ]
        );

        // Unset fields that are not part of the `update` method or are already correctly set
        unset($updatePayload['user_id'], $updatePayload['ref_id'], $updatePayload['type'], $updatePayload['price'], $updatePayload['admin_fee']);
        
        $unifiedTransaction->update($updatePayload);

        // Refresh the model to get the very latest data from the database
        $unifiedTransaction->refresh(); 

        // Update the $fullResponseData with the actual values saved in the database
        // This ensures the frontend displays exactly what's recorded.
        $fullResponseData['selling_price'] = $unifiedTransaction->selling_price;
        $fullResponseData['status'] = $unifiedTransaction->status;
        $fullResponseData['customer_name'] = $unifiedTransaction->customer_name;
        $fullResponseData['customer_no'] = $unifiedTransaction->customer_no;
        $fullResponseData['diskon'] = $unifiedTransaction->details['diskon'] ?? 0;
        $fullResponseData['sn'] = $unifiedTransaction->sn;
        $fullResponseData['jumlah_peserta'] = $unifiedTransaction->details['jumlah_peserta'] ?? null;
        $fullResponseData['alamat'] = $unifiedTransaction->details['alamat'] ?? null;


        // Logic for refund if the dummy transaction status indicates failure
        if (($apiResponseData['status'] ?? 'Gagal') === 'Gagal') {
            $user->increment('balance', $totalPriceToPay);
        }

        session()->forget('postpaid_inquiry_data'); // Clear session after transaction
        return response()->json($fullResponseData);
    }
}