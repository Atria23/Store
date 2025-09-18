<?php

// >>>>>>>>>>>>>     UNIFIED MULTIFINANCE POSTPAID CONTROLLER (REAL, TESTING-DUMMY, TESTING-REAL-API)      <<<<<<<<<<<<<<<<<<<<<<<

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
     * Menampilkan halaman pembayaran Multifinance pascabayar dengan daftar produk.
     */
    public function index()
    {
        $products = $this->fetchMultifinanceProducts();
        return Inertia::render('Pascabayar/Multifinance', [ // Sesuaikan path Inertia
            'products' => $products,
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }

    /**
     * Mengambil daftar produk Multifinance pascabayar dari database lokal.
     * Produk dengan status seller_product_status = false juga diambil
     * agar bisa ditampilkan di frontend dengan indikator gangguan.
     */
    private function fetchMultifinanceProducts()
    {
        $multifinanceProducts = PostpaidProduct::where('brand', 'MULTIFINANCE') // Sesuaikan brand ini jika berbeda
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
     * Menangani permintaan inquiry (pengecekan tagihan) untuk Multifinance pascabayar.
     */
    public function inquiry(Request $request)
    {
        $request->validate([
            'customer_no' => 'required|string|min:4',
            'buyer_sku_code' => 'required|string|exists:postpaid_products,buyer_sku_code',
            'testing' => 'sometimes|boolean',        // Flag untuk mengaktifkan mode testing secara umum
            'dummy_response' => 'sometimes|boolean', // Flag untuk force dummy response saat testing
        ]);

        $customerNo = $request->customer_no;
        $current_sku = $request->buyer_sku_code;
        $isTesting = $request->boolean('testing', false); // Default ke false (mode real)
        $useDummyResponse = $request->boolean('dummy_response', false); // Default ke false (tidak pakai dummy)

        $product = PostpaidProduct::where('buyer_sku_code', $current_sku)
                                ->where('seller_product_status', '1')
                                ->first();

        if (!$product) {
            return response()->json(['message' => 'Produk Multifinance tidak tersedia atau tidak aktif untuk inquiry.'], 503);
        }

        $ref_id = 'multi-' . substr(str_replace('-', '', Str::uuid()->toString()), 0, 15);
        $username = env('P_U');
        // Pilih API Key: P_AKD untuk mode testing (baik dummy atau real API testing), P_AK untuk mode real
        $apiKey = env($isTesting ? 'P_AKD' : 'P_AK');
        $sign = md5($username . $apiKey . $ref_id);

        $responseData = [];

        if ($isTesting && $useDummyResponse) {
            // --- MODE 2: TESTING DENGAN DUMMY RESPONSE ---
            $dummyPeriodBillAmount = 24700;
            $dummyPeriodAdminFee = 2500;
            $dummyDenda = 0;

            $specificDescData = [
                "lembar_tagihan" => 1,
                "item_name" => "HONDA VARIO TECHNO 125 PGM FI NON CBS",
                "no_rangka" => "MH1JFB111CK196426",
                "no_pol" => "B6213UWX",
                "tenor" => "030",
                "detail" => [
                    [
                        "periode" => "002",
                        "bill_amount" => $dummyPeriodBillAmount,
                        "admin_fee_per_period" => $dummyPeriodAdminFee,
                        "denda" => (string)$dummyDenda,
                        "biaya_lain" => "0"
                    ]
                ]
            ];

            $dummyStatus = 'Sukses';
            $dummyMessage = 'Inquiry Multifinance berhasil (Dummy Response).';
            $dummyCustomerName = 'Pelanggan Multifinance Dummy ' . substr($customerNo, 0, 4);

            $responseData = [
                'data' => [
                    'status' => $dummyStatus,
                    'message' => $dummyMessage,
                    'customer_name' => $dummyCustomerName,
                    'customer_no' => $customerNo,
                    'buyer_sku_code' => $current_sku,
                    'rc' => '00',
                    'sn' => 'SN-INQ-' . Str::random(12),
                    'ref_id' => $ref_id,
                    'desc' => $specificDescData,
                ],
            ];
            Log::info('Multifinance Inquiry Dummy Response:', ['response_data' => $responseData, 'customer_no' => $customerNo, 'sku' => $current_sku]);

        } else {
            // --- MODE 1: REAL API CALL ATAU MODE 3: TESTING DENGAN REAL API CALL ---
            // Parameter 'testing' yang akan dikirim ke API provider eksternal
            $providerApiTestingFlag = $isTesting;

            try {
                $response = Http::post(config('services.api_server') . '/v1/transaction', [
                    'commands' => 'inq-pasca',
                    'username' => $username,
                    'buyer_sku_code' => $current_sku,
                    'customer_no' => $customerNo,
                    'ref_id' => $ref_id,
                    'sign' => $sign,
                    'testing' => $providerApiTestingFlag, // True jika mode testing, False jika mode real
                ]);
                $responseData = $response->json();
            } catch (\Exception $e) {
                Log::error('Multifinance Inquiry Error: ' . $e->getMessage(), ['customer_no' => $customerNo, 'sku' => $current_sku, 'is_testing' => $isTesting, 'api_key_used' => $apiKey]);
                return response()->json(['message' => 'Terjadi kesalahan pada server provider.'], 500);
            }
        }


        if (isset($responseData['data']) && $responseData['data']['status'] === 'Sukses') {
            $inquiryDataFromApi = $responseData['data'];

            if (!isset($inquiryDataFromApi['desc']) || !is_array($inquiryDataFromApi['desc'])) {
                $inquiryDataFromApi['desc'] = [];
            }
            if (!isset($inquiryDataFromApi['desc']['detail']) || !is_array($inquiryDataFromApi['desc']['detail'])) {
                $inquiryDataFromApi['desc']['detail'] = [];
            }

            $totalDenda = 0;
            $totalNilaiTagihan = 0;
            $totalAdminFromDetails = 0;

            foreach ($inquiryDataFromApi['desc']['detail'] as $item) {
                $totalNilaiTagihan += (float) ($item['bill_amount'] ?? 0);
                $totalAdminFromDetails += (float) ($item['admin_fee_per_period'] ?? 0);
                $totalDenda += (float) ($item['denda'] ?? 0);
            }

            $jumlahLembarTagihan = (int) ($inquiryDataFromApi['desc']['lembar_tagihan'] ?? count($inquiryDataFromApi['desc']['detail']));

            $commission = $product->commission ?? 0;
            $commission_sell_percentage = $product->commission_sell_percentage ?? 0;
            $commission_sell_fixed = $product->commission_sell_fixed ?? 0;
            $diskonPerLembar = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;

            $finalDiskon = $diskonPerLembar * $jumlahLembarTagihan;
            $finalDiskon = ceil($finalDiskon);

            $finalSellingPrice = $totalNilaiTagihan + $totalAdminFromDetails + $totalDenda - $finalDiskon;
            $finalSellingPrice = ceil($finalSellingPrice);

             $apiOriginalPrice = (float) ($responseData['data']['price'] ?? 0);
                $apiOriginalSellingPrice = (float) ($responseData['data']['selling_price'] ?? 0);
                
                if ($apiOriginalPrice > $finalSellingPrice && $apiOriginalSellingPrice > 0) {
                    Log::info("Override finalSellingPrice (REAL MODE): Original API Price ({$apiOriginalPrice}) > Calculated Selling Price ({$finalSellingPrice}) AND Original API Selling Price ({$apiOriginalSellingPrice}) > 0. Using Original API Selling Price.");
                    $finalSellingPrice = $apiOriginalSellingPrice;
                }

            $inquiryDataFromApi['price'] = $totalNilaiTagihan;
            $inquiryDataFromApi['admin'] = $totalAdminFromDetails;
            $inquiryDataFromApi['denda'] = $totalDenda;
            $inquiryDataFromApi['diskon'] = $finalDiskon;
            $inquiryDataFromApi['jumlah_lembar_tagihan'] = $jumlahLembarTagihan;
            $inquiryDataFromApi['selling_price'] = $finalSellingPrice;
            $inquiryDataFromApi['buyer_sku_code'] = $current_sku;
            $inquiryDataFromApi['ref_id'] = $ref_id;

            unset($inquiryDataFromApi['buyer_last_saldo']);
            unset($inquiryDataFromApi['price_from_api_root']);
            unset($inquiryDataFromApi['admin_from_api_root']);


            session(['postpaid_inquiry_data' => $inquiryDataFromApi]);
            return response()->json($inquiryDataFromApi);
        } else {
            $errorMessage = $responseData['data']['message'] ?? 'Gagal melakukan pengecekan tagihan Multifinance.';
            Log::warning("Inquiry Multifinance Gagal untuk SKU: {$current_sku}. Pesan: {$errorMessage}", ['response' => $responseData, 'is_testing' => $isTesting, 'api_key_used' => $apiKey]);
            return response()->json(['message' => $errorMessage], 400);
        }
    }

    /**
     * Menangani permintaan pembayaran tagihan Multifinance pascabayar.
     */
    public function payment(Request $request)
    {
        $user = Auth::user();
        $inquiryData = session('postpaid_inquiry_data');

        if (!$inquiryData || !isset($inquiryData['customer_no']) || $inquiryData['customer_no'] !== $request->customer_no) {
            return response()->json(['message' => 'Sesi tidak valid atau nomor pelanggan tidak cocok.'], 400);
        }

        $isTesting = $request->boolean('testing', false);
        $useDummyResponse = $request->boolean('dummy_response', false);

        $totalPriceToPay     = $inquiryData['selling_price'];
        $finalAdmin          = $inquiryData['admin'];
        $pureBillPrice       = $inquiryData['price'];
        $diskon              = $inquiryData['diskon'] ?? 0;
        $jumlahLembarTagihan = $inquiryData['jumlah_lembar_tagihan'] ?? 0;
        $denda               = $inquiryData['denda'] ?? 0;

        if ($user->balance < $totalPriceToPay) {
            return response()->json(['message' => 'Saldo Anda tidak mencukupi.'], 402);
        }

        $user->decrement('balance', $totalPriceToPay);

        $initialData = $this->mapToUnifiedTransaction($inquiryData, 'MULTIFINANCE', $pureBillPrice, $finalAdmin);
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

        $unifiedTransaction = PostpaidTransaction::create($initialData);

        $apiResponseData = [];
        $username = env('P_U');
        $apiKey = env($isTesting ? 'P_AKD' : 'P_AK');
        $sign = md5($username . $apiKey . $inquiryData['ref_id']);

        if ($isTesting && $useDummyResponse) {
            // --- MODE 2: TESTING DENGAN DUMMY RESPONSE ---
            $apiResponseData = [
                'status' => 'Sukses',
                'message' => 'Pembayaran Multifinance dummy berhasil diproses.',
                'rc' => '00',
                'sn' => 'SN-MULTI-' . Str::random(15),
                'customer_name' => $inquiryData['customer_name'],
                'customer_no' => $inquiryData['customer_no'],
                'buyer_sku_code' => $inquiryData['buyer_sku_code'],
                'price' => $pureBillPrice,
                'admin' => $finalAdmin,
                'ref_id' => $inquiryData['ref_id'],
            ];
            Log::info('Multifinance Payment Dummy Response:', ['response_data' => $apiResponseData, 'transaction_id' => $unifiedTransaction->id]);

        } else {
            // --- MODE 1: REAL API CALL ATAU MODE 3: TESTING DENGAN REAL API CALL ---
            $providerApiTestingFlag = $isTesting;

            try {
                $response = Http::post(config('services.api_server') . '/v1/transaction', [
                    'commands' => 'pay-pasca',
                    'username' => $username,
                    'buyer_sku_code' => $inquiryData['buyer_sku_code'],
                    'customer_no' => $inquiryData['customer_no'],
                    'ref_id' => $inquiryData['ref_id'],
                    'sign' => $sign,
                    'testing' => $providerApiTestingFlag,
                ]);
                $apiResponseData = $response->json()['data'];

                Log::info('Multifinance Payment API Response:', ['response_data' => $apiResponseData, 'transaction_id' => $unifiedTransaction->id, 'is_testing' => $isTesting, 'api_key_used' => $apiKey]);

            } catch (\Exception $e) {
                $user->increment('balance', $totalPriceToPay);
                $errorMessage = ['status' => 'Gagal', 'message' => 'Gagal terhubung ke server provider.'];

                $unifiedTransaction->update(array_merge($errorMessage, ['rc' => null, 'sn' => null]));

                Log::error('Multifinance Payment Error: ' . $e->getMessage(), ['transaction_id' => $unifiedTransaction->id, 'inquiry_data' => $inquiryData, 'is_testing' => $isTesting, 'api_key_used' => $apiKey]);
                return response()->json(['message' => 'Terjadi kesalahan pada server provider.'], 500);
            }
        }

        $fullResponseData = array_merge($inquiryData, $apiResponseData);

        $fullResponseData['price'] = $pureBillPrice;
        $fullResponseData['admin'] = $finalAdmin;
        unset($fullResponseData['buyer_last_saldo']);

        $updatePayload = $this->mapToUnifiedTransaction($fullResponseData, 'MULTIFINANCE', $pureBillPrice, $finalAdmin);
        $updatePayload['selling_price'] = $totalPriceToPay;
        $updatePayload['status'] = $apiResponseData['status'] ?? 'Gagal';
        $updatePayload['message'] = $apiResponseData['message'] ?? 'Pembayaran gagal.';

        $updatePayload['rc'] = $apiResponseData['rc'] ?? null;
        $updatePayload['sn'] = $apiResponseData['sn'] ?? null;

        $keysToExcludeFromDetails = [
            'ref_id', 'customer_no', 'customer_name', 'buyer_sku_code', 'message',
            'rc', 'sn', 'buyer_last_saldo', 'price', 'selling_price', 'admin', 'status',
            'diskon', 'jumlah_lembar_tagihan', 'denda', 'desc',
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

        $unifiedTransaction->update($updatePayload);

        $unifiedTransaction->refresh();

        $fullResponseData['selling_price'] = $unifiedTransaction->selling_price;
        $fullResponseData['status'] = $unifiedTransaction->status;
        $fullResponseData['message'] = $unifiedTransaction->message;
        $fullResponseData['customer_name'] = $unifiedTransaction->customer_name;
        $fullResponseData['customer_no'] = $unifiedTransaction->customer_no;
        $fullResponseData['diskon'] = $unifiedTransaction->details['diskon'] ?? 0;
        $fullResponseData['denda'] = $unifiedTransaction->details['denda'] ?? 0;
        $fullResponseData['admin'] = $unifiedTransaction->admin_fee;
        $fullResponseData['price'] = $unifiedTransaction->price;
        $fullResponseData['sn'] = $unifiedTransaction->sn;
        $fullResponseData['ref_id'] = $unifiedTransaction->ref_id;
        $fullResponseData['details'] = $unifiedTransaction->details;

        if (($apiResponseData['status'] ?? 'Gagal') === 'Gagal' && $unifiedTransaction->status === 'Gagal') {
            $user->increment('balance', $totalPriceToPay);
        }

        session()->forget('postpaid_inquiry_data');
        return response()->json($fullResponseData);
    }
}