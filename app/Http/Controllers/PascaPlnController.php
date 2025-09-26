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

// class PascaPlnController extends Controller
// {
//     use TransactionMapper;

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

//     /**
//      * Helper method to perform a single PLN inquiry.
//      * Handles API calls and data processing for a given customer number.
//      *
//      * @param string $customerNo The customer number to inquire.
//      * @return array|null Returns processed inquiry data on success, null on failure.
//      */
//     private function _performSingleInquiry(string $customerNo): ?array
//     {
//         $availableProducts = PostpaidProduct::where('brand', 'PLN PASCABAYAR')
//                                             ->where('seller_product_status', true)
//                                             ->orderBy('buyer_sku_code', 'asc')
//                                             ->get();

//         if ($availableProducts->isEmpty()) {
//             Log::warning("Inquiry PLN: Tidak ada produk PLN Pascabayar yang aktif ditemukan untuk {$customerNo}.");
//             return null; // Indicates no active products
//         }

//         $successfulInquiryData = null;
//         $lastErrorMessage = 'Gagal melakukan pengecekan tagihan setelah mencoba semua provider.';

//         // Use the first available product for commission calculation if we are using dummy data
//         $productToUseForCommission = $availableProducts->first();
//         if (!$productToUseForCommission) {
//             Log::warning("Inquiry PLN: Tidak ada produk PLN Pascabayar yang aktif ditemukan, tidak bisa menghitung komisi.");
//             return null;
//         }

//         $responseData = [];

//         // --- START DUMMY DATA FOR TESTING INQUIRY (if APP_ENV is local) ---
//         if (env('APP_ENV') === 'local') {
//             $customerNoLength = strlen($customerNo);
//             $lastDigit = $customerNo[$customerNoLength - 1] ?? '0'; // Default to '0' if customerNo is empty
//             $isOverdue = ((int)$lastDigit % 2 === 0); // Simulate overdue for even last digits
//             $customerNameSeed = substr(preg_replace('/[^0-9]/', '', $customerNo), 0, 5); // Use digits from customerNo

//             $basePricePerBill = 95000; // Harga tagihan pokok per lembar
//             $adminFeePerBill = 2500;
//             $dendaPerBill = $isOverdue ? 7500 : 0;
//             $numBills = ((int)$lastDigit % 3 === 0) ? 2 : 1; // Simulate multiple bills for certain customer numbers (2 or 1)

//             $dummyDescDetails = [];
//             $totalPureBillAmount = 0; // Total harga tagihan pokok
//             $totalDendaAmount = 0;    // Total denda
//             $totalAdminAmount = 0;    // Total admin dari detail

//             for ($i = 0; $i < $numBills; $i++) {
//                 $periodeMonth = date('m', strtotime("-{$i} month"));
//                 $periodeYear = date('Y', strtotime("-{$i} month"));
//                 $billPrice = $basePricePerBill + ($i * 5000); // Vary bill price slightly (pure bill)
//                 $billAdmin = $adminFeePerBill + ($i * 100);
//                 $billDenda = $isOverdue ? ($dendaPerBill + ($i * 1000)) : 0; // Distribute denda if multiple bills

//                 $dummyDescDetails[] = [
//                     'periode' => "{$periodeYear}{$periodeMonth}",
//                     'nilai_tagihan' => $billPrice, // Pure bill per detail
//                     'denda' => $billDenda,
//                     'admin' => $billAdmin,
//                     'meter_awal' => '01234567' . (100 + $i),
//                     'meter_akhir' => '01234567' . (200 + $i),
//                 ];
//                 $totalPureBillAmount += $billPrice;
//                 $totalDendaAmount += $billDenda;
//                 $totalAdminAmount += $billAdmin;
//             }

//             // PENTING: Jika 'price' API sesungguhnya sudah termasuk denda, sesuaikan di sini juga.
//             // Di sini kita akan membuat 'price' dummy meniru (harga pokok + denda)
//             $dummyPriceField = $totalPureBillAmount + $totalDendaAmount; // Mengikuti pemahaman 'price' API sudah termasuk denda

//             $responseData = [
//                 'data' => [
//                     'status' => 'Sukses',
//                     'customer_no' => $customerNo,
//                     'customer_name' => 'DUMMY Pelanggan ' . $customerNameSeed . ($isOverdue ? ' (OVERDUE)' : ''),
//                     'buyer_sku_code' => 'pln', // Generic SKU for PLN
//                     'ref_id' => 'dummy-pln-' . substr(md5($customerNo . time()), 0, 15), // Unique ref_id
//                     'rc' => '00',
//                     'message' => 'INQ Sukses (DUMMY).',
//                     'price' => $dummyPriceField, // Ini adalah (harga pokok + denda) dari sisi dummy
//                     'admin' => $totalAdminAmount, // Total admin fee dari semua bills
//                     'desc' => [
//                         'tarif' => 'R1',
//                         'daya' => '1300',
//                         'lembar_tagihan' => $numBills,
//                         'detail' => $dummyDescDetails,
//                         'denda' => $totalDendaAmount, // Total denda dari semua bills (untuk info)
//                         'total_tagihan_akhir' => $totalPureBillAmount + $totalAdminAmount + $totalDendaAmount, // Total sebelum diskon kita
//                     ],
//                     // We need to set 'selling_price' to 0 initially so our internal calculation applies
//                     'selling_price' => 0,
//                     // original_api_price harus konsisten dengan (price + admin) yang akan kita hitung
//                     'original_api_price' => $dummyPriceField + $totalAdminAmount, // Mimic provider's total price (price + admin)
//                     'original_api_selling_price' => 0, // Mimic provider's selling price if it exists
//                 ],
//             ];
//             Log::info("Inquiry PLN (DUMMY) Sukses untuk Customer No: {$customerNo}", ['customer_no' => $customerNo, 'dummy_response' => $responseData]);

//             // Proceed with the dummy response
//             $apiResponseForProcessing = $responseData['data'];

//         } else {
//             // --- END DUMMY DATA ---

//             // --- ORIGINAL API CALL (only if not in local dummy mode) ---
//             $ref_id = 'pln-' . substr(str_replace('-', '', Str::uuid()->toString()), 0, 15);
//             $username = env('P_U');
//             $apiKey = env('P_AK');
//             $sign = md5($username . $apiKey . $ref_id);

//             try {
//                 $response = Http::post(config('services.api_server') . '/v1/transaction', [
//                     'commands' => 'inq-pasca', 'username' => $username, 'buyer_sku_code' => 'pln',
//                     'customer_no' => $customerNo, 'ref_id' => $ref_id, 'sign' => $sign, 'testing' => false,
//                 ]);
//                 $responseData = $response->json();
//             } catch (\Exception $e) {
//                 $lastErrorMessage = 'Gagal terhubung ke server provider.';
//                 Log::error("Inquiry PLN Gagal Koneksi API untuk Customer No: {$customerNo}. Error: " . $e->getMessage(), [
//                     'customer_no' => $customerNo, 'ref_id' => $ref_id, 'exception_message' => $e->getMessage(),
//                 ]);
//                 return null; // For real API, if it fails, return null immediately
//             }

//             if (!isset($responseData['data']) || $responseData['data']['status'] !== 'Sukses') {
//                 $lastErrorMessage = $responseData['data']['message'] ?? 'Provider sedang sibuk atau data tidak valid.';
//                 Log::warning("Inquiry PLN Gagal dari Provider. Customer No: {$customerNo}. Pesan: {$lastErrorMessage}", [
//                     'customer_no' => $customerNo, 'ref_id' => $ref_id, 'api_response' => $responseData,
//                 ]);
//                 return null; // For real API, if response is not successful, return null
//             }
//             $apiResponseForProcessing = $responseData['data'];
//             // END ORIGINAL API CALL
//         }

//         // --- COMMON PROCESSING LOGIC (for both real and dummy data) ---
//         $inquiryDataFromApi = $apiResponseForProcessing;

//         $sumOfPureBillAmounts = 0;
//         $sumOfDendaAmounts = 0;
//         $sumOfAdminFees = 0;
//         $jumlahLembarTagihan = 0;

//         // Determine jumlahLembarTagihan
//         if (isset($inquiryDataFromApi['desc']['lembar_tagihan'])) {
//             $jumlahLembarTagihan = (int) $inquiryDataFromApi['desc']['lembar_tagihan'];
//         } elseif (isset($inquiryDataFromApi['desc']['detail']) && is_array($inquiryDataFromApi['desc']['detail'])) {
//             $jumlahLembarTagihan = count($inquiryDataFromApi['desc']['detail']);
//         } else {
//             $jumlahLembarTagihan = 1;
//         }

//         // Aggregate totals from details array or top-level fields
//         if (isset($inquiryDataFromApi['desc']['detail']) && is_array($inquiryDataFromApi['desc']['detail'])) {
//             foreach ($inquiryDataFromApi['desc']['detail'] as $detail) {
//                 // Asumsi 'nilai_tagihan' di detail adalah harga pokok murni per lembar
//                 $sumOfPureBillAmounts += (float) ($detail['nilai_tagihan'] ?? 0);
//                 $sumOfDendaAmounts += (float) ($detail['denda'] ?? 0);
//                 $sumOfAdminFees += (float) ($detail['admin'] ?? 0);
//             }
//         } else {
//             // Jika 'desc.detail' tidak tersedia, dan 'price' API sudah termasuk denda:
//             $apiPrice = (float) ($inquiryDataFromApi['price'] ?? 0); // Ini adalah (harga pokok + denda) dari API
//             $apiDenda = (float) ($inquiryDataFromApi['desc']['denda'] ?? 0); // Ini adalah jumlah denda (untuk info)
//             $apiAdmin = (float) ($inquiryDataFromApi['admin'] ?? 0); // Ini adalah jumlah admin

//             $sumOfPureBillAmounts = $apiPrice - $apiDenda; // Kita "ekstrak" harga pokok murni
//             $sumOfDendaAmounts = $apiDenda;
//             $sumOfAdminFees = $apiAdmin;
//         }

//         $commission = $productToUseForCommission->commission ?? 0;
//         $commission_sell_percentage = $productToUseForCommission->commission_sell_percentage ?? 0;
//         $commission_sell_fixed = $productToUseForCommission->commission_sell_fixed ?? 0;
//         $diskonPerLembar = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;

//         $finalDiskon = $diskonPerLembar * $jumlahLembarTagihan;

//         // Hitung total jumlah yang harus dibayar sebelum diskon kita
//         // Ini adalah jumlah tagihan pokok + denda + admin
//         $totalAmountBeforeDiskon = $sumOfPureBillAmounts + $sumOfDendaAmounts + $sumOfAdminFees;

//         // Hitung harga jual akhir setelah diskon
//         $finalSellingPrice = $totalAmountBeforeDiskon - $finalDiskon;

//         // Override logic (from original code)
//         $apiOriginalPrice = (float) ($inquiryDataFromApi['original_api_price'] ?? ($inquiryDataFromApi['price'] + ($inquiryDataFromApi['admin'] ?? 0)) ?? 0); // Use specific original_api_price if available
//         $apiOriginalSellingPrice = (float) ($inquiryDataFromApi['original_api_selling_price'] ?? 0);

//         if ($apiOriginalPrice > $finalSellingPrice && $apiOriginalSellingPrice > 0) {
//             Log::info("Override finalSellingPrice: Original API Price ({$apiOriginalPrice}) > Calculated Selling Price ({$finalSellingPrice}) AND Original API Selling Price ({$apiOriginalSellingPrice}) > 0. Using Original API Selling Price.");
//             $finalSellingPrice = $apiOriginalSellingPrice;
//         }

//         $finalSellingPrice = ceil($finalSellingPrice);

//         // Populate the final successful inquiry data array
//         $successfulInquiryData = $inquiryDataFromApi;
//         $successfulInquiryData['price'] = $sumOfPureBillAmounts; // Ini adalah harga pokok murni untuk kebutuhan mapping transaksi
//         $successfulInquiryData['denda'] = $sumOfDendaAmounts; // Total denda untuk info
//         $successfulInquiryData['admin'] = $sumOfAdminFees; // Total admin untuk info
//         $successfulInquiryData['diskon'] = $finalDiskon;
//         $successfulInquiryData['jumlah_lembar_tagihan'] = $jumlahLembarTagihan;
//         $successfulInquiryData['selling_price'] = $finalSellingPrice; // Ini yang dibayar pengguna
//         $successfulInquiryData['buyer_sku_code'] = $productToUseForCommission->buyer_sku_code; // Gunakan SKU aktual dari produk
//         $successfulInquiryData['ref_id'] = $successfulInquiryData['ref_id'] ?? 'generated-' . Str::uuid()->toString(); // Pastikan ref_id ada

//         Log::info("Inquiry PLN Sukses (processed). Customer No: {$customerNo}", [
//             'customer_no' => $customerNo,
//             'ref_id' => $successfulInquiryData['ref_id'],
//             'processed_data' => $successfulInquiryData,
//         ]);

//         return $successfulInquiryData;
//     }

//     /**
//      * Helper method to process a single PLN payment after balance has been debited.
//      * This method creates the transaction record, calls the provider API, and updates the transaction.
//      * It DOES NOT handle user balance debit/credit, that is done by the calling public methods.
//      *
//      * @param array $inquiryData Processed inquiry data for a single customer.
//      * @param \App\Models\User $user The authenticated user (for logging/context, not balance modification).
//      * @return array Returns an array with transaction status and details.
//      * @throws \Exception If the API call or transaction update fails critically.
//      */
//     private function _processIndividualPlnPayment(array $inquiryData, \App\Models\User $user): array
//     {
//         // Extract necessary data for transaction creation and API call
//         $totalPriceToPay     = $inquiryData['selling_price'];
//         $finalAdmin          = $inquiryData['admin'];
//         $pureBillPrice       = $inquiryData['price']; // Ini sekarang adalah harga pokok murni
//         $diskon              = $inquiryData['diskon'] ?? 0;
//         $jumlahLembarTagihan = $inquiryData['jumlah_lembar_tagihan'] ?? 0;
//         // Denda juga bisa diakses via $inquiryData['denda']

//         // Create initial transaction record with 'Pending' status
//         $initialData = $this->mapToUnifiedTransaction($inquiryData, 'PLN', $pureBillPrice, $finalAdmin);
//         $initialData['user_id'] = $user->id; // Ensure user_id is set
//         $initialData['selling_price'] = $totalPriceToPay;
//         $initialData['status'] = 'Pending';
//         $initialData['message'] = 'Menunggu konfirmasi pembayaran dari provider';
//         $initialData['rc'] = $inquiryData['rc'] ?? null;
//         $initialData['sn'] = null;
//         $initialData['details'] = [
//             'diskon' => $diskon,
//             'jumlah_lembar_tagihan' => $jumlahLembarTagihan,
//             'denda_amount' => $inquiryData['denda'] ?? 0, // Simpan denda sebagai detail
//         ];

//         $unifiedTransaction = PostpaidTransaction::create($initialData);

//         $apiResponseData = [];

//         // --- START DUMMY DATA FOR TESTING PAYMENT (if APP_ENV is local) ---
//         if (env('APP_ENV') === 'local') {
//             $isPaymentSuccess = (substr($inquiryData['customer_no'], -1) % 2 !== 0); // Simulate success for odd last digit

//             if ($isPaymentSuccess) {
//                 $dummyApiResponseData = [
//                     'status' => 'Sukses',
//                     'message' => 'Payment Sukses (DUMMY).',
//                     'rc' => '00',
//                     'sn' => 'DUMMYPLN' . substr(md5($inquiryData['customer_no'] . microtime()), 0, 15),
//                     'buyer_last_saldo' => 99999999, // Dummy balance
//                     'customer_no' => $inquiryData['customer_no'],
//                     'customer_name' => $inquiryData['customer_name'],
//                     'price' => $inquiryData['price'], // pure bill price
//                     'selling_price' => $inquiryData['selling_price'],
//                     'admin' => $inquiryData['admin'],
//                     'desc' => $inquiryData['desc'] ?? [],
//                     'diskon' => $diskon,
//                 ];
//             } else {
//                 $dummyApiResponseData = [
//                     'status' => 'Gagal',
//                     'message' => 'Payment Gagal (DUMMY). Saldo tidak mencukupi di provider.',
//                     'rc' => '14', // Example failure code
//                     'sn' => null,
//                     'customer_no' => $inquiryData['customer_no'],
//                     'customer_name' => $inquiryData['customer_name'],
//                     'price' => $inquiryData['price'],
//                     'selling_price' => $inquiryData['selling_price'],
//                     'admin' => $inquiryData['admin'],
//                     'desc' => $inquiryData['desc'] ?? [],
//                     'diskon' => $diskon,
//                 ];
//             }

//             $apiResponseData = $dummyApiResponseData;
//             Log::info('PLN Payment API Response (DUMMY):', ['response_data' => $apiResponseData, 'transaction_id' => $unifiedTransaction->id]);

//         } else {
//             // --- END DUMMY DATA ---

//             // --- ORIGINAL API CALL (only if not in local dummy mode) ---
//             $username = env('P_U');
//             $apiKey = env('P_AK');
//             $sign = md5($username . $apiKey . $inquiryData['ref_id']);

//             try {
//                 $response = Http::post(config('services.api_server') . '/v1/transaction', [
//                     'commands' => 'pay-pasca', 'username' => $username, 'buyer_sku_code' => $inquiryData['buyer_sku_code'],
//                     'customer_no' => $inquiryData['customer_no'], 'ref_id' => $inquiryData['ref_id'], 'sign' => $sign, 'testing' => false,
//                 ]);
//                 $apiResponseData = $response->json()['data'] ?? []; // Ensure 'data' key exists, default to empty array
//                 if (!isset($response->json()['data'])) {
//                      Log::error('PLN Payment API Response did not contain "data" key.', ['full_response' => $response->json(), 'transaction_id' => $unifiedTransaction->id]);
//                      throw new \Exception('Respon API provider tidak lengkap.');
//                 }

//                 Log::info('PLN Payment API Response (Individual):', ['response_data' => $apiResponseData, 'transaction_id' => $unifiedTransaction->id]);

//             } catch (\Exception $e) {
//                 // Update transaction status to Failed and log error
//                 $errorMessage = ['status' => 'Gagal', 'message' => 'Gagal terhubung ke server provider atau respon tidak valid.'];
//                 $unifiedTransaction->update(array_merge($errorMessage, ['rc' => null, 'sn' => null]));
//                 Log::error('PLN Payment Error (Individual): ' . $e->getMessage(), ['transaction_id' => $unifiedTransaction->id, 'inquiry_data' => $inquiryData]);
//                 throw new \Exception('Terjadi kesalahan pada server provider untuk tagihan ID Pelanggan: ' . $inquiryData['customer_no'] . '.');
//             }
//             // END ORIGINAL API CALL
//         }

//         $fullResponseData = array_merge($inquiryData, $apiResponseData);

//         // Map and update the transaction with final status from API
//         $updatePayload = $this->mapToUnifiedTransaction($fullResponseData, 'PLN', $pureBillPrice, $finalAdmin);
//         $updatePayload['selling_price'] = $totalPriceToPay; // Preserve calculated selling price
//         $updatePayload['rc'] = $apiResponseData['rc'] ?? null;
//         $updatePayload['sn'] = $apiResponseData['sn'] ?? null;
//         $updatePayload['status'] = $apiResponseData['status'] ?? 'Gagal'; // Update status from API response
//         $updatePayload['message'] = $apiResponseData['message'] ?? 'Pembayaran tidak diketahui statusnya.'; // Update message from API response


//         // Exclude specific keys from 'details' to avoid duplication or unnecessary data
//         $keysToExcludeFromDetails = [
//             'ref_id', 'customer_no', 'customer_name', 'buyer_sku_code', 'message',
//             'rc', 'sn', 'buyer_last_saldo', 'price', 'selling_price', 'admin', 'status',
//             'diskon', 'jumlah_lembar_tagihan', 'original_api_response', 'original_api_price', 'original_api_selling_price',
//             'denda_amount' // Tambahkan ini agar tidak duplikasi di details jika sudah ada di initial data
//         ];

//         $detailsFromApiResponse = [];
//         foreach ($apiResponseData as $key => $value) {
//             if (!in_array($key, $keysToExcludeFromDetails)) {
//                 $detailsFromApiResponse[$key] = $value;
//             }
//         }

//         $updatePayload['details'] = array_merge(
//             $unifiedTransaction->details, // Preserve initial details if any
//             $detailsFromApiResponse,
//             ['diskon' => $diskon, 'jumlah_lembar_tagihan' => $jumlahLembarTagihan]
//         );

//         // Remove user_id, ref_id, type, price, admin_fee if TransactionMapper sets them explicitly or they are part of initial create
//         unset($updatePayload['user_id'], $updatePayload['ref_id'], $updatePayload['type'], $updatePayload['price'], $updatePayload['admin_fee']);

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
//             'denda_amount' => $unifiedTransaction->details['denda_amount'] ?? 0, // Pastikan denda juga dikembalikan
//             'rc' => $unifiedTransaction->rc,
//             'sn' => $unifiedTransaction->sn,
//             'original_inquiry_data' => $inquiryData, // For debugging/context
//             'final_details' => $unifiedTransaction->details, // Full updated details
//         ];
//     }

//     // Existing single inquiry endpoint, now using the helper
//     public function inquiry(Request $request)
//     {
//         $request->validate(['customer_no' => 'required|string|min:10']);
//         $customerNo = $request->customer_no;

//         $inquiryData = $this->_performSingleInquiry($customerNo);

//         if ($inquiryData) {
//     session(['postpaid_inquiry_data' => $inquiryData]);
//     return response()->json($inquiryData);
// } else {
//     return response()->json([
//         'message' => $inquiryData['message'] ?? 'Gagal melakukan pengecekan tagihan. Silakan coba lagi nanti.',
//         'rc' => $inquiryData['rc'] ?? null
//     ], 400);
// }

//     }

//     // Existing single payment endpoint, now using the helper and managing balance
//     public function payment(Request $request)
//     {
//         $user = Auth::user();
//         $inquiryData = session('postpaid_inquiry_data');

//         if (!$inquiryData || $inquiryData['customer_no'] !== $request->customer_no) {
//             return response()->json(['message' => 'Sesi tidak valid atau nomor pelanggan tidak cocok.'], 400);
//         }

//         $totalPriceToPay = $inquiryData['selling_price'];

//         if ($user->balance < $totalPriceToPay) {
//             return response()->json(['message' => 'Saldo Anda tidak mencukupi.'], 402);
//         }

//         // Debit balance before attempting payment
//         $user->decrement('balance', $totalPriceToPay);
//         Log::info("PLN Single Payment: User {$user->id} debited {$totalPriceToPay} for single payment.");

//         try {
//             $paymentResult = $this->_processIndividualPlnPayment($inquiryData, $user);

//             // If the payment API call resulted in a 'Gagal' status, refund the balance
//             if (($paymentResult['status'] ?? 'Gagal') === 'Gagal') {
//                 $user->increment('balance', $totalPriceToPay);
//                 Log::warning("PLN Single Payment: Transaction {$paymentResult['transaction_id']} failed according to provider API, balance refunded {$totalPriceToPay}.");
//             }
//             session()->forget('postpaid_inquiry_data');
//             return response()->json($paymentResult);
//         } catch (\Exception $e) {
//             // If any exception occurred during the payment process, refund the balance
//             $user->increment('balance', $totalPriceToPay);
//             Log::error('PLN Single Payment Error (Controller): ' . $e->getMessage(), ['customer_no' => $request->customer_no, 'inquiry_data' => $inquiryData]);
//             return response()->json(['message' => 'Terjadi kesalahan saat memproses pembayaran: ' . $e->getMessage()], 500);
//         }
//     }

//     /**
//      * NEW: Handles bulk PLN inquiry for multiple customer numbers.
//      *
//      * @param Request $request Contains 'customer_nos' array.
//      * @return \Illuminate\Http\JsonResponse
//      */
//     public function bulkInquiry(Request $request)
//     {
//         $request->validate(['customer_nos' => 'required|array', 'customer_nos.*' => 'required|string|min:10']);
//         $customerNos = array_unique($request->customer_nos); // Ensure unique customer numbers

//         $results = [
//             'successful' => [],
//             'failed' => [],
//         ];

//         foreach ($customerNos as $customerNo) {
//             try {
//                 $inquiryData = $this->_performSingleInquiry($customerNo);
//                 if ($inquiryData) {
//                     $results['successful'][] = $inquiryData;
//                 } else {
//                     $results['failed'][] = [
//                         'customer_no' => $customerNo,
//                         'message' => 'Tidak dapat menemukan tagihan atau layanan tidak tersedia.',
//                     ];
//                 }
//             } catch (\Exception $e) {
//                 // Catch any unexpected exceptions from _performSingleInquiry
//                 Log::error("Bulk Inquiry PLN: Unexpected error for customer {$customerNo}. Error: " . $e->getMessage());
//                 $results['failed'][] = [
//                     'customer_no' => $customerNo,
//                     'message' => 'Terjadi kesalahan saat pengecekan tagihan: ' . $e->getMessage(),
//                 ];
//             }
//         }

//         if (empty($results['successful']) && empty($results['failed'])) {
//             return response()->json(['message' => 'Tidak ada nomor pelanggan yang diproses.'], 400);
//         }

//         // Store only successful inquiries for bulk payment in session
//         if (!empty($results['successful'])) {
//             session(['postpaid_bulk_inquiry_data' => $results['successful']]);
//         } else {
//             session()->forget('postpaid_bulk_inquiry_data');
//         }

//         return response()->json($results);
//     }

//     /**
//      * NEW: Handles bulk PLN payment for multiple previously inquired customer numbers.
//      *
//      * @param Request $request Contains 'customer_nos_to_pay' array (for validation against session).
//      * @return \Illuminate\Http\JsonResponse
//      */
//     public function bulkPayment(Request $request)
//     {
//         $user = Auth::user();
//         $inquiryDataForPayment = session('postpaid_bulk_inquiry_data'); // Retrieve all successful inquiries from session

//         if (!$inquiryDataForPayment || empty($inquiryDataForPayment)) {
//             return response()->json(['message' => 'Sesi pembayaran massal tidak valid atau kosong. Silakan lakukan pengecekan tagihan ulang.'], 400);
//         }

//         // Validate that customer_nos in the request match those in the session for security
//         $requestCustomerNos = collect($request->customer_nos_to_pay)->unique()->sort()->values()->all();
//         $sessionCustomerNos = collect($inquiryDataForPayment)->pluck('customer_no')->unique()->sort()->values()->all();

//         if ($requestCustomerNos != $sessionCustomerNos) {
//              Log::warning("Bulk Payment PLN: Mismatch between requested customer_nos and session data.", [
//                 'request_customer_nos' => $requestCustomerNos,
//                 'session_customer_nos' => $sessionCustomerNos,
//                 'user_id' => $user->id,
//             ]);
//             return response()->json(['message' => 'Data pelanggan untuk pembayaran tidak cocok dengan sesi. Silakan coba lagi.'], 400);
//         }

//         // Calculate total price for all successful inquiries that are to be paid
//         $totalPriceForBulkPayment = collect($inquiryDataForPayment)->sum('selling_price');

//         if ($user->balance < $totalPriceForBulkPayment) {
//             return response()->json(['message' => 'Saldo Anda tidak mencukupi untuk semua transaksi ini.'], 402);
//         }

//         // Debit user's balance ONCE for the total sum before processing individual payments
//         $user->decrement('balance', $totalPriceForBulkPayment);
//         Log::info("Bulk Payment PLN: User {$user->id} debited total {$totalPriceForBulkPayment} for bulk payment.");

//         $paymentResults = [];
//         $totalRefundAmount = 0; // To track balance to refund for failed individual payments

//         foreach ($inquiryDataForPayment as $inquiryData) {
//             try {
//                 // Process each individual payment.
//                 $individualPaymentResult = $this->_processIndividualPlnPayment($inquiryData, $user);
//                 $paymentResults[] = $individualPaymentResult;

//                 // If an individual payment fails (status 'Gagal' from provider API), mark its amount for refund
//                 if (($individualPaymentResult['status'] ?? 'Gagal') === 'Gagal') {
//                     $totalRefundAmount += $inquiryData['selling_price'];
//                     Log::warning("Bulk Payment PLN: Individual transaction for {$inquiryData['customer_no']} failed, adding {$inquiryData['selling_price']} to refund amount.");
//                 }

//             } catch (\Exception $e) {
//                 // If an unexpected exception occurs during individual payment, treat it as failed and add to refund
//                 Log::error('PLN Bulk Payment Error for customer ' . $inquiryData['customer_no'] . ': ' . $e->getMessage(), ['inquiry_data' => $inquiryData, 'user_id' => $user->id]);
//                 $paymentResults[] = array_merge($inquiryData, [ // Add simplified error result
//                     'customer_no' => $inquiryData['customer_no'],
//                     'customer_name' => $inquiryData['customer_name'] ?? 'N/A',
//                     'selling_price' => $inquiryData['selling_price'],
//                     'status' => 'Gagal',
//                     'message' => 'Terjadi kesalahan saat memproses tagihan ini: ' . $e->getMessage(),
//                 ]);
//                 $totalRefundAmount += $inquiryData['selling_price'];
//             }
//         }

//         // Refund any failed payments from the initial bulk debit
//         if ($totalRefundAmount > 0) {
//             $user->increment('balance', $totalRefundAmount);
//             Log::info("Bulk Payment PLN: Refunded {$totalRefundAmount} to user {$user->id} for failed transactions.");
//         }

//         session()->forget('postpaid_bulk_inquiry_data'); // Clear session after bulk payment attempt
//         return response()->json(['results' => $paymentResults, 'total_refund_amount' => $totalRefundAmount, 'total_paid_amount' => $totalPriceForBulkPayment - $totalRefundAmount]);
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
    private function _performSingleInquiry(string $customerNo): array // MODIFIED: Always return array
    {
        $availableProducts = PostpaidProduct::where('brand', 'PLN PASCABAYAR')
                                            ->where('seller_product_status', true)
                                            ->orderBy('buyer_sku_code', 'asc')
                                            ->get();

        if ($availableProducts->isEmpty()) {
            Log::warning("Inquiry PLN: Tidak ada produk PLN Pascabayar yang aktif ditemukan untuk {$customerNo}.");
            // MODIFIED: Return an array on failure
            return [
                'success' => false,
                'message' => 'Tidak ada produk PLN Pascabayar yang aktif ditemukan.',
                'rc' => 'NO_PRODUCT_ACTIVE'
            ];
        }

        $productToUseForCommission = $availableProducts->first();
        if (!$productToUseForCommission) {
            Log::warning("Inquiry PLN: Tidak ada produk PLN Pascabayar yang aktif ditemukan, tidak bisa menghitung komisi.");
            // MODIFIED: Return an array on failure
            return [
                'success' => false,
                'message' => 'Tidak ada produk PLN Pascabayar yang aktif untuk perhitungan komisi.',
                'rc' => 'NO_PRODUCT_FOR_COMMISSION'
            ];
        }

        $responseData = [];
        $lastErrorMessage = 'Gagal melakukan pengecekan tagihan. Silakan coba lagi nanti.'; // Default error message

        // --- START DUMMY DATA FOR TESTING INQUIRY (if APP_ENV is local) ---
        if (env('APP_ENV') === 'local') {
            $customerNoLength = strlen($customerNo);
            $lastDigit = $customerNo[$customerNoLength - 1] ?? '0'; // Default to '0' if customerNo is empty
            $isOverdue = ((int)$lastDigit % 2 === 0); // Simulate overdue for even last digits
            $customerNameSeed = substr(preg_replace('/[^0-9]/', '', $customerNo), 0, 5); // Use digits from customerNo

            // NEW: Dummy error conditions for testing
            if ($customerNo === '99999999999') {
                return [
                    'success' => false,
                    'message' => 'ID Pelanggan tidak ditemukan (DUMMY).',
                    'rc' => '62' // Contoh RC dari provider
                ];
            }
            if ($customerNo === '88888888888') {
                return [
                    'success' => false,
                    'message' => 'Tagihan sudah lunas (DUMMY).',
                    'rc' => '02' // Contoh RC dari provider
                ];
            }

            $basePricePerBill = 95000; // Harga tagihan pokok per lembar
            $adminFeePerBill = 2500;
            $dendaPerBill = $isOverdue ? 7500 : 0;
            $numBills = ((int)$lastDigit % 3 === 0) ? 2 : 1; // Simulate multiple bills for certain customer numbers (2 or 1)

            $dummyDescDetails = [];
            $totalPureBillAmount = 0; // Total harga tagihan pokok
            $totalDendaAmount = 0;    // Total denda
            $totalAdminAmount = 0;    // Total admin dari detail

            for ($i = 0; $i < $numBills; $i++) {
                $periodeMonth = date('m', strtotime("-{$i} month"));
                $periodeYear = date('Y', strtotime("-{$i} month"));
                $billPrice = $basePricePerBill + ($i * 5000); // Vary bill price slightly (pure bill)
                $billAdmin = $adminFeePerBill + ($i * 100);
                $billDenda = $isOverdue ? ($dendaPerBill + ($i * 1000)) : 0; // Distribute denda if multiple bills

                $dummyDescDetails[] = [
                    'periode' => "{$periodeYear}{$periodeMonth}",
                    'nilai_tagihan' => $billPrice, // Pure bill per detail
                    'denda' => $billDenda,
                    'admin' => $billAdmin,
                    'meter_awal' => '01234567' . (100 + $i),
                    'meter_akhir' => '01234567' . (200 + $i),
                ];
                $totalPureBillAmount += $billPrice;
                $totalDendaAmount += $billDenda;
                $totalAdminAmount += $billAdmin;
            }

            $dummyPriceField = $totalPureBillAmount + $totalDendaAmount;

            $responseData = [
                'data' => [
                    'status' => 'Sukses',
                    'customer_no' => $customerNo,
                    'customer_name' => 'DUMMY Pelanggan ' . $customerNameSeed . ($isOverdue ? ' (OVERDUE)' : ''),
                    'buyer_sku_code' => 'pln',
                    'ref_id' => 'dummy-pln-' . substr(md5($customerNo . time()), 0, 15),
                    'rc' => '00', // MODIFIED: Always include RC
                    'message' => 'INQ Sukses (DUMMY).',
                    'price' => $dummyPriceField,
                    'admin' => $totalAdminAmount,
                    'desc' => [
                        'tarif' => 'R1',
                        'daya' => '1300',
                        'lembar_tagihan' => $numBills,
                        'detail' => $dummyDescDetails,
                        'denda' => $totalDendaAmount,
                        'total_tagihan_akhir' => $totalPureBillAmount + $totalAdminAmount + $totalDendaAmount,
                    ],
                    'selling_price' => 0,
                    'original_api_price' => $dummyPriceField + $totalAdminAmount,
                    'original_api_selling_price' => 0,
                ],
            ];
            Log::info("Inquiry PLN (DUMMY) Sukses untuk Customer No: {$customerNo}", ['customer_no' => $customerNo, 'dummy_response' => $responseData]);

            // Proceed with the dummy response
            $apiResponseForProcessing = $responseData['data'];

        } else {
            // --- END DUMMY DATA ---

            // --- ORIGINAL API CALL (only if not in local dummy mode) ---
            $ref_id = 'pln-' . substr(str_replace('-', '', Str::uuid()->toString()), 0, 15);
            $username = env('P_U');
            $apiKey = env('P_AK');
            $sign = md5($username . $apiKey . $ref_id);

            try {
                $response = Http::post(config('services.api_server') . '/v1/transaction', [
                    'commands' => 'inq-pasca', 'username' => $username, 'buyer_sku_code' => 'pln',
                    'customer_no' => $customerNo, 'ref_id' => $ref_id, 'sign' => $sign, 'testing' => false,
                ]);
                $responseData = $response->json();
            } catch (\Exception $e) {
                $lastErrorMessage = 'Gagal terhubung ke server provider.';
                Log::error("Inquiry PLN Gagal Koneksi API untuk Customer No: {$customerNo}. Error: " . $e->getMessage(), [
                    'customer_no' => $customerNo, 'ref_id' => $ref_id, 'exception_message' => $e->getMessage(),
                ]);
                // MODIFIED: Return an array on API connection failure
                return [
                    'success' => false,
                    'message' => $lastErrorMessage,
                    'rc' => 'API_CONNECTION_FAILED'
                ];
            }

            if (!isset($responseData['data']) || $responseData['data']['status'] !== 'Sukses') {
                $lastErrorMessage = $responseData['data']['message'] ?? 'Provider sedang sibuk atau data tidak valid.';
                $errorCode = $responseData['data']['rc'] ?? 'PROVIDER_ERROR_UNKNOWN'; // NEW: Capture provider's RC
                Log::warning("Inquiry PLN Gagal dari Provider. Customer No: {$customerNo}. Pesan: {$lastErrorMessage} (RC: {$errorCode})", [
                    'customer_no' => $customerNo, 'ref_id' => $ref_id, 'api_response' => $responseData,
                ]);
                // MODIFIED: Return an array on provider-side failure
                return [
                    'success' => false,
                    'message' => $lastErrorMessage,
                    'rc' => $errorCode // MODIFIED: Return actual RC from provider
                ];
            }
            $apiResponseForProcessing = $responseData['data'];
            // END ORIGINAL API CALL
        }

        // --- COMMON PROCESSING LOGIC (for both real and dummy data) ---
        $inquiryDataFromApi = $apiResponseForProcessing;

        $sumOfPureBillAmounts = 0;
        $sumOfDendaAmounts = 0;
        $sumOfAdminFees = 0;
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
                $sumOfPureBillAmounts += (float) ($detail['nilai_tagihan'] ?? 0);
                $sumOfDendaAmounts += (float) ($detail['denda'] ?? 0);
                $sumOfAdminFees += (float) ($detail['admin'] ?? 0);
            }
        } else {
            $apiPrice = (float) ($inquiryDataFromApi['price'] ?? 0);
            $apiDenda = (float) ($inquiryDataFromApi['desc']['denda'] ?? 0);
            $apiAdmin = (float) ($inquiryDataFromApi['admin'] ?? 0);

            $sumOfPureBillAmounts = $apiPrice - $apiDenda;
            $sumOfDendaAmounts = $apiDenda;
            $sumOfAdminFees = $apiAdmin;
        }

        $commission = $productToUseForCommission->commission ?? 0;
        $commission_sell_percentage = $productToUseForCommission->commission_sell_percentage ?? 0;
        $commission_sell_fixed = $productToUseForCommission->commission_sell_fixed ?? 0;
        $diskonPerLembar = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;

        $finalDiskon = $diskonPerLembar * $jumlahLembarTagihan;

        $totalAmountBeforeDiskon = $sumOfPureBillAmounts + $sumOfDendaAmounts + $sumOfAdminFees;

        $finalSellingPrice = $totalAmountBeforeDiskon - $finalDiskon;

        $apiOriginalPrice = (float) ($inquiryDataFromApi['original_api_price'] ?? ($inquiryDataFromApi['price'] + ($inquiryDataFromApi['admin'] ?? 0)) ?? 0);
        $apiOriginalSellingPrice = (float) ($inquiryDataFromApi['original_api_selling_price'] ?? 0);

        if ($apiOriginalPrice > $finalSellingPrice && $apiOriginalSellingPrice > 0) {
            Log::info("Override finalSellingPrice: Original API Price ({$apiOriginalPrice}) > Calculated Selling Price ({$finalSellingPrice}) AND Original API Selling Price ({$apiOriginalSellingPrice}) > 0. Using Original API Selling Price.");
            $finalSellingPrice = $apiOriginalSellingPrice;
        }

        $finalSellingPrice = ceil($finalSellingPrice);

        // Populate the final successful inquiry data array
        $successfulInquiryData = $inquiryDataFromApi;
        $successfulInquiryData['success'] = true; // NEW: Indicate success
        $successfulInquiryData['message'] = $inquiryDataFromApi['message'] ?? 'Inquiry berhasil.'; // NEW: Ensure message is present
        $successfulInquiryData['rc'] = $inquiryDataFromApi['rc'] ?? '00'; // NEW: Ensure RC is present, default to '00' for success
        $successfulInquiryData['price'] = $sumOfPureBillAmounts;
        $successfulInquiryData['denda'] = $sumOfDendaAmounts;
        $successfulInquiryData['admin'] = $sumOfAdminFees;
        $successfulInquiryData['diskon'] = $finalDiskon;
        $successfulInquiryData['jumlah_lembar_tagihan'] = $jumlahLembarTagihan;
        $successfulInquiryData['selling_price'] = $finalSellingPrice;
        $successfulInquiryData['buyer_sku_code'] = $productToUseForCommission->buyer_sku_code;
        $successfulInquiryData['ref_id'] = $successfulInquiryData['ref_id'] ?? 'generated-' . Str::uuid()->toString();

        Log::info("Inquiry PLN Sukses (processed). Customer No: {$customerNo}", [
            'customer_no' => $customerNo,
            'ref_id' => $successfulInquiryData['ref_id'],
            'processed_data' => $successfulInquiryData,
        ]);

        return $successfulInquiryData;
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
        $pureBillPrice       = $inquiryData['price']; // Ini sekarang adalah harga pokok murni
        $diskon              = $inquiryData['diskon'] ?? 0;
        $jumlahLembarTagihan = $inquiryData['jumlah_lembar_tagihan'] ?? 0;
        // Denda juga bisa diakses via $inquiryData['denda']

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
            'denda_amount' => $inquiryData['denda'] ?? 0, // Simpan denda sebagai detail
        ];

        $unifiedTransaction = PostpaidTransaction::create($initialData);

        $apiResponseData = [];

        // --- START DUMMY DATA FOR TESTING PAYMENT (if APP_ENV is local) ---
        if (env('APP_ENV') === 'local') {
            $isPaymentSuccess = (substr($inquiryData['customer_no'], -1) % 2 !== 0); // Simulate success for odd last digit

            if ($isPaymentSuccess) {
                $dummyApiResponseData = [
                    'status' => 'Sukses',
                    'message' => 'Payment Sukses (DUMMY).',
                    'rc' => '00',
                    'sn' => 'DUMMYPLN' . substr(md5($inquiryData['customer_no'] . microtime()), 0, 15),
                    'buyer_last_saldo' => 99999999, // Dummy balance
                    'customer_no' => $inquiryData['customer_no'],
                    'customer_name' => $inquiryData['customer_name'],
                    'price' => $inquiryData['price'], // pure bill price
                    'selling_price' => $inquiryData['selling_price'],
                    'admin' => $inquiryData['admin'],
                    'desc' => $inquiryData['desc'] ?? [],
                    'diskon' => $diskon,
                ];
            } else {
                $dummyApiResponseData = [
                    'status' => 'Gagal',
                    'message' => 'Payment Gagal (DUMMY). Saldo tidak mencukupi di provider.',
                    'rc' => '14', // Example failure code
                    'sn' => null,
                    'customer_no' => $inquiryData['customer_no'],
                    'customer_name' => $inquiryData['customer_name'],
                    'price' => $inquiryData['price'],
                    'selling_price' => $inquiryData['selling_price'],
                    'admin' => $inquiryData['admin'],
                    'desc' => $inquiryData['desc'] ?? [],
                    'diskon' => $diskon,
                ];
            }

            $apiResponseData = $dummyApiResponseData;
            Log::info('PLN Payment API Response (DUMMY):', ['response_data' => $apiResponseData, 'transaction_id' => $unifiedTransaction->id]);

        } else {
            // --- END DUMMY DATA ---

            // --- ORIGINAL API CALL (only if not in local dummy mode) ---
            $username = env('P_U');
            $apiKey = env('P_AK');
            $sign = md5($username . $apiKey . $inquiryData['ref_id']);

            try {
                $response = Http::post(config('services.api_server') . '/v1/transaction', [
                    'commands' => 'pay-pasca', 'username' => $username, 'buyer_sku_code' => $inquiryData['buyer_sku_code'],
                    'customer_no' => $inquiryData['customer_no'], 'ref_id' => $inquiryData['ref_id'], 'sign' => $sign, 'testing' => false,
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
            // END ORIGINAL API CALL
        }

        $fullResponseData = array_merge($inquiryData, $apiResponseData);

        // Map and update the transaction with final status from API
        $updatePayload = $this->mapToUnifiedTransaction($fullResponseData, 'PLN', $pureBillPrice, $finalAdmin);
        $updatePayload['selling_price'] = $totalPriceToPay; // Preserve calculated selling price
        $updatePayload['rc'] = $apiResponseData['rc'] ?? null;
        $updatePayload['sn'] = $apiResponseData['sn'] ?? null;
        $updatePayload['status'] = $apiResponseData['status'] ?? 'Gagal'; // Update status from API response
        $updatePayload['message'] = $apiResponseData['message'] ?? 'Pembayaran tidak diketahui statusnya.'; // Update message from API response


        // Exclude specific keys from 'details' to avoid duplication or unnecessary data
        $keysToExcludeFromDetails = [
            'ref_id', 'customer_no', 'customer_name', 'buyer_sku_code', 'message',
            'rc', 'sn', 'buyer_last_saldo', 'price', 'selling_price', 'admin', 'status',
            'diskon', 'jumlah_lembar_tagihan', 'original_api_response', 'original_api_price', 'original_api_selling_price',
            'denda_amount' // Tambahkan ini agar tidak duplikasi di details jika sudah ada di initial data
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
            'denda_amount' => $unifiedTransaction->details['denda_amount'] ?? 0, // Pastikan denda juga dikembalikan
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

        $inquiryResult = $this->_performSingleInquiry($customerNo);

        // MODIFIED: Check the 'success' key from the returned array
        if ($inquiryResult['success']) {
            session(['postpaid_inquiry_data' => $inquiryResult]);
            return response()->json($inquiryResult);
        } else {
            // MODIFIED: Directly use message and RC from the returned inquiryResult array
            return response()->json([
                'rc' => $inquiryResult['rc']
            ], 400); // Use 400 for bad request/client-side errors
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
        Log::info("PLN Single Payment: User {$user->id} debited {$totalPriceToPay} for single payment.");

        try {
            $paymentResult = $this->_processIndividualPlnPayment($inquiryData, $user);

            // If the payment API call resulted in a 'Gagal' status, refund the balance
            if (($paymentResult['status'] ?? 'Gagal') === 'Gagal') {
                $user->increment('balance', $totalPriceToPay);
                Log::warning("PLN Single Payment: Transaction {$paymentResult['transaction_id']} failed according to provider API, balance refunded {$totalPriceToPay}.");
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
        $requestCustomerNos = collect($request->customer_nos_to_pay)->unique()->sort()->values()->all();
        $sessionCustomerNos = collect($inquiryDataForPayment)->pluck('customer_no')->unique()->sort()->values()->all();

        if ($requestCustomerNos != $sessionCustomerNos) {
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
                // Process each individual payment.
                $individualPaymentResult = $this->_processIndividualPlnPayment($inquiryData, $user);
                $paymentResults[] = $individualPaymentResult;

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
        return response()->json(['results' => $paymentResults, 'total_refund_amount' => $totalRefundAmount, 'total_paid_amount' => $totalPriceForBulkPayment - $totalRefundAmount]);
    }
}