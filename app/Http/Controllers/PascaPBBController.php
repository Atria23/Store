<?php

// >>>>>>>>>>>>>     REAL PBB POSTPAID CONTROLLER      <<<<<<<<<<<<<<<<<<<<<<<

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

class PascaPBBController extends Controller
{
    use TransactionMapper;

    /**
     * Menampilkan halaman pembayaran PBB pascabayar dengan daftar produk.
     */
    public function index()
    {
        $products = $this->fetchPBBProducts();
        return Inertia::render('Pascabayar/PBB', [ // Sesuaikan path Inertia
            'products' => $products,
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }

    /**
     * Mengambil daftar produk PBB pascabayar dari database lokal.
     * Produk dengan status seller_product_status = false juga diambil
     * agar bisa ditampilkan di frontend dengan indikator gangguan.
     */
    private function fetchPBBProducts()
    {
        $pbbProducts = PostpaidProduct::where('brand', 'PBB') // Sesuaikan brand ini jika berbeda
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
     * Menangani permintaan inquiry (pengecekan tagihan) untuk PBB pascabayar.
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
            return response()->json(['message' => 'Produk PBB tidak tersedia atau tidak aktif untuk inquiry.'], 503);
        }

        $ref_id = 'pbb-' . substr(str_replace('-', '', Str::uuid()->toString()), 0, 15);
        $username = env('P_U');
        $apiKey = env('P_AK'); // Menggunakan API Key REAL
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
            Log::error('PBB Inquiry Error: ' . $e->getMessage(), ['customer_no' => $customerNo, 'sku' => $current_sku]);
            return response()->json(['message' => 'Terjadi kesalahan pada server provider.'], 500);
        }

        if (isset($responseData['data']) && $responseData['data']['status'] === 'Sukses') {
            $inquiryDataFromApi = $responseData['data'];

            if (!isset($inquiryDataFromApi['desc']) || !is_array($inquiryDataFromApi['desc'])) {
                $inquiryDataFromApi['desc'] = [];
            }

            $totalDenda = 0; // Sesuaikan jika API PBB memberikan denda
            $jumlahLembarTagihan = (int) ($inquiryDataFromApi['desc']['lembar_tagihan'] ?? 1); // Ambil dari desc, default 1

            // Untuk PBB, 'price' dan 'admin' dari root API response dianggap sebagai total tagihan dan total admin
            $pureBillPriceFromProvider = (float) ($inquiryDataFromApi['price'] ?? 0);
            $adminFromProvider = (float) ($inquiryDataFromApi['admin'] ?? 0);

            // 1. Hitung Diskon dasar per lembar berdasarkan komisi produk
            $commission = $product->commission ?? 0;
            $commission_sell_percentage = $product->commission_sell_percentage ?? 0;
            $commission_sell_fixed = $product->commission_sell_fixed ?? 0;
            $diskonPerLembar = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;

            // 2. Kalikan diskon per lembar dengan jumlah lembar tagihan
            $finalDiskon = $diskonPerLembar * $jumlahLembarTagihan;
            $finalDiskon = ceil($finalDiskon);

            // 3. Hitung Total Pembayaran Akhir (dengan Diskon)
            // selling_price = (price_dari_api_root) + (admin_dari_api_root) + total_denda - total_diskon_kita
            $finalSellingPrice = $pureBillPriceFromProvider + $adminFromProvider + $totalDenda - $finalDiskon;
            $finalSellingPrice = ceil($finalSellingPrice);

            // 4. Susun kembali data untuk dikirim ke frontend dan disimpan di sesi
            // 'price' dan 'admin' sudah sesuai dengan total dari provider
            $inquiryDataFromApi['price'] = $pureBillPriceFromProvider;
            $inquiryDataFromApi['admin'] = $adminFromProvider;
            $inquiryDataFromApi['denda'] = $totalDenda;
            $inquiryDataFromApi['diskon'] = $finalDiskon;
            $inquiryDataFromApi['jumlah_lembar_tagihan'] = $jumlahLembarTagihan;
            $inquiryDataFromApi['selling_price'] = $finalSellingPrice;
            $inquiryDataFromApi['buyer_sku_code'] = $current_sku;
            $inquiryDataFromApi['ref_id'] = $ref_id;

            // Hapus buyer_last_saldo sesuai permintaan
            unset($inquiryDataFromApi['buyer_last_saldo']);

            session(['postpaid_inquiry_data' => $inquiryDataFromApi]);
            return response()->json($inquiryDataFromApi);
        } else {
            $errorMessage = $responseData['data']['message'] ?? 'Gagal melakukan pengecekan tagihan PBB.';
            Log::warning("Inquiry PBB Gagal untuk SKU: {$current_sku}. Pesan: {$errorMessage}", ['response' => $responseData]);
            return response()->json(['message' => $errorMessage], 400);
        }
    }

    /**
     * Menangani permintaan pembayaran tagihan PBB pascabayar.
     */
    public function payment(Request $request)
    {
        $user = Auth::user();
        $inquiryData = session('postpaid_inquiry_data');

        if (!$inquiryData || $inquiryData['customer_no'] !== $request->customer_no) {
            return response()->json(['message' => 'Sesi tidak valid atau nomor pelanggan tidak cocok.'], 400);
        }

        $totalPriceToPay     = $inquiryData['selling_price'];
        $finalAdmin          = $inquiryData['admin']; // Admin dari inquiryData (sudah total dari provider)
        $pureBillPrice       = $inquiryData['price']; // Harga total dari inquiryData (sudah total dari provider)
        $diskon              = $inquiryData['diskon'] ?? 0;
        $jumlahLembarTagihan = $inquiryData['jumlah_lembar_tagihan'] ?? 0;
        $denda               = $inquiryData['denda'] ?? 0;

        if ($user->balance < $totalPriceToPay) {
            return response()->json(['message' => 'Saldo Anda tidak mencukupi.'], 402);
        }

        $user->decrement('balance', $totalPriceToPay);

        $initialData = $this->mapToUnifiedTransaction($inquiryData, 'PBB', $pureBillPrice, $finalAdmin);
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
        unset($initialData['buyer_last_saldo']); // Hapus buyer_last_saldo

        $unifiedTransaction = PostpaidTransaction::create($initialData);

        $apiResponseData = [];

        $username = env('P_U');
        $apiKey = env('P_AK'); // Menggunakan API Key REAL
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

            Log::info('PBB Payment API Response:', ['response_data' => $apiResponseData, 'transaction_id' => $unifiedTransaction->id]);

        } catch (\Exception $e) {
            $user->increment('balance', $totalPriceToPay);
            $errorMessage = ['status' => 'Gagal', 'message' => 'Gagal terhubung ke server provider.'];

            $unifiedTransaction->update(array_merge($errorMessage, ['rc' => null, 'sn' => null]));

            Log::error('PBB Payment Error: ' . $e->getMessage(), ['transaction_id' => $unifiedTransaction->id, 'inquiry_data' => $inquiryData]);
            return response()->json(['message' => 'Terjadi kesalahan pada server provider.'], 500);
        }

        $fullResponseData = array_merge($inquiryData, $apiResponseData);

        // Pastikan 'price' dan 'admin' di $fullResponseData konsisten dengan perhitungan total
        $fullResponseData['price'] = $pureBillPrice;
        $fullResponseData['admin'] = $finalAdmin;
        unset($fullResponseData['buyer_last_saldo']); // Hapus buyer_last_saldo

        $updatePayload = $this->mapToUnifiedTransaction($fullResponseData, 'PBB', $pureBillPrice, $finalAdmin);
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
        unset($updatePayload['buyer_last_saldo']); // Hapus buyer_last_saldo

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



// // >>>>>>>>>>>>>     TESTING PBB POSTPAID CONTROLLER      <<<<<<<<<<<<<<<<<<<<<<<

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

// class PascaPBBController extends Controller
// {
//     use TransactionMapper;

//     /**
//      * Menampilkan halaman pembayaran PBB pascabayar dengan daftar produk.
//      */
//     public function index()
//     {
//         $products = $this->fetchPBBProducts();
//         return Inertia::render('Pascabayar/PBB', [ // Sesuaikan path Inertia
//             'products' => $products,
//             'auth' => [
//                 'user' => Auth::user(),
//             ],
//         ]);
//     }

//     /**
//      * Mengambil daftar produk PBB pascabayar dari database lokal.
//      * Produk dengan status seller_product_status = false juga diambil
//      * agar bisa ditampilkan di frontend dengan indikator gangguan.
//      */
//     private function fetchPBBProducts()
//     {
//         $pbbProducts = PostpaidProduct::where('brand', 'PBB') // Sesuaikan brand ini jika berbeda
//                                            ->orderBy('product_name', 'asc')
//                                            ->get();

//         return $pbbProducts->map(function ($product) {
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
//      * Menangani permintaan inquiry (pengecekan tagihan) untuk PBB pascabayar.
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
//             return response()->json(['message' => 'Produk PBB tidak tersedia atau tidak aktif untuk inquiry.'], 503);
//         }

//         $ref_id = 'pbb-' . substr(str_replace('-', '', Str::uuid()->toString()), 0, 15);
//         $username = env('P_U');
//         $apiKey = env('P_AKD'); // Menggunakan API Key DUMMY
//         $sign = md5($username . $apiKey . $ref_id);

//         // --- START DUMMY RESPONSE INQUIRY ---
//         $specificDescData = [
//             "lembar_tagihan" => 1,
//             "alamat" => "KO. GRIYA ASRI CIPAGERAN",
//             "tahun_pajak" => "2019",
//             "kelurahan" => "CIPAGERAN",
//             "kecamatan" => "CIPAGERAN",
//             "kode_kab_kota" => "0023",
//             "kab_kota" => "PEMKOT CIMAHI",
//             "luas_tanah" => "113 M2",
//             "luas_gedung" => "47 M2"
//         ];

//         $dummyStatus = 'Sukses';
//         $dummyMessage = 'Inquiry PBB berhasil.';
//         $dummyCustomerName = 'Pelanggan PBB Dummy ' . substr($customerNo, 0, 4);
//         $dummyRootPrice = 99500; // Total nilai tagihan dari contoh respons
//         $dummyRootAdmin = 2500;  // Biaya admin dari contoh respons

//         $responseData = [
//             'data' => [
//                 'status' => $dummyStatus,
//                 'message' => $dummyMessage,
//                 'customer_name' => $dummyCustomerName,
//                 'customer_no' => $customerNo,
//                 'buyer_sku_code' => $current_sku,
//                 'price' => $dummyRootPrice,
//                 'admin' => $dummyRootAdmin,
//                 'rc' => '00',
//                 'sn' => 'SN-INQ-' . Str::random(12),
//                 'ref_id' => $ref_id,
//                 'desc' => $specificDescData,
//                 // 'buyer_last_saldo' tidak lagi disertakan sesuai permintaan
//             ],
//         ];
//         // --- END DUMMY RESPONSE INQUIRY ---

//         // >>>>>>>>>>>>>>>>> BAGIAN INI UNTUK PANGGILAN API ASLI JIKA SUDAH SIAP (dikomentari untuk testing) <<<<<<<<<<<<<<<<<
//         // try {
//         //     $response = Http::post(config('services.api_server') . '/v1/transaction', [
//         //         'commands' => 'inq-pasca',
//         //         'username' => $username,
//         //         'buyer_sku_code' => 'cimahi',
//         //         'customer_no' => $customerNo,
//         //         'ref_id' => $ref_id,
//         //         'sign' => $sign,
//         //         'testing' => true, // Menggunakan testing mode untuk dummy
//         //     ]);
//         //     $responseData = $response->json();
//         // } catch (\Exception $e) {
//         //     Log::error('PBB Inquiry Error: ' . $e->getMessage(), ['customer_no' => $customerNo, 'sku' => $current_sku]);
//         //     return response()->json(['message' => 'Terjadi kesalahan pada server provider.'], 500);
//         // }
//         // >>>>>>>>>>>>>>>>> AKHIR BAGIAN PANGGILAN API ASLI <<<<<<<<<<<<<<<<<


//         if (isset($responseData['data']) && $responseData['data']['status'] === 'Sukses') {
//             $inquiryDataFromApi = $responseData['data'];

//             if (!isset($inquiryDataFromApi['desc']) || !is_array($inquiryDataFromApi['desc'])) {
//                 $inquiryDataFromApi['desc'] = [];
//             }

//             $totalDenda = 0; // Sesuaikan jika API PBB memberikan denda
//             $jumlahLembarTagihan = (int) ($inquiryDataFromApi['desc']['lembar_tagihan'] ?? 1); // Ambil dari desc, default 1

//             // Untuk PBB, 'price' dan 'admin' dari root API response dianggap sebagai total tagihan dan total admin
//             $pureBillPriceFromProvider = (float) ($inquiryDataFromApi['price'] ?? 0);
//             $adminFromProvider = (float) ($inquiryDataFromApi['admin'] ?? 0);

//             // 1. Hitung Diskon dasar per lembar berdasarkan komisi produk
//             $commission = $product->commission ?? 0;
//             $commission_sell_percentage = $product->commission_sell_percentage ?? 0;
//             $commission_sell_fixed = $product->commission_sell_fixed ?? 0;
//             $diskonPerLembar = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;

//             // 2. Kalikan diskon per lembar dengan jumlah lembar tagihan
//             $finalDiskon = $diskonPerLembar * $jumlahLembarTagihan;
//             $finalDiskon = ceil($finalDiskon);

//             // 3. Hitung Total Pembayaran Akhir (dengan Diskon)
//             // selling_price = (price_dari_api_root) + (admin_dari_api_root) + total_denda - total_diskon_kita
//             $finalSellingPrice = $pureBillPriceFromProvider + $adminFromProvider + $totalDenda - $finalDiskon;
//             $finalSellingPrice = ceil($finalSellingPrice);

//             // 4. Susun kembali data untuk dikirim ke frontend dan disimpan di sesi
//             // 'price' dan 'admin' sudah sesuai dengan total dari provider
//             $inquiryDataFromApi['price'] = $pureBillPriceFromProvider;
//             $inquiryDataFromApi['admin'] = $adminFromProvider;
//             $inquiryDataFromApi['denda'] = $totalDenda;
//             $inquiryDataFromApi['diskon'] = $finalDiskon;
//             $inquiryDataFromApi['jumlah_lembar_tagihan'] = $jumlahLembarTagihan;
//             $inquiryDataFromApi['selling_price'] = $finalSellingPrice;
//             $inquiryDataFromApi['buyer_sku_code'] = $current_sku;
//             $inquiryDataFromApi['ref_id'] = $ref_id;

//             // Hapus buyer_last_saldo sesuai permintaan
//             unset($inquiryDataFromApi['buyer_last_saldo']);

//             session(['postpaid_inquiry_data' => $inquiryDataFromApi]);
//             return response()->json($inquiryDataFromApi);
//         } else {
//             $errorMessage = $responseData['data']['message'] ?? 'Gagal melakukan pengecekan tagihan dummy.';
//             Log::warning("Inquiry PBB Dummy Gagal untuk SKU: {$current_sku}. Pesan: {$errorMessage}", ['response' => $responseData]);
//             return response()->json(['message' => $errorMessage], 400);
//         }
//     }

//     /**
//      * Menangani permintaan pembayaran tagihan PBB pascabayar.
//      */
//     public function payment(Request $request)
//     {
//         $user = Auth::user();
//         $inquiryData = session('postpaid_inquiry_data');

//         if (!$inquiryData || $inquiryData['customer_no'] !== $request->customer_no) {
//             return response()->json(['message' => 'Sesi tidak valid atau nomor pelanggan tidak cocok.'], 400);
//         }

//         $totalPriceToPay     = $inquiryData['selling_price'];
//         $finalAdmin          = $inquiryData['admin']; // Admin dari inquiryData (sudah total dari provider)
//         $pureBillPrice       = $inquiryData['price']; // Harga total dari inquiryData (sudah total dari provider)
//         $diskon              = $inquiryData['diskon'] ?? 0;
//         $jumlahLembarTagihan = $inquiryData['jumlah_lembar_tagihan'] ?? 0;
//         $denda               = $inquiryData['denda'] ?? 0;

//         if ($user->balance < $totalPriceToPay) {
//             return response()->json(['message' => 'Saldo Anda tidak mencukupi.'], 402);
//         }

//         $user->decrement('balance', $totalPriceToPay);

//         $initialData = $this->mapToUnifiedTransaction($inquiryData, 'PBB', $pureBillPrice, $finalAdmin);
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
//         unset($initialData['buyer_last_saldo']); // Hapus buyer_last_saldo

//         $unifiedTransaction = PostpaidTransaction::create($initialData);

//         // --- START DUMMY RESPONSE PAYMENT ---
//         $apiResponseData = [
//             'status' => 'Sukses',
//             'message' => 'Pembayaran PBB dummy berhasil diproses.',
//             'rc' => '00',
//             'sn' => 'SN-PBB-' . Str::random(15),
//             'customer_name' => $inquiryData['customer_name'],
//             'customer_no' => $inquiryData['customer_no'],
//             'buyer_sku_code' => $inquiryData['buyer_sku_code'],
//             'price' => $pureBillPrice, // Gunakan harga total dari inquiryData
//             'admin' => $finalAdmin, // Gunakan admin total dari inquiryData
//             'ref_id' => $inquiryData['ref_id'],
//             // 'buyer_last_saldo' tidak lagi disertakan sesuai permintaan
//         ];
//         // --- END DUMMY RESPONSE PAYMENT ---

//         Log::info('PBB Payment Dummy Response:', ['response_data' => $apiResponseData, 'transaction_id' => $unifiedTransaction->id]);

//         // >>>>>>>>>>>>>>>>> BAGIAN INI UNTUK PANGGILAN API ASLI JIKA SUDAH SIAP (dikomentari untuk testing) <<<<<<<<<<<<<<<<<
//         // $username = env('P_U');
//         // $apiKey = env('P_AKD'); // Pastikan ini API Key DUMMY jika mode testing
//         // $sign = md5($username . $apiKey . $inquiryData['ref_id']);
//         // try {
//         //     $response = Http::post(config('services.api_server') . '/v1/transaction', [
//         //         'commands' => 'pay-pasca',
//         //         'username' => $username,
//         //         'buyer_sku_code' => $inquiryData['buyer_sku_code'],
//         //         'customer_no' => $inquiryData['customer_no'],
//         //         'ref_id' => $inquiryData['ref_id'],
//         //         'sign' => $sign,
//         //         'testing' => true, // Menggunakan testing mode untuk dummy
//         //     ]);
//         //     $apiResponseData = $response->json()['data'];
//         // } catch (\Exception $e) {
//         //     $user->increment('balance', $totalPriceToPay);
//         //     $errorMessage = ['status' => 'Gagal', 'message' => 'Gagal terhubung ke server provider.'];
//         //     $unifiedTransaction->update(array_merge($errorMessage, ['rc' => null, 'sn' => null]));
//         //     Log::error('PBB Payment Error: ' . $e->getMessage(), ['transaction_id' => $unifiedTransaction->id, 'inquiry_data' => $inquiryData]);
//         //     return response()->json(['message' => 'Terjadi kesalahan pada server provider.'], 500);
//         // }
//         // >>>>>>>>>>>>>>>>> AKHIR BAGIAN PANGGILAN API ASLI <<<<<<<<<<<<<<<<<


//         $fullResponseData = array_merge($inquiryData, $apiResponseData);

//         // Pastikan 'price' dan 'admin' di $fullResponseData konsisten dengan perhitungan total
//         $fullResponseData['price'] = $pureBillPrice;
//         $fullResponseData['admin'] = $finalAdmin;
//         unset($fullResponseData['buyer_last_saldo']); // Hapus buyer_last_saldo

//         $updatePayload = $this->mapToUnifiedTransaction($fullResponseData, 'PBB', $pureBillPrice, $finalAdmin);
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
//         unset($updatePayload['buyer_last_saldo']); // Hapus buyer_last_saldo

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