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

class PascaPbbController extends Controller
{
    use TransactionMapper;

    /**
     * Menampilkan halaman pembayaran PBB dengan daftar produk.
     */
    public function index()
    {
        $products = $this->fetchPbbProducts();
        return Inertia::render('Pascabayar/PBB', [
            'products' => $products,
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }

    /**
     * Mengambil daftar produk PBB dari database lokal.
     * Produk dengan status seller_product_status = false juga diambil
     * agar bisa ditampilkan di frontend dengan indikator gangguan.
     */
    private function fetchPbbProducts()
    {
        $pbbProducts = PostpaidProduct::where('brand', 'PBB')
                                        ->orderBy('product_name', 'asc')
                                        ->get();

        return $pbbProducts->map(function ($product) {
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
     * Helper method to perform a single PBB inquiry.
     * Handles API calls and data processing for a given customer number and product.
     *
     * @param string $customerNo The customer number to inquire.
     * @param PostpaidProduct $product The PostpaidProduct model associated with the inquiry.
     * @return array|null Returns processed inquiry data on success, null on failure.
     */
    private function _performSinglePbbInquiry(string $customerNo, PostpaidProduct $product): ?array
    {
        $current_sku = $product->buyer_sku_code;
        $ref_id = 'pbb-' . substr(str_replace('-', '', Str::uuid()->toString()), 0, 15);
        $username = env('P_U');
        $apiKey = env('P_AK');
        $sign = md5($username . $apiKey . $ref_id);

        $responseData = [];

        // --- START DUMMY DATA FOR TESTING INQUIRY (if APP_ENV is local) ---
        if (env('APP_ENV') === 'local') {
            $customerNoLength = strlen($customerNo);
            $lastDigit = $customerNo[$customerNoLength - 1] ?? '0';
            $isOverdue = ((int)$lastDigit % 2 === 0); // Simulate overdue for even last digits
            $customerNameSeed = substr(preg_replace('/[^0-9]/', '', $customerNo), 0, 5);

            $baseNilaiPbbPerTahun = 150000 + (substr($customerNo, -2, 1) * 10000); // Vary base PBB amount
            $dendaPbbPerTahun = $isOverdue ? (5000 + (substr($customerNo, -3, 1) * 500)) : 0; // Vary denda
            $adminFeePerTransaction = 2500; // Admin fee applied per transaction

            $numBills = 1;
            if ((int)$lastDigit % 3 === 0) { // Some customers might have 2 bills (years)
                $numBills = 2;
            } elseif ((int)$lastDigit % 5 === 0) { // Some might have 3 bills (years)
                $numBills = 3;
            }

            $dummyDescDetails = [];
            $totalPureBillAmountDummy = 0; // Renamed to avoid confusion with sumOfPureBillAmounts
            $totalDendaAmountDummy = 0;

            for ($i = 0; $i < $numBills; $i++) {
                $tahunPajak = date('Y', strtotime("-{$i} year"));
                $nilaiPbb = $baseNilaiPbbPerTahun + ($i * 5000);
                $dendaPbb = $isOverdue ? ceil($dendaPbbPerTahun / $numBills) : 0; // Distribute denda

                $dummyDescDetails[] = [
                    "tahun_pajak" => $tahunPajak,
                    "nilai_pbb" => $nilaiPbb,
                    "denda_pbb" => $dendaPbb,
                    "total_tagihan_per_tahun" => $nilaiPbb + $dendaPbb,
                ];
                $totalPureBillAmountDummy += $nilaiPbb;
                $totalDendaAmountDummy += $dendaPbb;
            }

            $dummyCustomerName = 'Wajib Pajak ' . $product->product_name . ' ' . $customerNameSeed . ($isOverdue ? ' (OVERDUE)' : '');
            $dummyObjekPajak = '32.09.0' . Str::random(2, '0123456789') . '.00' . Str::random(2, '0123456789') . '.000' . Str::random(2, '0123456789') . '-' . Str::random(4, '0123456789') . '.0';
            $dummyAlamatObjekPajak = 'Jl. Pajak Bumi No.' . $customerNoLength . ', Kec. Dummy, Kab. ' . Str::upper(substr($current_sku, 0, 3));
            $dummyJatuhTempo = date('d-M-Y', strtotime('+5 days'));

            // 'price' field is often (principal + denda) or just principal.
            // For PBB, let's make it principal + denda for consistency with calculation flow below.
            $dummyPriceField = $totalPureBillAmountDummy + $totalDendaAmountDummy; // Total PBB Pokok + Denda for this field
            $dummyAdminField = $adminFeePerTransaction; // Admin fee applied per transaction

            // This is the total charged by the provider to us (PBB Pokok + Denda + Admin)
            $dummyOriginalApiTotalPrice = $totalPureBillAmountDummy + $totalDendaAmountDummy + $dummyAdminField;
            // The 'selling_price' from provider might have a slight markup on top of original total
            $dummyProviderOriginalSellingPrice = ceil($dummyOriginalApiTotalPrice * (1 + (int)$lastDigit / 10000));

            $responseData = [
                'data' => [
                    'status' => 'Sukses',
                    'message' => 'Inquiry PBB dummy berhasil.',
                    'customer_name' => $dummyCustomerName,
                    'customer_no' => $customerNo,
                    'buyer_sku_code' => $current_sku,
                    'price' => $dummyPriceField, // Total PBB Pokok + Denda (sesuai permintaan user)
                    'admin' => $dummyAdminField, // Admin fee per transaksi
                    'rc' => '00',
                    'sn' => 'SN-INQ-' . Str::random(12),
                    'ref_id' => $ref_id,
                    'desc' => [
                        "nama_wajib_pajak" => $dummyCustomerName,
                        "objek_pajak" => $dummyObjekPajak,
                        "alamat_objek_pajak" => $dummyAlamatObjekPajak,
                        "jumlah_lembar_tagihan" => $numBills,
                        "jatuh_tempo" => $dummyJatuhTempo,
                        "detail" => $dummyDescDetails,
                        "total_denda" => $totalDendaAmountDummy, // Total denda (for info in desc)
                    ],
                    'selling_price' => $dummyProviderOriginalSellingPrice,
                    'original_api_price' => $dummyOriginalApiTotalPrice,
                    'original_api_selling_price' => $dummyProviderOriginalSellingPrice,
                ],
            ];
            Log::info('PBB Inquiry API Response (DUMMY):', ['response_data' => $responseData, 'customer_no' => $customerNo, 'sku' => $current_sku, 'ref_id' => $ref_id]);
        } else {
            // --- END DUMMY DATA ---

            // --- ORIGINAL API CALL (only if not in local dummy mode) ---
            if (!$product->seller_product_status) {
                Log::warning("Inquiry PBB: Produk tidak aktif untuk SKU: {$current_sku}, Customer No: {$customerNo}.");
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
                Log::info('PBB Inquiry API Response:', ['response_data' => $responseData, 'customer_no' => $customerNo, 'sku' => $current_sku, 'ref_id' => $ref_id]);

                if (!isset($responseData['data']) || $responseData['data']['status'] !== 'Sukses') {
                    $errorMessage = $responseData['data']['message'] ?? 'Gagal melakukan pengecekan tagihan dari provider.';
                    Log::warning("Inquiry PBB Gagal dari Provider untuk SKU: {$current_sku}. Pesan: {$errorMessage}", ['response' => $responseData, 'customer_no' => $customerNo]);
                    return null;
                }
            } catch (\Exception $e) {
                Log::error('PBB Inquiry Error (API Call): ' . $e->getMessage(), ['customer_no' => $customerNo, 'sku' => $current_sku, 'exception_trace' => $e->getTraceAsString()]);
                return null;
            }
        }

        // --- COMMON PROCESSING LOGIC (for both real and dummy data) ---
        $inquiryDataFromApi = $responseData['data'];

        $providerOriginalSellingPrice = (float) ($inquiryDataFromApi['selling_price'] ?? 0);
        $apiPriceComponentFromApi     = (float) ($inquiryDataFromApi['price'] ?? 0); // 'price' dari API (PBB Pokok + Denda)

        if (!isset($inquiryDataFromApi['desc']) || !is_array($inquiryDataFromApi['desc'])) {
            $inquiryDataFromApi['desc'] = [];
        }

        // Pastikan field desc yang penting ada atau disetel null
        $inquiryDataFromApi['desc']['nama_wajib_pajak'] = $inquiryDataFromApi['desc']['nama_wajib_pajak'] ?? null;
        $inquiryDataFromApi['desc']['objek_pajak']      = $inquiryDataFromApi['desc']['objek_pajak'] ?? null;
        $inquiryDataFromApi['desc']['alamat_objek_pajak'] = $inquiryDataFromApi['desc']['alamat_objek_pajak'] ?? null;
        $inquiryDataFromApi['desc']['jatuh_tempo'] = $inquiryDataFromApi['desc']['jatuh_tempo'] ?? null;

        $sumOfPureBillAmounts = 0; // Total nilai PBB pokok murni (akan dihitung setelah)
        $sumOfDendaAmounts = 0;    // Total denda PBB (akumulasi dari detail atau root desc)
        $sumOfBiayaLainAmounts = 0; // PBB typically doesn't have 'biaya_lain', keep at 0
        $sumOfAdminFees = (float) ($inquiryDataFromApi['admin'] ?? 0); // Total admin dari API (per transaction)
        $jumlahLembarTagihan = 0;

        // Determine jumlahLembarTagihan and aggregate total denda from details array or root desc
        if (isset($inquiryDataFromApi['desc']['detail']) && is_array($inquiryDataFromApi['desc']['detail'])) {
            $jumlahLembarTagihan = count($inquiryDataFromApi['desc']['detail']);
            foreach ($inquiryDataFromApi['desc']['detail'] as $detail) {
                // HANYA AKUMULASI DENDA. nilai_pbb tidak diakumulasi langsung ke sumOfPureBillAmounts di sini.
                $sumOfDendaAmounts += (float) ($detail['denda_pbb'] ?? 0);
            }
        } else {
            // Jika 'desc.detail' tidak tersedia, ambil total denda dari root 'desc'
            $sumOfDendaAmounts = (float) ($inquiryDataFromApi['desc']['total_denda'] ?? 0);
            $jumlahLembarTagihan = (int) ($inquiryDataFromApi['desc']['jumlah_lembar_tagihan'] ?? 1);
        }

        // --- NEW GLOBAL CALCULATION for sumOfPureBillAmounts (PBB Pokok Murni SAJA) ---
        // Berdasarkan permintaan: sumOfPureBillAmounts = selling_price (dari API) - admin (dari API) - sumOfDendaAmounts
        $providerSellingPriceFromApi = (float)($inquiryDataFromApi['selling_price'] ?? 0);
        $providerAdminFromApi = (float)($inquiryDataFromApi['admin'] ?? 0);

        // Ini adalah (PBB Pokok + Total Denda) dari total provider sebelum biaya admin mereka
        $providerGrossBillAmount = $providerSellingPriceFromApi - $providerAdminFromApi;

        // Kurangkan total denda untuk mendapatkan PBB Pokok Murni
        $sumOfPureBillAmounts = $providerGrossBillAmount - $sumOfDendaAmounts;

        // Pastikan sumOfPureBillAmounts tidak menjadi negatif jika ada inkonsistensi data
        if ($sumOfPureBillAmounts < 0) {
            Log::warning("PBB Inquiry: Calculated sumOfPureBillAmounts went negative for customer {$customerNo}. Adjusting to 0.", [
                'providerGrossBillAmount' => $providerGrossBillAmount,
                'sumOfDendaAmounts' => $sumOfDendaAmounts,
                'inquiryDataFromApi' => $inquiryDataFromApi
            ]);
            $sumOfPureBillAmounts = 0;
        }


        $commission = $product->commission ?? 0;
        $commission_sell_percentage = $product->commission_sell_percentage ?? 0;
        $commission_sell_fixed = $product->commission_sell_fixed ?? 0;
        $diskonPerLembar = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;

        $finalDiskon = $diskonPerLembar * $jumlahLembarTagihan;
        $finalDiskon = ceil($finalDiskon);

        // Hitung total jumlah yang harus dibayar sebelum diskon kita (Pure PBB + Denda + Admin dari provider)
        $totalAmountBeforeDiskon = $sumOfPureBillAmounts + $sumOfDendaAmounts + $sumOfAdminFees;

        $finalSellingPrice = $totalAmountBeforeDiskon - $finalDiskon; // Total pembayaran akhir = (total PBB + denda + admin provider) - diskon kita
        $finalSellingPrice = ceil($finalSellingPrice);

        // --- START OF MODIFIED OVERRIDE LOGIC ---
        // Logika override yang diubah: Jika 'price' dari API (PBB Pokok + Denda dari provider)
        // lebih tinggi dari 'finalSellingPrice' yang telah dihitung (yang mencakup admin provider dan diskon),
        // DAN 'providerOriginalSellingPrice' juga positif, maka override finalSellingPrice
        // dengan 'providerOriginalSellingPrice'.
        // Ini memastikan bahwa jika harga dasar PBB dari provider saja sudah melebihi
        // harga akhir kita (setelah diskon), kita akan membebankan harga total yang
        // ditentukan oleh provider asli (termasuk admin dan markup mereka).
        if ($apiPriceComponentFromApi > $finalSellingPrice && $providerOriginalSellingPrice > 0) {
            Log::info("PBB Inquiry: finalSellingPrice overridden by provider_original_selling_price based on API 'price' component.", [
                'calculated_finalSellingPrice' => $finalSellingPrice,
                'apiPriceComponentFromApi' => $apiPriceComponentFromApi, // Ini adalah PBB Pokok + Denda dari API
                'providerOriginalSellingPrice' => $providerOriginalSellingPrice, // Ini adalah selling_price total dari API
                'customer_no' => $customerNo
            ]);
            $finalSellingPrice = $providerOriginalSellingPrice;
        }
        // --- END OF MODIFIED OVERRIDE LOGIC ---

        // Update inquiryDataFromApi with processed values
        $inquiryDataFromApi['price']         = $sumOfPureBillAmounts; // Total PBB pokok murni (untuk mapping transaksi)
        $inquiryDataFromApi['admin']         = $sumOfAdminFees;       // Admin dari provider
        $inquiryDataFromApi['denda']         = $sumOfDendaAmounts;    // Total denda PBB
        $inquiryDataFromApi['biaya_lain']    = $sumOfBiayaLainAmounts; // Will be 0 for PBB
        $inquiryDataFromApi['diskon']        = $finalDiskon;
        $inquiryDataFromApi['jumlah_lembar_tagihan'] = $jumlahLembarTagihan;
        $inquiryDataFromApi['selling_price'] = $finalSellingPrice; // Harga yang harus dibayar user (setelah diskon kita)
        $inquiryDataFromApi['buyer_sku_code'] = $current_sku;
        $inquiryDataFromApi['ref_id'] = $ref_id;
        $inquiryDataFromApi['provider_original_selling_price'] = $providerOriginalSellingPrice;
        $inquiryDataFromApi['product_name'] = $product->product_name;

        unset($inquiryDataFromApi['buyer_last_saldo']);

        return $inquiryDataFromApi;
    }

    /**
     * Helper method to process a single PBB payment after balance has been debited.
     * This method creates the transaction record, calls the provider API, and updates the transaction.
     *
     * @param array $inquiryData Processed inquiry data for a single customer.
     * @param \App\Models\User $user The authenticated user.
     * @return array Returns an array with transaction status and details.
     * @throws \Exception If the API call or transaction update fails critically.
     */
    private function _processIndividualPbbPayment(array $inquiryData, \App\Models\User $user): array
    {
        $totalPriceToPay     = (float) $inquiryData['selling_price'];
        $finalAdmin          = (float) $inquiryData['admin'];
        $pureBillPrice       = (float) $inquiryData['price']; // Total PBB Pokok murni (dari inquiry data)
        $diskon              = (float) ($inquiryData['diskon'] ?? 0);
        $jumlahLembarTagihan = (int) ($inquiryData['jumlah_lembar_tagihan'] ?? 0);
        $denda               = (float) ($inquiryData['denda'] ?? 0); // Total Denda PBB
        $biayaLain           = (float) ($inquiryData['biaya_lain'] ?? 0); // Will be 0 for PBB

        $initialData = $this->mapToUnifiedTransaction($inquiryData, 'PBB', $pureBillPrice, $finalAdmin);
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
            // 'biaya_lain' is explicitly excluded as it's not typical for PBB
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
                    'message' => 'Pembayaran PBB dummy berhasil diproses.',
                    'rc' => '00',
                    'sn' => 'SN-PBB-' . Str::random(15),
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
                    'message' => 'Pembayaran PBB dummy gagal. Saldo provider tidak cukup (simulasi).',
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
            Log::info('PBB Payment Dummy Response:', ['response_data' => $apiResponseData, 'transaction_id' => $unifiedTransaction->id]);

        } else {
            // --- END DUMMY DATA ---

            // --- ORIGINAL API CALL (only if not in local dummy mode) ---
            $username = env('P_U');
            $apiKey = env('P_AK');
            $sign = md5($username . $apiKey . $inquiryData['ref_id']);

            try {
                $response = Http::post(config('services.api_server') . '/v1/transaction', [
                    'commands' => 'pay-pasca', // Assuming 'pay-pasca' is generic
                    'username' => $username,
                    'buyer_sku_code' => $inquiryData['buyer_sku_code'],
                    'customer_no' => $inquiryData['customer_no'],
                    'ref_id' => $inquiryData['ref_id'],
                    'sign' => $sign,
                    'testing' => false,
                ]);
                $apiResponseData = $response->json()['data'];

                Log::info('PBB Payment API Response:', ['response_data' => $apiResponseData, 'transaction_id' => $unifiedTransaction->id]);

            } catch (\Exception $e) {
                $errorMessage = ['status' => 'Gagal', 'message' => 'Gagal terhubung ke server provider.'];
                $unifiedTransaction->update(array_merge($errorMessage, ['rc' => null, 'sn' => null]));
                Log::error('PBB Payment Error: ' . $e->getMessage(), ['transaction_id' => $unifiedTransaction->id, 'inquiry_data' => $inquiryData]);
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
        unset($fullResponseData['biaya_lain']); // PBB doesn't use biaya_lain at root or in map

        $updatePayload = $this->mapToUnifiedTransaction($fullResponseData, 'PBB', $pureBillPrice, $finalAdmin);
        $updatePayload['selling_price'] = $totalPriceToPay;
        $updatePayload['status'] = $apiResponseData['status'] ?? 'Gagal';
        $updatePayload['message'] = $apiResponseData['message'] ?? 'Pembayaran gagal.';

        $updatePayload['rc'] = $apiResponseData['rc'] ?? null;
        $updatePayload['sn'] = $apiResponseData['sn'] ?? null;

        $keysToExcludeFromDetails = [
            'ref_id', 'customer_no', 'customer_name', 'buyer_sku_code', 'message',
            'rc', 'sn', 'buyer_last_saldo', 'price', 'selling_price', 'admin', 'status',
            'diskon', 'jumlah_lembar_tagihan', 'denda', 'biaya_lain', 'desc', // 'biaya_lain' added here to be unset
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
            ['diskon' => $diskon, 'jumlah_lembar_tagihan' => $jumlahLembarTagihan, 'denda' => $denda],
            ['desc' => $inquiryData['desc'] ?? null]
        );

        unset($updatePayload['user_id'], $updatePayload['ref_id'], $updatePayload['type'], $updatePayload['price'], $updatePayload['admin_fee']);
        unset($updatePayload['buyer_last_saldo']);
        unset($updatePayload['provider_original_selling_price']);

        $unifiedTransaction->update($updatePayload);
        $unifiedTransaction->refresh();

        // Return a structured result for the calling method, ensuring it reflects updated transaction
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
            // 'biaya_lain' is excluded from PBB return
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
            return response()->json(['message' => 'Produk PBB tidak tersedia atau tidak aktif.'], 503);
        }

        $inquiryData = $this->_performSinglePbbInquiry($customerNo, $product);

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
        Log::info("PBB Single Payment: User {$user->id} debited {$totalPriceToPay} for single payment.");

        try {
            $paymentResult = $this->_processIndividualPbbPayment($inquiryData, $user);

            if (($paymentResult['status'] ?? 'Gagal') === 'Gagal') {
                $user->increment('balance', $totalPriceToPay);
                Log::warning("PBB Single Payment: Transaction {$paymentResult['transaction_id']} failed, balance refunded {$totalPriceToPay}.");
            }
            session()->forget('postpaid_inquiry_data');
            return response()->json($paymentResult);
        } catch (\Exception $e) {
            $user->increment('balance', $totalPriceToPay);
            Log::error('PBB Single Payment Error (Controller): ' . $e->getMessage(), ['customer_no' => $request->customer_no, 'inquiry_data' => $inquiryData]);
            return response()->json(['message' => 'Terjadi kesalahan saat memproses pembayaran: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Handles bulk PBB inquiry for multiple customer numbers.
     *
     * @param Request $request Contains 'customer_nos' array and 'buyer_sku_code'.
     * @return \Illuminate\Http\JsonResponse
     */
    public function bulkInquiry(Request $request)
    {
        $request->validate([
            'customer_nos' => 'required|array',
            'customer_nos.*' => 'required|string|min:4', // PBB NOPs can be quite long, adjust min if needed
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
            Log::warning("Bulk Inquiry PBB: Produk PBB tidak tersedia atau tidak aktif: {$buyerSkuCode}.");
            return response()->json(['message' => 'Produk PBB yang dipilih tidak tersedia atau tidak aktif.'], 503);
        }

        foreach ($customerNos as $customerNo) {
            try {
                $inquiryData = $this->_performSinglePbbInquiry($customerNo, $product);

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
                Log::error("Bulk Inquiry PBB: Unexpected error for customer {$customerNo}, SKU {$buyerSkuCode}. Error: " . $e->getMessage());
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
            session(['postpaid_bulk_pbb_inquiry_data' => $results['successful']]);
        } else {
            session()->forget('postpaid_bulk_pbb_inquiry_data');
        }

        return response()->json($results);
    }

    /**
     * Handles bulk PBB payment for multiple previously inquired customer numbers.
     *
     * @param Request $request Contains 'customer_nos_to_pay' array (for validation against session).
     * @return \Illuminate\Http\JsonResponse
     */
    public function bulkPayment(Request $request)
    {
        $user = Auth::user();
        $inquiryDataForPayment = session('postpaid_bulk_pbb_inquiry_data');

        if (!$inquiryDataForPayment || empty($inquiryDataForPayment)) {
            return response()->json(['message' => 'Sesi pembayaran massal tidak valid atau kosong. Silakan lakukan pengecekan tagihan ulang.'], 400);
        }

        $requestedCustomerNos = collect($request->customer_nos_to_pay)->unique();
        $filteredInquiryDataForPayment = collect($inquiryDataForPayment)->filter(function ($item) use ($requestedCustomerNos) {
            return $requestedCustomerNos->contains($item['customer_no']);
        })->values()->all();

        if (count($requestedCustomerNos) !== count($filteredInquiryDataForPayment)) {
            Log::warning("Bulk Payment PBB: Mismatch between requested customer_nos and session data after filtering.", [
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
        Log::info("Bulk Payment PBB: User {$user->id} debited total {$totalPriceForBulkPayment} for bulk payment.");

        $paymentResults = [];
        $totalRefundAmount = 0;

        foreach ($filteredInquiryDataForPayment as $inquiryData) {
            try {
                $individualPaymentResult = $this->_processIndividualPbbPayment($inquiryData, $user);
                $paymentResults[] = $individualPaymentResult;

                if (($individualPaymentResult['status'] ?? 'Gagal') === 'Gagal') {
                    $totalRefundAmount += $inquiryData['selling_price'];
                    Log::warning("Bulk Payment PBB: Individual transaction for {$inquiryData['customer_no']} failed, adding {$inquiryData['selling_price']} to refund amount.");
                }
            } catch (\Exception $e) {
                Log::error('PBB Bulk Payment Error for customer ' . $inquiryData['customer_no'] . ': ' . $e->getMessage(), ['inquiry_data' => $inquiryData, 'user_id' => $user->id]);
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
            Log::info("Bulk Payment PBB: Refunded {$totalRefundAmount} to user {$user->id} for failed transactions.");
        }

        session()->forget('postpaid_bulk_pbb_inquiry_data');
        return response()->json([
            'results' => $paymentResults,
            'total_refund_amount' => $totalRefundAmount,
            'total_paid_amount' => $totalPriceForBulkPayment - $totalRefundAmount
        ]);
    }
}