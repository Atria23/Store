<?php

// // >>>>>>>>>>>>>     REAL PDAM POSTPAID CONTROLLER      <<<<<<<<<<<<<<<<<<<<<<<

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
//             'auth' => [ // Pastikan data auth user juga dikirim
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

//     public function inquiry(Request $request)
//     {
//         $request->validate([
//             'customer_no' => 'required|string|min:4',
//             'buyer_sku_code' => 'required|string|exists:postpaid_products,buyer_sku_code',
//         ]);

//         $customerNo = $request->customer_no;
//         $current_sku = $request->buyer_sku_code;

//         $product = PostpaidProduct::where('buyer_sku_code', $current_sku)
//                                 ->where('seller_product_status', '1') // Tetap filter hanya produk aktif saat inquiry
//                                 ->first();

//         if (!$product) {
//             return response()->json(['message' => 'Produk PDAM tidak tersedia atau tidak aktif.'], 503);
//         }

//         $ref_id = 'pdam-' . substr(str_replace('-', '', Str::uuid()->toString()), 0, 15);
//         $username = env('P_U');
//         $apiKey = env('P_AK'); // Pastikan ini adalah API Key yang benar untuk PDAM
//         $sign = md5($username . $apiKey . $ref_id);

//         try {
//             $response = Http::post(config('services.api_server') . '/v1/transaction', [
//                 'commands' => 'inq-pasca',
//                 'username' => $username,
//                 'buyer_sku_code' => $current_sku,
//                 'customer_no' => $customerNo,
//                 'ref_id' => $ref_id,
//                 'sign' => $sign,
//                 'testing' => false, // Pertimbangkan untuk mengubah ini ke false di produksi
//             ]);

//             $responseData = $response->json();

//             // <<<<<<<<<<< KOREKSI: LOGGING UNTUK RESPON INQUIRY PDAM >>>>>>>>>>>>>
//             Log::info('PDAM Inquiry API Response:', ['response_data' => $responseData, 'customer_no' => $customerNo, 'sku' => $current_sku, 'ref_id' => $ref_id]);
//             // <<<<<<<<<<< AKHIR KOREKSI >>>>>>>>>>>>>

//             if (isset($responseData['data']) && $responseData['data']['status'] === 'Sukses') {
//                 $inquiryDataFromApi = $responseData['data'];

//                 // Simpan 'selling_price' asli dari respons API provider jika tersedia
//                 $providerOriginalSellingPrice = (float) ($inquiryDataFromApi['selling_price'] ?? 0);
//                 // Simpan 'price' asli dari respons API provider (harga pokok/bill murni dari provider)
//                 $pureBillPriceFromApiRoot = (float) ($inquiryDataFromApi['price'] ?? 0);


//                 if (!isset($inquiryDataFromApi['desc']) || !is_array($inquiryDataFromApi['desc'])) {
//                     $inquiryDataFromApi['desc'] = [];
//                 }

//                 $inquiryDataFromApi['desc']['tarif']       = $inquiryDataFromApi['desc']['tarif'] ?? null;
//                 $inquiryDataFromApi['desc']['alamat']      = $inquiryDataFromApi['desc']['alamat'] ?? null;
//                 $inquiryDataFromApi['desc']['jatuh_tempo'] = $inquiryDataFromApi['desc']['jatuh_tempo'] ?? null;


//                 // Inisialisasi variabel perhitungan
//                 $totalNilaiTagihan = 0;
//                 $totalDenda = 0;
//                 $totalBiayaLain = 0;
//                 $jumlahLembarTagihan = 0;
//                 $totalAdminFromProvider = (float) ($inquiryDataFromApi['admin'] ?? 0);

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
//                         $totalBiayaLain += (float) ($detail['biaya_lain'] ?? 0);
//                     }
//                 } else {
//                     $totalNilaiTagihan = $pureBillPriceFromApiRoot; // Gunakan 'price' dari root jika tidak ada detail
//                     $totalDenda = (float) ($inquiryDataFromApi['desc']['denda'] ?? 0); // Jika denda di root desc
//                     $totalBiayaLain = (float) ($inquiryDataFromApi['desc']['biaya_lain'] ?? 0); // Jika biaya_lain di root desc
//                 }

//                 $commission = $product->commission ?? 0;
//                 $commission_sell_percentage = $product->commission_sell_percentage ?? 0;
//                 $commission_sell_fixed = $product->commission_sell_fixed ?? 0;
//                 $diskonPerLembar = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;

//                 $finalDiskon = $diskonPerLembar * $jumlahLembarTagihan;
//                 $finalDiskon = ceil($finalDiskon);

//                 // Harga pokok tagihan dari provider (total nilai tagihan + total biaya lain)
//                 // Ini adalah 'price' yang akan kita simpan di transaksi kita.
//                 $calculatedPureBillPrice = $totalNilaiTagihan + $totalBiayaLain;

//                 // Hitung Total Pembayaran Akhir (dengan Diskon)
//                 $finalSellingPrice = $calculatedPureBillPrice + $totalAdminFromProvider + $totalDenda - $finalDiskon;
//                 $finalSellingPrice = ceil($finalSellingPrice);

//                 // <<<<<<<<<<< LOGIKA OVERRIDE FINAL SELLING PRICE BARU >>>>>>>>>>>>>
//                 // Jika 'price' dari respons API provider ($pureBillPriceFromApiRoot) lebih besar dari $finalSellingPrice (harga jual yang kita hitung),
//                 // DAN $providerOriginalSellingPrice (harga jual rekomendasi dari provider) tersedia dan lebih besar dari 0,
//                 // maka $finalSellingPrice akan di-override menggunakan $providerOriginalSellingPrice.
//                 if ($pureBillPriceFromApiRoot > $finalSellingPrice && $providerOriginalSellingPrice > 0) {
//                     $finalSellingPrice = $providerOriginalSellingPrice;
//                     Log::info('PDAM Inquiry: finalSellingPrice overridden by provider_original_selling_price.', [
//                         'calculated_finalSellingPrice' => $finalSellingPrice,
//                         'pureBillPriceFromApiRoot' => $pureBillPriceFromApiRoot,
//                         'providerOriginalSellingPrice' => $providerOriginalSellingPrice,
//                         'customer_no' => $customerNo
//                     ]);
//                 }
//                 // <<<<<<<<<<< AKHIR LOGIKA OVERRIDE >>>>>>>>>>>>>

//                 // 4. Susun kembali data untuk dikirim ke frontend dan disimpan di sesi
//                 $inquiryDataFromApi['price']         = $calculatedPureBillPrice; // Total nilai tagihan murni + biaya lain (yang kita hitung)
//                 $inquiryDataFromApi['admin']         = $totalAdminFromProvider; // Admin dari provider
//                 $inquiryDataFromApi['denda']         = $totalDenda; // Total denda
//                 $inquiryDataFromApi['diskon']        = $finalDiskon; // Simpan diskon yang sudah dikalikan
//                 $inquiryDataFromApi['jumlah_lembar_tagihan'] = $jumlahLembarTagihan; // Jumlah lembar tagihan
//                 $inquiryDataFromApi['selling_price'] = $finalSellingPrice; // Total yang harus dibayar pelanggan (sudah disesuaikan)
//                 $inquiryDataFromApi['buyer_sku_code'] = $current_sku;
//                 $inquiryDataFromApi['ref_id'] = $ref_id;
//                 $inquiryDataFromApi['provider_original_selling_price'] = $providerOriginalSellingPrice; // Simpan ini untuk referensi

//                 unset($inquiryDataFromApi['buyer_last_saldo']);

//                 session(['postpaid_inquiry_data' => $inquiryDataFromApi]);
//                 return response()->json($inquiryDataFromApi);
//             } else {
//                 $errorMessage = $responseData['data']['message'] ?? 'Gagal melakukan pengecekan tagihan.';
//                 Log::warning("Inquiry PDAM Gagal untuk SKU: {$current_sku}. Pesan: {$errorMessage}", ['response' => $responseData]);
//                 return response()->json(['message' => $errorMessage], 400);
//             }
//         } catch (\Exception $e) {
//             Log::error('PDAM Inquiry Error: ' . $e->getMessage(), ['customer_no' => $customerNo, 'sku' => $current_sku]);
//             return response()->json(['message' => 'Terjadi kesalahan pada server provider.'], 500);
//         }
//     }

//     /**
//      * Menangani permintaan pembayaran tagihan PDAM.
//      * Metode payment ini akan menggunakan selling_price yang sudah disesuaikan dari sesi.
//      */
//     public function payment(Request $request)
//     {
//         $user = Auth::user();
//         $inquiryData = session('postpaid_inquiry_data');

//         if (!$inquiryData || $inquiryData['customer_no'] !== $request->customer_no) {
//             return response()->json(['message' => 'Sesi tidak valid atau nomor pelanggan tidak cocok.'], 400);
//         }

//         // Ambil selling_price yang sudah disesuaikan dari sesi
//         $totalPriceToPay     = (float) $inquiryData['selling_price'];
//         $finalAdmin          = (float) $inquiryData['admin'];
//         $pureBillPrice       = (float) $inquiryData['price'];
//         $diskon              = (float) ($inquiryData['diskon'] ?? 0);
//         $jumlahLembarTagihan = (int) ($inquiryData['jumlah_lembar_tagihan'] ?? 0);
//         $denda               = (float) ($inquiryData['denda'] ?? 0);
//         // `provider_original_selling_price` tidak lagi diperlukan di sini karena sudah diaplikasikan di inquiry

//         if ($user->balance < $totalPriceToPay) {
//             return response()->json(['message' => 'Saldo Anda tidak mencukupi.'], 402);
//         }

//         $user->decrement('balance', $totalPriceToPay);

//         $initialData = $this->mapToUnifiedTransaction($inquiryData, 'PDAM', $pureBillPrice, $finalAdmin);
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
//         unset($initialData['provider_original_selling_price']); // Hapus dari initial data

//         $unifiedTransaction = PostpaidTransaction::create($initialData);

//         $apiResponseData = [];

//         $username = env('P_U');
//         $apiKey = env('P_AK');
//         $sign = md5($username . $apiKey . $inquiryData['ref_id']);

//         try {
//             $response = Http::post(config('services.api_server') . '/v1/transaction', [
//                 'commands' => 'pay-pasca',
//                 'username' => $username,
//                 'buyer_sku_code' => $inquiryData['buyer_sku_code'],
//                 'customer_no' => $inquiryData['customer_no'],
//                 'ref_id' => $inquiryData['ref_id'],
//                 'sign' => $sign,
//                 'testing' => false,
//             ]);
//             $apiResponseData = $response->json()['data'];

//             Log::info('PDAM Payment API Response:', ['response_data' => $apiResponseData, 'transaction_id' => $unifiedTransaction->id]);

//         } catch (\Exception $e) {
//             $user->increment('balance', $totalPriceToPay);
//             $errorMessage = ['status' => 'Gagal', 'message' => 'Gagal terhubung ke server provider.'];

//             $unifiedTransaction->update(array_merge($errorMessage, ['rc' => null, 'sn' => null]));

//             Log::error('PDAM Payment Error: ' . $e->getMessage(), ['transaction_id' => $unifiedTransaction->id, 'inquiry_data' => $inquiryData]);
//             return response()->json(['message' => 'Terjadi kesalahan pada server provider.'], 500);
//         }

//         $fullResponseData = array_merge($inquiryData, $apiResponseData);

//         $fullResponseData['price'] = $pureBillPrice;
//         $fullResponseData['admin'] = $finalAdmin;
//         $fullResponseData['selling_price'] = $totalPriceToPay;
//         unset($fullResponseData['buyer_last_saldo']);
//         unset($fullResponseData['provider_original_selling_price']); // Hapus dari fullResponseData

//         $updatePayload = $this->mapToUnifiedTransaction($fullResponseData, 'PDAM', $pureBillPrice, $finalAdmin);
//         $updatePayload['selling_price'] = $totalPriceToPay;
//         $updatePayload['status'] = $apiResponseData['status'] ?? 'Gagal';
//         $updatePayload['message'] = $apiResponseData['message'] ?? 'Pembayaran gagal.';

//         $updatePayload['rc'] = $apiResponseData['rc'] ?? null;
//         $updatePayload['sn'] = $apiResponseData['sn'] ?? null;

//         $keysToExcludeFromDetails = [
//             'ref_id', 'customer_no', 'customer_name', 'buyer_sku_code', 'message',
//             'rc', 'sn', 'buyer_last_saldo', 'price', 'selling_price', 'admin', 'status',
//             'diskon', 'jumlah_lembar_tagihan', 'denda', 'desc', 'provider_original_selling_price'
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
//         unset($updatePayload['provider_original_selling_price']); // Hapus dari updatePayload

//         $unifiedTransaction->update($updatePayload);

//         $unifiedTransaction->refresh();

//         $fullResponseData['selling_price'] = $unifiedTransaction->selling_price;
//         $fullResponseData['status'] = $unifiedTransaction->status;
//         $fullResponseData['message'] = $unifiedTransaction->message;
//         $fullResponseData['customer_name'] = $unifiedTransaction->customer_name;
//         $fullResponseData['customer_no'] = $unifiedTransaction->customer_no;
//         $fullResponseData['diskon'] = $unifiedTransaction->details['diskon'] ?? 0;
//         $fullResponseData['denda'] = $unifiedTransaction->details['denda'] ?? 0;
//         $fullResponseData['admin'] = $unifiedTransaction->admin_fee;
//         $fullResponseData['price'] = $unifiedTransaction->price;
//         $fullResponseData['sn'] = $unifiedTransaction->sn;
//         $fullResponseData['ref_id'] = $unifiedTransaction->ref_id;
//         $fullResponseData['details'] = $unifiedTransaction->details;

//         session()->forget('postpaid_inquiry_data');
//         return response()->json($fullResponseData);
//     }
// }

// >>>>>>>>>> TESTING PDAM POSTPAID CONTROLLER <<<<<<<<<<<<<<

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

    public function inquiry(Request $request)
    {
        $request->validate([
            'customer_no' => 'required|string|min:4',
            'buyer_sku_code' => 'required|string|exists:postpaid_products,buyer_sku_code',
        ]);

        $customerNo = $request->customer_no;
        $current_sku = $request->buyer_sku_code;

        $product = PostpaidProduct::where('buyer_sku_code', $current_sku)
                                ->where('seller_product_status', '1')
                                ->first();

        if (!$product) {
            return response()->json(['message' => 'Produk PDAM tidak tersedia atau tidak aktif untuk inquiry.'], 503);
        }

        $ref_id = 'pdam-' . substr(str_replace('-', '', Str::uuid()->toString()), 0, 15);
        $username = env('P_U');
        $apiKey = env('P_AKD');
        $sign = md5($username . $apiKey . $ref_id);

        // --- START DUMMY RESPONSE INQUIRY ---
        $specificDescData = [
            "tarif" => "3A",
            "lembar_tagihan" => 1,
            "alamat" => "-",
            "jatuh_tempo" => "1-15 DES 2014",
            "detail" => [
                [
                    "periode" => "201901",
                    "nilai_tagihan" => "8000",
                    "denda" => "500",
                    "meter_awal" => "00080000",
                    "meter_akhir" => "00090000",
                    "biaya_lain" => "1500"
                ]
            ]
        ];

        $dummyStatus = 'Sukses';
        $dummyMessage = 'Inquiry PDAM berhasil.';
        $dummyCustomerName = 'Pelanggan PDAM Dummy ' . substr($customerNo, 0, 4);

        $calculatedPrice = 0;
        $calculatedDenda = 0;
        $calculatedBiayaLain = 0;
        if (isset($specificDescData['detail']) && is_array($specificDescData['detail'])) {
            foreach ($specificDescData['detail'] as $detail) {
                $calculatedPrice += (float) ($detail['nilai_tagihan'] ?? 0);
                $calculatedDenda += (float) ($detail['denda'] ?? 0);
                $calculatedBiayaLain += (float) ($detail['biaya_lain'] ?? 0);
            }
        }

        $dummyAdminFromProvider = 2500;
        $dummyProviderOriginalSellingPrice = 12500; // Contoh harga jual asli dari provider (misal: 8000+500+1500+2500 = 12500)

        $responseData = [
            'data' => [
                'status' => $dummyStatus,
                'message' => $dummyMessage,
                'customer_name' => $dummyCustomerName,
                'customer_no' => $customerNo,
                'buyer_sku_code' => $current_sku,
                'price' => $calculatedPrice + $calculatedBiayaLain, // Ini adalah 'price' dari root response, yang kita anggap sebagai total bill murni
                'admin' => $dummyAdminFromProvider,
                'rc' => '00',
                'sn' => 'SN-INQ-' . Str::random(12),
                'ref_id' => $ref_id,
                'desc' => $specificDescData,
                'selling_price' => $dummyProviderOriginalSellingPrice, // ORIGINAL provider selling_price
            ],
        ];
        // --- END DUMMY RESPONSE INQUIRY ---

        Log::info('PDAM Inquiry API Response (DUMMY):', ['response_data' => $responseData, 'customer_no' => $customerNo, 'sku' => $current_sku, 'ref_id' => $ref_id]);

        if (isset($responseData['data']) && $responseData['data']['status'] === 'Sukses') {
            $inquiryDataFromApi = $responseData['data'];

            // Simpan 'selling_price' asli dari respons API provider jika tersedia
            $providerOriginalSellingPrice = (float) ($inquiryDataFromApi['selling_price'] ?? 0);
            // Simpan 'price' asli dari respons API provider (harga pokok/bill murni dari provider)
            $pureBillPriceFromApiRoot = (float) ($inquiryDataFromApi['price'] ?? 0);

            if (!isset($inquiryDataFromApi['desc']) || !is_array($inquiryDataFromApi['desc'])) {
                $inquiryDataFromApi['desc'] = [];
            }

            // Variabel ini sudah diatur dalam $specificDescData, tidak perlu di-override lagi di sini
            // $inquiryDataFromApi['desc']['tarif']       = $inquiryDataFromApi['desc']['tarif'] ?? null;
            // $inquiryDataFromApi['desc']['alamat']      = $inquiryDataFromApi['desc']['alamat'] ?? null;
            // $inquiryDataFromApi['desc']['jatuh_tempo'] = $inquiryDataFromApi['desc']['jatuh_tempo'] ?? null;

            $totalNilaiTagihan = 0;
            $totalDenda = 0;
            $totalBiayaLain = 0;
            $jumlahLembarTagihan = 0;
            $totalAdminFromProvider = (float) ($inquiryDataFromApi['admin'] ?? 0);

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
                    $totalBiayaLain += (float) ($detail['biaya_lain'] ?? 0);
                }
            } else {
                $totalNilaiTagihan = $pureBillPriceFromApiRoot; // Gunakan 'price' dari root jika tidak ada detail
                $totalDenda = (float) ($inquiryDataFromApi['desc']['denda'] ?? 0); // Jika denda di root desc
                $totalBiayaLain = (float) ($inquiryDataFromApi['desc']['biaya_lain'] ?? 0); // Jika biaya_lain di root desc
            }

            $commission = $product->commission ?? 0;
            $commission_sell_percentage = $product->commission_sell_percentage ?? 0;
            $commission_sell_fixed = $product->commission_sell_fixed ?? 0;
            $diskonPerLembar = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;

            $finalDiskon = $diskonPerLembar * $jumlahLembarTagihan;
            $finalDiskon = ceil($finalDiskon);

            // Harga pokok tagihan dari provider (total nilai tagihan + total biaya lain)
            // Ini adalah 'price' yang akan kita simpan di transaksi kita.
            $calculatedPureBillPrice = $totalNilaiTagihan + $totalBiayaLain;

            // Hitung Total Pembayaran Akhir (dengan Diskon)
            $finalSellingPrice = $calculatedPureBillPrice + $totalAdminFromProvider + $totalDenda - $finalDiskon;
            $finalSellingPrice = ceil($finalSellingPrice);

            // <<<<<<<<<<< LOGIKA OVERRIDE FINAL SELLING PRICE BARU >>>>>>>>>>>>>
            // Jika 'price' dari respons API provider ($pureBillPriceFromApiRoot) lebih besar dari $finalSellingPrice (harga jual yang kita hitung),
            // DAN $providerOriginalSellingPrice (harga jual rekomendasi dari provider) tersedia dan lebih besar dari 0,
            // maka $finalSellingPrice akan di-override menggunakan $providerOriginalSellingPrice.
            if ($pureBillPriceFromApiRoot > $finalSellingPrice && $providerOriginalSellingPrice > 0) {
                $finalSellingPrice = $providerOriginalSellingPrice;
                Log::info('PDAM Inquiry (DUMMY): finalSellingPrice overridden by provider_original_selling_price.', [
                    'calculated_finalSellingPrice' => $finalSellingPrice,
                    'pureBillPriceFromApiRoot' => $pureBillPriceFromApiRoot,
                    'providerOriginalSellingPrice' => $providerOriginalSellingPrice,
                    'customer_no' => $customerNo
                ]);
            }
            // <<<<<<<<<<< AKHIR LOGIKA OVERRIDE >>>>>>>>>>>>>

            // 4. Susun kembali data untuk dikirim ke frontend dan disimpan di sesi
            $inquiryDataFromApi['price']         = $calculatedPureBillPrice;
            $inquiryDataFromApi['admin']         = $totalAdminFromProvider;
            $inquiryDataFromApi['denda']         = $totalDenda;
            $inquiryDataFromApi['diskon']        = $finalDiskon;
            $inquiryDataFromApi['jumlah_lembar_tagihan'] = $jumlahLembarTagihan;
            $inquiryDataFromApi['selling_price'] = $finalSellingPrice; // Gunakan finalSellingPrice yang sudah disesuaikan
            $inquiryDataFromApi['buyer_sku_code'] = $current_sku;
            $inquiryDataFromApi['ref_id'] = $ref_id;
            $inquiryDataFromApi['provider_original_selling_price'] = $providerOriginalSellingPrice; // Simpan ini untuk referensi

            unset($inquiryDataFromApi['buyer_last_saldo']);

            session(['postpaid_inquiry_data' => $inquiryDataFromApi]);
            return response()->json($inquiryDataFromApi);
        } else {
            $errorMessage = $responseData['data']['message'] ?? 'Gagal melakukan pengecekan tagihan dummy.';
            Log::warning("Inquiry PDAM Dummy Gagal untuk SKU: {$current_sku}. Pesan: {$errorMessage}", ['response' => $responseData]);
            return response()->json(['message' => $errorMessage], 400);
        }
    }

    public function payment(Request $request)
    {
        $user = Auth::user();
        $inquiryData = session('postpaid_inquiry_data');

        if (!$inquiryData || $inquiryData['customer_no'] !== $request->customer_no) {
            return response()->json(['message' => 'Sesi tidak valid atau nomor pelanggan tidak cocok.'], 400);
        }

        // Ambil selling_price yang sudah disesuaikan dari sesi
        $totalPriceToPay     = (float) $inquiryData['selling_price'];
        $finalAdmin          = (float) $inquiryData['admin'];
        $pureBillPrice       = (float) $inquiryData['price'];
        $diskon              = (float) ($inquiryData['diskon'] ?? 0);
        $jumlahLembarTagihan = (int) ($inquiryData['jumlah_lembar_tagihan'] ?? 0);
        $denda               = (float) ($inquiryData['denda'] ?? 0);
        // `provider_original_selling_price` tidak lagi diperlukan di sini karena sudah diaplikasikan di inquiry

        if ($user->balance < $totalPriceToPay) {
            return response()->json(['message' => 'Saldo Anda tidak mencukupi.'], 402);
        }

        $user->decrement('balance', $totalPriceToPay);

        $initialData = $this->mapToUnifiedTransaction($inquiryData, 'PDAM', $pureBillPrice, $finalAdmin);
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
        unset($initialData['provider_original_selling_price']); // Hapus dari initial data

        $unifiedTransaction = PostpaidTransaction::create($initialData);

        // --- START DUMMY RESPONSE PAYMENT ---
        $apiResponseData = [
            'status' => 'Sukses',
            'message' => 'Pembayaran PDAM dummy berhasil diproses.',
            'rc' => '00',
            'sn' => 'SN-PDAM-' . Str::random(15),
            'customer_name' => $inquiryData['customer_name'],
            'customer_no' => $inquiryData['customer_no'],
            'buyer_sku_code' => $inquiryData['buyer_sku_code'],
            'price' => $pureBillPrice,
            'admin' => $finalAdmin,
            'ref_id' => $inquiryData['ref_id'],
            'selling_price' => $totalPriceToPay, // Menyesuaikan selling_price dummy dengan yang akan dibayar
        ];
        // --- END DUMMY RESPONSE PAYMENT ---

        Log::info('PDAM Payment Dummy Response:', ['response_data' => $apiResponseData, 'transaction_id' => $unifiedTransaction->id]);

        $fullResponseData = array_merge($inquiryData, $apiResponseData);

        $fullResponseData['price'] = $pureBillPrice;
        $fullResponseData['admin'] = $finalAdmin;
        $fullResponseData['selling_price'] = $totalPriceToPay;
        unset($fullResponseData['buyer_last_saldo']);
        unset($fullResponseData['provider_original_selling_price']); // Hapus dari fullResponseData

        $updatePayload = $this->mapToUnifiedTransaction($fullResponseData, 'PDAM', $pureBillPrice, $finalAdmin);
        $updatePayload['selling_price'] = $totalPriceToPay;
        $updatePayload['status'] = $apiResponseData['status'] ?? 'Gagal';
        $updatePayload['message'] = $apiResponseData['message'] ?? 'Pembayaran gagal.';

        $updatePayload['rc'] = $apiResponseData['rc'] ?? null;
        $updatePayload['sn'] = $apiResponseData['sn'] ?? null;

        $keysToExcludeFromDetails = [
            'ref_id', 'customer_no', 'customer_name', 'buyer_sku_code', 'message',
            'rc', 'sn', 'buyer_last_saldo', 'price', 'selling_price', 'admin', 'status',
            'diskon', 'jumlah_lembar_tagihan', 'denda', 'desc', 'provider_original_selling_price'
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
        unset($updatePayload['provider_original_selling_price']); // Hapus dari updatePayload

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

        session()->forget('postpaid_inquiry_data');
        return response()->json($fullResponseData);
    }
}