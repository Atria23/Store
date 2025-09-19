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
    private function _performSingleMultifinanceInquiry(string $customerNo, PostpaidProduct $product): ?array
    {
        $current_sku = $product->buyer_sku_code;
        $ref_id = 'mf-' . substr(str_replace('-', '', Str::uuid()->toString()), 0, 15);
        $username = env('P_U');
        $apiKey = env('P_AKD'); // Assuming P_AKD is also used for Multifinance
        $sign = md5($username . $apiKey . $ref_id);

        $responseData = [];

        // --- START DUMMY DATA FOR TESTING INQUIRY (if APP_ENV is local) ---
        if (env('APP_ENV') === 'local') {
            $customerNoLength = strlen($customerNo);
            $lastDigit = $customerNo[$customerNoLength - 1] ?? '0';
            $isOverdue = ((int)$lastDigit % 2 === 0); // Simulate overdue for even last digits
            $customerNameSeed = substr(preg_replace('/[^0-9]/', '', $customerNo), 0, 5);

            $baseBillAmount = 500000 + (substr($customerNo, -2, 1) * 10000);
            $adminFeePerPeriod = 7500;
            $dendaPerPeriod = $isOverdue ? (25000 + (substr($customerNo, -3, 1) * 1000)) : 0;

            $numPeriods = 1;
            if ((int)$lastDigit % 3 === 0) { // Some customers might have 2 periods
                $numPeriods = 2;
            }

            $dummyDescDetails = [];
            $totalBillAmount = 0;
            $totalAdminFeePerPeriodAggregated = 0; // Renamed to avoid confusion with transaction admin
            $totalDendaAggregated = 0;

            for ($i = 0; $i < $numPeriods; $i++) {
                $periodeMonth = date('m', strtotime("-{$i} month"));
                $periodeYear = date('Y', strtotime("-{$i} month"));
                $billAmount = $baseBillAmount + ($i * 5000);
                $dendaAmount = $isOverdue ? ($dendaPerPeriod / $numPeriods) : 0;

                $dummyDescDetails[] = [
                    "periode" => "{$periodeYear}{$periodeMonth}",
                    "bill_amount" => $billAmount,
                    "admin_fee_per_period" => $adminFeePerPeriod,
                    "denda" => ceil($dendaAmount),
                ];
                $totalBillAmount += $billAmount;
                $totalAdminFeePerPeriodAggregated += $adminFeePerPeriod;
                $totalDendaAggregated += ceil($dendaAmount);
            }

            $dummyCustomerName = 'Pelanggan ' . $product->product_name . ' ' . $customerNameSeed . ($isOverdue ? ' (OVERDUE)' : '');
            $dummyItemName = 'Motor ABC-XYZ';
            $dummyNoRangka = 'MHS' . Str::random(10) . 'A';
            $dummyNoPol = 'AB ' . (1000 + (int)$customerNoLength) . ' AZ';
            $dummyTenor = 36; // Example tenor

            $totalAdminFromProvider = 5000; // Example admin fee for the whole transaction

            $baseTotalApiPrice = $totalBillAmount + $totalAdminFeePerPeriodAggregated + $totalDendaAggregated + $totalAdminFromProvider;
            $dummyProviderOriginalSellingPrice = ceil($baseTotalApiPrice * (1 + (int)$lastDigit / 2000)); // Slight variation

            $responseData = [
                'data' => [
                    'status' => 'Sukses',
                    'message' => 'Inquiry Multifinance dummy berhasil.',
                    'customer_name' => $dummyCustomerName,
                    'customer_no' => $customerNo,
                    'buyer_sku_code' => $current_sku,
                    'price' => $totalBillAmount, // Total bill amount (pokok) from API perspective
                    'admin' => $totalAdminFromProvider, // Main admin for the transaction
                    'rc' => '00',
                    'sn' => 'SN-INQ-MF-' . Str::random(10),
                    'ref_id' => $ref_id,
                    'desc' => [
                        "item_name" => $dummyItemName,
                        "no_rangka" => $dummyNoRangka,
                        "no_pol" => $dummyNoPol,
                        "tenor" => $dummyTenor,
                        "lembar_tagihan" => $numPeriods, // Total periods with bills
                        "detail" => $dummyDescDetails,
                        "total_denda" => $totalDendaAggregated, // Total denda from all periods
                        "total_admin_per_period" => $totalAdminFeePerPeriodAggregated, // Total admin fee from all periods
                    ],
                    'selling_price' => $dummyProviderOriginalSellingPrice, // ORIGINAL provider selling_price
                ],
            ];
            Log::info('Multifinance Inquiry API Response (DUMMY):', ['response_data' => $responseData, 'customer_no' => $customerNo, 'sku' => $current_sku, 'ref_id' => $ref_id]);
        } else {
            // --- END DUMMY DATA ---

            // --- ORIGINAL API CALL (only if not in local dummy mode) ---
            if (!$product->seller_product_status) {
                Log::warning("Multifinance Inquiry: Produk tidak aktif untuk SKU: {$current_sku}. Customer No: {$customerNo}.");
                return null;
            }

            try {
                $response = Http::post(config('services.api_server') . '/v1/transaction', [
                    'commands' => 'inq-pasca',
                    'username' => $username,
                    'buyer_sku_code' => $current_sku, // Use generic multifinance code if specific SKU is not accepted by provider
                    'customer_no' => $customerNo,
                    'ref_id' => $ref_id,
                    'sign' => $sign,
                    'testing' => true, // Make sure this is 'false' in production
                ]);

                $responseData = $response->json();
                Log::info('Multifinance Inquiry API Response:', ['response_data' => $responseData, 'customer_no' => $customerNo, 'sku' => $current_sku, 'ref_id' => $ref_id]);

                if (!isset($responseData['data']) || $responseData['data']['status'] !== 'Sukses') {
                    $errorMessage = $responseData['data']['message'] ?? 'Gagal melakukan pengecekan tagihan dari provider.';
                    Log::warning("Inquiry Multifinance Gagal dari Provider untuk SKU: {$current_sku}. Pesan: {$errorMessage}", ['response' => $responseData, 'customer_no' => $customerNo]);
                    return null;
                }
            } catch (\Exception $e) {
                Log::error('Multifinance Inquiry Error (API Call): ' . $e->getMessage(), ['customer_no' => $customerNo, 'sku' => $current_sku, 'exception_trace' => $e->getTraceAsString()]);
                return null;
            }
        }

        // --- COMMON PROCESSING LOGIC (for both real and dummy data) ---
        $inquiryDataFromApi = $responseData['data'];

        $providerOriginalSellingPrice = (float) ($inquiryDataFromApi['selling_price'] ?? 0);
        $pureBillPriceFromApiRoot = (float) ($inquiryDataFromApi['price'] ?? 0); // This should be total bill_amount without admin/denda from provider

        // Ensure 'desc' is an array and initialize common Multifinance specific keys
        if (!isset($inquiryDataFromApi['desc']) || !is_array($inquiryDataFromApi['desc'])) {
            $inquiryDataFromApi['desc'] = [];
        }
        $inquiryDataFromApi['desc']['item_name'] = $inquiryDataFromApi['desc']['item_name'] ?? null;
        $inquiryDataFromApi['desc']['no_rangka'] = $inquiryDataFromApi['desc']['no_rangka'] ?? null;
        $inquiryDataFromApi['desc']['no_pol'] = $inquiryDataFromApi['desc']['no_pol'] ?? null;
        $inquiryDataFromApi['desc']['tenor'] = $inquiryDataFromApi['desc']['tenor'] ?? null;
        $inquiryDataFromApi['desc']['lembar_tagihan'] = $inquiryDataFromApi['desc']['lembar_tagihan'] ?? 1; // Default to 1

        $totalBillAmountFromDetails = 0; // Sum of bill_amount from details
        $totalAdminFeePerPeriodAggregated = 0; // Sum of admin_fee_per_period from details
        $totalDendaAggregated = 0; // Sum of denda from details
        $jumlahLembarTagihan = 0; // Number of periods with bills

        $totalAdminFromProvider = (float) ($inquiryDataFromApi['admin'] ?? 0); // Main admin fee for the transaction (from root API response)


        if (isset($inquiryDataFromApi['desc']['lembar_tagihan'])) {
            $jumlahLembarTagihan = (int) $inquiryDataFromApi['desc']['lembar_tagihan'];
        } elseif (isset($inquiryDataFromApi['desc']['detail']) && is_array($inquiryDataFromApi['desc']['detail'])) {
            $jumlahLembarTagihan = count($inquiryDataFromApi['desc']['detail']);
        } else {
            $jumlahLembarTagihan = 1; // Default to 1 if no detail/lembar_tagihan
        }

        // Process details, mapping generic keys from real API response to desired Multifinance keys
        $processedDetails = [];
        if (isset($inquiryDataFromApi['desc']['detail']) && is_array($inquiryDataFromApi['desc']['detail'])) {
            foreach ($inquiryDataFromApi['desc']['detail'] as $detail) {
                // Map generic API keys to desired Multifinance keys
                $billAmount = (float) ($detail['bill_amount'] ?? $detail['nilai_tagihan'] ?? 0);
                $adminFeePerPeriod = (float) ($detail['admin_fee_per_period'] ?? $detail['admin'] ?? 0);
                $dendaAmount = (float) ($detail['denda'] ?? 0);

                $processedDetails[] = [
                    "periode" => $detail['periode'] ?? null,
                    "bill_amount" => $billAmount,
                    "admin_fee_per_period" => $adminFeePerPeriod,
                    "denda" => $dendaAmount,
                ];

                $totalBillAmountFromDetails += $billAmount;
                $totalAdminFeePerPeriodAggregated += $adminFeePerPeriod;
                $totalDendaAggregated += $dendaAmount;
            }
            $inquiryDataFromApi['desc']['detail'] = $processedDetails; // Update with mapped details
        } else {
            // Fallback if 'detail' is not an array.
            // For Multifinance, 'price' at root often represents total principal bill amount
            // If totalBillAmountFromDetails remains 0, this is the first real fallback.
            $totalBillAmountFromDetails = $pureBillPriceFromApiRoot;
            $totalDendaAggregated = (float) ($inquiryDataFromApi['desc']['total_denda'] ?? $inquiryDataFromApi['denda'] ?? 0); // Use denda from desc or root
            $totalAdminFeePerPeriodAggregated = (float) ($inquiryDataFromApi['desc']['total_admin_per_period'] ?? 0);
        }

        $commission = $product->commission ?? 0;
        $commission_sell_percentage = $product->commission_sell_percentage ?? 0;
        $commission_sell_fixed = $product->commission_sell_fixed ?? 0;
        $diskonPerLembar = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;

        $finalDiskon = $diskonPerLembar * $jumlahLembarTagihan; // Apply discount based on number of billing periods
        $finalDiskon = ceil($finalDiskon);

        // Calculated values for our transaction record
        // Step 1: Default to sum from details or root price
        $calculatedPureBillPrice = $totalBillAmountFromDetails;

        // Step 2: If calculatedPureBillPrice is still 0, use provider's original selling price as fallback
        // This addresses the user's request: "price nya jangan sampai 0, pakai selling price dari api saja kalo memang nilai aslinya 0"
        if ($calculatedPureBillPrice === 0 && $providerOriginalSellingPrice > 0) {
            $calculatedPureBillPrice = $providerOriginalSellingPrice;
            Log::warning("Multifinance Inquiry: calculatedPureBillPrice was 0 (from details/root price). Using provider_original_selling_price ({$providerOriginalSellingPrice}) as fallback for pure bill price. Customer: {$customerNo}");
        }

        $totalCombinedAdminFees = $totalAdminFromProvider + $totalAdminFeePerPeriodAggregated; // Root admin + sum of per-period admin

        // Final selling price calculation (what the customer actually pays)
        $finalSellingPrice = $calculatedPureBillPrice + $totalCombinedAdminFees + $totalDendaAggregated - $finalDiskon;
        $finalSellingPrice = ceil($finalSellingPrice);

        // Override logic (from previous code): If provider's root price is somehow higher than our calculated final selling price, and provider has a specific selling price, use that specific selling price.
        // This specifically applies to finalSellingPrice (customer pays), not calculatedPureBillPrice (our internal 'price').
        if ($pureBillPriceFromApiRoot > $finalSellingPrice && $providerOriginalSellingPrice > 0) {
            $finalSellingPrice = $providerOriginalSellingPrice;
            Log::info('Multifinance Inquiry: finalSellingPrice overridden by provider_original_selling_price.', [
                'calculated_finalSellingPrice' => $finalSellingPrice,
                'pureBillPriceFromApiRoot' => $pureBillPriceFromApiRoot,
                'providerOriginalSellingPrice' => $providerOriginalSellingPrice,
                'customer_no' => $customerNo
            ]);
        }

        // Populate the final successful inquiry data array
        $successfulInquiryData = $inquiryDataFromApi;
        $successfulInquiryData['price']         = $calculatedPureBillPrice; // Our calculated pure bill price (now should not be 0 if selling_price > 0)
        $successfulInquiryData['admin']         = $totalCombinedAdminFees; // Our calculated total admin (root + per period)
        $successfulInquiryData['denda']         = $totalDendaAggregated; // Our calculated total denda
        $successfulInquiryData['diskon']        = $finalDiskon;
        $successfulInquiryData['jumlah_lembar_tagihan'] = $jumlahLembarTagihan;
        $successfulInquiryData['selling_price'] = $finalSellingPrice; // What the user pays
        $successfulInquiryData['buyer_sku_code'] = $current_sku;
        $successfulInquiryData['ref_id'] = $ref_id;
        $successfulInquiryData['provider_original_selling_price'] = $providerOriginalSellingPrice;
        $successfulInquiryData['product_name'] = $product->product_name; // Add product name for frontend display

        unset($successfulInquiryData['buyer_last_saldo']);

        Log::info("Inquiry Multifinance Sukses (processed). Customer No: {$customerNo}", [
            'customer_no' => $customerNo,
            'ref_id' => $successfulInquiryData['ref_id'],
            'processed_data' => $successfulInquiryData,
        ]);

        return $successfulInquiryData;
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
        $finalAdmin          = (float) ($inquiryData['admin'] ?? 0); // Ensure fallback for admin
        $pureBillPrice       = (float) ($inquiryData['price'] ?? 0); // Ensure fallback for price
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
            $apiKey = env('P_AKD'); // Use P_AKD for real API call
            $sign = md5($username . $apiKey . $inquiryData['ref_id']);

            try {
                $response = Http::post(config('services.api_server') . '/v1/transaction', [
                    'commands' => 'pay-pasca',
                    'username' => $username,
                    'buyer_sku_code' => $inquiryData['buyer_sku_code'],
                    'customer_no' => $inquiryData['customer_no'],
                    'ref_id' => $inquiryData['ref_id'],
                    'sign' => $sign,
                    'testing' => true, // Make sure this is 'false' in production
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
            return response()->json(['message' => 'Produk Multifinance tidak tersedia atau tidak aktif.'], 503);
        }

        $inquiryData = $this->_performSingleMultifinanceInquiry($customerNo, $product);

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