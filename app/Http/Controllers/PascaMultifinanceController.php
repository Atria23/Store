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

// class PascaMultifinanceController extends Controller
// {
//     use TransactionMapper;

//     /**
//      * Menampilkan halaman pembayaran Multifinance dengan daftar produk.
//      */
//     public function index()
//     {
//         $products = $this->fetchMultifinanceProducts();
//         return Inertia::render('Pascabayar/Multifinance', [
//             'products' => $products,
//             'auth' => [
//                 'user' => Auth::user(),
//             ],
//         ]);
//     }

//     /**
//      * Mengambil daftar produk Multifinance dari database lokal.
//      * Produk dengan status seller_product_status = false juga diambil
//      * agar bisa ditampilkan di frontend dengan indikator gangguan.
//      */
//     private function fetchMultifinanceProducts()
//     {
//         $multifinanceProducts = PostpaidProduct::where('brand', 'MULTIFINANCE')
//                                         ->orderBy('product_name', 'asc')
//                                         ->get();

//         return $multifinanceProducts->map(function ($product) {
//             $commission = $product->commission ?? 0;
//             $commission_sell_percentage = $product->commission_sell_percentage ?? 0;
//             $commission_sell_fixed = $product->commission_sell_fixed ?? 0;
//             $adminFromServer = $product->admin ?? 0;

//             $markupForClient = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;
//             $product->calculated_admin = ceil($adminFromServer - $markupForClient);

//             return $product;
//         })->values()->all();
//     }

//     /**
//      * Helper method to perform a single Multifinance inquiry.
//      * Handles API calls and data processing for a given customer number and product.
//      *
//      * @param string $customerNo The customer number (contract number) to inquire.
//      * @param PostpaidProduct $product The PostpaidProduct model associated with the inquiry.
//      * @return array|null Returns processed inquiry data on success, null on failure.
//      */
//     private function _performSingleMultifinanceInquiry(string $customerNo, PostpaidProduct $product): ?array
//     {
//         $current_sku = $product->buyer_sku_code;
//         $ref_id = 'mf-' . substr(str_replace('-', '', Str::uuid()->toString()), 0, 15);
//         $username = env('P_U');
//         $apiKey = env('P_AK'); // Assuming P_AK is also used for Multifinance
//         $sign = md5($username . $apiKey . $ref_id);

//         $responseData = [];

//         // --- START DUMMY DATA FOR TESTING INQUIRY (if APP_ENV is local) ---
//         if (env('APP_ENV') === 'local') {
//             $customerNoLength = strlen($customerNo);
//             $lastDigit = $customerNo[$customerNoLength - 1] ?? '0';
//             $isOverdue = ((int)$lastDigit % 2 === 0); // Simulate overdue for even last digits
//             $customerNameSeed = substr(preg_replace('/[^0-9]/', '', $customerNo), 0, 5);

//             $baseBillAmount = 500000 + (substr($customerNo, -2, 1) * 10000); // Principal + Interest
//             $adminFeePerPeriodDummy = 7500; // Admin fee per period (part of the bill)
//             $dendaPerPeriodDummy = $isOverdue ? (25000 + (substr($customerNo, -3, 1) * 1000)) : 0; // Denda per period

//             $numPeriods = 1;
//             if ((int)$lastDigit % 3 === 0) {
//                 $numPeriods = 2;
//             }

//             $dummyDescDetails = [];
//             $totalBillAmountDummy = 0; // Sum of baseBillAmount from all periods
//             $totalAdminFeePerPeriodAggregatedDummy = 0; // Sum of adminFeePerPeriodDummy from all periods
//             $totalDendaAggregatedDummy = 0; // Sum of dendaPerPeriodDummy from all periods

//             for ($i = 0; $i < $numPeriods; $i++) {
//                 $periode = date('Y-m', strtotime("-{$i} month")); // Format YYYY-MM
//                 $billAmount = $baseBillAmount + ($i * 5000);
//                 $dendaAmount = $isOverdue ? ($dendaPerPeriodDummy / $numPeriods) : 0;

//                 $dummyDescDetails[] = [
//                     "periode" => $periode,
//                     "bill_amount" => $billAmount, // Pokok per periode
//                     "admin_fee_per_period" => $adminFeePerPeriodDummy, // Admin per periode
//                     "denda" => ceil($dendaAmount),
//                 ];
//                 $totalBillAmountDummy += $billAmount;
//                 $totalAdminFeePerPeriodAggregatedDummy += $adminFeePerPeriodDummy;
//                 $totalDendaAggregatedDummy += ceil($dendaAmount);
//             }

//             $dummyCustomerName = 'Pelanggan ' . $product->product_name . ' ' . $customerNameSeed . ($isOverdue ? ' (OVERDUE)' : '');
//             $dummyItemName = 'Motor ABC-XYZ';
//             $dummyNoRangka = 'MHS' . Str::random(10) . 'A';
//             $dummyNoPol = 'AB ' . (1000 + (int)$customerNoLength) . ' AZ';
//             $dummyTenor = 36; // Example tenor

//             // This is the root admin fee from the provider, for informational purposes only.
//             // It is considered part of their total selling_price.
//             $providerInfoAdminDummy = 5000;

//             // This is the actual total charged by the provider (selling_price for them)
//             // It includes all principal, interest, per-period admin, denda, AND their root admin fee.
//             $dummyProviderOriginalSellingPrice = $totalBillAmountDummy + $totalAdminFeePerPeriodAggregatedDummy + $totalDendaAggregatedDummy + $providerInfoAdminDummy;

//             // The 'price' field for our internal record will be (provider's total selling price - provider's root admin info)
//             // This is "selling_price from api - admin from api" as per request for internal price.
//             $dummyPriceFieldForOurRecord = $dummyProviderOriginalSellingPrice - $providerInfoAdminDummy;


//             $responseData = [
//                 'data' => [
//                     'status' => 'Sukses',
//                     'message' => 'Inquiry Multifinance dummy berhasil.',
//                     'customer_name' => $dummyCustomerName,
//                     'customer_no' => $customerNo,
//                     'buyer_sku_code' => $current_sku,
//                     'price' => $dummyPriceFieldForOurRecord, // This is (provider's selling_price - provider's root admin) for our internal record
//                     'admin' => $providerInfoAdminDummy, // This is the informational root admin from provider
//                     'rc' => '00',
//                     'sn' => 'SN-INQ-MF-' . Str::random(10),
//                     'ref_id' => $ref_id,
//                     'desc' => [
//                         "item_name" => $dummyItemName,
//                         "no_rangka" => $dummyNoRangka,
//                         "no_pol" => $dummyNoPol,
//                         "tenor" => $dummyTenor,
//                         "lembar_tagihan" => $numPeriods, // Total periods with bills
//                         "detail" => $dummyDescDetails,
//                         "total_denda" => $totalDendaAggregatedDummy, // Total denda from all periods
//                         "total_admin_per_period" => $totalAdminFeePerPeriodAggregatedDummy, // Total admin fee from all periods
//                     ],
//                     'selling_price' => $dummyProviderOriginalSellingPrice, // This is the actual total charged by provider for their service
//                 ],
//             ];
//             Log::info('Multifinance Inquiry API Response (DUMMY):', ['response_data' => $responseData, 'customer_no' => $customerNo, 'sku' => $current_sku, 'ref_id' => $ref_id]);
//         } else {
//             // --- END DUMMY DATA ---

//             // --- ORIGINAL API CALL (only if not in local dummy mode) ---
//             if (!$product->seller_product_status) {
//                 Log::warning("Multifinance Inquiry: Produk tidak aktif untuk SKU: {$current_sku}. Customer No: {$customerNo}.");
//                 return null;
//             }

//             try {
//                 $response = Http::post(config('services.api_server') . '/v1/transaction', [
//                     'commands' => 'inq-pasca',
//                     'username' => $username,
//                     'buyer_sku_code' => $current_sku, // Use generic multifinance code if specific SKU is not accepted by provider
//                     'customer_no' => $customerNo,
//                     'ref_id' => $ref_id,
//                     'sign' => $sign,
//                     'testing' => false, // Make sure this is 'false' in production
//                 ]);

//                 $responseData = $response->json();
//                 Log::info('Multifinance Inquiry API Response:', ['response_data' => $responseData, 'customer_no' => $customerNo, 'sku' => $current_sku, 'ref_id' => $ref_id]);

//                 if (!isset($responseData['data']) || $responseData['data']['status'] !== 'Sukses') {
//                     $errorMessage = $responseData['data']['message'] ?? 'Gagal melakukan pengecekan tagihan dari provider.';
//                     Log::warning("Inquiry Multifinance Gagal dari Provider untuk SKU: {$current_sku}. Pesan: {$errorMessage}", ['response' => $responseData, 'customer_no' => $customerNo]);
//                     return null;
//                 }
//             } catch (\Exception $e) {
//                 Log::error('Multifinance Inquiry Error (API Call): ' . $e->getMessage(), ['customer_no' => $customerNo, 'sku' => $current_sku, 'exception_trace' => $e->getTraceAsString()]);
//                 return null;
//             }
//         }

//         // --- COMMON PROCESSING LOGIC (for both real and dummy data) ---
//         $inquiryDataFromApi = $responseData['data'];

//         $providerOriginalSellingPrice = (float) ($inquiryDataFromApi['selling_price'] ?? 0); // Total price charged by provider
//         $providerInfoAdmin = (float) ($inquiryDataFromApi['admin'] ?? 0); // Root admin fee reported by provider (info only)

//         // Ensure 'desc' is an array and initialize common Multifinance specific keys
//         if (!isset($inquiryDataFromApi['desc']) || !is_array($inquiryDataFromApi['desc'])) {
//             $inquiryDataFromApi['desc'] = [];
//         }
//         $inquiryDataFromApi['desc']['item_name'] = $inquiryDataFromApi['desc']['item_name'] ?? null;
//         $inquiryDataFromApi['desc']['no_rangka'] = $inquiryDataFromApi['desc']['no_rangka'] ?? null;
//         $inquiryDataFromApi['desc']['no_pol'] = $inquiryDataFromApi['desc']['no_pol'] ?? null;
//         $inquiryDataFromApi['desc']['tenor'] = $inquiryDataFromApi['desc']['tenor'] ?? null;
//         $inquiryDataFromApi['desc']['jatuh_tempo'] = $inquiryDataFromApi['desc']['jatuh_tempo'] ?? null; // Added jatuh_tempo

//         $totalDendaAggregated = 0; // Sum of denda from details/desc
//         $totalAdminFeePerPeriodAggregated = 0; // Sum of admin_fee_per_period from details/desc
//         $jumlahLembarTagihan = (int) ($inquiryDataFromApi['desc']['lembar_tagihan'] ?? 1); // From desc or default

//         // Process details to accumulate denda and per-period admin fees
//         $processedDetails = [];
//         if (isset($inquiryDataFromApi['desc']['detail']) && is_array($inquiryDataFromApi['desc']['detail'])) {
//             foreach ($inquiryDataFromApi['desc']['detail'] as $detail) {
//                 // Map generic API keys to desired Multifinance keys
//                 $billAmountDetail = (float) ($detail['bill_amount'] ?? $detail['nilai_tagihan'] ?? 0); // Base bill per period (principal+interest)
//                 $adminFeeDetail = (float) ($detail['admin_fee_per_period'] ?? $detail['admin'] ?? 0); // Admin fee per period
//                 $dendaDetail = (float) ($detail['denda'] ?? 0);

//                 $processedDetails[] = [
//                     "periode" => $detail['periode'] ?? null,
//                     "bill_amount" => $billAmountDetail,
//                     "admin_fee_per_period" => $adminFeeDetail,
//                     "denda" => $dendaDetail,
//                 ];

//                 $totalDendaAggregated += $dendaDetail;
//                 $totalAdminFeePerPeriodAggregated += $adminFeeDetail;
//             }
//             $inquiryDataFromApi['desc']['detail'] = $processedDetails; // Update with mapped details
//         } else {
//             // Fallback if 'detail' is not an array. Take totals from desc or root
//             $totalDendaAggregated = (float) ($inquiryDataFromApi['desc']['total_denda'] ?? $inquiryDataFromApi['denda'] ?? 0);
//             $totalAdminFeePerPeriodAggregated = (float) ($inquiryDataFromApi['desc']['total_admin_per_period'] ?? 0);
//         }

//         // --- CALCULATE sumOfPureBillAmounts (for our internal record 'price') ---
//         // As per user request: "pure biaya nay itu selling_price from api - admin from api"
//         // This 'price' field for us will be (provider's total selling price - provider's root admin info)
//         $sumOfPureBillAmounts = $providerOriginalSellingPrice - $providerInfoAdmin;

//         // Ensure price is not negative (if provider's admin > selling_price, highly unlikely but for safety)
//         if ($sumOfPureBillAmounts < 0) {
//             Log::warning("Multifinance Inquiry: Calculated sumOfPureBillAmounts went negative for customer {$customerNo}. Adjusting to 0.", [
//                 'providerOriginalSellingPrice' => $providerOriginalSellingPrice,
//                 'providerInfoAdmin' => $providerInfoAdmin,
//                 'inquiryDataFromApi' => $inquiryDataFromApi
//             ]);
//             $sumOfPureBillAmounts = 0;
//         }

//         // Our commission/markup logic
//         $commission = $product->commission ?? 0;
//         $commission_sell_percentage = $product->commission_sell_percentage ?? 0;
//         $commission_sell_fixed = $product->commission_sell_fixed ?? 0;
//         $diskonPerLembar = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;

//         $finalDiskon = $diskonPerLembar * $jumlahLembarTagihan; // Apply discount based on number of billing periods
//         $finalDiskon = ceil($finalDiskon);

//         // Our own calculated admin margin for this product (this is what goes into our 'admin' record field)
//         $ourCalculatedAdmin = $product->calculated_admin;

//         // --- CALCULATE finalSellingPrice (what the customer actually pays) ---
//         // As per user request: (provider's total selling_price + our admin_margin) - our_discount
//         // "admin dari response itu sebenarnya hanya info saja, karena selling_price sejatihanya sudah termasuk admin dari response"
//         // so providerInfoAdmin is part of providerOriginalSellingPrice and not added again.
//         $finalSellingPrice = ($providerOriginalSellingPrice + $ourCalculatedAdmin) - $finalDiskon;
//         $finalSellingPrice = ceil($finalSellingPrice);

//         // Override logic (simplified to prevent our calculated selling price from being lower than provider's reported total selling price)
//         // Jika providerOriginalSellingPrice (total dari provider) lebih besar dari finalSellingPrice yang kita hitung,
//         // maka gunakan providerOriginalSellingPrice sebagai finalSellingPrice (ini untuk mencegah harga jual kita lebih rendah dari harga provider jika ada anomali).
//         if ($providerOriginalSellingPrice > $finalSellingPrice) {
//             Log::info('Multifinance Inquiry: finalSellingPrice overridden by provider_original_selling_price.', [
//                 'calculated_finalSellingPrice' => $finalSellingPrice,
//                 'providerOriginalSellingPrice' => $providerOriginalSellingPrice,
//                 'customer_no' => $customerNo
//             ]);
//             $finalSellingPrice = $providerOriginalSellingPrice;
//         }

//         // Populate the final successful inquiry data array
//         $successfulInquiryData = $inquiryDataFromApi;
//         $successfulInquiryData['price']         = $sumOfPureBillAmounts; // Our calculated pure bill price (for mapping, based on selling_price - admin info)
//         $successfulInquiryData['admin']         = $ourCalculatedAdmin; // This is OUR calculated admin margin (to be recorded and shown in frontend)
//         $successfulInquiryData['denda']         = $totalDendaAggregated; // Our calculated total denda
//         $successfulInquiryData['diskon']        = $finalDiskon;
//         $successfulInquiryData['jumlah_lembar_tagihan'] = $jumlahLembarTagihan;
//         $successfulInquiryData['selling_price'] = $finalSellingPrice; // What the user pays (final amount)
//         $successfulInquiryData['buyer_sku_code'] = $current_sku;
//         $successfulInquiryData['ref_id'] = $ref_id;
//         $successfulInquiryData['provider_original_selling_price'] = $providerOriginalSellingPrice; // For reference
//         $successfulInquiryData['product_name'] = $product->product_name; // Add product name for frontend display

//         unset($successfulInquiryData['buyer_last_saldo']);

//         Log::info("Inquiry Multifinance Sukses (processed). Customer No: {$customerNo}", [
//             'customer_no' => $customerNo,
//             'ref_id' => $successfulInquiryData['ref_id'],
//             'processed_data' => $successfulInquiryData,
//         ]);

//         return $successfulInquiryData;
//     }
    

//     public function inquiry(Request $request)
//     {
//         $request->validate([
//             'customer_no' => 'required|string|min:4', // Multifinance numbers might be shorter
//             'buyer_sku_code' => 'required|string|exists:postpaid_products,buyer_sku_code',
//         ]);

//         $customerNo = $request->customer_no;
//         $current_sku = $request->buyer_sku_code;

//         $product = PostpaidProduct::where('buyer_sku_code', $current_sku)->first();

//         if (!$product || !$product->seller_product_status) {
//             return response()->json(['message' => 'Produk Multifinance tidak tersedia atau tidak aktif.'], 503);
//         }

//         $inquiryData = $this->_performSingleMultifinanceInquiry($customerNo, $product);

//         if ($inquiryData) {
//             session(['postpaid_inquiry_data' => $inquiryData]);
//             return response()->json($inquiryData);
//         } else {
//             return response()->json(['message' => 'Gagal melakukan pengecekan tagihan. Silakan coba lagi nanti.'], 400);
//         }
//     }

//     /**
//      * Helper method to process a single Multifinance payment after balance has been debited.
//      *
//      * @param array $inquiryData Processed inquiry data for a single customer.
//      * @param \App\Models\User $user The authenticated user (for logging/context, not balance modification).
//      * @return array Returns an array with transaction status and details.
//      * @throws \Exception If the API call or transaction update fails critically.
//      */
//     private function _processIndividualMultifinancePayment(array $inquiryData, \App\Models\User $user): array
//     {
//         $totalPriceToPay     = (float) $inquiryData['selling_price'];
//         $finalAdmin          = (float) ($inquiryData['admin'] ?? 0); // Our calculated admin margin
//         $pureBillPrice       = (float) ($inquiryData['price'] ?? 0); // Our calculated pure bill price
//         $diskon              = (float) ($inquiryData['diskon'] ?? 0);
//         $jumlahLembarTagihan = (int) ($inquiryData['jumlah_lembar_tagihan'] ?? 0);
//         $denda               = (float) ($inquiryData['denda'] ?? 0);

//         $initialData = $this->mapToUnifiedTransaction($inquiryData, 'MULTIFINANCE', $pureBillPrice, $finalAdmin);
//         $initialData['user_id'] = $user->id;
//         $initialData['selling_price'] = $totalPriceToPay;
//         $initialData['status'] = 'Pending';
//         $initialData['message'] = 'Menunggu konfirmasi pembayaran dari provider';

//         $initialData['rc'] = $inquiryData['rc'] ?? null;
//         $initialData['sn'] = null;

//         $initialData['details'] = [
//             'diskon' => $diskon,
//             'jumlah_lembar_tagihan' => $jumlahLembarTagihan,
//             'denda' => $denda,
//             'desc' => $inquiryData['desc'] ?? null,
//         ];
//         unset($initialData['buyer_last_saldo']);
//         unset($initialData['provider_original_selling_price']);

//         $unifiedTransaction = PostpaidTransaction::create($initialData);

//         $apiResponseData = [];

//         // --- START DUMMY RESPONSE PAYMENT ---
//         if (env('APP_ENV') === 'local') {
//             $isPaymentSuccess = (substr($inquiryData['customer_no'], -1) % 2 !== 0); // Simulate success for odd last digit

//             if ($isPaymentSuccess) {
//                 $apiResponseData = [
//                     'status' => 'Sukses',
//                     'message' => 'Pembayaran Multifinance dummy berhasil diproses.',
//                     'rc' => '00',
//                     'sn' => 'SN-MF-' . Str::random(15),
//                     'customer_name' => $inquiryData['customer_name'],
//                     'customer_no' => $inquiryData['customer_no'],
//                     'buyer_sku_code' => $inquiryData['buyer_sku_code'],
//                     'price' => $pureBillPrice,
//                     'admin' => $finalAdmin,
//                     'ref_id' => $inquiryData['ref_id'],
//                     'selling_price' => $totalPriceToPay,
//                 ];
//             } else {
//                 $apiResponseData = [
//                     'status' => 'Gagal',
//                     'message' => 'Pembayaran Multifinance dummy gagal. Saldo provider tidak cukup (simulasi).',
//                     'rc' => '14',
//                     'sn' => null,
//                     'customer_name' => $inquiryData['customer_name'],
//                     'customer_no' => $inquiryData['customer_no'],
//                     'buyer_sku_code' => $inquiryData['buyer_sku_code'],
//                     'price' => $pureBillPrice,
//                     'admin' => $finalAdmin,
//                     'ref_id' => $inquiryData['ref_id'],
//                     'selling_price' => $totalPriceToPay,
//                 ];
//             }
//             Log::info('Multifinance Payment Dummy Response:', ['response_data' => $apiResponseData, 'transaction_id' => $unifiedTransaction->id]);

//         } else {
//             // --- END DUMMY DATA ---

//             // --- ORIGINAL API CALL (only if not in local dummy mode) ---
//             $username = env('P_U');
//             $apiKey = env('P_AK'); // Use P_AK for real API call
//             $sign = md5($username . $apiKey . $inquiryData['ref_id']);

//             try {
//                 $response = Http::post(config('services.api_server') . '/v1/transaction', [
//                     'commands' => 'pay-pasca',
//                     'username' => $username,
//                     'buyer_sku_code' => $inquiryData['buyer_sku_code'],
//                     'customer_no' => $inquiryData['customer_no'],
//                     'ref_id' => $inquiryData['ref_id'],
//                     'sign' => $sign,
//                     'testing' => false, // Make sure this is 'false' in production
//                 ]);
//                 $apiResponseData = $response->json()['data'];

//                 Log::info('Multifinance Payment API Response:', ['response_data' => $apiResponseData, 'transaction_id' => $unifiedTransaction->id]);

//             } catch (\Exception $e) {
//                 $errorMessage = ['status' => 'Gagal', 'message' => 'Gagal terhubung ke server provider.'];
//                 $unifiedTransaction->update(array_merge($errorMessage, ['rc' => null, 'sn' => null]));
//                 Log::error('Multifinance Payment Error: ' . $e->getMessage(), ['transaction_id' => $unifiedTransaction->id, 'inquiry_data' => $inquiryData]);
//                 throw new \Exception('Terjadi kesalahan pada server provider.');
//             }
//         }

//         $fullResponseData = array_merge($inquiryData, $apiResponseData);

//         $fullResponseData['price'] = $pureBillPrice;
//         $fullResponseData['admin'] = $finalAdmin;
//         $fullResponseData['selling_price'] = $totalPriceToPay;
//         unset($fullResponseData['buyer_last_saldo']);
//         unset($fullResponseData['provider_original_selling_price']);

//         $updatePayload = $this->mapToUnifiedTransaction($fullResponseData, 'MULTIFINANCE', $pureBillPrice, $finalAdmin);
//         $updatePayload['selling_price'] = $totalPriceToPay;
//         $updatePayload['status'] = $apiResponseData['status'] ?? 'Gagal';
//         $updatePayload['message'] = $apiResponseData['message'] ?? 'Pembayaran gagal.';

//         $updatePayload['rc'] = $apiResponseData['rc'] ?? null;
//         $updatePayload['sn'] = $apiResponseData['sn'] ?? null;

//         $keysToExcludeFromDetails = [
//             'ref_id', 'customer_no', 'customer_name', 'buyer_sku_code', 'message',
//             'rc', 'sn', 'buyer_last_saldo', 'price', 'selling_price', 'admin', 'status',
//             'diskon', 'jumlah_lembar_tagihan', 'denda', 'desc', 'provider_original_selling_price', 'product_name'
//         ];

//         $detailsFromApiResponse = [];
//         foreach ($apiResponseData as $key => $value) {
//             if (!in_array($key, $keysToExcludeFromDetails)) {
//                 $detailsFromApiResponse[$key] = $value;
//             }
//         }

//         $updatePayload['details'] = array_merge(
//             $detailsFromApiResponse,
//             ['diskon' => $diskon, 'jumlah_lembar_tagihan' => $jumlahLembarTagihan, 'denda' => $denda],
//             ['desc' => $inquiryData['desc'] ?? null]
//         );

//         unset($updatePayload['user_id'], $updatePayload['ref_id'], $updatePayload['type'], $updatePayload['price'], $updatePayload['admin_fee']);
//         unset($updatePayload['buyer_last_saldo']);
//         unset($updatePayload['provider_original_selling_price']);

//         $unifiedTransaction->update($updatePayload);
//         $unifiedTransaction->refresh();

//         // Return a structured result for the calling method
//         return [
//             'transaction_id' => $unifiedTransaction->id,
//             'ref_id' => $unifiedTransaction->ref_id,
//             'customer_no' => $unifiedTransaction->customer_no,
//             'customer_name' => $unifiedTransaction->customer_name,
//             'selling_price' => $unifiedTransaction->selling_price,
//             'status' => $unifiedTransaction->status,
//             'message' => $unifiedTransaction->message,
//             'diskon' => $unifiedTransaction->details['diskon'] ?? 0,
//             'jumlah_lembar_tagihan' => $unifiedTransaction->details['jumlah_lembar_tagihan'] ?? 0,
//             'denda' => $unifiedTransaction->details['denda'] ?? 0,
//             'admin' => $unifiedTransaction->admin_fee,
//             'price' => $unifiedTransaction->price,
//             'sn' => $unifiedTransaction->sn,
//             'product_name' => $inquiryData['product_name'], // Pass product name from inquiry data
//             'details' => $unifiedTransaction->details,
//         ];
//     }

//     public function payment(Request $request)
//     {
//         $user = Auth::user();
//         $inquiryData = session('postpaid_inquiry_data');

//         if (!$inquiryData || $inquiryData['customer_no'] !== $request->customer_no) {
//             return response()->json(['message' => 'Sesi tidak valid atau nomor pelanggan tidak cocok.'], 400);
//         }

//         $totalPriceToPay = (float) $inquiryData['selling_price'];

//         if ($user->balance < $totalPriceToPay) {
//             return response()->json(['message' => 'Saldo Anda tidak mencukupi.'], 402);
//         }

//         $user->decrement('balance', $totalPriceToPay);
//         Log::info("Multifinance Single Payment: User {$user->id} debited {$totalPriceToPay} for single payment.");

//         try {
//             $paymentResult = $this->_processIndividualMultifinancePayment($inquiryData, $user);

//             if (($paymentResult['status'] ?? 'Gagal') === 'Gagal') {
//                 $user->increment('balance', $totalPriceToPay);
//                 Log::warning("Multifinance Single Payment: Transaction {$paymentResult['transaction_id']} failed, balance refunded {$totalPriceToPay}.");
//             }
//             session()->forget('postpaid_inquiry_data');
//             return response()->json($paymentResult);
//         } catch (\Exception $e) {
//             $user->increment('balance', $totalPriceToPay);
//             Log::error('Multifinance Single Payment Error (Controller): ' . $e->getMessage(), ['customer_no' => $request->customer_no, 'inquiry_data' => $inquiryData]);
//             return response()->json(['message' => 'Terjadi kesalahan saat memproses pembayaran: ' . $e->getMessage()], 500);
//         }
//     }

//     /**
//      * NEW: Handles bulk Multifinance inquiry for multiple customer numbers.
//      *
//      * @param Request $request Contains 'customer_nos' array and 'buyer_sku_code'.
//      * @return \Illuminate\Http\JsonResponse
//      */
//     public function bulkInquiry(Request $request)
//     {
//         $request->validate([
//             'customer_nos' => 'required|array',
//             'customer_nos.*' => 'required|string|min:4',
//             'buyer_sku_code' => 'required|string|exists:postpaid_products,buyer_sku_code',
//         ]);

//         $customerNos = array_unique($request->customer_nos);
//         $buyerSkuCode = $request->buyer_sku_code;

//         $results = [
//             'successful' => [],
//             'failed' => [],
//         ];

//         $product = PostpaidProduct::where('buyer_sku_code', $buyerSkuCode)->first();

//         if (!$product || !$product->seller_product_status) {
//             Log::warning("Bulk Inquiry Multifinance: Produk tidak tersedia atau tidak aktif: {$buyerSkuCode}.");
//             return response()->json(['message' => 'Produk Multifinance yang dipilih tidak tersedia atau tidak aktif.'], 503);
//         }

//         foreach ($customerNos as $customerNo) {
//             try {
//                 $inquiryData = $this->_performSingleMultifinanceInquiry($customerNo, $product);

//                 if ($inquiryData) {
//                     $results['successful'][] = $inquiryData;
//                 } else {
//                     $results['failed'][] = [
//                         'customer_no' => $customerNo,
//                         'product_name' => $product->product_name,
//                         'message' => 'Tidak dapat menemukan tagihan atau layanan tidak tersedia.',
//                         'buyer_sku_code' => $buyerSkuCode,
//                     ];
//                 }
//             } catch (\Exception $e) {
//                 Log::error("Bulk Inquiry Multifinance: Unexpected error for customer {$customerNo}, SKU {$buyerSkuCode}. Error: " . $e->getMessage());
//                 $results['failed'][] = [
//                     'customer_no' => $customerNo,
//                     'product_name' => $product->product_name,
//                     'message' => 'Terjadi kesalahan saat pengecekan tagihan: ' . $e->getMessage(),
//                     'buyer_sku_code' => $buyerSkuCode,
//                 ];
//             }
//         }

//         if (empty($results['successful']) && empty($results['failed'])) {
//             return response()->json(['message' => 'Tidak ada nomor pelanggan yang diproses.'], 400);
//         }

//         if (!empty($results['successful'])) {
//             session(['postpaid_bulk_multifinance_inquiry_data' => $results['successful']]);
//         } else {
//             session()->forget('postpaid_bulk_multifinance_inquiry_data');
//         }

//         return response()->json($results);
//     }

//     /**
//      * NEW: Handles bulk Multifinance payment for multiple previously inquired customer numbers.
//      *
//      * @param Request $request Contains 'customer_nos_to_pay' array.
//      * @return \Illuminate\Http\JsonResponse
//      */
//     public function bulkPayment(Request $request)
//     {
//         $user = Auth::user();
//         $inquiryDataForPayment = session('postpaid_bulk_multifinance_inquiry_data');

//         if (!$inquiryDataForPayment || empty($inquiryDataForPayment)) {
//             return response()->json(['message' => 'Sesi pembayaran massal tidak valid atau kosong. Silakan lakukan pengecekan tagihan ulang.'], 400);
//         }

//         $requestedCustomerNos = collect($request->customer_nos_to_pay)->unique();
//         $filteredInquiryDataForPayment = collect($inquiryDataForPayment)->filter(function ($item) use ($requestedCustomerNos) {
//             return $requestedCustomerNos->contains($item['customer_no']);
//         })->values()->all();

//         if (count($requestedCustomerNos) !== count($filteredInquiryDataForPayment)) {
//             Log::warning("Bulk Payment Multifinance: Mismatch between requested customer_nos and session data after filtering.", [
//                'request_customer_nos' => $requestedCustomerNos->all(),
//                'session_filtered_customer_nos' => collect($filteredInquiryDataForPayment)->pluck('customer_no')->all(),
//                'user_id' => $user->id,
//            ]);
//            return response()->json(['message' => 'Beberapa data pelanggan untuk pembayaran tidak cocok dengan sesi. Silakan coba lagi.'], 400);
//         }

//         $totalPriceForBulkPayment = collect($filteredInquiryDataForPayment)->sum('selling_price');

//         if ($user->balance < $totalPriceForBulkPayment) {
//             return response()->json(['message' => 'Saldo Anda tidak mencukupi untuk semua transaksi ini.'], 402);
//         }

//         $user->decrement('balance', $totalPriceForBulkPayment);
//         Log::info("Bulk Payment Multifinance: User {$user->id} debited total {$totalPriceForBulkPayment} for bulk payment.");

//         $paymentResults = [];
//         $totalRefundAmount = 0;

//         foreach ($filteredInquiryDataForPayment as $inquiryData) {
//             try {
//                 $individualPaymentResult = $this->_processIndividualMultifinancePayment($inquiryData, $user);
//                 $paymentResults[] = $individualPaymentResult;

//                 if (($individualPaymentResult['status'] ?? 'Gagal') === 'Gagal') {
//                     $totalRefundAmount += $inquiryData['selling_price'];
//                     Log::warning("Bulk Payment Multifinance: Individual transaction for {$inquiryData['customer_no']} failed, adding {$inquiryData['selling_price']} to refund amount.");
//                 }
//             } catch (\Exception $e) {
//                 Log::error('Multifinance Bulk Payment Error for customer ' . $inquiryData['customer_no'] . ': ' . $e->getMessage(), ['inquiry_data' => $inquiryData, 'user_id' => $user->id]);
//                 $paymentResults[] = array_merge($inquiryData, [
//                     'customer_no' => $inquiryData['customer_no'],
//                     'customer_name' => $inquiryData['customer_name'] ?? 'N/A',
//                     'selling_price' => $inquiryData['selling_price'],
//                     'status' => 'Gagal',
//                     'message' => 'Terjadi kesalahan saat memproses tagihan ini: ' . $e->getMessage(),
//                     'product_name' => $inquiryData['product_name'],
//                 ]);
//                 $totalRefundAmount += $inquiryData['selling_price'];
//             }
//         }

//         if ($totalRefundAmount > 0) {
//             $user->increment('balance', $totalRefundAmount);
//             Log::info("Bulk Payment Multifinance: Refunded {$totalRefundAmount} to user {$user->id} for failed transactions.");
//         }

//         session()->forget('postpaid_bulk_multifinance_inquiry_data');
//         return response()->json([
//             'results' => $paymentResults,
//             'total_refund_amount' => $totalRefundAmount,
//             'total_paid_amount' => $totalPriceForBulkPayment - $totalRefundAmount
//         ]);
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

class PascaMultifinanceController extends Controller
{
    use TransactionMapper;

    /**
     * Menampilkan halaman pembayaran Multifinance dengan daftar produk.
     */
    public function index()
    {
        $products = $this->fetchMultifinanceProducts();
        return Inertia::render('Pascabayar/Multifinance', [
            'products' => $products,
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }

    /**
     * Mengambil daftar produk Multifinance dari database lokal.
     * Produk dengan status seller_product_status = false juga diambil
     * agar bisa ditampilkan di frontend dengan indikator gangguan.
     */
    private function fetchMultifinanceProducts()
    {
        $multifinanceProducts = PostpaidProduct::where('brand', 'MULTIFINANCE')
                                        ->orderBy('product_name', 'asc')
                                        ->get();

        return $multifinanceProducts->map(function ($product) {
            $commission = $product->commission ?? 0;
            $commission_sell_percentage = $product->commission_sell_percentage ?? 0;
            $commission_sell_fixed = $product->commission_sell_fixed ?? 0;
            $adminFromServer = $product->admin ?? 0;

            $markupForClient = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;
            $product->calculated_admin = ceil($adminFromServer - $markupForClient);

            return $product;
        })->values()->all();
    }

    /**
     * Helper method to perform a single Multifinance inquiry.
     * Handles API calls and data processing for a given customer number and product.
     *
     * @param string $customerNo The customer number (contract number) to inquire.
     * @param PostpaidProduct $product The PostpaidProduct model associated with the inquiry.
     * @return array|null Returns processed inquiry data on success, null on failure.
     */
    private function _performSingleMultifinanceInquiry(string $customerNo, PostpaidProduct $product): array // MODIFIED: Always return array
    {
        $current_sku = $product->buyer_sku_code;
        $ref_id = 'mf-' . substr(str_replace('-', '', Str::uuid()->toString()), 0, 15);
        $username = env('P_U');
        $apiKey = env('P_AK'); // Assuming P_AK is also used for Multifinance
        $sign = md5($username . $apiKey . $ref_id);

        // --- START DUMMY DATA FOR TESTING INQUIRY (if APP_ENV is local) ---
        if (env('APP_ENV') === 'local') {
            // NEW: Dummy error conditions for testing
            if ($customerNo === '9999') { // Simulate customer not found
                return [
                    'success' => false,
                    'message' => 'Nomor Pelanggan / Nomor Kontrak Multifinance tidak ditemukan (DUMMY).',
                    'rc' => '50' // Contoh RC: Transaksi Tidak Ditemukan
                ];
            }
            if ($customerNo === '8888') { // Simulate product gangguan
                return [
                    'success' => false,
                    'message' => 'Produk Multifinance mengalami gangguan (DUMMY).',
                    'rc' => '55' // Contoh RC: Produk Gangguan
                ];
            }
            if ($customerNo === '7777') { // Simulate tagihan sudah lunas
                return [
                    'success' => false,
                    'message' => 'Tagihan Multifinance untuk Nomor Kontrak ini sudah lunas (DUMMY).',
                    'rc' => '02' // Contoh RC: Transaksi Gagal (sering juga untuk sudah lunas)
                ];
            }

            $customerNoLength = strlen($customerNo);
            $lastDigit = $customerNo[$customerNoLength - 1] ?? '0';
            $isOverdue = ((int)$lastDigit % 2 === 0); // Simulate overdue for even last digits
            $customerNameSeed = substr(preg_replace('/[^0-9]/', '', $customerNo), 0, 5);

            $baseBillAmount = 500000 + (substr($customerNo, -2, 1) * 10000); // Principal + Interest
            $adminFeePerPeriodDummy = 7500; // Admin fee per period (part of the bill)
            $dendaPerPeriodDummy = $isOverdue ? (25000 + (substr($customerNo, -3, 1) * 1000)) : 0; // Denda per period

            $numPeriods = 1;
            if ((int)$lastDigit % 3 === 0) {
                $numPeriods = 2;
            }

            $dummyDescDetails = [];
            $totalBillAmountDummy = 0; // Sum of baseBillAmount from all periods
            $totalAdminFeePerPeriodAggregatedDummy = 0; // Sum of adminFeePerPeriodDummy from all periods
            $totalDendaAggregatedDummy = 0; // Sum of dendaPerPeriodDummy from all periods

            for ($i = 0; $i < $numPeriods; $i++) {
                $periode = date('Y-m', strtotime("-{$i} month")); // Format YYYY-MM
                $billAmount = $baseBillAmount + ($i * 5000);
                $dendaAmount = $isOverdue ? ($dendaPerPeriodDummy / $numPeriods) : 0;

                $dummyDescDetails[] = [
                    "periode" => $periode,
                    "bill_amount" => $billAmount, // Pokok per periode
                    "admin_fee_per_period" => $adminFeePerPeriodDummy, // Admin per periode
                    "denda" => ceil($dendaAmount),
                ];
                $totalBillAmountDummy += $billAmount;
                $totalAdminFeePerPeriodAggregatedDummy += $adminFeePerPeriodDummy;
                $totalDendaAggregatedDummy += ceil($dendaAmount);
            }

            $dummyCustomerName = 'Pelanggan ' . $product->product_name . ' ' . $customerNameSeed . ($isOverdue ? ' (OVERDUE)' : '');
            $dummyItemName = 'Motor ABC-XYZ';
            $dummyNoRangka = 'MHS' . Str::random(10) . 'A';
            $dummyNoPol = 'AB ' . (1000 + (int)$customerNoLength) . ' AZ';
            $dummyTenor = 36; // Example tenor
            $dummyJatuhTempo = date('d-M-Y', strtotime('+5 days')); // Added for consistency

            $providerInfoAdminDummy = 5000;

            $dummyProviderOriginalSellingPrice = $totalBillAmountDummy + $totalAdminFeePerPeriodAggregatedDummy + $totalDendaAggregatedDummy + $providerInfoAdminDummy;
            $dummyPriceFieldForOurRecord = $dummyProviderOriginalSellingPrice - $providerInfoAdminDummy;


            $inquiryDataFromApi = [ // Use a temporary variable to build data
                'status' => 'Sukses',
                'message' => 'Inquiry Multifinance dummy berhasil.', // MODIFIED: Always include message
                'customer_name' => $dummyCustomerName,
                'customer_no' => $customerNo,
                'buyer_sku_code' => $current_sku,
                'price' => $dummyPriceFieldForOurRecord, // This is (provider's selling_price - provider's root admin) for our internal record
                'admin' => $providerInfoAdminDummy, // This is the informational root admin from provider
                'rc' => '00', // MODIFIED: Always include RC
                'sn' => 'SN-INQ-MF-' . Str::random(10),
                'ref_id' => $ref_id,
                'desc' => [
                    "item_name" => $dummyItemName,
                    "no_rangka" => $dummyNoRangka,
                    "no_pol" => $dummyNoPol,
                    "tenor" => $dummyTenor,
                    "lembar_tagihan" => $numPeriods, // Total periods with bills
                    "detail" => $dummyDescDetails,
                    "total_denda" => $totalDendaAggregatedDummy, // Total denda from all periods
                    "total_admin_per_period" => $totalAdminFeePerPeriodAggregatedDummy, // Total admin fee from all periods
                    "jatuh_tempo" => $dummyJatuhTempo, // Added for consistency
                ],
                'selling_price' => $dummyProviderOriginalSellingPrice, // This is the actual total charged by provider for their service
            ];
            Log::info('Multifinance Inquiry API Response (DUMMY):', ['response_data' => $inquiryDataFromApi, 'customer_no' => $customerNo, 'sku' => $current_sku, 'ref_id' => $ref_id]);
        } else {
            // --- END DUMMY DATA ---

            // --- ORIGINAL API CALL (only if not in local dummy mode) ---
            if (!$product->seller_product_status) {
                Log::warning("Multifinance Inquiry: Produk tidak aktif untuk SKU: {$current_sku}. Customer No: {$customerNo}.");
                // MODIFIED: Return an array on failure
                return [
                    'success' => false,
                    'message' => 'Produk Multifinance tidak aktif.',
                    'rc' => 'PRODUCT_NOT_ACTIVE' // Custom RC
                ];
            }

            try {
                $response = Http::post(config('services.api_server') . '/v1/transaction', [
                    'commands' => 'inq-pasca',
                    'username' => $username,
                    'buyer_sku_code' => $current_sku,
                    'customer_no' => $customerNo,
                    'ref_id' => $ref_id,
                    'sign' => $sign,
                    'testing' => false,
                ]);

                $responseData = $response->json();
                Log::info('Multifinance Inquiry API Response:', ['response_data' => $responseData, 'customer_no' => $customerNo, 'sku' => $current_sku, 'ref_id' => $ref_id]);

                if (!isset($responseData['data']) || $responseData['data']['status'] !== 'Sukses') {
                    $errorMessage = $responseData['data']['message'] ?? 'Gagal melakukan pengecekan tagihan dari provider.';
                    $errorCode = $responseData['data']['rc'] ?? 'PROVIDER_ERROR_UNKNOWN'; // NEW: Capture provider's RC
                    Log::warning("Inquiry Multifinance Gagal dari Provider untuk SKU: {$current_sku}. Pesan: {$errorMessage} (RC: {$errorCode})", ['response' => $responseData, 'customer_no' => $customerNo]);
                    // MODIFIED: Return an array on provider-side failure
                    return [
                        'success' => false,
                        'message' => $errorMessage,
                        'rc' => $errorCode // MODIFIED: Return actual RC from provider
                    ];
                }
            } catch (\Exception $e) {
                Log::error('Multifinance Inquiry Error (API Call): ' . $e->getMessage(), ['customer_no' => $customerNo, 'sku' => $current_sku, 'exception_trace' => $e->getTraceAsString()]);
                // MODIFIED: Return an array on API connection failure
                return [
                    'success' => false,
                    'message' => 'Gagal terhubung ke server provider.',
                    'rc' => 'API_CONNECTION_FAILED' // Custom RC
                ];
            }
            $inquiryDataFromApi = $responseData['data']; // Assign to a common variable
        }

        // --- COMMON PROCESSING LOGIC (for both real and dummy data) ---
        $inquiryDataFromApi = $responseData['data'];

        $providerOriginalSellingPrice = (float) ($inquiryDataFromApi['selling_price'] ?? 0); // Total price charged by provider
        $providerInfoAdmin = (float) ($inquiryDataFromApi['admin'] ?? 0); // Root admin fee reported by provider (info only)

        // Ensure 'desc' is an array and initialize common Multifinance specific keys
        if (!isset($inquiryDataFromApi['desc']) || !is_array($inquiryDataFromApi['desc'])) {
            $inquiryDataFromApi['desc'] = [];
        }
        $inquiryDataFromApi['desc']['item_name'] = $inquiryDataFromApi['desc']['item_name'] ?? null;
        $inquiryDataFromApi['desc']['no_rangka'] = $inquiryDataFromApi['desc']['no_rangka'] ?? null;
        $inquiryDataFromApi['desc']['no_pol'] = $inquiryDataFromApi['desc']['no_pol'] ?? null;
        $inquiryDataFromApi['desc']['tenor'] = $inquiryDataFromApi['desc']['tenor'] ?? null;
        $inquiryDataFromApi['desc']['jatuh_tempo'] = $inquiryDataFromApi['desc']['jatuh_tempo'] ?? null; // Added jatuh_tempo

        $totalDendaAggregated = 0; // Sum of denda from details/desc
        $totalAdminFeePerPeriodAggregated = 0; // Sum of admin_fee_per_period from details/desc
        $jumlahLembarTagihan = (int) ($inquiryDataFromApi['desc']['lembar_tagihan'] ?? 1); // From desc or default

        // Process details to accumulate denda and per-period admin fees
        $processedDetails = [];
        if (isset($inquiryDataFromApi['desc']['detail']) && is_array($inquiryDataFromApi['desc']['detail'])) {
            foreach ($inquiryDataFromApi['desc']['detail'] as $detail) {
                $billAmountDetail = (float) ($detail['bill_amount'] ?? $detail['nilai_tagihan'] ?? 0);
                $adminFeeDetail = (float) ($detail['admin_fee_per_period'] ?? $detail['admin'] ?? 0);
                $dendaDetail = (float) ($detail['denda'] ?? 0);

                $processedDetails[] = [
                    "periode" => $detail['periode'] ?? null,
                    "bill_amount" => $billAmountDetail,
                    "admin_fee_per_period" => $adminFeeDetail,
                    "denda" => $dendaDetail,
                ];

                $totalDendaAggregated += $dendaDetail;
                $totalAdminFeePerPeriodAggregated += $adminFeeDetail;
            }
            $inquiryDataFromApi['desc']['detail'] = $processedDetails; // Update with mapped details
        } else {
            // Fallback if 'detail' is not an array. Take totals from desc or root
            $totalDendaAggregated = (float) ($inquiryDataFromApi['desc']['total_denda'] ?? $inquiryDataFromApi['denda'] ?? 0);
            $totalAdminFeePerPeriodAggregated = (float) ($inquiryDataFromApi['desc']['total_admin_per_period'] ?? 0);
        }

        // --- CALCULATE sumOfPureBillAmounts (for our internal record 'price') ---
        $sumOfPureBillAmounts = $providerOriginalSellingPrice - $providerInfoAdmin;

        // Ensure price is not negative
        if ($sumOfPureBillAmounts < 0) {
            Log::warning("Multifinance Inquiry: Calculated sumOfPureBillAmounts went negative for customer {$customerNo}. Adjusting to 0.", [
                'providerOriginalSellingPrice' => $providerOriginalSellingPrice,
                'providerInfoAdmin' => $providerInfoAdmin,
                'inquiryDataFromApi' => $inquiryDataFromApi
            ]);
            $sumOfPureBillAmounts = 0;
        }

        // Our commission/markup logic
        $commission = $product->commission ?? 0;
        $commission_sell_percentage = $product->commission_sell_percentage ?? 0;
        $commission_sell_fixed = $product->commission_sell_fixed ?? 0;
        $diskonPerLembar = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;

        $finalDiskon = $diskonPerLembar * $jumlahLembarTagihan;
        $finalDiskon = ceil($finalDiskon);

        $ourCalculatedAdmin = $product->calculated_admin;

        // --- CALCULATE finalSellingPrice (what the customer actually pays) ---
        $finalSellingPrice = ($providerOriginalSellingPrice + $ourCalculatedAdmin) - $finalDiskon;
        $finalSellingPrice = ceil($finalSellingPrice);

        // Override logic (simplified to prevent our calculated selling price from being lower than provider's reported total selling price)
        if ($providerOriginalSellingPrice > $finalSellingPrice) {
            Log::info('Multifinance Inquiry: finalSellingPrice overridden by provider_original_selling_price.', [
                'calculated_finalSellingPrice' => $finalSellingPrice,
                'providerOriginalSellingPrice' => $providerOriginalSellingPrice,
                'customer_no' => $customerNo
            ]);
            $finalSellingPrice = $providerOriginalSellingPrice;
        }

        // Populate the final successful inquiry data array
        $successfulInquiryData = $inquiryDataFromApi;
        $successfulInquiryData['success'] = true; // NEW: Indicate success
        $successfulInquiryData['message'] = $inquiryDataFromApi['message'] ?? 'Inquiry berhasil.'; // NEW: Ensure message is present
        $successfulInquiryData['rc'] = $inquiryDataFromApi['rc'] ?? '00'; // NEW: Ensure RC is present, default to '00' for success

        $successfulInquiryData['price']         = $sumOfPureBillAmounts;
        $successfulInquiryData['admin']         = $ourCalculatedAdmin;
        $successfulInquiryData['denda']         = $totalDendaAggregated;
        $successfulInquiryData['diskon']        = $finalDiskon;
        $successfulInquiryData['jumlah_lembar_tagihan'] = $jumlahLembarTagihan;
        $successfulInquiryData['selling_price'] = $finalSellingPrice;
        $successfulInquiryData['buyer_sku_code'] = $current_sku;
        $successfulInquiryData['ref_id'] = $ref_id;
        $successfulInquiryData['provider_original_selling_price'] = $providerOriginalSellingPrice;
        $successfulInquiryData['product_name'] = $product->product_name;

        unset($successfulInquiryData['buyer_last_saldo']);

        Log::info("Inquiry Multifinance Sukses (processed). Customer No: {$customerNo}", [
            'customer_no' => $customerNo,
            'ref_id' => $successfulInquiryData['ref_id'],
            'processed_data' => $successfulInquiryData,
        ]);

        return $successfulInquiryData;
    }

public function inquiry(Request $request)
    {
        $request->validate([
            'customer_no' => 'required|string|min:4', // Multifinance numbers might be shorter
            'buyer_sku_code' => 'required|string|exists:postpaid_products,buyer_sku_code',
        ]);

        $customerNo = $request->customer_no;
        $current_sku = $request->buyer_sku_code;

        $product = PostpaidProduct::where('buyer_sku_code', $current_sku)->first();

        if (!$product || !$product->seller_product_status) {
            // MODIFIED: Return object with RC if product not found/active
            return response()->json([
                'message' => 'Produk Multifinance tidak tersedia atau tidak aktif.',
                'rc' => 'PRODUCT_NOT_ACTIVE' // Custom RC
            ], 503);
        }

        $inquiryResult = $this->_performSingleMultifinanceInquiry($customerNo, $product); // MODIFIED: Use $inquiryResult

        // MODIFIED: Check the 'success' key from the returned array
        if ($inquiryResult['success']) {
            session(['postpaid_inquiry_data' => $inquiryResult]);
            return response()->json($inquiryResult);
        } else {
            // MODIFIED: Directly use message and RC from the returned inquiryResult array
            return response()->json([
                'message' => $inquiryResult['message'] ?? 'Gagal melakukan pengecekan tagihan. Silakan coba lagi nanti.', // Fallback message
                'rc' => $inquiryResult['rc'] ?? 'UNKNOWN_ERROR' // Fallback RC
            ], 400); // Use 400 for bad request/client-side errors
        }
    }

    /**
     * Helper method to process a single Multifinance payment after balance has been debited.
     *
     * @param array $inquiryData Processed inquiry data for a single customer.
     * @param \App\Models\User $user The authenticated user (for logging/context, not balance modification).
     * @return array Returns an array with transaction status and details.
     * @throws \Exception If the API call or transaction update fails critically.
     */
    private function _processIndividualMultifinancePayment(array $inquiryData, \App\Models\User $user): array
    {
        $totalPriceToPay     = (float) $inquiryData['selling_price'];
        $finalAdmin          = (float) ($inquiryData['admin'] ?? 0); // Our calculated admin margin
        $pureBillPrice       = (float) ($inquiryData['price'] ?? 0); // Our calculated pure bill price
        $diskon              = (float) ($inquiryData['diskon'] ?? 0);
        $jumlahLembarTagihan = (int) ($inquiryData['jumlah_lembar_tagihan'] ?? 0);
        $denda               = (float) ($inquiryData['denda'] ?? 0);

        $initialData = $this->mapToUnifiedTransaction($inquiryData, 'MULTIFINANCE', $pureBillPrice, $finalAdmin);
        $initialData['user_id'] = $user->id;
        $initialData['selling_price'] = $totalPriceToPay;
        $initialData['status'] = 'Pending';
        $initialData['message'] = 'Menunggu konfirmasi pembayaran dari provider';

        $initialData['rc'] = $inquiryData['rc'] ?? null;
        $initialData['sn'] = null;

        $initialData['details'] = [
            'diskon' => $diskon,
            'jumlah_lembar_tagihan' => $jumlahLembarTagihan,
            'denda' => $denda,
            'desc' => $inquiryData['desc'] ?? null,
        ];
        unset($initialData['buyer_last_saldo']);
        unset($initialData['provider_original_selling_price']);

        $unifiedTransaction = PostpaidTransaction::create($initialData);

        $apiResponseData = [];

        // --- START DUMMY RESPONSE PAYMENT ---
        if (env('APP_ENV') === 'local') {
            $isPaymentSuccess = (substr($inquiryData['customer_no'], -1) % 2 !== 0); // Simulate success for odd last digit

            if ($isPaymentSuccess) {
                $apiResponseData = [
                    'status' => 'Sukses',
                    'message' => 'Pembayaran Multifinance dummy berhasil diproses.',
                    'rc' => '00',
                    'sn' => 'SN-MF-' . Str::random(15),
                    'customer_name' => $inquiryData['customer_name'],
                    'customer_no' => $inquiryData['customer_no'],
                    'buyer_sku_code' => $inquiryData['buyer_sku_code'],
                    'price' => $pureBillPrice,
                    'admin' => $finalAdmin,
                    'ref_id' => $inquiryData['ref_id'],
                    'selling_price' => $totalPriceToPay,
                ];
            } else {
                $apiResponseData = [
                    'status' => 'Gagal',
                    'message' => 'Pembayaran Multifinance dummy gagal. Saldo provider tidak cukup (simulasi).',
                    'rc' => '14',
                    'sn' => null,
                    'customer_name' => $inquiryData['customer_name'],
                    'customer_no' => $inquiryData['customer_no'],
                    'buyer_sku_code' => $inquiryData['buyer_sku_code'],
                    'price' => $pureBillPrice,
                    'admin' => $finalAdmin,
                    'ref_id' => $inquiryData['ref_id'],
                    'selling_price' => $totalPriceToPay,
                ];
            }
            Log::info('Multifinance Payment Dummy Response:', ['response_data' => $apiResponseData, 'transaction_id' => $unifiedTransaction->id]);

        } else {
            // --- END DUMMY DATA ---

            // --- ORIGINAL API CALL (only if not in local dummy mode) ---
            $username = env('P_U');
            $apiKey = env('P_AK'); // Use P_AK for real API call
            $sign = md5($username . $apiKey . $inquiryData['ref_id']);

            try {
                $response = Http::post(config('services.api_server') . '/v1/transaction', [
                    'commands' => 'pay-pasca',
                    'username' => $username,
                    'buyer_sku_code' => $inquiryData['buyer_sku_code'],
                    'customer_no' => $inquiryData['customer_no'],
                    'ref_id' => $inquiryData['ref_id'],
                    'sign' => $sign,
                    'testing' => false, // Make sure this is 'false' in production
                ]);
                $apiResponseData = $response->json()['data'];

                Log::info('Multifinance Payment API Response:', ['response_data' => $apiResponseData, 'transaction_id' => $unifiedTransaction->id]);

            } catch (\Exception $e) {
                $errorMessage = ['status' => 'Gagal', 'message' => 'Gagal terhubung ke server provider.'];
                $unifiedTransaction->update(array_merge($errorMessage, ['rc' => null, 'sn' => null]));
                Log::error('Multifinance Payment Error: ' . $e->getMessage(), ['transaction_id' => $unifiedTransaction->id, 'inquiry_data' => $inquiryData]);
                throw new \Exception('Terjadi kesalahan pada server provider.');
            }
        }

        $fullResponseData = array_merge($inquiryData, $apiResponseData);

        $fullResponseData['price'] = $pureBillPrice;
        $fullResponseData['admin'] = $finalAdmin;
        $fullResponseData['selling_price'] = $totalPriceToPay;
        unset($fullResponseData['buyer_last_saldo']);
        unset($fullResponseData['provider_original_selling_price']);

        $updatePayload = $this->mapToUnifiedTransaction($fullResponseData, 'MULTIFINANCE', $pureBillPrice, $finalAdmin);
        $updatePayload['selling_price'] = $totalPriceToPay;
        $updatePayload['status'] = $apiResponseData['status'] ?? 'Gagal';
        $updatePayload['message'] = $apiResponseData['message'] ?? 'Pembayaran gagal.';

        $updatePayload['rc'] = $apiResponseData['rc'] ?? null;
        $updatePayload['sn'] = $apiResponseData['sn'] ?? null;

        $keysToExcludeFromDetails = [
            'ref_id', 'customer_no', 'customer_name', 'buyer_sku_code', 'message',
            'rc', 'sn', 'buyer_last_saldo', 'price', 'selling_price', 'admin', 'status',
            'diskon', 'jumlah_lembar_tagihan', 'denda', 'desc', 'provider_original_selling_price', 'product_name'
        ];

        $detailsFromApiResponse = [];
        foreach ($apiResponseData as $key => $value) {
            if (!in_array($key, $keysToExcludeFromDetails)) {
                $detailsFromApiResponse[$key] = $value;
            }
        }

        $updatePayload['details'] = array_merge(
            $detailsFromApiResponse,
            ['diskon' => $diskon, 'jumlah_lembar_tagihan' => $jumlahLembarTagihan, 'denda' => $denda],
            ['desc' => $inquiryData['desc'] ?? null]
        );

        unset($updatePayload['user_id'], $updatePayload['ref_id'], $updatePayload['type'], $updatePayload['price'], $updatePayload['admin_fee']);
        unset($updatePayload['buyer_last_saldo']);
        unset($updatePayload['provider_original_selling_price']);

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
            'denda' => $unifiedTransaction->details['denda'] ?? 0,
            'admin' => $unifiedTransaction->admin_fee,
            'price' => $unifiedTransaction->price,
            'sn' => $unifiedTransaction->sn,
            'product_name' => $inquiryData['product_name'], // Pass product name from inquiry data
            'details' => $unifiedTransaction->details,
        ];
    }

    public function payment(Request $request)
    {
        $user = Auth::user();
        $inquiryData = session('postpaid_inquiry_data');

        if (!$inquiryData || $inquiryData['customer_no'] !== $request->customer_no) {
            return response()->json(['message' => 'Sesi tidak valid atau nomor pelanggan tidak cocok.'], 400);
        }

        $totalPriceToPay = (float) $inquiryData['selling_price'];

        if ($user->balance < $totalPriceToPay) {
            return response()->json(['message' => 'Saldo Anda tidak mencukupi.'], 402);
        }

        $user->decrement('balance', $totalPriceToPay);
        Log::info("Multifinance Single Payment: User {$user->id} debited {$totalPriceToPay} for single payment.");

        try {
            $paymentResult = $this->_processIndividualMultifinancePayment($inquiryData, $user);

            if (($paymentResult['status'] ?? 'Gagal') === 'Gagal') {
                $user->increment('balance', $totalPriceToPay);
                Log::warning("Multifinance Single Payment: Transaction {$paymentResult['transaction_id']} failed, balance refunded {$totalPriceToPay}.");
            }
            session()->forget('postpaid_inquiry_data');
            return response()->json($paymentResult);
        } catch (\Exception $e) {
            $user->increment('balance', $totalPriceToPay);
            Log::error('Multifinance Single Payment Error (Controller): ' . $e->getMessage(), ['customer_no' => $request->customer_no, 'inquiry_data' => $inquiryData]);
            return response()->json(['message' => 'Terjadi kesalahan saat memproses pembayaran: ' . $e->getMessage()], 500);
        }
    }

    /**
     * NEW: Handles bulk Multifinance inquiry for multiple customer numbers.
     *
     * @param Request $request Contains 'customer_nos' array and 'buyer_sku_code'.
     * @return \Illuminate\Http\JsonResponse
     */
    public function bulkInquiry(Request $request)
    {
        $request->validate([
            'customer_nos' => 'required|array',
            'customer_nos.*' => 'required|string|min:4',
            'buyer_sku_code' => 'required|string|exists:postpaid_products,buyer_sku_code',
        ]);

        $customerNos = array_unique($request->customer_nos);
        $buyerSkuCode = $request->buyer_sku_code;

        $results = [
            'successful' => [],
            'failed' => [],
        ];

        $product = PostpaidProduct::where('buyer_sku_code', $buyerSkuCode)->first();

        if (!$product || !$product->seller_product_status) {
            Log::warning("Bulk Inquiry Multifinance: Produk tidak tersedia atau tidak aktif: {$buyerSkuCode}.");
            return response()->json(['message' => 'Produk Multifinance yang dipilih tidak tersedia atau tidak aktif.'], 503);
        }

        foreach ($customerNos as $customerNo) {
            try {
                $inquiryData = $this->_performSingleMultifinanceInquiry($customerNo, $product);

                if ($inquiryData) {
                    $results['successful'][] = $inquiryData;
                } else {
                    $results['failed'][] = [
                        'customer_no' => $customerNo,
                        'product_name' => $product->product_name,
                        'message' => 'Tidak dapat menemukan tagihan atau layanan tidak tersedia.',
                        'buyer_sku_code' => $buyerSkuCode,
                    ];
                }
            } catch (\Exception $e) {
                Log::error("Bulk Inquiry Multifinance: Unexpected error for customer {$customerNo}, SKU {$buyerSkuCode}. Error: " . $e->getMessage());
                $results['failed'][] = [
                    'customer_no' => $customerNo,
                    'product_name' => $product->product_name,
                    'message' => 'Terjadi kesalahan saat pengecekan tagihan: ' . $e->getMessage(),
                    'buyer_sku_code' => $buyerSkuCode,
                ];
            }
        }

        if (empty($results['successful']) && empty($results['failed'])) {
            return response()->json(['message' => 'Tidak ada nomor pelanggan yang diproses.'], 400);
        }

        if (!empty($results['successful'])) {
            session(['postpaid_bulk_multifinance_inquiry_data' => $results['successful']]);
        } else {
            session()->forget('postpaid_bulk_multifinance_inquiry_data');
        }

        return response()->json($results);
    }

    /**
     * NEW: Handles bulk Multifinance payment for multiple previously inquired customer numbers.
     *
     * @param Request $request Contains 'customer_nos_to_pay' array.
     * @return \Illuminate\Http\JsonResponse
     */
    public function bulkPayment(Request $request)
    {
        $user = Auth::user();
        $inquiryDataForPayment = session('postpaid_bulk_multifinance_inquiry_data');

        if (!$inquiryDataForPayment || empty($inquiryDataForPayment)) {
            return response()->json(['message' => 'Sesi pembayaran massal tidak valid atau kosong. Silakan lakukan pengecekan tagihan ulang.'], 400);
        }

        $requestedCustomerNos = collect($request->customer_nos_to_pay)->unique();
        $filteredInquiryDataForPayment = collect($inquiryDataForPayment)->filter(function ($item) use ($requestedCustomerNos) {
            return $requestedCustomerNos->contains($item['customer_no']);
        })->values()->all();

        if (count($requestedCustomerNos) !== count($filteredInquiryDataForPayment)) {
            Log::warning("Bulk Payment Multifinance: Mismatch between requested customer_nos and session data after filtering.", [
               'request_customer_nos' => $requestedCustomerNos->all(),
               'session_filtered_customer_nos' => collect($filteredInquiryDataForPayment)->pluck('customer_no')->all(),
               'user_id' => $user->id,
           ]);
           return response()->json(['message' => 'Beberapa data pelanggan untuk pembayaran tidak cocok dengan sesi. Silakan coba lagi.'], 400);
        }

        $totalPriceForBulkPayment = collect($filteredInquiryDataForPayment)->sum('selling_price');

        if ($user->balance < $totalPriceForBulkPayment) {
            return response()->json(['message' => 'Saldo Anda tidak mencukupi untuk semua transaksi ini.'], 402);
        }

        $user->decrement('balance', $totalPriceForBulkPayment);
        Log::info("Bulk Payment Multifinance: User {$user->id} debited total {$totalPriceForBulkPayment} for bulk payment.");

        $paymentResults = [];
        $totalRefundAmount = 0;

        foreach ($filteredInquiryDataForPayment as $inquiryData) {
            try {
                $individualPaymentResult = $this->_processIndividualMultifinancePayment($inquiryData, $user);
                $paymentResults[] = $individualPaymentResult;

                if (($individualPaymentResult['status'] ?? 'Gagal') === 'Gagal') {
                    $totalRefundAmount += $inquiryData['selling_price'];
                    Log::warning("Bulk Payment Multifinance: Individual transaction for {$inquiryData['customer_no']} failed, adding {$inquiryData['selling_price']} to refund amount.");
                }
            } catch (\Exception $e) {
                Log::error('Multifinance Bulk Payment Error for customer ' . $inquiryData['customer_no'] . ': ' . $e->getMessage(), ['inquiry_data' => $inquiryData, 'user_id' => $user->id]);
                $paymentResults[] = array_merge($inquiryData, [
                    'customer_no' => $inquiryData['customer_no'],
                    'customer_name' => $inquiryData['customer_name'] ?? 'N/A',
                    'selling_price' => $inquiryData['selling_price'],
                    'status' => 'Gagal',
                    'message' => 'Terjadi kesalahan saat memproses tagihan ini: ' . $e->getMessage(),
                    'product_name' => $inquiryData['product_name'],
                ]);
                $totalRefundAmount += $inquiryData['selling_price'];
            }
        }

        if ($totalRefundAmount > 0) {
            $user->increment('balance', $totalRefundAmount);
            Log::info("Bulk Payment Multifinance: Refunded {$totalRefundAmount} to user {$user->id} for failed transactions.");
        }

        session()->forget('postpaid_bulk_multifinance_inquiry_data');
        return response()->json([
            'results' => $paymentResults,
            'total_refund_amount' => $totalRefundAmount,
            'total_paid_amount' => $totalPriceForBulkPayment - $totalRefundAmount
        ]);
    }
}