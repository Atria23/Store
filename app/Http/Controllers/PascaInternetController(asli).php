<?php

// >>>>>>>>>>>>>     REAL INTERNET POSTPAID CONTROLLER      <<<<<<<<<<<<<<<<<<<<<<<

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
     * Menampilkan halaman pembayaran Internet pascabayar dengan daftar produk.
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
     * Mengambil daftar produk Internet pascabayar dari database lokal.
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
     * Menangani permintaan inquiry (pengecekan tagihan) untuk Internet pascabayar.
     */
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
            return response()->json(['message' => 'Produk Internet tidak tersedia atau tidak aktif untuk inquiry.'], 503);
        }

        $ref_id = 'internet-' . substr(str_replace('-', '', Str::uuid()->toString()), 0, 15);
        $username = env('P_U');
        $apiKey = env('P_AK');
        $sign = md5($username . $apiKey . $ref_id);

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
        } catch (\Exception $e) {
            Log::error('Internet Inquiry Error: ' . $e->getMessage(), ['customer_no' => $customerNo, 'sku' => $current_sku]);
            return response()->json(['message' => 'Terjadi kesalahan pada server provider.'], 500);
        }

        if (isset($responseData['data']) && $responseData['data']['status'] === 'Sukses') {
            $inquiryDataFromApi = $responseData['data'];

            if (!isset($inquiryDataFromApi['desc']) || !is_array($inquiryDataFromApi['desc'])) {
                $inquiryDataFromApi['desc'] = [];
            }

            // Inisialisasi variabel perhitungan
            $totalNilaiTagihan = 0; // Sum of 'nilai_tagihan' from desc.detail
            $totalAdminFromDetails = 0;      // Sum of 'admin' from desc.detail
            $totalDenda = 0;
            $jumlahLembarTagihan = 0;

            // Ambil jumlah lembar tagihan dari 'desc.lembar_tagihan'
            if (isset($inquiryDataFromApi['desc']['lembar_tagihan'])) {
                $jumlahLembarTagihan = (int) $inquiryDataFromApi['desc']['lembar_tagihan'];
            } elseif (isset($inquiryDataFromApi['desc']['detail']) && is_array($inquiryDataFromApi['desc']['detail'])) {
                $jumlahLembarTagihan = count($inquiryDataFromApi['desc']['detail']);
            } else {
                $jumlahLembarTagihan = 1;
            }

            // Akumulasikan nilai tagihan dan admin dari detail
            if (isset($inquiryDataFromApi['desc']['detail']) && is_array($inquiryDataFromApi['desc']['detail'])) {
                foreach ($inquiryDataFromApi['desc']['detail'] as $detail) {
                    $totalNilaiTagihan += (float) ($detail['nilai_tagihan'] ?? 0);
                    $totalAdminFromDetails += (float) ($detail['admin'] ?? 0);
                }
            }

            // 1. Hitung Diskon dasar per lembar berdasarkan komisi produk
            $commission = $product->commission ?? 0;
            $commission_sell_percentage = $product->commission_sell_percentage ?? 0;
            $commission_sell_fixed = $product->commission_sell_fixed ?? 0;
            $diskonPerLembar = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;

            // 2. Kalikan diskon per lembar dengan jumlah lembar tagihan
            $finalDiskon = $diskonPerLembar * $jumlahLembarTagihan;
            $finalDiskon = ceil($finalDiskon);

            // 3. Hitung Total Pembayaran Akhir (dengan Diskon)
            // selling_price = (totalNilaiTagihanFromDetails) + (totalAdminFromDetails) + total_denda - total_diskon_kita
            $finalSellingPrice = $totalNilaiTagihan + $totalAdminFromDetails + $totalDenda - $finalDiskon;
                
                // --- START OF NEW LOGIC FOR OVERRIDE ---
                // Ambil 'price' dan 'selling_price' asli dari respons API provider root
                $apiOriginalPrice = (float) ($responseData['data']['price'] ?? 0);
                $apiOriginalSellingPrice = (float) ($responseData['data']['selling_price'] ?? 0);

                // Jika 'price' dari respons API provider lebih besar dari $finalSellingPrice (harga jual yang kita hitung),
                // DAN 'selling_price' dari respons API provider tersedia dan lebih besar dari 0,
                // maka $finalSellingPrice akan di-override menggunakan $apiOriginalSellingPrice.
                if ($apiOriginalPrice > $finalSellingPrice && $apiOriginalSellingPrice > 0) {
                    Log::info("Override finalSellingPrice: Original API Price ({$apiOriginalPrice}) > Calculated Selling Price ({$finalSellingPrice}) AND Original API Selling Price ({$apiOriginalSellingPrice}) > 0. Using Original API Selling Price.");
                    $finalSellingPrice = $apiOriginalSellingPrice;
                }
                // --- END OF NEW LOGIC FOR OVERRIDE ---

                // Pembulatan $finalSellingPrice setelah potensi override
                $finalSellingPrice = ceil($finalSellingPrice); // Round up the final selling price

            // 4. Susun kembali data untuk dikirim ke frontend dan disimpan di sesi
            // Update 'price' and 'admin' to reflect the sums from details as requested
            $inquiryDataFromApi['price'] = $totalNilaiTagihan;
            $inquiryDataFromApi['admin'] = $totalAdminFromDetails;
            $inquiryDataFromApi['denda'] = $totalDenda;
            $inquiryDataFromApi['diskon'] = $finalDiskon;
            $inquiryDataFromApi['jumlah_lembar_tagihan'] = $jumlahLembarTagihan;
            $inquiryDataFromApi['selling_price'] = $finalSellingPrice;
            $inquiryDataFromApi['buyer_sku_code'] = $current_sku;
            $inquiryDataFromApi['ref_id'] = $ref_id;

            // Hapus buyer_last_saldo
            unset($inquiryDataFromApi['buyer_last_saldo']);

            session(['postpaid_inquiry_data' => $inquiryDataFromApi]);
            return response()->json($inquiryDataFromApi);
        } else {
            $errorMessage = $responseData['data']['message'] ?? 'Gagal melakukan pengecekan tagihan.';
            Log::warning("Inquiry Internet Gagal untuk SKU: {$current_sku}. Pesan: {$errorMessage}", ['response' => $responseData]);
            return response()->json(['message' => $errorMessage], 400);
        }
    }

    /**
     * Menangani permintaan pembayaran tagihan Internet pascabayar.
     */
    public function payment(Request $request)
    {
        $user = Auth::user();
        $inquiryData = session('postpaid_inquiry_data');

        if (!$inquiryData || $inquiryData['customer_no'] !== $request->customer_no) {
            return response()->json(['message' => 'Sesi tidak valid atau nomor pelanggan tidak cocok.'], 400);
        }

        $totalPriceToPay     = $inquiryData['selling_price'];
        // Pastikan $finalAdmin dan $pureBillPrice berasal dari perhitungan total di inquiry
        $finalAdmin          = $inquiryData['admin'];
        $pureBillPrice       = $inquiryData['price'];
        $diskon              = $inquiryData['diskon'] ?? 0;
        $jumlahLembarTagihan = $inquiryData['jumlah_lembar_tagihan'] ?? 0;
        $denda               = $inquiryData['denda'] ?? 0;

        if ($user->balance < $totalPriceToPay) {
            return response()->json(['message' => 'Saldo Anda tidak mencukupi.'], 402);
        }

        $user->decrement('balance', $totalPriceToPay);

        $initialData = $this->mapToUnifiedTransaction($inquiryData, 'INTERNET PASCABAYAR', $pureBillPrice, $finalAdmin);
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
        unset($initialData['buyer_last_saldo']); // Pastikan tidak ada buyer_last_saldo di initialData

        $unifiedTransaction = PostpaidTransaction::create($initialData);

        $apiResponseData = [];

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

            Log::info('Internet Payment API Response:', ['response_data' => $apiResponseData, 'transaction_id' => $unifiedTransaction->id]);

        } catch (\Exception $e) {
            $user->increment('balance', $totalPriceToPay);
            $errorMessage = ['status' => 'Gagal', 'message' => 'Gagal terhubung ke server provider.'];

            $unifiedTransaction->update(array_merge($errorMessage, ['rc' => null, 'sn' => null]));

            Log::error('Internet Payment Error: ' . $e->getMessage(), ['transaction_id' => $unifiedTransaction->id, 'inquiry_data' => $inquiryData]);
            return response()->json(['message' => 'Terjadi kesalahan pada server provider.'], 500);
        }

        $fullResponseData = array_merge($inquiryData, $apiResponseData);

        // Pastikan 'price' dan 'admin' di $fullResponseData konsisten dengan perhitungan total
        $fullResponseData['price'] = $pureBillPrice;
        $fullResponseData['admin'] = $finalAdmin;
        unset($fullResponseData['buyer_last_saldo']); // Hapus buyer_last_saldo

        $updatePayload = $this->mapToUnifiedTransaction($fullResponseData, 'INTERNET PASCABAYAR', $pureBillPrice, $finalAdmin);
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
        unset($updatePayload['buyer_last_saldo']); // Pastikan tidak ada buyer_last_saldo di updatePayload

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
        // buyer_last_saldo tidak ditampilkan

        if (($apiResponseData['status'] ?? 'Gagal') === 'Gagal' && $unifiedTransaction->status === 'Gagal') {
            $user->increment('balance', $totalPriceToPay);
        }

        session()->forget('postpaid_inquiry_data');
        return response()->json($fullResponseData);
    }
}


// // >>>>>>>>>>>>>     TESTING INTERNET POSTPAID CONTROLLER      <<<<<<<<<<<<<<<<<<<<<<<

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

// class PascaInternetController extends Controller
// {
//     use TransactionMapper;

//     /**
//      * Menampilkan halaman pembayaran Internet pascabayar dengan daftar produk.
//      */
//     public function index()
//     {
//         $products = $this->fetchInternetProducts();
//         return Inertia::render('Pascabayar/Internet', [
//             'products' => $products,
//             'auth' => [
//                 'user' => Auth::user(),
//             ],
//         ]);
//     }

//     /**
//      * Mengambil daftar produk Internet pascabayar dari database lokal.
//      * Produk dengan status seller_product_status = false juga diambil
//      * agar bisa ditampilkan di frontend dengan indikator gangguan.
//      */
//     private function fetchInternetProducts()
//     {
//         $internetProducts = PostpaidProduct::where('brand', 'INTERNET PASCABAYAR')
//                                            ->orderBy('product_name', 'asc')
//                                            ->get();

//         return $internetProducts->map(function ($product) {
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
//      * Menangani permintaan inquiry (pengecekan tagihan) untuk Internet pascabayar.
//      */
//     public function inquiry(Request $request)
//     {
//         $request->validate([
//             'customer_no' => 'required|string|min:4',
//             'buyer_sku_code' => 'required|string|exists:postpaid_products,buyer_sku_code',
//         ]);

//         $customerNo = $request->customer_no;
//         $current_sku = $request->buyer_sku_code;

//         $product = PostpaidProduct::where('buyer_sku_code', $current_sku)
//                                 ->where('seller_product_status', '1')
//                                 ->first();

//         if (!$product) {
//             return response()->json(['message' => 'Produk Internet tidak tersedia atau tidak aktif untuk inquiry.'], 503);
//         }

//         $ref_id = 'internet-' . substr(str_replace('-', '', Str::uuid()->toString()), 0, 15);
//         $username = env('P_U');
//         $apiKey = env('P_AKD');
//         $sign = md5($username . $apiKey . $ref_id);

//         // --- START DUMMY RESPONSE INQUIRY ---
//         $specificDescData = [
//             "lembar_tagihan" => 2,
//             "detail" => [
//                 ["periode" => "MEI 2019", "nilai_tagihan" => "8000", "admin" => "2500"],
//                 ["periode" => "JUN 2019", "nilai_tagihan" => "11500", "admin" => "2500"]
//             ]
//         ];

//         // Calculate dummyRootPrice and dummyRootAdmin from specificDescData
//         $calculatedDummyRootPrice = 0;
//         $calculatedDummyRootAdmin = 0;
//         if (isset($specificDescData['detail']) && is_array($specificDescData['detail'])) {
//             foreach ($specificDescData['detail'] as $detail) {
//                 $calculatedDummyRootPrice += (float) ($detail['nilai_tagihan'] ?? 0);
//                 $calculatedDummyRootAdmin += (float) ($detail['admin'] ?? 0);
//             }
//         }

//         $dummyStatus = 'Sukses';
//         $dummyMessage = 'Inquiry Internet berhasil.';
//         $dummyCustomerName = 'Pelanggan Internet Dummy ' . substr($customerNo, 0, 4);

//         $responseData = [
//             'data' => [
//                 'status' => $dummyStatus,
//                 'message' => $dummyMessage,
//                 'customer_name' => $dummyCustomerName,
//                 'customer_no' => $customerNo,
//                 'buyer_sku_code' => $current_sku, // Corrected to use $current_sku
//                 'price' => $calculatedDummyRootPrice, // Use calculated total from details
//                 'admin' => $calculatedDummyRootAdmin,  // Use calculated total from details
//                 'rc' => '00',
//                 'sn' => 'SN-INQ-' . Str::random(12),
//                 'ref_id' => $ref_id,
//                 'desc' => $specificDescData,
//                 // 'buyer_last_saldo' tidak lagi disertakan
//             ],
//         ];
//         // --- END DUMMY RESPONSE INQUIRY ---

//         // >>>>>>>>>>>>>>>>> BAGIAN INI UNTUK PANGGILAN API ASLI JIKA SUDAH SIAP <<<<<<<<<<<<<<<<<
//         // (bagian ini sengaja dikomentari untuk mode TESTING)
//         // try {
//         //     $response = Http::post(config('services.api_server') . '/v1/transaction', [
//         //         'commands' => 'inq-pasca',
//         //         'username' => $username,
//         //         'buyer_sku_code' => 'internet',
//         //         'customer_no' => $customerNo,
//         //         'ref_id' => $ref_id,
//         //         'sign' => $sign,
//         //         'testing' => true,
//         //     ]);
//         //     $responseData = $response->json();
//         // } catch (\Exception $e) {
//         //     Log::error('Internet Inquiry Error: ' . $e->getMessage(), ['customer_no' => $customerNo, 'sku' => $current_sku]);
//         //     return response()->json(['message' => 'Terjadi kesalahan pada server provider.'], 500);
//         // }
//         // >>>>>>>>>>>>>>>>> AKHIR BAGIAN PANGGILAN API ASLI <<<<<<<<<<<<<<<<<


//         if (isset($responseData['data']) && $responseData['data']['status'] === 'Sukses') {
//             $inquiryDataFromApi = $responseData['data'];

//             if (!isset($inquiryDataFromApi['desc']) || !is_array($inquiryDataFromApi['desc'])) {
//                 $inquiryDataFromApi['desc'] = [];
//             }

//             // Inisialisasi variabel perhitungan
//             $totalNilaiTagihan = 0;
//             $totalAdminFromDetails = 0;
//             $totalDenda = 0;
//             $jumlahLembarTagihan = 0;

//             if (isset($inquiryDataFromApi['desc']['lembar_tagihan'])) {
//                 $jumlahLembarTagihan = (int) $inquiryDataFromApi['desc']['lembar_tagihan'];
//             } elseif (isset($inquiryDataFromApi['desc']['detail']) && is_array($inquiryDataFromApi['desc']['detail'])) {
//                 $jumlahLembarTagihan = count($inquiryDataFromApi['desc']['detail']);
//             } else {
//                 $jumlahLembarTagihan = 1;
//             }

//             if (isset($inquiryDataFromApi['desc']['detail']) && is_array($inquiryDataFromApi['desc']['detail'])) {
//                 foreach ($inquiryDataFromApi['desc']['detail'] as $detail) {
//                     $totalNilaiTagihan += (float) ($detail['nilai_tagihan'] ?? 0);
//                     $totalAdminFromDetails += (float) ($detail['admin'] ?? 0);
//                 }
//             }

//             // 1. Hitung Diskon dasar per lembar berdasarkan komisi produk
//             $commission = $product->commission ?? 0;
//             $commission_sell_percentage = $product->commission_sell_percentage ?? 0;
//             $commission_sell_fixed = $product->commission_sell_fixed ?? 0;
//             $diskonPerLembar = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;

//             // 2. Kalikan diskon per lembar dengan jumlah lembar tagihan
//             $finalDiskon = $diskonPerLembar * $jumlahLembarTagihan;
//             $finalDiskon = ceil($finalDiskon);

//             // 3. Hitung Total Pembayaran Akhir (dengan Diskon)
//             // selling_price = (totalNilaiTagihanFromDetails) + (totalAdminFromDetails) + total_denda - total_diskon_kita
            // $finalSellingPrice = ($totalNilaiTagihan + $totalBiayaLain) + $totalAdminFromProvider + $totalDenda - $finalDiskon;
                
            //     // --- START OF NEW LOGIC FOR OVERRIDE ---
            //     // Ambil 'price' dan 'selling_price' asli dari respons API provider root
            //     $apiOriginalPrice = (float) ($responseData['data']['price'] ?? 0);
            //     $apiOriginalSellingPrice = (float) ($responseData['data']['selling_price'] ?? 0);

            //     // Jika 'price' dari respons API provider lebih besar dari $finalSellingPrice (harga jual yang kita hitung),
            //     // DAN 'selling_price' dari respons API provider tersedia dan lebih besar dari 0,
            //     // maka $finalSellingPrice akan di-override menggunakan $apiOriginalSellingPrice.
            //     if ($apiOriginalPrice > $finalSellingPrice && $apiOriginalSellingPrice > 0) {
            //         Log::info("Override finalSellingPrice: Original API Price ({$apiOriginalPrice}) > Calculated Selling Price ({$finalSellingPrice}) AND Original API Selling Price ({$apiOriginalSellingPrice}) > 0. Using Original API Selling Price.");
            //         $finalSellingPrice = $apiOriginalSellingPrice;
            //     }
            //     // --- END OF NEW LOGIC FOR OVERRIDE ---

            //     // Pembulatan $finalSellingPrice setelah potensi override
            //     $finalSellingPrice = ceil($finalSellingPrice); // Round up the final selling price

//             // 4. Susun kembali data untuk dikirim ke frontend dan disimpan di sesi
//             // Pastikan 'price' dan 'admin' mencerminkan total dari detail
//             $inquiryDataFromApi['price'] = $totalNilaiTagihan;
//             $inquiryDataFromApi['admin'] = $totalAdminFromDetails;
//             $inquiryDataFromApi['denda'] = $totalDenda;
//             $inquiryDataFromApi['diskon'] = $finalDiskon;
//             $inquiryDataFromApi['jumlah_lembar_tagihan'] = $jumlahLembarTagihan;
//             $inquiryDataFromApi['selling_price'] = $finalSellingPrice;
//             $inquiryDataFromApi['buyer_sku_code'] = $current_sku;
//             $inquiryDataFromApi['ref_id'] = $ref_id;

//             // Hapus buyer_last_saldo
//             unset($inquiryDataFromApi['buyer_last_saldo']);

//             session(['postpaid_inquiry_data' => $inquiryDataFromApi]);
//             return response()->json($inquiryDataFromApi);
//         } else {
//             $errorMessage = $responseData['data']['message'] ?? 'Gagal melakukan pengecekan tagihan dummy.';
//             Log::warning("Inquiry Internet Dummy Gagal untuk SKU: {$current_sku}. Pesan: {$errorMessage}", ['response' => $responseData]);
//             return response()->json(['message' => $errorMessage], 400);
//         }
//     }

//     /**
//      * Menangani permintaan pembayaran tagihan Internet pascabayar.
//      */
//     public function payment(Request $request)
//     {
//         $user = Auth::user();
//         $inquiryData = session('postpaid_inquiry_data');

//         if (!$inquiryData || $inquiryData['customer_no'] !== $request->customer_no) {
//             return response()->json(['message' => 'Sesi tidak valid atau nomor pelanggan tidak cocok.'], 400);
//         }

//         $totalPriceToPay     = $inquiryData['selling_price'];
//         // Pastikan $finalAdmin dan $pureBillPrice berasal dari perhitungan total di inquiry
//         $finalAdmin          = $inquiryData['admin'];
//         $pureBillPrice       = $inquiryData['price'];
//         $diskon              = $inquiryData['diskon'] ?? 0;
//         $jumlahLembarTagihan = $inquiryData['jumlah_lembar_tagihan'] ?? 0;
//         $denda               = $inquiryData['denda'] ?? 0;

//         if ($user->balance < $totalPriceToPay) {
//             return response()->json(['message' => 'Saldo Anda tidak mencukupi.'], 402);
//         }

//         $user->decrement('balance', $totalPriceToPay);

//         $initialData = $this->mapToUnifiedTransaction($inquiryData, 'INTERNET PASCABAYAR', $pureBillPrice, $finalAdmin);
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
//         unset($initialData['buyer_last_saldo']); // Pastikan tidak ada buyer_last_saldo di initialData

//         $unifiedTransaction = PostpaidTransaction::create($initialData);

//         // --- START DUMMY RESPONSE PAYMENT ---
//         $apiResponseData = [
//             'status' => 'Sukses',
//             'message' => 'Pembayaran Internet dummy berhasil diproses.',
//             'rc' => '00',
//             'sn' => 'SN-INTERNET-' . Str::random(15),
//             'customer_name' => $inquiryData['customer_name'],
//             'customer_no' => $inquiryData['customer_no'],
//             'buyer_sku_code' => $inquiryData['buyer_sku_code'],
//             'price' => $pureBillPrice, // Gunakan harga total dari inquiryData
//             'admin' => $finalAdmin, // Gunakan admin total dari inquiryData
//             'ref_id' => $inquiryData['ref_id'],
//             // 'buyer_last_saldo' tidak lagi disertakan
//         ];
//         // --- END DUMMY RESPONSE PAYMENT ---

//         Log::info('Internet Payment Dummy Response:', ['response_data' => $apiResponseData, 'transaction_id' => $unifiedTransaction->id]);

//         // >>>>>>>>>>>>>>>>> BAGIAN INI UNTUK PANGGILAN API ASLI JIKA SUDAH SIAP <<<<<<<<<<<<<<<<<
//         // (bagian ini sengaja dikomentari untuk mode TESTING)
//         // $ref_id = 'internet-' . substr(str_replace('-', '', Str::uuid()->toString()), 0, 15);
//         // $username = env('P_U');
//         // $apiKey = env('P_AKD');
//         // $sign = md5($username . $apiKey . $ref_id);
//         // try {
//         //     $response = Http::post(config('services.api_server') . '/v1/transaction', [
//         //         'commands' => 'pay-pasca',
//         //         'username' => $username,
//         //         'buyer_sku_code' => 'internet',
//         //         'customer_no' => $inquiryData['customer_no'],
//         //         'ref_id' => $inquiryData['ref_id'],
//         //         'sign' => $sign,
//         //         'testing' => true,
//         //     ]);
//         //     $apiResponseData = $response->json()['data'];
//         // } catch (\Exception $e) {
//         //     $user->increment('balance', $totalPriceToPay);
//         //     $errorMessage = ['status' => 'Gagal', 'message' => 'Gagal terhubung ke server provider.'];
//         //     $unifiedTransaction->update(array_merge($errorMessage, ['rc' => null, 'sn' => null]));
//         //     Log::error('Internet Payment Error: ' . $e->getMessage(), ['transaction_id' => $unifiedTransaction->id, 'inquiry_data' => $inquiryData]);
//         //     return response()->json(['message' => 'Terjadi kesalahan pada server provider.'], 500);
//         // }
//         // >>>>>>>>>>>>>>>>> AKHIR BAGIAN PANGGILAN API ASLI <<<<<<<<<<<<<<<<<


//         $fullResponseData = array_merge($inquiryData, $apiResponseData);

//         // Pastikan 'price' dan 'admin' di $fullResponseData konsisten dengan perhitungan total
//         $fullResponseData['price'] = $pureBillPrice;
//         $fullResponseData['admin'] = $finalAdmin;
//         unset($fullResponseData['buyer_last_saldo']); // Hapus buyer_last_saldo

//         $updatePayload = $this->mapToUnifiedTransaction($fullResponseData, 'INTERNET PASCABAYAR', $pureBillPrice, $finalAdmin);
//         $updatePayload['selling_price'] = $totalPriceToPay;
//         $updatePayload['status'] = $apiResponseData['status'] ?? 'Gagal';
//         $updatePayload['message'] = $apiResponseData['message'] ?? 'Pembayaran gagal.';

//         $updatePayload['rc'] = $apiResponseData['rc'] ?? null;
//         $updatePayload['sn'] = $apiResponseData['sn'] ?? null;

//         $keysToExcludeFromDetails = [
//             'ref_id', 'customer_no', 'customer_name', 'buyer_sku_code', 'message',
//             'rc', 'sn', 'buyer_last_saldo', 'price', 'selling_price', 'admin', 'status',
//             'diskon', 'jumlah_lembar_tagihan', 'denda', 'desc',
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
//         unset($updatePayload['buyer_last_saldo']); // Pastikan tidak ada buyer_last_saldo di updatePayload

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
//         // buyer_last_saldo tidak ditampilkan

//         if (($apiResponseData['status'] ?? 'Gagal') === 'Gagal' && $unifiedTransaction->status === 'Gagal') {
//             $user->increment('balance', $totalPriceToPay);
//         }

//         session()->forget('postpaid_inquiry_data');
//         return response()->json($fullResponseData);
//     }
// }