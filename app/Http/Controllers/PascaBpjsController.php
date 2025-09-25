<?php

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
     * Display a listing of BPJS Health products.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $products = $this->fetchBpjsProducts();
        return Inertia::render('Pascabayar/Bpjs', [
            'products' => $products,
        ]);
    }

    /**
     * Fetch and process BPJS Health products for display.
     *
     * @return array
     */
    private function fetchBpjsProducts()
    {
        // Fetch products specifically for BPJS KESEHATAN
        $bpjsProducts = PostpaidProduct::where('brand', 'BPJS KESEHATAN')->get();

        return $bpjsProducts->map(function ($product) {
            $commission = $product->commission ?? 0;
            $commission_sell_percentage = $product->commission_sell_percentage ?? 0;
            $commission_sell_fixed = $product->commission_sell_fixed ?? 0;
            $adminFromServer = $product->admin ?? 0; // Admin dari server API (provider)

            // Hitung markup/diskon untuk klien berdasarkan komisi
            $markupForClient = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;

            // calculated_admin di sini adalah "admin fee" yang kita tampilkan ke pengguna,
            // yaitu admin dari provider dikurangi markup kita.
            $product->calculated_admin = $adminFromServer - $markupForClient;
            return $product;
        })->values()->all();
    }

    /**
     * Helper method to perform a single BPJS Health inquiry.
     * Handles API calls and data processing for a given customer number.
     *
     * @param string $customerNo The customer number (BPJS ID) to inquire.
     * @return array|null Returns processed inquiry data on success, null on failure.
     */
    private function _performSingleInquiry(string $customerNo): ?array
    {
        $availableProducts = PostpaidProduct::where('brand', 'BPJS KESEHATAN')
                                            ->where('seller_product_status', true)
                                            ->orderBy('buyer_sku_code', 'asc')
                                            ->get();

        if ($availableProducts->isEmpty()) {
            Log::warning("Inquiry BPJS: Tidak ada produk BPJS Kesehatan yang aktif ditemukan untuk {$customerNo}.");
            return null; // Indicates no active products
        }

        $successfulInquiryData = null;
        $lastErrorMessage = 'Gagal melakukan pengecekan tagihan setelah mencoba semua provider.';

        // Use the first available product for commission calculation
        $productToUseForCommission = $availableProducts->first();
        if (!$productToUseForCommission) {
            Log::warning("Inquiry BPJS: Tidak ada produk BPJS Kesehatan yang aktif ditemukan, tidak bisa menghitung komisi.");
            return null;
        }

        $responseData = [];

        // --- START DUMMY DATA FOR TESTING INQUIRY (if APP_ENV is local) ---
        if (env('APP_ENV') === 'local') {
            $customerNoLength = strlen($customerNo);
            $lastDigit = $customerNo[$customerNoLength - 1] ?? '0';
            $isOverdue = ((int)$lastDigit % 2 === 0); // Simulate overdue for even last digits

            $dummyPriceField = 24700; // Harga pokok per peserta per bulan
            $dummyAdminField = 2500; // Admin dari provider
            $dummySellingPriceField = $dummyPriceField + $dummyAdminField; // Initial selling price from provider

            $jumlahPeserta = ((int)$lastDigit % 3 === 0) ? 2 : 1; // Simulate multiple participants

            // Simulate slight variation in price if multiple participants or overdue
            if ($jumlahPeserta > 1) {
                $dummyPriceField = 24700 * $jumlahPeserta;
                $dummySellingPriceField = $dummyPriceField + $dummyAdminField;
            }
            if ($isOverdue) {
                // For BPJS, overdue usually means multiple unpaid months, or just blocked.
                // For simplicity, let's just make the message overdue, not necessarily add a denda in price
                // unless provider's actual API includes it in 'price'.
            }


            $responseData = [
                'data' => [
                    'ref_id' => 'dummy-bpjs-' . substr(md5($customerNo . time()), 0, 15),
                    'customer_no' => $customerNo,
                    'customer_name' => 'DUMMY BPJS ' . substr(preg_replace('/[^0-9]/', '', $customerNo), 0, 5) . ($isOverdue ? ' (OVERDUE)' : ''),
                    'buyer_sku_code' => 'bpjs', // Generic SKU for BPJS
                    'admin' => $dummyAdminField, // Admin dari provider
                    'message' => 'INQ BPJS Sukses (DUMMY).',
                    'status' => 'Sukses',
                    'rc' => '00',
                    'price' => $dummyPriceField, // Ini adalah harga pokok murni dari provider
                    'selling_price' => $dummySellingPriceField, // Ini adalah (harga pokok + admin) dari provider
                    'desc' => [
                        'jumlah_peserta' => (string)$jumlahPeserta,
                        'lembar_tagihan' => 1, // BPJS usually 1 month at a time for inquiry
                        'alamat' => 'JAKARTA PUSAT (DUMMY)',
                        'detail' => [
                            ['periode' => date('m')],
                        ],
                    ],
                    // We need to set 'original_api_price' and 'original_api_selling_price'
                    // to accurately reflect provider's total and selling price to us for calculations.
                    'original_api_price' => $dummyPriceField + $dummyAdminField, // Provider's total (pure bill + their admin)
                    'original_api_selling_price' => $dummySellingPriceField, // Provider's selling price to us
                ],
            ];
            Log::info("Inquiry BPJS (DUMMY) Sukses untuk Customer No: {$customerNo}", ['customer_no' => $customerNo, 'dummy_response' => $responseData]);

            // Proceed with the dummy response
            $apiResponseForProcessing = $responseData['data'];

        } else {
            // --- END DUMMY DATA ---

            // --- ORIGINAL API CALL (only if not in local dummy mode) ---
            $ref_id = 'bpjs-' . substr(str_replace('-', '', Str::uuid()->toString()), 0, 15);
            $username = env('P_U'); // Your provider username
            $apiKey = env('P_AK'); // Your provider API key
            $sign = md5($username . $apiKey . $ref_id);

            try {
                $response = Http::post(config('services.api_server') . '/v1/transaction', [
                    'commands' => 'inq-pasca', 'username' => $username, 'buyer_sku_code' => 'bpjs',
                    'customer_no' => $customerNo, 'ref_id' => $ref_id, 'sign' => $sign, 'testing' => false,
                ]);
                $responseData = $response->json();
            } catch (\Exception $e) {
                $lastErrorMessage = 'Gagal terhubung ke server provider.';
                Log::error("Inquiry BPJS Gagal Koneksi API untuk Customer No: {$customerNo}. Error: " . $e->getMessage(), [
                    'customer_no' => $customerNo, 'ref_id' => $ref_id, 'exception_message' => $e->getMessage(),
                ]);
                return null;
            }

            if (!isset($responseData['data']) || $responseData['data']['status'] !== 'Sukses') {
                $lastErrorMessage = $responseData['data']['message'] ?? 'Provider sedang sibuk atau data tidak valid.';
                Log::warning("Inquiry BPJS Gagal dari Provider. Customer No: {$customerNo}. Pesan: {$lastErrorMessage}", [
                    'customer_no' => $customerNo, 'ref_id' => $ref_id, 'api_response' => $responseData,
                ]);
                return null;
            }
            $apiResponseForProcessing = $responseData['data'];
            // END ORIGINAL API CALL
        }

        // --- COMMON PROCESSING LOGIC (for both real and dummy data) ---
        $inquiryDataFromApi = $apiResponseForProcessing;

        // Extract raw data from API response
        $pureBillPriceFromApi = (float) ($inquiryDataFromApi['price'] ?? 0); // This is the "price" from API (pure bill)
        $adminFeeFromApi = (float) ($inquiryDataFromApi['admin'] ?? 0);     // This is the "admin" from API (provider's admin)
        $jumlahLembarTagihan = (int) ($inquiryDataFromApi['desc']['lembar_tagihan'] ?? 1); // Default to 1 if not specified

        // Calculate our discount based on product commission
        $commission = $productToUseForCommission->commission ?? 0;
        $commission_sell_percentage = $productToUseForCommission->commission_sell_percentage ?? 0;
        $commission_sell_fixed = $productToUseForCommission->commission_sell_fixed ?? 0;
        $diskonPerLembar = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;

        $finalDiskon = $diskonPerLembar * $jumlahLembarTagihan;

        // Total amount before our discount (Pure Bill from API + Admin from API)
        $totalAmountBeforeOurDiskon = $pureBillPriceFromApi + $adminFeeFromApi;

        // Calculate our final selling price to the user
        // This directly implements the user's requested formula: (total bill amount + total admin fee) - discount
        $finalSellingPrice = $totalAmountBeforeOurDiskon - $finalDiskon;

        // Ensure selling price is an integer (round up for safety/simplicity)
        $finalSellingPrice = ceil($finalSellingPrice);

        // --- NEW CALCULATION FOR bill_amount_for_client_display ---
        // This will be pure bill price from API minus our discount (finalDiskon)
        $billAmountForClientDisplay = $pureBillPriceFromApi - $finalDiskon;
        $billAmountForClientDisplay = ceil($billAmountForClientDisplay); // Round up for display consistency

        // Populate the final successful inquiry data array
        $successfulInquiryData = $inquiryDataFromApi;
        $successfulInquiryData['price'] = (float) ($inquiryDataFromApi['selling_price'] ?? 0) - (float) ($inquiryDataFromApi['admin'] ?? 0);
        $successfulInquiryData['admin'] = $adminFeeFromApi;         // This is the provider's admin fee for our transaction mapping
        $successfulInquiryData['diskon'] = $finalDiskon;
        $successfulInquiryData['jumlah_lembar_tagihan'] = $jumlahLembarTagihan;
        $successfulInquiryData['selling_price'] = $finalSellingPrice; // This is what the user will pay
        $successfulInquiryData['buyer_sku_code'] = $productToUseForCommission->buyer_sku_code; // Use actual SKU from product
        $successfulInquiryData['ref_id'] = $successfulInquiryData['ref_id'] ?? 'generated-' . Str::uuid()->toString(); // Ensure ref_id exists
        // Add the new field for frontend display
        $successfulInquiryData['bill_amount_for_client_display'] = $billAmountForClientDisplay;


        Log::info("Inquiry BPJS Sukses (processed). Customer No: {$customerNo}", [
            'customer_no' => $customerNo,
            'ref_id' => $successfulInquiryData['ref_id'],
            'processed_data' => $successfulInquiryData,
        ]);

        return $successfulInquiryData;
    }

    /**
     * Helper method to process a single BPJS Health payment after balance has been debited.
     * This method creates the transaction record, calls the provider API, and updates the transaction.
     * It DOES NOT handle user balance debit/credit, that is done by the calling public methods.
     *
     * @param array $inquiryData Processed inquiry data for a single customer.
     * @param \App\Models\User $user The authenticated user (for logging/context, not balance modification).
     * @return array Returns an array with transaction status and details.
     * @throws \Exception If the API call or transaction update fails critically.
     */
    private function _processIndividualBpjsPayment(array $inquiryData, \App\Models\User $user): array
    {
        // Extract necessary data for transaction creation and API call
        $totalPriceToPay     = $inquiryData['selling_price'];
        $finalAdmin          = $inquiryData['admin'];          // Provider's admin fee
        $pureBillPrice       = $inquiryData['price'];          // Pure bill amount from provider
        $diskon              = $inquiryData['diskon'] ?? 0;
        $jumlahLembarTagihan = $inquiryData['jumlah_lembar_tagihan'] ?? 0;
        $jumlahPeserta       = $inquiryData['desc']['jumlah_peserta'] ?? null;
        $alamatPelanggan     = $inquiryData['desc']['alamat'] ?? null;

        // Create initial transaction record with 'Pending' status
        // Use 'BPJS' as the transaction type
        $initialData = $this->mapToUnifiedTransaction($inquiryData, 'BPJS KESEHATAN', $pureBillPrice, $finalAdmin);
        $initialData['user_id'] = $user->id; // Ensure user_id is set
        $initialData['selling_price'] = $totalPriceToPay;
        $initialData['status'] = 'Pending';
        $initialData['message'] = 'Menunggu konfirmasi pembayaran dari provider';
        $initialData['rc'] = $inquiryData['rc'] ?? null;
        $initialData['sn'] = null;
        $initialData['details'] = [
            'diskon' => $diskon,
            'jumlah_lembar_tagihan' => $jumlahLembarTagihan,
            'jumlah_peserta' => $jumlahPeserta,
            'alamat' => $alamatPelanggan,
            // You can add more BPJS-specific details from 'desc' here if needed
            'bpjs_desc_detail' => $inquiryData['desc']['detail'] ?? [],
        ];

        $unifiedTransaction = PostpaidTransaction::create($initialData);

        $apiResponseData = [];

        // --- START DUMMY DATA FOR TESTING PAYMENT (if APP_ENV is local) ---
        if (env('APP_ENV') === 'local') {
            $isPaymentSuccess = (substr($inquiryData['customer_no'], -1) % 2 !== 0); // Simulate success for odd last digit

            if ($isPaymentSuccess) {
                $dummyApiResponseData = [
                    'ref_id' => $inquiryData['ref_id'],
                    'customer_no' => $inquiryData['customer_no'],
                    'customer_name' => $inquiryData['customer_name'],
                    'buyer_sku_code' => $inquiryData['buyer_sku_code'],
                    'admin' => $inquiryData['admin'],
                    'message' => 'Payment Sukses (DUMMY).',
                    'status' => 'Sukses',
                    'sn' => 'DUMMYBPJS' . substr(md5($inquiryData['customer_no'] . microtime()), 0, 15),
                    'rc' => '00',
                    'buyer_last_saldo' => 99999999, // Dummy balance
                    'price' => $inquiryData['price'], // pure bill price
                    'selling_price' => $inquiryData['selling_price'], // what client paid
                    'desc' => $inquiryData['desc'] ?? [],
                ];
            } else {
                $dummyApiResponseData = [
                    'ref_id' => $inquiryData['ref_id'],
                    'customer_no' => $inquiryData['customer_no'],
                    'customer_name' => $inquiryData['customer_name'],
                    'buyer_sku_code' => $inquiryData['buyer_sku_code'],
                    'admin' => $inquiryData['admin'],
                    'message' => 'Payment Gagal (DUMMY). Saldo provider tidak mencukupi.',
                    'status' => 'Gagal',
                    'sn' => null,
                    'rc' => '14', // Example failure code
                    'buyer_last_saldo' => 99999999,
                    'price' => $inquiryData['price'],
                    'selling_price' => $inquiryData['selling_price'],
                    'desc' => $inquiryData['desc'] ?? [],
                ];
            }

            $apiResponseData = $dummyApiResponseData;
            Log::info('BPJS Payment API Response (DUMMY):', ['response_data' => $apiResponseData, 'transaction_id' => $unifiedTransaction->id]);

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
                $apiResponseData = $response->json()['data'] ?? [];
                if (!isset($response->json()['data'])) {
                     Log::error('BPJS Payment API Response did not contain "data" key.', ['full_response' => $response->json(), 'transaction_id' => $unifiedTransaction->id]);
                     throw new \Exception('Respon API provider tidak lengkap.');
                }
                Log::info('BPJS Payment API Response (Individual):', ['response_data' => $apiResponseData, 'transaction_id' => $unifiedTransaction->id]);

            } catch (\Exception $e) {
                // Update transaction status to Failed and log error
                $errorMessage = ['status' => 'Gagal', 'message' => 'Gagal terhubung ke server provider atau respon tidak valid.'];
                $unifiedTransaction->update(array_merge($errorMessage, ['rc' => null, 'sn' => null]));
                Log::error('BPJS Payment Error (Individual): ' . $e->getMessage(), ['transaction_id' => $unifiedTransaction->id, 'inquiry_data' => $inquiryData]);
                throw new \Exception('Terjadi kesalahan pada server provider untuk ID Pelanggan: ' . $inquiryData['customer_no'] . '.');
            }
            // END ORIGINAL API CALL
        }

        $fullResponseData = array_merge($inquiryData, $apiResponseData);

        // Map and update the transaction with final status from API
        $updatePayload = $this->mapToUnifiedTransaction($fullResponseData, 'BPJS', $pureBillPrice, $finalAdmin);
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
            'jumlah_peserta', 'alamat', 'bpjs_desc_detail', // Already in initial details, avoid re-adding directly from apiResponseData
            'bill_amount_for_client_display', // Exclude this from details as it's for frontend display, not core transaction detail
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
            'jumlah_peserta' => $unifiedTransaction->details['jumlah_peserta'] ?? null,
            'alamat' => $unifiedTransaction->details['alamat'] ?? null,
            'rc' => $unifiedTransaction->rc,
            'sn' => $unifiedTransaction->sn,
            'original_inquiry_data' => $inquiryData, // For debugging/context
            'final_details' => $unifiedTransaction->details, // Full updated details
        ];
    }

    /**
     * Handles single BPJS Health inquiry.
     *
     * @param Request $request Contains 'customer_no'.
     * @return \Illuminate\Http\JsonResponse
     */
    public function inquiry(Request $request)
    {
        // BPJS customer numbers are typically 13 digits (e.g., 8801234560001)
        $request->validate(['customer_no' => 'required|string|min:11|max:16']); // Adjust min/max as per BPJS ID length
        $customerNo = $request->customer_no;

        $inquiryData = $this->_performSingleInquiry($customerNo);

        if ($inquiryData) {
            session(['postpaid_bpjs_inquiry_data' => $inquiryData]); // Use a distinct session key
            return response()->json($inquiryData);
        } else {
            return response()->json(['message' => 'Gagal melakukan pengecekan tagihan BPJS. Silakan coba lagi nanti atau periksa nomor pelanggan.'], 400);
        }
    }

    /**
     * Handles single BPJS Health payment.
     *
     * @param Request $request Contains 'customer_no'.
     * @return \Illuminate\Http\JsonResponse
     */
    public function payment(Request $request)
    {
        $user = Auth::user();
        $inquiryData = session('postpaid_bpjs_inquiry_data'); // Use distinct session key

        if (!$inquiryData || $inquiryData['customer_no'] !== $request->customer_no) {
            return response()->json(['message' => 'Sesi tidak valid atau nomor pelanggan BPJS tidak cocok.'], 400);
        }

        $totalPriceToPay = $inquiryData['selling_price'];

        if ($user->balance < $totalPriceToPay) {
            return response()->json(['message' => 'Saldo Anda tidak mencukupi.'], 402);
        }

        // Debit balance before attempting payment
        $user->decrement('balance', $totalPriceToPay);
        Log::info("BPJS Single Payment: User {$user->id} debited {$totalPriceToPay} for single BPJS payment.");

        try {
            $paymentResult = $this->_processIndividualBpjsPayment($inquiryData, $user);

            // If the payment API call resulted in a 'Gagal' status, refund the balance
            if (($paymentResult['status'] ?? 'Gagal') === 'Gagal') {
                $user->increment('balance', $totalPriceToPay);
                Log::warning("BPJS Single Payment: Transaction {$paymentResult['transaction_id']} failed according to provider API, balance refunded {$totalPriceToPay}.");
            }
            session()->forget('postpaid_bpjs_inquiry_data'); // Clear session
            return response()->json($paymentResult);
        } catch (\Exception $e) {
            // If any exception occurred during the payment process, refund the balance
            $user->increment('balance', $totalPriceToPay);
            Log::error('BPJS Single Payment Error (Controller): ' . $e->getMessage(), ['customer_no' => $request->customer_no, 'inquiry_data' => $inquiryData]);
            return response()->json(['message' => 'Terjadi kesalahan saat memproses pembayaran BPJS: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Handles bulk BPJS Health inquiry for multiple customer numbers.
     *
     * @param Request $request Contains 'customer_nos' array.
     * @return \Illuminate\Http\JsonResponse
     */
    public function bulkInquiry(Request $request)
    {
        $request->validate(['customer_nos' => 'required|array', 'customer_nos.*' => 'required|string|min:11|max:16']);
        $customerNos = array_unique($request->customer_nos);

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
                        'message' => 'Tidak dapat menemukan tagihan BPJS atau layanan tidak tersedia.',
                    ];
                }
            } catch (\Exception $e) {
                Log::error("Bulk Inquiry BPJS: Unexpected error for customer {$customerNo}. Error: " . $e->getMessage());
                $results['failed'][] = [
                    'customer_no' => $customerNo,
                    'message' => 'Terjadi kesalahan saat pengecekan tagihan BPJS: ' . $e->getMessage(),
                ];
            }
        }

        if (empty($results['successful']) && empty($results['failed'])) {
            return response()->json(['message' => 'Tidak ada nomor pelanggan BPJS yang diproses.'], 400);
        }

        if (!empty($results['successful'])) {
            session(['postpaid_bpjs_bulk_inquiry_data' => $results['successful']]); // Use distinct session key
        } else {
            session()->forget('postpaid_bpjs_bulk_inquiry_data');
        }

        return response()->json($results);
    }

    /**
     * Handles bulk BPJS Health payment for multiple previously inquired customer numbers.
     *
     * @param Request $request Contains 'customer_nos_to_pay' array (for validation against session).
     * @return \Illuminate\Http\JsonResponse
     */
    public function bulkPayment(Request $request)
    {
        $user = Auth::user();
        $inquiryDataForPayment = session('postpaid_bpjs_bulk_inquiry_data'); // Use distinct session key

        if (!$inquiryDataForPayment || empty($inquiryDataForPayment)) {
            return response()->json(['message' => 'Sesi pembayaran massal BPJS tidak valid atau kosong. Silakan lakukan pengecekan tagihan ulang.'], 400);
        }

        $requestCustomerNos = collect($request->customer_nos_to_pay)->unique()->sort()->values()->all();
        $sessionCustomerNos = collect($inquiryDataForPayment)->pluck('customer_no')->unique()->sort()->values()->all();

        if ($requestCustomerNos != $sessionCustomerNos) {
             Log::warning("Bulk Payment BPJS: Mismatch between requested customer_nos and session data.", [
                'request_customer_nos' => $requestCustomerNos,
                'session_customer_nos' => $sessionCustomerNos,
                'user_id' => $user->id,
            ]);
            return response()->json(['message' => 'Data pelanggan untuk pembayaran BPJS tidak cocok dengan sesi. Silakan coba lagi.'], 400);
        }

        $totalPriceForBulkPayment = collect($inquiryDataForPayment)->sum('selling_price');

        if ($user->balance < $totalPriceForBulkPayment) {
            return response()->json(['message' => 'Saldo Anda tidak mencukupi untuk semua transaksi BPJS ini.'], 402);
        }

        // Debit user's balance ONCE for the total sum before processing individual payments
        $user->decrement('balance', $totalPriceForBulkPayment);
        Log::info("Bulk Payment BPJS: User {$user->id} debited total {$totalPriceForBulkPayment} for bulk payment.");

        $paymentResults = [];
        $totalRefundAmount = 0;

        foreach ($inquiryDataForPayment as $inquiryData) {
            try {
                $individualPaymentResult = $this->_processIndividualBpjsPayment($inquiryData, $user);
                $paymentResults[] = $individualPaymentResult;

                if (($individualPaymentResult['status'] ?? 'Gagal') === 'Gagal') {
                    $totalRefundAmount += $inquiryData['selling_price'];
                    Log::warning("Bulk Payment BPJS: Individual transaction for {$inquiryData['customer_no']} failed, adding {$inquiryData['selling_price']} to refund amount.");
                }

            } catch (\Exception $e) {
                Log::error('BPJS Bulk Payment Error for customer ' . $inquiryData['customer_no'] . ': ' . $e->getMessage(), ['inquiry_data' => $inquiryData, 'user_id' => $user->id]);
                $paymentResults[] = array_merge($inquiryData, [
                    'customer_no' => $inquiryData['customer_no'],
                    'customer_name' => $inquiryData['customer_name'] ?? 'N/A',
                    'selling_price' => $inquiryData['selling_price'],
                    'status' => 'Gagal',
                    'message' => 'Terjadi kesalahan saat memproses tagihan BPJS ini: ' . $e->getMessage(),
                ]);
                $totalRefundAmount += $inquiryData['selling_price'];
            }
        }

        if ($totalRefundAmount > 0) {
            $user->increment('balance', $totalRefundAmount);
            Log::info("Bulk Payment BPJS: Refunded {$totalRefundAmount} to user {$user->id} for failed transactions.");
        }

        session()->forget('postpaid_bpjs_bulk_inquiry_data'); // Clear session
        return response()->json(['results' => $paymentResults, 'total_refund_amount' => $totalRefundAmount, 'total_paid_amount' => $totalPriceForBulkPayment - $totalRefundAmount]);
    }
}