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

// class PascaPdamController extends Controller
// {
//     use TransactionMapper;

//     /**
//      * Menampilkan halaman pembayaran PDAM dengan daftar produk.
//      */
//     public function index()
//     {
//         $products = $this->fetchPdamProducts();
//         return Inertia::render('Pascabayar/Pdam', [
//             'products' => $products,
//             'auth' => [
//                 'user' => Auth::user(),
//             ],
//         ]);
//     }

//     /**
//      * Mengambil daftar produk PDAM dari database lokal.
//      * Produk dengan status seller_product_status = false juga diambil
//      * agar bisa ditampilkan di frontend dengan indikator gangguan.
//      */
//     private function fetchPdamProducts()
//     {
//         $pdamProducts = PostpaidProduct::where('brand', 'PDAM')
//                                         ->orderBy('product_name', 'asc')
//                                         ->get();

//         return $pdamProducts->map(function ($product) {
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
//      * Helper method to perform a single PDAM inquiry.
//      * Handles API calls and data processing for a given customer number and product.
//      *
//      * @param string $customerNo The customer number to inquire.
//      * @param PostpaidProduct $product The PostpaidProduct model associated with the inquiry.
//      * @return array|null Returns processed inquiry data on success, null on failure.
//      */
//     private function _performSinglePdamInquiry(string $customerNo, PostpaidProduct $product): ?array
//     {
//         $current_sku = $product->buyer_sku_code;
//         $ref_id = 'pdam-' . substr(str_replace('-', '', Str::uuid()->toString()), 0, 15);
//         $username = env('P_U');
//         $apiKey = env('P_AK'); // Using P_AK from env
//         $sign = md5($username . $apiKey . $ref_id);

//         $responseData = [];

//         // --- START DUMMY DATA FOR TESTING INQUIRY (if APP_ENV is local) ---
//         if (env('APP_ENV') === 'local') {
//             $customerNoLength = strlen($customerNo);
//             $lastDigit = $customerNo[$customerNoLength - 1] ?? '0'; // Default to '0' if customerNo is empty
//             $isOverdue = ((int)$lastDigit % 2 === 0); // Simulate overdue for even last digits
//             $customerNameSeed = substr(preg_replace('/[^0-9]/', '', $customerNo), 0, 5); // Use digits from customerNo

//             $basePricePerBill = 25000 + (substr($customerNo, -2, 1) * 1000); // Vary base price
//             $adminFeePerBill = 2500;
//             $biayaLainPerBill = 1500;
//             $dendaPerBill = $isOverdue ? (5000 + (substr($customerNo, -3, 1) * 500)) : 0; // Vary denda

//             $numBills = 1;
//             if ((int)$lastDigit % 3 === 0) { // Some customers might have 2 bills
//                 $numBills = 2;
//             } elseif ((int)$lastDigit % 5 === 0) { // Some might have 3 bills
//                 $numBills = 3;
//             }

//             $dummyDescDetails = [];
//             $totalNilaiTagihan = 0;
//             $totalDenda = 0;
//             $totalBiayaLain = 0;
//             $totalAdminFromProvider = $adminFeePerBill; // Assume admin is fixed per transaction, not per bill item in this dummy

//             for ($i = 0; $i < $numBills; $i++) {
//                 $periodeMonth = date('m', strtotime("-{$i} month"));
//                 $periodeYear = date('Y', strtotime("-{$i} month"));
//                 $billPrice = $basePricePerBill + ($i * 1000);
//                 $billDenda = $isOverdue ? ($dendaPerBill / $numBills) : 0; // Distribute denda
//                 $billBiayaLain = $biayaLainPerBill;

//                 $dummyDescDetails[] = [
//                     "periode" => "{$periodeYear}{$periodeMonth}",
//                     "nilai_tagihan" => $billPrice,
//                     "denda" => ceil($billDenda),
//                     "meter_awal" => '000' . Str::random(5),
//                     "meter_akhir" => '000' . Str::random(5),
//                     "biaya_lain" => $billBiayaLain
//                 ];
//                 $totalNilaiTagihan += $billPrice;
//                 $totalDenda += ceil($billDenda);
//                 $totalBiayaLain += $billBiayaLain;
//             }

//             $dummyCustomerName = 'Pelanggan PDAM ' . $product->product_name . ' ' . $customerNameSeed . ($isOverdue ? ' (OVERDUE)' : '');
//             $dummyAddress = 'Jl. Dummy No.' . $customerNoLength . ', Kota ' . Str::upper(substr($current_sku, 0, 3));
//             $dummyJatuhTempo = date('d-M-Y', strtotime('+5 days'));

//             $baseTotalApiPrice = $totalNilaiTagihan + $totalBiayaLain + $totalDenda + $totalAdminFromProvider;
//             $dummyProviderOriginalSellingPrice = ceil($baseTotalApiPrice * (1 + (int)$lastDigit / 1000)); // Slight variation

//             $responseData = [
//                 'data' => [
//                     'status' => 'Sukses',
//                     'message' => 'Inquiry PDAM dummy berhasil.',
//                     'customer_name' => $dummyCustomerName,
//                     'customer_no' => $customerNo,
//                     'buyer_sku_code' => $current_sku,
//                     'price' => $totalNilaiTagihan + $totalBiayaLain, // Total bill amount (pokok + biaya lain) from API perspective
//                     'admin' => $totalAdminFromProvider,
//                     'rc' => '00',
//                     'sn' => 'SN-INQ-' . Str::random(12),
//                     'ref_id' => $ref_id,
//                     'desc' => [
//                         "tarif" => "R" . (2 + (int)$lastDigit % 3),
//                         "lembar_tagihan" => $numBills,
//                         "alamat" => $dummyAddress,
//                         "jatuh_tempo" => $dummyJatuhTempo,
//                         "detail" => $dummyDescDetails,
//                         "denda" => $totalDenda, // Total denda
//                         "biaya_lain" => $totalBiayaLain, // Total biaya lain (jika ada di root desc)
//                     ],
//                     'selling_price' => $dummyProviderOriginalSellingPrice, // ORIGINAL provider selling_price
//                 ],
//             ];
//             Log::info('PDAM Inquiry API Response (DUMMY):', ['response_data' => $responseData, 'customer_no' => $customerNo, 'sku' => $current_sku, 'ref_id' => $ref_id]);
//         } else {
//             // --- END DUMMY DATA ---

//             // --- ORIGINAL API CALL (only if not in local dummy mode) ---
//             if (!$product->seller_product_status) {
//                 return null; // Don't even try if product is inactive in real mode
//             }

//             try {
//                 $response = Http::post(config('services.api_server') . '/v1/transaction', [
//                     'commands' => 'inq-pasca',
//                     'username' => $username,
//                     'buyer_sku_code' => $current_sku,
//                     'customer_no' => $customerNo,
//                     'ref_id' => $ref_id,
//                     'sign' => $sign,
//                     'testing' => false,
//                 ]);

//                 $responseData = $response->json();
//                 Log::info('PDAM Inquiry API Response:', ['response_data' => $responseData, 'customer_no' => $customerNo, 'sku' => $current_sku, 'ref_id' => $ref_id]);

//                 if (!isset($responseData['data']) || $responseData['data']['status'] !== 'Sukses') {
//                     $errorMessage = $responseData['data']['message'] ?? 'Gagal melakukan pengecekan tagihan dari provider.';
//                     Log::warning("Inquiry PDAM Gagal dari Provider untuk SKU: {$current_sku}. Pesan: {$errorMessage}", ['response' => $responseData, 'customer_no' => $customerNo]);
//                     return null;
//                 }
//             } catch (\Exception $e) {
//                 Log::error('PDAM Inquiry Error (API Call): ' . $e->getMessage(), ['customer_no' => $customerNo, 'sku' => $current_sku, 'exception_trace' => $e->getTraceAsString()]);
//                 return null;
//             }
//         }

//         // --- COMMON PROCESSING LOGIC (for both real and dummy data) ---
//         $inquiryDataFromApi = $responseData['data'];

//         // Simpan 'selling_price' asli dari respons API provider jika tersedia
//         $providerOriginalSellingPrice = (float) ($inquiryDataFromApi['selling_price'] ?? 0);
//         // Simpan 'price' asli dari respons API provider (harga pokok/bill murni dari provider)
//         $pureBillPriceFromApiRoot = (float) ($inquiryDataFromApi['price'] ?? 0);

//         if (!isset($inquiryDataFromApi['desc']) || !is_array($inquiryDataFromApi['desc'])) {
//             $inquiryDataFromApi['desc'] = [];
//         }

//         $inquiryDataFromApi['desc']['tarif']       = $inquiryDataFromApi['desc']['tarif'] ?? null;
//         $inquiryDataFromApi['desc']['alamat']      = $inquiryDataFromApi['desc']['alamat'] ?? null;
//         $inquiryDataFromApi['desc']['jatuh_tempo'] = $inquiryDataFromApi['desc']['jatuh_tempo'] ?? null;

//         $totalNilaiTagihan = 0;
//         $totalDenda = 0;
//         $totalBiayaLain = 0;
//         $jumlahLembarTagihan = 0;
//         $totalAdminFromProvider = (float) ($inquiryDataFromApi['admin'] ?? 0);

//         if (isset($inquiryDataFromApi['desc']['lembar_tagihan'])) {
//             $jumlahLembarTagihan = (int) $inquiryDataFromApi['desc']['lembar_tagihan'];
//         } elseif (isset($inquiryDataFromApi['desc']['detail']) && is_array($inquiryDataFromApi['desc']['detail'])) {
//             $jumlahLembarTagihan = count($inquiryDataFromApi['desc']['detail']);
//         } else {
//             $jumlahLembarTagihan = 1;
//         }

//         if (isset($inquiryDataFromApi['desc']['detail']) && is_array($inquiryDataFromApi['desc']['detail'])) {
//             foreach ($inquiryDataFromApi['desc']['detail'] as $detail) {
//                 $totalNilaiTagihan += (float) ($detail['nilai_tagihan'] ?? 0);
//                 $totalDenda += (float) ($detail['denda'] ?? 0);
//                 $totalBiayaLain += (float) ($detail['biaya_lain'] ?? 0);
//             }
//         } else {
//             $totalNilaiTagihan = $pureBillPriceFromApiRoot;
//             $totalDenda = (float) ($inquiryDataFromApi['desc']['denda'] ?? 0);
//             $totalBiayaLain = (float) ($inquiryDataFromApi['desc']['biaya_lain'] ?? 0);
//         }

//         $commission = $product->commission ?? 0;
//         $commission_sell_percentage = $product->commission_sell_percentage ?? 0;
//         $commission_sell_fixed = $product->commission_sell_fixed ?? 0;
//         $diskonPerLembar = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;

//         $finalDiskon = $diskonPerLembar * $jumlahLembarTagihan;
//         $finalDiskon = ceil($finalDiskon);

//         $calculatedPureBillPrice = $totalNilaiTagihan + $totalBiayaLain;

//         $finalSellingPrice = $calculatedPureBillPrice + $totalAdminFromProvider + $totalDenda - $finalDiskon;
//         $finalSellingPrice = ceil($finalSellingPrice);

//         if ($pureBillPriceFromApiRoot > $finalSellingPrice && $providerOriginalSellingPrice > 0) {
//             $finalSellingPrice = $providerOriginalSellingPrice;
//             Log::info('PDAM Inquiry: finalSellingPrice overridden by provider_original_selling_price.', [
//                 'calculated_finalSellingPrice' => $finalSellingPrice,
//                 'pureBillPriceFromApiRoot' => $pureBillPriceFromApiRoot,
//                 'providerOriginalSellingPrice' => $providerOriginalSellingPrice,
//                 'customer_no' => $customerNo
//             ]);
//         }

//         $inquiryDataFromApi['price']         = $calculatedPureBillPrice;
//         $inquiryDataFromApi['admin']         = $totalAdminFromProvider;
//         $inquiryDataFromApi['denda']         = $totalDenda;
//         $inquiryDataFromApi['diskon']        = $finalDiskon;
//         $inquiryDataFromApi['jumlah_lembar_tagihan'] = $jumlahLembarTagihan;
//         $inquiryDataFromApi['selling_price'] = $finalSellingPrice;
//         $inquiryDataFromApi['buyer_sku_code'] = $current_sku;
//         $inquiryDataFromApi['ref_id'] = $ref_id;
//         $inquiryDataFromApi['provider_original_selling_price'] = $providerOriginalSellingPrice;
//         $inquiryDataFromApi['product_name'] = $product->product_name; // Add product name for frontend display

//         unset($inquiryDataFromApi['buyer_last_saldo']);

//         return $inquiryDataFromApi;
//     }

//     /**
//      * Helper method to process a single PDAM payment after balance has been debited.
//      * This method creates the transaction record, calls the provider API, and updates the transaction.
//      *
//      * @param array $inquiryData Processed inquiry data for a single customer.
//      * @param \App\Models\User $user The authenticated user (for logging/context, not balance modification).
//      * @return array Returns an array with transaction status and details.
//      * @throws \Exception If the API call or transaction update fails critically.
//      */
//     private function _processIndividualPdamPayment(array $inquiryData, \App\Models\User $user): array
//     {
//         $totalPriceToPay     = (float) $inquiryData['selling_price'];
//         $finalAdmin          = (float) $inquiryData['admin'];
//         $pureBillPrice       = (float) $inquiryData['price'];
//         $diskon              = (float) ($inquiryData['diskon'] ?? 0);
//         $jumlahLembarTagihan = (int) ($inquiryData['jumlah_lembar_tagihan'] ?? 0);
//         $denda               = (float) ($inquiryData['denda'] ?? 0);

//         $initialData = $this->mapToUnifiedTransaction($inquiryData, 'PDAM', $pureBillPrice, $finalAdmin);
//         $initialData['user_id'] = $user->id; // Set user_id
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
//                     'message' => 'Pembayaran PDAM dummy berhasil diproses.',
//                     'rc' => '00',
//                     'sn' => 'SN-PDAM-' . Str::random(15),
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
//                     'message' => 'Pembayaran PDAM dummy gagal. Saldo provider tidak cukup (simulasi).',
//                     'rc' => '14', // Example failure code
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
//             Log::info('PDAM Payment Dummy Response:', ['response_data' => $apiResponseData, 'transaction_id' => $unifiedTransaction->id]);

//         } else {
//             // --- END DUMMY DATA ---

//             // --- ORIGINAL API CALL (only if not in local dummy mode) ---
//             $username = env('P_U');
//             $apiKey = env('P_AK');
//             $sign = md5($username . $apiKey . $inquiryData['ref_id']);

//             try {
//                 $response = Http::post(config('services.api_server') . '/v1/transaction', [
//                     'commands' => 'pay-pasca',
//                     'username' => $username,
//                     'buyer_sku_code' => $inquiryData['buyer_sku_code'],
//                     'customer_no' => $inquiryData['customer_no'],
//                     'ref_id' => $inquiryData['ref_id'],
//                     'sign' => $sign,
//                     'testing' => false,
//                 ]);
//                 $apiResponseData = $response->json()['data'];

//                 Log::info('PDAM Payment API Response:', ['response_data' => $apiResponseData, 'transaction_id' => $unifiedTransaction->id]);

//             } catch (\Exception $e) {
//                 $errorMessage = ['status' => 'Gagal', 'message' => 'Gagal terhubung ke server provider.'];
//                 $unifiedTransaction->update(array_merge($errorMessage, ['rc' => null, 'sn' => null]));
//                 Log::error('PDAM Payment Error: ' . $e->getMessage(), ['transaction_id' => $unifiedTransaction->id, 'inquiry_data' => $inquiryData]);
//                 throw new \Exception('Terjadi kesalahan pada server provider.');
//             }
//         }

//         $fullResponseData = array_merge($inquiryData, $apiResponseData);

//         $fullResponseData['price'] = $pureBillPrice;
//         $fullResponseData['admin'] = $finalAdmin;
//         $fullResponseData['selling_price'] = $totalPriceToPay;
//         unset($fullResponseData['buyer_last_saldo']);
//         unset($fullResponseData['provider_original_selling_price']);

//         $updatePayload = $this->mapToUnifiedTransaction($fullResponseData, 'PDAM', $pureBillPrice, $finalAdmin);
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

//     public function inquiry(Request $request)
//     {
//         $request->validate([
//             'customer_no' => 'required|string|min:4',
//             'buyer_sku_code' => 'required|string|exists:postpaid_products,buyer_sku_code',
//         ]);

//         $customerNo = $request->customer_no;
//         $current_sku = $request->buyer_sku_code;

//         $product = PostpaidProduct::where('buyer_sku_code', $current_sku)->first();

//         if (!$product || !$product->seller_product_status) {
//             return response()->json(['message' => 'Produk PDAM tidak tersedia atau tidak aktif.'], 503);
//         }

//         $inquiryData = $this->_performSinglePdamInquiry($customerNo, $product);

//         if ($inquiryData) {
//             session(['postpaid_inquiry_data' => $inquiryData]);
//             return response()->json($inquiryData);
//         } else {
//             return response()->json(['message' => 'Gagal melakukan pengecekan tagihan. Silakan coba lagi nanti.'], 400);
//         }
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
//         Log::info("PDAM Single Payment: User {$user->id} debited {$totalPriceToPay} for single payment.");

//         try {
//             $paymentResult = $this->_processIndividualPdamPayment($inquiryData, $user);

//             if (($paymentResult['status'] ?? 'Gagal') === 'Gagal') {
//                 $user->increment('balance', $totalPriceToPay);
//                 Log::warning("PDAM Single Payment: Transaction {$paymentResult['transaction_id']} failed, balance refunded {$totalPriceToPay}.");
//             }
//             session()->forget('postpaid_inquiry_data');
//             return response()->json($paymentResult);
//         } catch (\Exception $e) {
//             $user->increment('balance', $totalPriceToPay);
//             Log::error('PDAM Single Payment Error (Controller): ' . $e->getMessage(), ['customer_no' => $request->customer_no, 'inquiry_data' => $inquiryData]);
//             return response()->json(['message' => 'Terjadi kesalahan saat memproses pembayaran: ' . $e->getMessage()], 500);
//         }
//     }

//     /**
//      * NEW: Handles bulk PDAM inquiry for multiple customer numbers.
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
//             Log::warning("Bulk Inquiry PDAM: Produk PDAM tidak tersedia atau tidak aktif: {$buyerSkuCode}.");
//             return response()->json(['message' => 'Produk PDAM yang dipilih tidak tersedia atau tidak aktif.'], 503);
//         }

//         foreach ($customerNos as $customerNo) {
//             try {
//                 $inquiryData = $this->_performSinglePdamInquiry($customerNo, $product);

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
//                 Log::error("Bulk Inquiry PDAM: Unexpected error for customer {$customerNo}, SKU {$buyerSkuCode}. Error: " . $e->getMessage());
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
//             session(['postpaid_bulk_pdam_inquiry_data' => $results['successful']]);
//         } else {
//             session()->forget('postpaid_bulk_pdam_inquiry_data');
//         }

//         return response()->json($results);
//     }

//     /**
//      * NEW: Handles bulk PDAM payment for multiple previously inquired customer numbers.
//      *
//      * @param Request $request Contains 'customer_nos_to_pay' array (for validation against session).
//      * @return \Illuminate\Http\JsonResponse
//      */
//     public function bulkPayment(Request $request)
//     {
//         $user = Auth::user();
//         $inquiryDataForPayment = session('postpaid_bulk_pdam_inquiry_data');

//         if (!$inquiryDataForPayment || empty($inquiryDataForPayment)) {
//             return response()->json(['message' => 'Sesi pembayaran massal tidak valid atau kosong. Silakan lakukan pengecekan tagihan ulang.'], 400);
//         }

//         // Filter inquiryDataForPayment to only include those requested in customer_nos_to_pay
//         $requestedCustomerNos = collect($request->customer_nos_to_pay)->unique();
//         $filteredInquiryDataForPayment = collect($inquiryDataForPayment)->filter(function ($item) use ($requestedCustomerNos) {
//             return $requestedCustomerNos->contains($item['customer_no']);
//         })->values()->all();

//         if (count($requestedCustomerNos) !== count($filteredInquiryDataForPayment)) {
//             Log::warning("Bulk Payment PDAM: Mismatch between requested customer_nos and session data after filtering.", [
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
//         Log::info("Bulk Payment PDAM: User {$user->id} debited total {$totalPriceForBulkPayment} for bulk payment.");

//         $paymentResults = [];
//         $totalRefundAmount = 0;

//         foreach ($filteredInquiryDataForPayment as $inquiryData) {
//             try {
//                 $individualPaymentResult = $this->_processIndividualPdamPayment($inquiryData, $user);
//                 $paymentResults[] = $individualPaymentResult;

//                 if (($individualPaymentResult['status'] ?? 'Gagal') === 'Gagal') {
//                     $totalRefundAmount += $inquiryData['selling_price'];
//                     Log::warning("Bulk Payment PDAM: Individual transaction for {$inquiryData['customer_no']} failed, adding {$inquiryData['selling_price']} to refund amount.");
//                 }
//             } catch (\Exception $e) {
//                 Log::error('PDAM Bulk Payment Error for customer ' . $inquiryData['customer_no'] . ': ' . $e->getMessage(), ['inquiry_data' => $inquiryData, 'user_id' => $user->id]);
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
//             Log::info("Bulk Payment PDAM: Refunded {$totalRefundAmount} to user {$user->id} for failed transactions.");
//         }

//         session()->forget('postpaid_bulk_pdam_inquiry_data');
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

class PascaPdamController extends Controller
{
    use TransactionMapper;

    /**
     * Menampilkan halaman pembayaran PDAM dengan daftar produk.
     */
    public function index()
    {
        $products = $this->fetchPdamProducts();
        return Inertia::render('Pascabayar/Pdam', [
            'products' => $products,
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }

    /**
     * Mengambil daftar produk PDAM dari database lokal.
     * Produk dengan status seller_product_status = false juga diambil
     * agar bisa ditampilkan di frontend dengan indikator gangguan.
     */
    private function fetchPdamProducts()
    {
        $pdamProducts = PostpaidProduct::where('brand', 'PDAM')
                                        ->orderBy('product_name', 'asc')
                                        ->get();

        return $pdamProducts->map(function ($product) {
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
     * Helper method to perform a single PDAM inquiry.
     * Handles API calls and data processing for a given customer number and product.
     *
     * @param string $customerNo The customer number to inquire.
     * @param PostpaidProduct $product The PostpaidProduct model associated with the inquiry.
     * @return array|null Returns processed inquiry data on success, null on failure.
     */
    private function _performSinglePdamInquiry(string $customerNo, PostpaidProduct $product): ?array
    {
        $current_sku = $product->buyer_sku_code;
        $ref_id = 'pdam-' . substr(str_replace('-', '', Str::uuid()->toString()), 0, 15);
        $username = env('P_U');
        $apiKey = env('P_AK'); // Using P_AK from env
        $sign = md5($username . $apiKey . $ref_id);

        $responseData = [];

        // --- START DUMMY DATA FOR TESTING INQUIRY (if APP_ENV is local) ---
        if (env('APP_ENV') === 'local') {
            $customerNoLength = strlen($customerNo);
            $lastDigit = $customerNo[$customerNoLength - 1] ?? '0'; // Default to '0' if customerNo is empty
            $isOverdue = ((int)$lastDigit % 2 === 0); // Simulate overdue for even last digits
            $customerNameSeed = substr(preg_replace('/[^0-9]/', '', $customerNo), 0, 5); // Use digits from customerNo

            $basePricePerBill = 25000 + (substr($customerNo, -2, 1) * 1000); // Vary base price (pure bill)
            $adminFeePerTransaction = 2500; // Admin fee applied per transaction
            $biayaLainPerBill = 1500;
            $dendaPerBill = $isOverdue ? (5000 + (substr($customerNo, -3, 1) * 500)) : 0; // Vary denda

            $numBills = 1;
            if ((int)$lastDigit % 3 === 0) { // Some customers might have 2 bills
                $numBills = 2;
            } elseif ((int)$lastDigit % 5 === 0) { // Some might have 3 bills
                $numBills = 3;
            }

            $dummyDescDetails = [];
            $totalPureBillAmount = 0;
            $totalDendaAmount = 0;
            $totalBiayaLainAmount = 0;

            for ($i = 0; $i < $numBills; $i++) {
                $periodeMonth = date('m', strtotime("-{$i} month"));
                $periodeYear = date('Y', strtotime("-{$i} month"));
                $billPrice = $basePricePerBill + ($i * 1000); // Pure bill per detail
                $billDenda = $isOverdue ? ceil($dendaPerBill / $numBills) : 0; // Distribute denda
                $billBiayaLain = $biayaLainPerBill;

                $dummyDescDetails[] = [
                    "periode" => "{$periodeYear}{$periodeMonth}",
                    "nilai_tagihan" => $billPrice, // Ini harga pokok murni per lembar
                    "denda" => $billDenda,
                    "meter_awal" => '000' . Str::random(5),
                    "meter_akhir" => '000' . Str::random(5),
                    "biaya_lain" => $billBiayaLain
                ];
                $totalPureBillAmount += $billPrice;
                $totalDendaAmount += $billDenda;
                $totalBiayaLainAmount += $billBiayaLain;
            }

            $dummyCustomerName = 'Pelanggan PDAM ' . $product->product_name . ' ' . $customerNameSeed . ($isOverdue ? ' (OVERDUE)' : '');
            $dummyAddress = 'Jl. Dummy No.' . $customerNoLength . ', Kota ' . Str::upper(substr($current_sku, 0, 3));
            $dummyJatuhTempo = date('d-M-Y', strtotime('+5 days'));

            // Mengikuti pola PLN, asumsikan 'price' dari API (jika tanpa detail) adalah (pure_bill + denda + biaya_lain)
            $dummyPriceField = $totalPureBillAmount + $totalDendaAmount + $totalBiayaLainAmount;
            $dummyAdminField = $adminFeePerTransaction; // Admin fee per transaksi

            // Original API Total Price (price field + admin field)
            $dummyOriginalApiTotalPrice = $dummyPriceField + $dummyAdminField;
            // Original API Selling Price (jika ada, bisa berbeda dari total di atas karena markup provider)
            $dummyProviderOriginalSellingPrice = ceil($dummyOriginalApiTotalPrice * (1 + (int)$lastDigit / 10000)); // Slight variation from base

            $responseData = [
                'data' => [
                    'status' => 'Sukses',
                    'message' => 'Inquiry PDAM dummy berhasil.',
                    'customer_name' => $dummyCustomerName,
                    'customer_no' => $customerNo,
                    'buyer_sku_code' => $current_sku,
                    'price' => $dummyPriceField, // Ini adalah (harga pokok + denda + biaya lain) dari sisi dummy
                    'admin' => $dummyAdminField, // Admin fee per transaksi
                    'rc' => '00',
                    'sn' => 'SN-INQ-' . Str::random(12),
                    'ref_id' => $ref_id,
                    'desc' => [
                        "tarif" => "R" . (2 + (int)$lastDigit % 3),
                        "lembar_tagihan" => $numBills,
                        "alamat" => $dummyAddress,
                        "jatuh_tempo" => $dummyJatuhTempo,
                        "detail" => $dummyDescDetails,
                        "denda" => $totalDendaAmount, // Total denda (untuk info di desc)
                        "biaya_lain" => $totalBiayaLainAmount, // Total biaya lain (untuk info di desc)
                    ],
                    'selling_price' => $dummyProviderOriginalSellingPrice, // ORIGINAL provider selling_price
                    'original_api_price' => $dummyOriginalApiTotalPrice, // Total murni dari provider (price + admin)
                    'original_api_selling_price' => $dummyProviderOriginalSellingPrice, // Untuk konsistensi dengan PLN
                ],
            ];
            Log::info('PDAM Inquiry API Response (DUMMY):', ['response_data' => $responseData, 'customer_no' => $customerNo, 'sku' => $current_sku, 'ref_id' => $ref_id]);
        } else {
            // --- END DUMMY DATA ---

            // --- ORIGINAL API CALL (only if not in local dummy mode) ---
            if (!$product->seller_product_status) {
                Log::warning("Inquiry PDAM: Produk tidak aktif untuk SKU: {$current_sku}, Customer No: {$customerNo}.");
                return null; // Don't even try if product is inactive in real mode
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
                Log::info('PDAM Inquiry API Response:', ['response_data' => $responseData, 'customer_no' => $customerNo, 'sku' => $current_sku, 'ref_id' => $ref_id]);

                if (!isset($responseData['data']) || $responseData['data']['status'] !== 'Sukses') {
                    $errorMessage = $responseData['data']['message'] ?? 'Gagal melakukan pengecekan tagihan dari provider.';
                    Log::warning("Inquiry PDAM Gagal dari Provider untuk SKU: {$current_sku}. Pesan: {$errorMessage}", ['response' => $responseData, 'customer_no' => $customerNo]);
                    return null;
                }
            } catch (\Exception $e) {
                Log::error('PDAM Inquiry Error (API Call): ' . $e->getMessage(), ['customer_no' => $customerNo, 'sku' => $current_sku, 'exception_trace' => $e->getTraceAsString()]);
                return null;
            }
        }

        // --- COMMON PROCESSING LOGIC (for both real and dummy data) ---
        $inquiryDataFromApi = $responseData['data'];

        // Simpan 'selling_price' asli dari respons API provider jika tersedia (ini akan jadi original_api_selling_price)
        $providerOriginalSellingPrice = (float) ($inquiryDataFromApi['selling_price'] ?? 0);

        if (!isset($inquiryDataFromApi['desc']) || !is_array($inquiryDataFromApi['desc'])) {
            $inquiryDataFromApi['desc'] = [];
        }

        // Pastikan field desc yang penting ada atau disetel null
        $inquiryDataFromApi['desc']['tarif']       = $inquiryDataFromApi['desc']['tarif'] ?? null;
        $inquiryDataFromApi['desc']['alamat']      = $inquiryDataFromApi['desc']['alamat'] ?? null;
        $inquiryDataFromApi['desc']['jatuh_tempo'] = $inquiryDataFromApi['desc']['jatuh_tempo'] ?? null;

        $sumOfPureBillAmounts = 0; // Total harga pokok tagihan murni
        $sumOfDendaAmounts = 0;    // Total denda
        $sumOfBiayaLainAmounts = 0; // Total biaya lain
        $sumOfAdminFees = (float) ($inquiryDataFromApi['admin'] ?? 0); // Total admin dari API
        $jumlahLembarTagihan = 0;

        // Determine jumlahLembarTagihan
        if (isset($inquiryDataFromApi['desc']['lembar_tagihan'])) {
            $jumlahLembarTagihan = (int) $inquiryDataFromApi['desc']['lembar_tagihan'];
        } elseif (isset($inquiryDataFromApi['desc']['detail']) && is_array($inquiryDataFromApi['desc']['detail'])) {
            $jumlahLembarTagihan = count($inquiryDataFromApi['desc']['detail']);
        } else {
            $jumlahLembarTagihan = 1;
        }

        // Aggregate totals from details array or top-level fields
        if (isset($inquiryDataFromApi['desc']['detail']) && is_array($inquiryDataFromApi['desc']['detail'])) {
            foreach ($inquiryDataFromApi['desc']['detail'] as $detail) {
                $sumOfPureBillAmounts += (float) ($detail['nilai_tagihan'] ?? 0);
                $sumOfDendaAmounts += (float) ($detail['denda'] ?? 0);
                $sumOfBiayaLainAmounts += (float) ($detail['biaya_lain'] ?? 0);
            }
        } else {
            // Jika 'desc.detail' tidak tersedia, kita asumsikan 'price' di root sudah termasuk denda dan biaya_lain
            $apiCombinedPrice = (float) ($inquiryDataFromApi['price'] ?? 0); // Ini adalah (harga pokok + denda + biaya lain) dari API
            $apiDenda = (float) ($inquiryDataFromApi['desc']['denda'] ?? 0); // Total denda (dari desc, untuk info)
            $apiBiayaLain = (float) ($inquiryDataFromApi['desc']['biaya_lain'] ?? 0); // Total biaya lain (dari desc, untuk info)

            // Ekstrak harga pokok murni
            $sumOfPureBillAmounts = $apiCombinedPrice - $apiDenda - $apiBiayaLain;
            $sumOfDendaAmounts = $apiDenda;
            $sumOfBiayaLainAmounts = $apiBiayaLain;
            // $sumOfAdminFees sudah diambil dari $inquiryDataFromApi['admin'] di atas
        }

        $commission = $product->commission ?? 0;
        $commission_sell_percentage = $product->commission_sell_percentage ?? 0;
        $commission_sell_fixed = $product->commission_sell_fixed ?? 0;
        $diskonPerLembar = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;

        $finalDiskon = $diskonPerLembar * $jumlahLembarTagihan;
        $finalDiskon = ceil($finalDiskon); // Pembulatan diskon ke atas

        // Hitung total jumlah yang harus dibayar sebelum diskon kita (Pure Bill + Denda + Biaya Lain + Admin dari provider)
        $totalAmountBeforeDiskon = $sumOfPureBillAmounts + $sumOfDendaAmounts + $sumOfBiayaLainAmounts + $sumOfAdminFees;

        $finalSellingPrice = $totalAmountBeforeDiskon - $finalDiskon;
        $finalSellingPrice = ceil($finalSellingPrice); // Pembulatan harga jual akhir ke atas

        // Override logic: Jika total harga dari API lebih besar dari harga kalkulasi kita, dan API punya harga jual sendiri
        // original_api_price akan mengambil dari 'original_api_price' yang mungkin diset di dummy atau dihitung dari 'price' + 'admin'
        $apiOriginalPrice = (float) ($inquiryDataFromApi['original_api_price'] ?? ($inquiryDataFromApi['price'] + ($inquiryDataFromApi['admin'] ?? 0)) ?? 0);

        if ($apiOriginalPrice > $finalSellingPrice && $providerOriginalSellingPrice > 0) {
            Log::info("PDAM Inquiry: finalSellingPrice overridden by provider_original_selling_price.", [
                'calculated_finalSellingPrice' => $finalSellingPrice,
                'apiOriginalPrice' => $apiOriginalPrice,
                'providerOriginalSellingPrice' => $providerOriginalSellingPrice,
                'customer_no' => $customerNo
            ]);
            $finalSellingPrice = $providerOriginalSellingPrice;
        }

        // Update inquiryDataFromApi dengan nilai-nilai yang sudah diproses
        $inquiryDataFromApi['price']         = $sumOfPureBillAmounts; // Harga pokok murni (untuk mapping transaksi)
        $inquiryDataFromApi['admin']         = $sumOfAdminFees; // Admin dari provider
        $inquiryDataFromApi['denda']         = $sumOfDendaAmounts; // Total denda
        $inquiryDataFromApi['biaya_lain']    = $sumOfBiayaLainAmounts; // Total biaya lain (NEW)
        $inquiryDataFromApi['diskon']        = $finalDiskon;
        $inquiryDataFromApi['jumlah_lembar_tagihan'] = $jumlahLembarTagihan;
        $inquiryDataFromApi['selling_price'] = $finalSellingPrice; // Harga yang harus dibayar user
        $inquiryDataFromApi['buyer_sku_code'] = $current_sku;
        $inquiryDataFromApi['ref_id'] = $ref_id;
        $inquiryDataFromApi['provider_original_selling_price'] = $providerOriginalSellingPrice; // Untuk referensi
        $inquiryDataFromApi['product_name'] = $product->product_name; // Add product name for frontend display

        unset($inquiryDataFromApi['buyer_last_saldo']); // Hapus jika tidak relevan

        return $inquiryDataFromApi;
    }

    /**
     * Helper method to process a single PDAM payment after balance has been debited.
     * This method creates the transaction record, calls the provider API, and updates the transaction.
     *
     * @param array $inquiryData Processed inquiry data for a single customer.
     * @param \App\Models\User $user The authenticated user (for logging/context, not balance modification).
     * @return array Returns an array with transaction status and details.
     * @throws \Exception If the API call or transaction update fails critically.
     */
    private function _processIndividualPdamPayment(array $inquiryData, \App\Models\User $user): array
    {
        $totalPriceToPay     = (float) $inquiryData['selling_price'];
        $finalAdmin          = (float) $inquiryData['admin']; // Ini adalah sumOfAdminFees
        $pureBillPrice       = (float) $inquiryData['price']; // Ini adalah sumOfPureBillAmounts
        $diskon              = (float) ($inquiryData['diskon'] ?? 0);
        $jumlahLembarTagihan = (int) ($inquiryData['jumlah_lembar_tagihan'] ?? 0);
        $denda               = (float) ($inquiryData['denda'] ?? 0); // Ini adalah sumOfDendaAmounts
        $biayaLain           = (float) ($inquiryData['biaya_lain'] ?? 0); // Ini adalah sumOfBiayaLainAmounts (NEW)

        $initialData = $this->mapToUnifiedTransaction($inquiryData, 'PDAM', $pureBillPrice, $finalAdmin);
        $initialData['user_id'] = $user->id; // Set user_id
        $initialData['selling_price'] = $totalPriceToPay;
        $initialData['status'] = 'Pending';
        $initialData['message'] = 'Menunggu konfirmasi pembayaran dari provider';

        $initialData['rc'] = $inquiryData['rc'] ?? null;
        $initialData['sn'] = null;

        $initialData['details'] = [
            'diskon' => $diskon,
            'jumlah_lembar_tagihan' => $jumlahLembarTagihan,
            'denda' => $denda,
            'biaya_lain' => $biayaLain, // Simpan biaya lain sebagai detail (NEW)
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
                    'message' => 'Pembayaran PDAM dummy berhasil diproses.',
                    'rc' => '00',
                    'sn' => 'SN-PDAM-' . Str::random(15),
                    'customer_name' => $inquiryData['customer_name'],
                    'customer_no' => $inquiryData['customer_no'],
                    'buyer_sku_code' => $inquiryData['buyer_sku_code'],
                    'price' => $pureBillPrice, // Pure bill (dari inquiry data)
                    'admin' => $finalAdmin, // Final admin (dari inquiry data)
                    'ref_id' => $inquiryData['ref_id'],
                    'selling_price' => $totalPriceToPay,
                ];
            } else {
                $apiResponseData = [
                    'status' => 'Gagal',
                    'message' => 'Pembayaran PDAM dummy gagal. Saldo provider tidak cukup (simulasi).',
                    'rc' => '14', // Example failure code
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
            Log::info('PDAM Payment Dummy Response:', ['response_data' => $apiResponseData, 'transaction_id' => $unifiedTransaction->id]);

        } else {
            // --- END DUMMY DATA ---

            // --- ORIGINAL API CALL (only if not in local dummy mode) ---
            $username = env('P_U');
            $apiKey = env('P_AK');
            $sign = md5($username . $apiKey . $inquiryData['ref_id']);

            try {
                $response = Http::post(config('services.api_server') . '/v1/transaction', [
                    'commands' => 'pay-pasca',
                    'username' => $username,
                    'buyer_sku_code' => $inquiryData['buyer_sku_code'],
                    'customer_no' => $inquiryData['customer_no'],
                    'ref_id' => $inquiryData['ref_id'],
                    'sign' => $sign,
                    'testing' => false,
                ]);
                $apiResponseData = $response->json()['data'];

                Log::info('PDAM Payment API Response:', ['response_data' => $apiResponseData, 'transaction_id' => $unifiedTransaction->id]);

            } catch (\Exception $e) {
                $errorMessage = ['status' => 'Gagal', 'message' => 'Gagal terhubung ke server provider.'];
                $unifiedTransaction->update(array_merge($errorMessage, ['rc' => null, 'sn' => null]));
                Log::error('PDAM Payment Error: ' . $e->getMessage(), ['transaction_id' => $unifiedTransaction->id, 'inquiry_data' => $inquiryData]);
                throw new \Exception('Terjadi kesalahan pada server provider.');
            }
        }

        $fullResponseData = array_merge($inquiryData, $apiResponseData);

        // Pastikan nilai yang dikirim ke mapToUnifiedTransaction adalah yang sudah diproses
        $fullResponseData['price'] = $pureBillPrice;
        $fullResponseData['admin'] = $finalAdmin;
        $fullResponseData['selling_price'] = $totalPriceToPay;
        unset($fullResponseData['buyer_last_saldo']);
        unset($fullResponseData['provider_original_selling_price']);
        unset($fullResponseData['biaya_lain']); // Hapus dari level root jika sudah masuk ke details atau dihitung sebagai bagian dari price

        $updatePayload = $this->mapToUnifiedTransaction($fullResponseData, 'PDAM', $pureBillPrice, $finalAdmin);
        $updatePayload['selling_price'] = $totalPriceToPay;
        $updatePayload['status'] = $apiResponseData['status'] ?? 'Gagal';
        $updatePayload['message'] = $apiResponseData['message'] ?? 'Pembayaran gagal.';

        $updatePayload['rc'] = $apiResponseData['rc'] ?? null;
        $updatePayload['sn'] = $apiResponseData['sn'] ?? null;

        $keysToExcludeFromDetails = [
            'ref_id', 'customer_no', 'customer_name', 'buyer_sku_code', 'message',
            'rc', 'sn', 'buyer_last_saldo', 'price', 'selling_price', 'admin', 'status',
            'diskon', 'jumlah_lembar_tagihan', 'denda', 'biaya_lain', 'desc', // 'biaya_lain' ditambahkan
            'provider_original_selling_price', 'product_name'
        ];

        $detailsFromApiResponse = [];
        foreach ($apiResponseData as $key => $value) {
            if (!in_array($key, $keysToExcludeFromDetails)) {
                $detailsFromApiResponse[$key] = $value;
            }
        }

        $updatePayload['details'] = array_merge(
            $detailsFromApiResponse,
            ['diskon' => $diskon, 'jumlah_lembar_tagihan' => $jumlahLembarTagihan, 'denda' => $denda, 'biaya_lain' => $biayaLain], // Sertakan biaya_lain
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
            'biaya_lain' => $unifiedTransaction->details['biaya_lain'] ?? 0, // Tambahkan biaya_lain di return
            'admin' => $unifiedTransaction->admin_fee,
            'price' => $unifiedTransaction->price,
            'sn' => $unifiedTransaction->sn,
            'product_name' => $inquiryData['product_name'], // Pass product name from inquiry data
            'details' => $unifiedTransaction->details,
        ];
    }

    public function inquiry(Request $request)
    {
        $request->validate([
            'customer_no' => 'required|string|min:4',
            'buyer_sku_code' => 'required|string|exists:postpaid_products,buyer_sku_code',
        ]);

        $customerNo = $request->customer_no;
        $current_sku = $request->buyer_sku_code;

        $product = PostpaidProduct::where('buyer_sku_code', $current_sku)->first();

        if (!$product || !$product->seller_product_status) {
            return response()->json(['message' => 'Produk PDAM tidak tersedia atau tidak aktif.'], 503);
        }

        $inquiryData = $this->_performSinglePdamInquiry($customerNo, $product);

        if ($inquiryData) {
            session(['postpaid_inquiry_data' => $inquiryData]);
            return response()->json($inquiryData);
        } else {
            return response()->json(['message' => 'Gagal melakukan pengecekan tagihan. Silakan coba lagi nanti.'], 400);
        }
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
        Log::info("PDAM Single Payment: User {$user->id} debited {$totalPriceToPay} for single payment.");

        try {
            $paymentResult = $this->_processIndividualPdamPayment($inquiryData, $user);

            if (($paymentResult['status'] ?? 'Gagal') === 'Gagal') {
                $user->increment('balance', $totalPriceToPay);
                Log::warning("PDAM Single Payment: Transaction {$paymentResult['transaction_id']} failed, balance refunded {$totalPriceToPay}.");
            }
            session()->forget('postpaid_inquiry_data');
            return response()->json($paymentResult);
        } catch (\Exception $e) {
            $user->increment('balance', $totalPriceToPay);
            Log::error('PDAM Single Payment Error (Controller): ' . $e->getMessage(), ['customer_no' => $request->customer_no, 'inquiry_data' => $inquiryData]);
            return response()->json(['message' => 'Terjadi kesalahan saat memproses pembayaran: ' . $e->getMessage()], 500);
        }
    }

    /**
     * NEW: Handles bulk PDAM inquiry for multiple customer numbers.
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
            Log::warning("Bulk Inquiry PDAM: Produk PDAM tidak tersedia atau tidak aktif: {$buyerSkuCode}.");
            return response()->json(['message' => 'Produk PDAM yang dipilih tidak tersedia atau tidak aktif.'], 503);
        }

        foreach ($customerNos as $customerNo) {
            try {
                $inquiryData = $this->_performSinglePdamInquiry($customerNo, $product);

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
                Log::error("Bulk Inquiry PDAM: Unexpected error for customer {$customerNo}, SKU {$buyerSkuCode}. Error: " . $e->getMessage());
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
            session(['postpaid_bulk_pdam_inquiry_data' => $results['successful']]);
        } else {
            session()->forget('postpaid_bulk_pdam_inquiry_data');
        }

        return response()->json($results);
    }

    /**
     * NEW: Handles bulk PDAM payment for multiple previously inquired customer numbers.
     *
     * @param Request $request Contains 'customer_nos_to_pay' array (for validation against session).
     * @return \Illuminate\Http\JsonResponse
     */
    public function bulkPayment(Request $request)
    {
        $user = Auth::user();
        $inquiryDataForPayment = session('postpaid_bulk_pdam_inquiry_data');

        if (!$inquiryDataForPayment || empty($inquiryDataForPayment)) {
            return response()->json(['message' => 'Sesi pembayaran massal tidak valid atau kosong. Silakan lakukan pengecekan tagihan ulang.'], 400);
        }

        // Filter inquiryDataForPayment to only include those requested in customer_nos_to_pay
        $requestedCustomerNos = collect($request->customer_nos_to_pay)->unique();
        $filteredInquiryDataForPayment = collect($inquiryDataForPayment)->filter(function ($item) use ($requestedCustomerNos) {
            return $requestedCustomerNos->contains($item['customer_no']);
        })->values()->all();

        if (count($requestedCustomerNos) !== count($filteredInquiryDataForPayment)) {
            Log::warning("Bulk Payment PDAM: Mismatch between requested customer_nos and session data after filtering.", [
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
        Log::info("Bulk Payment PDAM: User {$user->id} debited total {$totalPriceForBulkPayment} for bulk payment.");

        $paymentResults = [];
        $totalRefundAmount = 0;

        foreach ($filteredInquiryDataForPayment as $inquiryData) {
            try {
                $individualPaymentResult = $this->_processIndividualPdamPayment($inquiryData, $user);
                $paymentResults[] = $individualPaymentResult;

                if (($individualPaymentResult['status'] ?? 'Gagal') === 'Gagal') {
                    $totalRefundAmount += $inquiryData['selling_price'];
                    Log::warning("Bulk Payment PDAM: Individual transaction for {$inquiryData['customer_no']} failed, adding {$inquiryData['selling_price']} to refund amount.");
                }
            } catch (\Exception $e) {
                Log::error('PDAM Bulk Payment Error for customer ' . $inquiryData['customer_no'] . ': ' . $e->getMessage(), ['inquiry_data' => $inquiryData, 'user_id' => $user->id]);
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
            Log::info("Bulk Payment PDAM: Refunded {$totalRefundAmount} to user {$user->id} for failed transactions.");
        }

        session()->forget('postpaid_bulk_pdam_inquiry_data');
        return response()->json([
            'results' => $paymentResults,
            'total_refund_amount' => $totalRefundAmount,
            'total_paid_amount' => $totalPriceForBulkPayment - $totalRefundAmount
        ]);
    }
}