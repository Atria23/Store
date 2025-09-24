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

class PascaInternetController extends Controller
{
    use TransactionMapper;

    /**
     * Menampilkan halaman pembayaran Internet Pascabayar dengan daftar produk.
     */
    public function index()
    {
        $products = $this->fetchInternetProducts();
        return Inertia::render('Pascabayar/Internet', [
            'products' => $products,
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }

    /**
     * Mengambil daftar produk Internet Pascabayar dari database lokal.
     * Produk dengan status seller_product_status = false juga diambil
     * agar bisa ditampilkan di frontend dengan indikator gangguan.
     */
    private function fetchInternetProducts()
    {
        $internetProducts = PostpaidProduct::where('brand', 'INTERNET PASCABAYAR')
                                        ->orderBy('product_name', 'asc')
                                        ->get();

        return $internetProducts->map(function ($product) {
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
     * Helper method to perform a single Internet Pascabayar inquiry.
     * Handles API calls and data processing for a given customer number and product.
     *
     * @param string $customerNo The customer number to inquire.
     * @param PostpaidProduct $product The PostpaidProduct model associated with the inquiry.
     * @return array|null Returns processed inquiry data on success, null on failure.
     */
    private function _performSingleInternetInquiry(string $customerNo, PostpaidProduct $product): ?array
    {
        $current_sku = $product->buyer_sku_code;
        $ref_id = 'internet-' . substr(str_replace('-', '', Str::uuid()->toString()), 0, 15);
        $username = env('P_U');
        $apiKey = env('P_AK');
        $sign = md5($username . $apiKey . $ref_id);

        $responseData = [];

        // --- START DUMMY DATA FOR TESTING INQUIRY (if APP_ENV is local) ---
        if (env('APP_ENV') === 'local') {
            $customerNoLength = strlen($customerNo);
            $lastDigit = $customerNo[$customerNoLength - 1] ?? '0';

            $numBills = 1;
            if ((int)$lastDigit % 3 === 0) { // Some customers might have 2 bills
                $numBills = 2;
            } elseif ((int)$lastDigit % 5 === 0) { // Some might have 3 bills
                $numBills = 3;
            }

            $dummyDescDetails = [];
            $totalPureBillAmount = 0;
            $totalAdminFromDetails = 0;

            $baseNilaiTagihan = 50000 + (substr($customerNo, -2, 1) * 5000); // Vary base bill
            $baseAdminPerBill = 2500;

            for ($i = 0; $i < $numBills; $i++) {
                $periodeMonth = date('M Y', strtotime("-{$i} month"));
                $billNilaiTagihan = $baseNilaiTagihan + ($i * 1000);
                $billAdmin = $baseAdminPerBill;

                $dummyDescDetails[] = [
                    "periode" => $periodeMonth,
                    "nilai_tagihan" => $billNilaiTagihan,
                    "admin" => $billAdmin,
                ];
                $totalPureBillAmount += $billNilaiTagihan;
                $totalAdminFromDetails += $billAdmin;
            }

            $specificDescData = [
                "lembar_tagihan" => $numBills,
                "detail" => $dummyDescDetails,
            ];

            $dummyCustomerName = 'Pelanggan Internet ' . $product->product_name . ' ' . substr(preg_replace('/[^0-9]/', '', $customerNo), 0, 5);
            $dummyAddress = 'Jl. Digital No.' . $customerNoLength . ', Kota ' . Str::upper(substr($current_sku, 0, 3));
            $dummyJatuhTempo = date('d-M-Y', strtotime('+5 days'));

            // The 'price' field at the root should be the sum of 'nilai_tagihan' from details.
            // The 'admin' field at the root should be the sum of 'admin' from details.
            $dummyPriceField = $totalPureBillAmount;
            $dummyAdminField = $totalAdminFromDetails;

            // Original API Total Price (price field + admin field)
            $dummyOriginalApiTotalPrice = $dummyPriceField + $dummyAdminField;
            $dummyProviderOriginalSellingPrice = ceil($dummyOriginalApiTotalPrice * (1 + (int)$lastDigit / 10000));

            $responseData = [
                'data' => [
                    'status' => 'Sukses',
                    'message' => 'Inquiry Internet dummy berhasil.',
                    'customer_name' => $dummyCustomerName,
                    'customer_no' => $customerNo,
                    'buyer_sku_code' => $current_sku,
                    'price' => $dummyPriceField,
                    'admin' => $dummyAdminField,
                    'rc' => '00',
                    'sn' => 'SN-INQ-' . Str::random(12),
                    'ref_id' => $ref_id,
                    'desc' => array_merge($specificDescData, [
                        "alamat" => $dummyAddress,
                        "jatuh_tempo" => $dummyJatuhTempo,
                    ]),
                    'selling_price' => $dummyProviderOriginalSellingPrice,
                    'original_api_price' => $dummyOriginalApiTotalPrice,
                    'original_api_selling_price' => $dummyProviderOriginalSellingPrice,
                ],
            ];
            Log::info('Internet Inquiry API Response (DUMMY):', ['response_data' => $responseData, 'customer_no' => $customerNo, 'sku' => $current_sku, 'ref_id' => $ref_id]);
        } else {
            // --- END DUMMY DATA ---

            // --- ORIGINAL API CALL (only if not in local dummy mode) ---
            if (!$product->seller_product_status) {
                Log::warning("Inquiry Internet: Produk tidak aktif untuk SKU: {$current_sku}, Customer No: {$customerNo}.");
                return null;
            }

            try {
                $response = Http::post(config('services.api_server') . '/v1/transaction', [
                    'commands' => 'inq-pasca', // Assuming 'inq-pasca' is generic and buyer_sku_code differentiates
                    'username' => $username,
                    'buyer_sku_code' => $current_sku,
                    'customer_no' => $customerNo,
                    'ref_id' => $ref_id,
                    'sign' => $sign,
                    'testing' => false,
                ]);

                $responseData = $response->json();
                Log::info('Internet Inquiry API Response:', ['response_data' => $responseData, 'customer_no' => $customerNo, 'sku' => $current_sku, 'ref_id' => $ref_id]);

                if (!isset($responseData['data']) || $responseData['data']['status'] !== 'Sukses') {
                    $errorMessage = $responseData['data']['message'] ?? 'Gagal melakukan pengecekan tagihan dari provider.';
                    Log::warning("Inquiry Internet Gagal dari Provider untuk SKU: {$current_sku}. Pesan: {$errorMessage}", ['response' => $responseData, 'customer_no' => $customerNo]);
                    return null;
                }
            } catch (\Exception $e) {
                Log::error('Internet Inquiry Error (API Call): ' . $e->getMessage(), ['customer_no' => $customerNo, 'sku' => $current_sku, 'exception_trace' => $e->getTraceAsString()]);
                return null;
            }
        }

        // --- COMMON PROCESSING LOGIC (for both real and dummy data) ---
        $inquiryDataFromApi = $responseData['data'];

        $providerOriginalSellingPrice = (float) ($inquiryDataFromApi['selling_price'] ?? 0);

        if (!isset($inquiryDataFromApi['desc']) || !is_array($inquiryDataFromApi['desc'])) {
            $inquiryDataFromApi['desc'] = [];
        }

        $inquiryDataFromApi['desc']['alamat']      = $inquiryDataFromApi['desc']['alamat'] ?? null;
        $inquiryDataFromApi['desc']['jatuh_tempo'] = $inquiryDataFromApi['desc']['jatuh_tempo'] ?? null;
        // Internet typically doesn't have 'tarif' like PDAM

        $sumOfPureBillAmounts = 0;
        $sumOfAdminFees = 0;
        $sumOfDendaAmounts = 0; // Internet usually doesn't have denda
        $sumOfBiayaLainAmounts = 0; // Internet usually doesn't have biaya lain
        $jumlahLembarTagihan = 0;

        if (isset($inquiryDataFromApi['desc']['detail']) && is_array($inquiryDataFromApi['desc']['detail'])) {
            $jumlahLembarTagihan = count($inquiryDataFromApi['desc']['detail']);
            foreach ($inquiryDataFromApi['desc']['detail'] as $detail) {
                $sumOfPureBillAmounts += (float) ($detail['nilai_tagihan'] ?? 0);
                $sumOfAdminFees += (float) ($detail['admin'] ?? 0); // Admin can be per detail for internet
            }
        } else {
            // If 'desc.detail' is not available, take 'price' and 'admin' from root
            $sumOfPureBillAmounts = (float) ($inquiryDataFromApi['price'] ?? 0);
            $sumOfAdminFees = (float) ($inquiryDataFromApi['admin'] ?? 0);
            $jumlahLembarTagihan = (int) ($inquiryDataFromApi['desc']['lembar_tagihan'] ?? 1);
        }

        $commission = $product->commission ?? 0;
        $commission_sell_percentage = $product->commission_sell_percentage ?? 0;
        $commission_sell_fixed = $product->commission_sell_fixed ?? 0;
        $diskonPerLembar = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;

        $finalDiskon = $diskonPerLembar * $jumlahLembarTagihan;
        $finalDiskon = ceil($finalDiskon);

        $totalAmountBeforeDiskon = $sumOfPureBillAmounts + $sumOfAdminFees + $sumOfDendaAmounts + $sumOfBiayaLainAmounts; // Keep denda/biaya_lain for completeness, even if 0

        $finalSellingPrice = $totalAmountBeforeDiskon - $finalDiskon;
        $finalSellingPrice = ceil($finalSellingPrice);

        $apiOriginalPrice = (float) ($inquiryDataFromApi['original_api_price'] ?? (($inquiryDataFromApi['price'] ?? 0) + ($inquiryDataFromApi['admin'] ?? 0)));

        if ($apiOriginalPrice > $finalSellingPrice && $providerOriginalSellingPrice > 0) {
            Log::info("Internet Inquiry: finalSellingPrice overridden by provider_original_selling_price.", [
                'calculated_finalSellingPrice' => $finalSellingPrice,
                'apiOriginalPrice' => $apiOriginalPrice,
                'providerOriginalSellingPrice' => $providerOriginalSellingPrice,
                'customer_no' => $customerNo
            ]);
            $finalSellingPrice = $providerOriginalSellingPrice;
        }

        $inquiryDataFromApi['price']         = $sumOfPureBillAmounts;
        $inquiryDataFromApi['admin']         = $sumOfAdminFees;
        $inquiryDataFromApi['denda']         = $sumOfDendaAmounts;
        $inquiryDataFromApi['biaya_lain']    = $sumOfBiayaLainAmounts;
        $inquiryDataFromApi['diskon']        = $finalDiskon;
        $inquiryDataFromApi['jumlah_lembar_tagihan'] = $jumlahLembarTagihan;
        $inquiryDataFromApi['selling_price'] = $finalSellingPrice;
        $inquiryDataFromApi['buyer_sku_code'] = $current_sku;
        $inquiryDataFromApi['ref_id'] = $ref_id;
        $inquiryDataFromApi['provider_original_selling_price'] = $providerOriginalSellingPrice;
        $inquiryDataFromApi['product_name'] = $product->product_name;

        unset($inquiryDataFromApi['buyer_last_saldo']);

        return $inquiryDataFromApi;
    }

    /**
     * Helper method to process a single Internet Pascabayar payment after balance has been debited.
     * This method creates the transaction record, calls the provider API, and updates the transaction.
     *
     * @param array $inquiryData Processed inquiry data for a single customer.
     * @param \App\Models\User $user The authenticated user.
     * @return array Returns an array with transaction status and details.
     * @throws \Exception If the API call or transaction update fails critically.
     */
    private function _processIndividualInternetPayment(array $inquiryData, \App\Models\User $user): array
    {
        $totalPriceToPay     = (float) $inquiryData['selling_price'];
        $finalAdmin          = (float) $inquiryData['admin'];
        $pureBillPrice       = (float) $inquiryData['price'];
        $diskon              = (float) ($inquiryData['diskon'] ?? 0);
        $jumlahLembarTagihan = (int) ($inquiryData['jumlah_lembar_tagihan'] ?? 0);
        $denda               = (float) ($inquiryData['denda'] ?? 0);
        $biayaLain           = (float) ($inquiryData['biaya_lain'] ?? 0);

        $initialData = $this->mapToUnifiedTransaction($inquiryData, 'INTERNET PASCABAYAR', $pureBillPrice, $finalAdmin);
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
            'biaya_lain' => $biayaLain,
            'desc' => $inquiryData['desc'] ?? null,
        ];
        unset($initialData['buyer_last_saldo']);
        unset($initialData['provider_original_selling_price']);

        $unifiedTransaction = PostpaidTransaction::create($initialData);

        $apiResponseData = [];

        // --- START DUMMY RESPONSE PAYMENT ---
        if (env('APP_ENV') === 'local') {
            $isPaymentSuccess = (substr($inquiryData['customer_no'], -1) % 2 !== 0);

            if ($isPaymentSuccess) {
                $apiResponseData = [
                    'status' => 'Sukses',
                    'message' => 'Pembayaran Internet dummy berhasil diproses.',
                    'rc' => '00',
                    'sn' => 'SN-INTERNET-' . Str::random(15),
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
                    'message' => 'Pembayaran Internet dummy gagal. Saldo provider tidak cukup (simulasi).',
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
            Log::info('Internet Payment Dummy Response:', ['response_data' => $apiResponseData, 'transaction_id' => $unifiedTransaction->id]);

        } else {
            // --- END DUMMY DATA ---

            // --- ORIGINAL API CALL (only if not in local dummy mode) ---
            $username = env('P_U');
            $apiKey = env('P_AK');
            $sign = md5($username . $apiKey . $inquiryData['ref_id']);

            try {
                $response = Http::post(config('services.api_server') . '/v1/transaction', [
                    'commands' => 'pay-pasca', // Assuming 'pay-pasca' is generic and buyer_sku_code differentiates
                    'username' => $username,
                    'buyer_sku_code' => $inquiryData['buyer_sku_code'],
                    'customer_no' => $inquiryData['customer_no'],
                    'ref_id' => $inquiryData['ref_id'],
                    'sign' => $sign,
                    'testing' => false,
                ]);
                $apiResponseData = $response->json()['data'];

                Log::info('Internet Payment API Response:', ['response_data' => $apiResponseData, 'transaction_id' => $unifiedTransaction->id]);

            } catch (\Exception $e) {
                $errorMessage = ['status' => 'Gagal', 'message' => 'Gagal terhubung ke server provider.'];
                $unifiedTransaction->update(array_merge($errorMessage, ['rc' => null, 'sn' => null]));
                Log::error('Internet Payment Error: ' . $e->getMessage(), ['transaction_id' => $unifiedTransaction->id, 'inquiry_data' => $inquiryData]);
                throw new \Exception('Terjadi kesalahan pada server provider.');
            }
        }

        $fullResponseData = array_merge($inquiryData, $apiResponseData);

        $fullResponseData['price'] = $pureBillPrice;
        $fullResponseData['admin'] = $finalAdmin;
        $fullResponseData['selling_price'] = $totalPriceToPay;
        unset($fullResponseData['buyer_last_saldo']);
        unset($fullResponseData['provider_original_selling_price']);
        unset($fullResponseData['denda']); // Remove if not directly relevant at root
        unset($fullResponseData['biaya_lain']); // Remove if not directly relevant at root

        $updatePayload = $this->mapToUnifiedTransaction($fullResponseData, 'INTERNET PASCABAYAR', $pureBillPrice, $finalAdmin);
        $updatePayload['selling_price'] = $totalPriceToPay;
        $updatePayload['status'] = $apiResponseData['status'] ?? 'Gagal';
        $updatePayload['message'] = $apiResponseData['message'] ?? 'Pembayaran gagal.';

        $updatePayload['rc'] = $apiResponseData['rc'] ?? null;
        $updatePayload['sn'] = $apiResponseData['sn'] ?? null;

        $keysToExcludeFromDetails = [
            'ref_id', 'customer_no', 'customer_name', 'buyer_sku_code', 'message',
            'rc', 'sn', 'buyer_last_saldo', 'price', 'selling_price', 'admin', 'status',
            'diskon', 'jumlah_lembar_tagihan', 'denda', 'biaya_lain', 'desc',
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
            ['diskon' => $diskon, 'jumlah_lembar_tagihan' => $jumlahLembarTagihan, 'denda' => $denda, 'biaya_lain' => $biayaLain],
            ['desc' => $inquiryData['desc'] ?? null]
        );

        unset($updatePayload['user_id'], $updatePayload['ref_id'], $updatePayload['type'], $updatePayload['price'], $updatePayload['admin_fee']);
        unset($updatePayload['buyer_last_saldo']);
        unset($updatePayload['provider_original_selling_price']);

        $unifiedTransaction->update($updatePayload);
        $unifiedTransaction->refresh();

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
            'biaya_lain' => $unifiedTransaction->details['biaya_lain'] ?? 0,
            'admin' => $unifiedTransaction->admin_fee,
            'price' => $unifiedTransaction->price,
            'sn' => $unifiedTransaction->sn,
            'product_name' => $inquiryData['product_name'],
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
            return response()->json(['message' => 'Produk Internet tidak tersedia atau tidak aktif.'], 503);
        }

        $inquiryData = $this->_performSingleInternetInquiry($customerNo, $product);

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
        Log::info("Internet Single Payment: User {$user->id} debited {$totalPriceToPay} for single payment.");

        try {
            $paymentResult = $this->_processIndividualInternetPayment($inquiryData, $user);

            if (($paymentResult['status'] ?? 'Gagal') === 'Gagal') {
                $user->increment('balance', $totalPriceToPay);
                Log::warning("Internet Single Payment: Transaction {$paymentResult['transaction_id']} failed, balance refunded {$totalPriceToPay}.");
            }
            session()->forget('postpaid_inquiry_data');
            return response()->json($paymentResult);
        } catch (\Exception $e) {
            $user->increment('balance', $totalPriceToPay);
            Log::error('Internet Single Payment Error (Controller): ' . $e->getMessage(), ['customer_no' => $request->customer_no, 'inquiry_data' => $inquiryData]);
            return response()->json(['message' => 'Terjadi kesalahan saat memproses pembayaran: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Handles bulk Internet Pascabayar inquiry for multiple customer numbers.
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
            Log::warning("Bulk Inquiry Internet: Produk Internet tidak tersedia atau tidak aktif: {$buyerSkuCode}.");
            return response()->json(['message' => 'Produk Internet yang dipilih tidak tersedia atau tidak aktif.'], 503);
        }

        foreach ($customerNos as $customerNo) {
            try {
                $inquiryData = $this->_performSingleInternetInquiry($customerNo, $product);

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
                Log::error("Bulk Inquiry Internet: Unexpected error for customer {$customerNo}, SKU {$buyerSkuCode}. Error: " . $e->getMessage());
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
            session(['postpaid_bulk_internet_inquiry_data' => $results['successful']]);
        } else {
            session()->forget('postpaid_bulk_internet_inquiry_data');
        }

        return response()->json($results);
    }

    /**
     * Handles bulk Internet Pascabayar payment for multiple previously inquired customer numbers.
     *
     * @param Request $request Contains 'customer_nos_to_pay' array (for validation against session).
     * @return \Illuminate\Http\JsonResponse
     */
    public function bulkPayment(Request $request)
    {
        $user = Auth::user();
        $inquiryDataForPayment = session('postpaid_bulk_internet_inquiry_data');

        if (!$inquiryDataForPayment || empty($inquiryDataForPayment)) {
            return response()->json(['message' => 'Sesi pembayaran massal tidak valid atau kosong. Silakan lakukan pengecekan tagihan ulang.'], 400);
        }

        $requestedCustomerNos = collect($request->customer_nos_to_pay)->unique();
        $filteredInquiryDataForPayment = collect($inquiryDataForPayment)->filter(function ($item) use ($requestedCustomerNos) {
            return $requestedCustomerNos->contains($item['customer_no']);
        })->values()->all();

        if (count($requestedCustomerNos) !== count($filteredInquiryDataForPayment)) {
            Log::warning("Bulk Payment Internet: Mismatch between requested customer_nos and session data after filtering.", [
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
        Log::info("Bulk Payment Internet: User {$user->id} debited total {$totalPriceForBulkPayment} for bulk payment.");

        $paymentResults = [];
        $totalRefundAmount = 0;

        foreach ($filteredInquiryDataForPayment as $inquiryData) {
            try {
                $individualPaymentResult = $this->_processIndividualInternetPayment($inquiryData, $user);
                $paymentResults[] = $individualPaymentResult;

                if (($individualPaymentResult['status'] ?? 'Gagal') === 'Gagal') {
                    $totalRefundAmount += $inquiryData['selling_price'];
                    Log::warning("Bulk Payment Internet: Individual transaction for {$inquiryData['customer_no']} failed, adding {$inquiryData['selling_price']} to refund amount.");
                }
            } catch (\Exception $e) {
                Log::error('Internet Bulk Payment Error for customer ' . $inquiryData['customer_no'] . ': ' . $e->getMessage(), ['inquiry_data' => $inquiryData, 'user_id' => $user->id]);
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
            Log::info("Bulk Payment Internet: Refunded {$totalRefundAmount} to user {$user->id} for failed transactions.");
        }

        session()->forget('postpaid_bulk_internet_inquiry_data');
        return response()->json([
            'results' => $paymentResults,
            'total_refund_amount' => $totalRefundAmount,
            'total_paid_amount' => $totalPriceForBulkPayment - $totalRefundAmount
        ]);
    }
}