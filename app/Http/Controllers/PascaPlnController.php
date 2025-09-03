<?php

// namespace App\Http\Controllers;

// use App\Models\PascaPln;        
// use App\Models\PostpaidProduct;
// use App\Models\PostpaidTransaction;
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Auth;
// use Illuminate\Support\Facades\Http;
// use Illuminate\Support\Facades\Log;
// use Illuminate\Support\Str;
// use Inertia\Inertia;

// class PascaPlnController extends Controller
// {
//     /**
//      * Menampilkan halaman pembayaran PLN dengan daftar produk.
//      */
//     public function index()
//     {
//         $products = $this->fetchPlnProducts();
//         return Inertia::render('Pascabayar/Pln', [
//             'products' => $products,
//         ]);
//     }

//     /**
//      * Mengambil daftar produk PLN dari database lokal.
//      */
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

// private function calculateAdminFee($product)
//     {
//         $commission = $product->commission ?? 0;
//         $commission_sell_percentage = $product->commission_sell_percentage ?? 0;
//         $commission_sell_fixed = $product->commission_sell_fixed ?? 0;
//         $originalAdmin = $product->admin ?? 0;
//         $markup = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;
//         return $originalAdmin - $markup;
//     }

//     /**
//      * Menangani permintaan cek tagihan (inquiry) PLN.
//      */
//     public function inquiry(Request $request)
//     {
//         // Validasi hanya nomor pelanggan, SKU tidak lagi dari frontend.
//         $request->validate(['customer_no' => 'required|string|min:10']);

//         // --- LOGIKA OTOMATISASI SKU ---
//         // 1. Ambil semua produk PLN yang aktif dari DB, urutkan secara alfanumerik.
//         $availableProducts = PostpaidProduct::where('brand', 'PLN PASCABAYAR')
//                                             ->where('seller_product_status', true)
//                                             ->orderBy('buyer_sku_code', 'asc')
//                                             ->get();

//         if ($availableProducts->isEmpty()) {
//             return response()->json(['message' => 'Layanan PLN Pascabayar tidak tersedia saat ini.'], 503);
//         }

//         $successfulInquiryData = null;
//         $lastErrorMessage = 'Gagal melakukan pengecekan tagihan setelah mencoba semua provider.';

//         // 2. Loop melalui setiap produk yang tersedia dan coba lakukan inquiry.
//         foreach ($availableProducts as $product) {
//             $current_sku = $product->buyer_sku_code;
//             $ref_id = 'pln-' . Str::uuid();
//             $username = env('P_U');
//             $apiKey = env('P_AK');
//             $sign = md5($username . $apiKey . $ref_id);

//             try {
//                 // ================== SIMULASI API CALL ==================
//                 // Di sini Anda akan mengganti dengan panggilan API asli Anda
// $dummyResponseData = [
//                 'data' => [
//                     'ref_id' => $ref_id,
//                     'customer_no' => $request->customer_no,
//                     'customer_name' => 'PELANGGAN PLN DUMMY',
//                     'buyer_sku_code' => $current_sku, // BENAR: Menggunakan SKU yang berhasil dari loop
//                     'admin' => 3000,
//                     'message' => 'INQUIRY SUKSES (SIMULASI)',
//                     'status' => 'Sukses',
//                     'rc' => '00',
//                     'price' => 153000,
//                     'selling_price' => 153000,
//                     'desc' => [
//                         'tarif' => 'R1',
//                         'daya' => '1300',
//                         'lembar_tagihan' => 1,
//                         'detail' => [
//                         [
//                         'periode' => '202508',
//                         'nilai_tagihan' => '150000',
//                         'admin' => '3000', // Umumnya ada juga di detail
//                         'denda' => '500',
//                         'meter_awal' => '00123450',
//                         'meter_akhir' => '00124550'
//                     ]
//                         ]
//                     ]
//                 ]
//             ];
//             $responseData = $dummyResponseData;
//                 // ================== AKHIR SIMULASI ==================

//                 if (isset($responseData['data']) && $responseData['data']['status'] === 'Sukses') {
//                     // Jika sukses, hitung ulang admin, simpan hasilnya, dan HENTIKAN LOOP.
//                     $calculatedAdmin = $this->calculateAdminFee($product);
//                     $inquiryDataFromApi = $responseData['data'];
                    
//                     $apiPrice = $inquiryDataFromApi['price'];
//                     $apiAdmin = $inquiryDataFromApi['admin'];
//                     $finalPrice = ($apiPrice - $apiAdmin) + $calculatedAdmin;

//                     $inquiryDataFromApi['admin'] = $calculatedAdmin;
//                     $inquiryDataFromApi['price'] = $finalPrice;
//                     $inquiryDataFromApi['selling_price'] = $finalPrice;
                    
//                     $successfulInquiryData = $inquiryDataFromApi;
//                     break; // KELUAR DARI LOOP KARENA SUDAH BERHASIL
//                 } else {
//                     // Jika API merespons gagal (misal: "produk sedang gangguan")
//                     $lastErrorMessage = $responseData['data']['message'] ?? 'Provider sedang sibuk.';
//                     Log::warning("Inquiry PLN Gagal untuk SKU: {$current_sku}. Pesan: {$lastErrorMessage}");
//                 }

//             } catch (\Exception $e) {
//                 // Jika terjadi error koneksi atau lainnya
//                 $lastErrorMessage = 'Gagal terhubung ke server provider.';
//                 Log::error("Inquiry PLN Error untuk SKU: {$current_sku}. Error: " . $e->getMessage());
//                 continue; // Lanjut ke SKU berikutnya
//             }
//         }

//         // 3. Setelah loop selesai, periksa hasilnya.
//         if ($successfulInquiryData) {
//             session(['pln_inquiry_data' => $successfulInquiryData]);
//             return response()->json($successfulInquiryData);
//         } else {
//             return response()->json(['message' => $lastErrorMessage], 400);
//         }
//     }

//     /**
//      * Menangani permintaan pembayaran tagihan PLN dengan metode DUAL WRITE.
//      */
//     public function payment(Request $request)
//     {
//         $user = Auth::user();
//         $inquiryData = session('pln_inquiry_data');

//         if (!$inquiryData) {
//             return response()->json(['message' => 'Sesi pengecekan tagihan tidak ditemukan.'], 400);
//         }
//         if ($inquiryData['customer_no'] !== $request->customer_no) {
//              return response()->json(['message' => 'Nomor pelanggan tidak cocok.'], 400);
//         }

//         $totalPrice = $inquiryData['price'];
//         if ($user->balance < $totalPrice) {
//             return response()->json(['message' => 'Saldo Anda tidak mencukupi.'], 402);
//         }

//         $user->decrement('balance', $totalPrice);
        
//         // --- LOGIKA DUAL WRITE DIMULAI ---

//         // 2. Buat record di tabel LAMA (pasca_plns) untuk backward compatibility
//         $legacyTransaction = PascaPln::create([
//             'user_id' => $user->id,
//             'ref_id' => $inquiryData['ref_id'],
//             'customer_no' => $inquiryData['customer_no'],
//             'customer_name' => $inquiryData['customer_name'],
//             'buyer_sku_code' => $inquiryData['buyer_sku_code'],
//             'price' => $inquiryData['price'],
//             'selling_price' => $inquiryData['selling_price'],
//             'admin_fee' => $inquiryData['admin'],
//             'status' => 'Pending',
//             'message' => 'Menunggu konfirmasi pembayaran dari provider',
//             'tarif' => $inquiryData['desc']['tarif'] ?? null,
//             'daya' => $inquiryData['desc']['daya'] ?? null,
//             'lembar_tagihan' => $inquiryData['desc']['lembar_tagihan'] ?? null,
//             'bill_details' => $inquiryData['desc']['detail'] ?? [],
//         ]);

//         // 3. Siapkan array untuk kolom 'details' di tabel BARU
//         $transactionDetails = [
//             'tarif' => $inquiryData['desc']['tarif'] ?? null,
//             'daya' => $inquiryData['desc']['daya'] ?? null,
//             'lembar_tagihan' => $inquiryData['desc']['lembar_tagihan'] ?? null,
//             'bill_details' => $inquiryData['desc']['detail'] ?? [],
//         ];

//         // 4. Buat record di tabel BARU (postpaid_transactions)
//         $unifiedTransaction = PostpaidTransaction::create([ 
//             'user_id' => $user->id,
//             'ref_id' => $inquiryData['ref_id'],
//             'type' => 'PLN',
//             'customer_no' => $inquiryData['customer_no'],
//             'customer_name' => $inquiryData['customer_name'],
//             'buyer_sku_code' => $inquiryData['buyer_sku_code'],
//             'price' => $inquiryData['price'],
//             'selling_price' => $inquiryData['selling_price'],
//             'admin_fee' => $inquiryData['admin'], 
//             'status' => 'Pending',
//             'message' => 'Menunggu konfirmasi pembayaran dari provider',
//             'details' => $transactionDetails,
//         ]);

//         $username = env('P_U');
//         $apiKey = env('P_AK');
//         $sign = md5($username . $apiKey . $inquiryData['ref_id']);

//         try {
//             // ================== PANGGILAN API ASLI (DIKOMENTARI) ==================
//             /*
//             $response = Http::post(config('services.api_server') . '/v1/transaction', [
//                 'commands' => 'pay-pasca',
//                 'username' => $username,
//                 'buyer_sku_code' => $inquiryData['buyer_sku_code'],
//                 'customer_no' => $inquiryData['customer_no'],
//                 'ref_id' => $inquiryData['ref_id'],
//                 'sign' => $sign,
//                 'testing' => true,
//             ]);
//             $apiResponseData = $response->json()['data'];
//             */

//             // ================== SIMULASI DATA DUMMY ==================
//             $dummyPaymentResponseData = [
//                 'sn' => 'DUMMYSN-PLN-'.strtoupper(Str::random(10)),
//                 'status' => 'Sukses',
//                 'rc' => '00',
//                 'message' => 'PEMBAYARAN PLN SUKSES (SIMULASI)',
//             ];
//             $responseData = array_merge($inquiryData, $dummyPaymentResponseData);
//             // ================== AKHIR SIMULASI ==================

            
//             // --- DUAL UPDATE ---
//             $updateData = [
//                 'status' => $responseData['status'],
//                 'sn' => $responseData['sn'] ?? null,
//                 'rc' => $responseData['rc'],
//                 'message' => $responseData['message'],
//             ];
            
//             // 5. Update status transaksi di kedua tabel
//             $legacyTransaction->update($updateData);
//             $unifiedTransaction->update($updateData);

//             if ($responseData['status'] === 'Gagal') {
//                 $user->increment('balance', $totalPrice);
//             }

//             session()->forget('pln_inquiry_data');
//             return response()->json($responseData);

//         } catch (\Exception $e) {
//             $user->increment('balance', $totalPrice);
//             // Update kedua tabel menjadi Gagal jika terjadi error
//             $errorMessage = ['status' => 'Gagal', 'message' => 'Gagal terhubung ke server provider.'];
//             $legacyTransaction->update($errorMessage);
//             $unifiedTransaction->update($errorMessage);

//             Log::error('PLN Payment Error: ' . $e->getMessage());
//             return response()->json(['message' => 'Terjadi kesalahan pada server provider.'], 500);
//         }
//     }
// }



















// namespace App\Http\Controllers;

// use App\Models\PascaPln;
// use App\Models\PostpaidProduct;
// use App\Models\PostpaidTransaction;
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Auth;
// use Illuminate\Support\Facades\Http;
// use Illuminate\Support\Facades\Log;
// use Illuminate\Support\Str;
// use Inertia\Inertia;

// class PascaPlnController extends Controller
// {
//     /**
//      * Menampilkan halaman pembayaran PLN dengan daftar produk.
//      */
//     public function index()
//     {
//         $products = $this->fetchPlnProducts();
//         return Inertia::render('Pascabayar/Pln', [
//             'products' => $products,
//         ]);
//     }

//     /**
//      * Mengambil daftar produk PLN dari database lokal.
//      */
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
//      * Menghitung biaya admin yang disesuaikan untuk klien.
//      */
//     private function calculateAdminFee($product)
//     {
//         $commission = $product->commission ?? 0;
//         $commission_sell_percentage = $product->commission_sell_percentage ?? 0;
//         $commission_sell_fixed = $product->commission_sell_fixed ?? 0;
//         $originalAdmin = $product->admin ?? 0;
//         $markup = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;
//         return $originalAdmin - $markup;
//     }

//     /**
//      * Menangani permintaan cek tagihan (inquiry) PLN.
//      */
//     public function inquiry(Request $request)
//     {
//         $request->validate(['customer_no' => 'required|string|min:10']);

//         $availableProducts = PostpaidProduct::where('brand', 'PLN PASCABAYAR')
//                                             ->where('seller_product_status', true)
//                                             ->orderBy('buyer_sku_code', 'asc')
//                                             ->get();

//         if ($availableProducts->isEmpty()) {
//             return response()->json(['message' => 'Layanan PLN Pascabayar tidak tersedia saat ini.'], 503);
//         }

//         $successfulInquiryData = null;
//         $lastErrorMessage = 'Gagal melakukan pengecekan tagihan setelah mencoba semua provider.';

//         foreach ($availableProducts as $product) {
//             $current_sku = $product->buyer_sku_code;
//             $ref_id = 'pln-' . Str::uuid();
//             $username = env('P_U');
//             $apiKey = env('P_AK');
//             $sign = md5($username . $apiKey . $ref_id);

//             try {
//                 // ================== PANGGILAN API ASLI (UPDATED) ==================
//                 $response = Http::post(config('services.api_server') . '/v1/transaction', [
//                     'commands' => 'inq-pasca', // Diperbarui sesuai spesifikasi
//                     'username' => $username,
//                     'buyer_sku_code' => $current_sku,
//                     'customer_no' => $request->customer_no,
//                     'ref_id' => $ref_id,
//                     'sign' => $sign,
//                     'testing' => true, 
//                 ]);
                
//                 $responseData = $response->json();
//                 // ================== AKHIR PANGGILAN API ==================

//                 if (isset($responseData['data']) && $responseData['data']['status'] === 'Sukses') {
//                     $calculatedAdmin = $this->calculateAdminFee($product);
//                     $inquiryDataFromApi = $responseData['data'];
                    
//                     $apiPrice = $inquiryDataFromApi['price'];
//                     $apiAdmin = $inquiryDataFromApi['admin'];
//                     $finalPrice = ($apiPrice - $apiAdmin) + $calculatedAdmin;

//                     $inquiryDataFromApi['admin'] = $calculatedAdmin;
//                     $inquiryDataFromApi['price'] = $finalPrice;
//                     $inquiryDataFromApi['selling_price'] = $finalPrice;
//                     $inquiryDataFromApi['buyer_sku_code'] = $current_sku;
                    
//                     $successfulInquiryData = $inquiryDataFromApi;
//                     break;
//                 } else {
//                     $lastErrorMessage = $responseData['data']['message'] ?? 'Provider sedang sibuk.';
//                     Log::warning("Inquiry PLN Gagal untuk SKU: {$current_sku}. Pesan: {$lastErrorMessage}");
//                 }

//             } catch (\Exception $e) {
//                 $lastErrorMessage = 'Gagal terhubung ke server provider.';
//                 Log::error("Inquiry PLN Error untuk SKU: {$current_sku}. Error: " . $e->getMessage());
//                 continue;
//             }
//         }

//         if ($successfulInquiryData) {
//             session(['pln_inquiry_data' => $successfulInquiryData]);
//             return response()->json($successfulInquiryData);
//         } else {
//             return response()->json(['message' => $lastErrorMessage], 400);
//         }
//     }

//     /**
//      * Menangani permintaan pembayaran tagihan PLN dengan metode DUAL WRITE.
//      */
//     public function payment(Request $request)
//     {
//         $user = Auth::user();
//         $inquiryData = session('pln_inquiry_data');

//         if (!$inquiryData) {
//             return response()->json(['message' => 'Sesi pengecekan tagihan tidak ditemukan.'], 400);
//         }
//         if ($inquiryData['customer_no'] !== $request->customer_no) {
//              return response()->json(['message' => 'Nomor pelanggan tidak cocok.'], 400);
//         }

//         $totalPrice = $inquiryData['price'];
//         if ($user->balance < $totalPrice) {
//             return response()->json(['message' => 'Saldo Anda tidak mencukupi.'], 402);
//         }

//         $user->decrement('balance', $totalPrice);
        
//         // --- LOGIKA DUAL WRITE ---
//         $legacyTransaction = PascaPln::create([
//             'user_id' => $user->id, 'ref_id' => $inquiryData['ref_id'], 'customer_no' => $inquiryData['customer_no'],
//             'customer_name' => $inquiryData['customer_name'], 'buyer_sku_code' => $inquiryData['buyer_sku_code'],
//             'price' => $inquiryData['price'], 'selling_price' => $inquiryData['selling_price'], 'admin_fee' => $inquiryData['admin'],
//             'status' => 'Pending', 'message' => 'Menunggu konfirmasi pembayaran dari provider',
//             'tarif' => $inquiryData['desc']['tarif'] ?? null, 'daya' => $inquiryData['desc']['daya'] ?? null,
//             'lembar_tagihan' => $inquiryData['desc']['lembar_tagihan'] ?? null, 'bill_details' => $inquiryData['desc']['detail'] ?? [],
//         ]);

//         $transactionDetails = [
//             'tarif' => $inquiryData['desc']['tarif'] ?? null, 'daya' => $inquiryData['desc']['daya'] ?? null,
//             'lembar_tagihan' => $inquiryData['desc']['lembar_tagihan'] ?? null, 'bill_details' => $inquiryData['desc']['detail'] ?? [],
//         ];

//         $unifiedTransaction = PostpaidTransaction::create([ 
//             'user_id' => $user->id, 'ref_id' => $inquiryData['ref_id'], 'type' => 'PLN', 'customer_no' => $inquiryData['customer_no'],
//             'customer_name' => $inquiryData['customer_name'], 'buyer_sku_code' => $inquiryData['buyer_sku_code'],
//             'price' => $inquiryData['price'], 'selling_price' => $inquiryData['selling_price'], 'admin_fee' => $inquiryData['admin'], 
//             'status' => 'Pending', 'message' => 'Menunggu konfirmasi pembayaran dari provider', 'details' => $transactionDetails,
//         ]);

//         $username = env('P_U');
//         $apiKey = env('P_AK');
//         $sign = md5($username . $apiKey . $inquiryData['ref_id']);

//         try {
//             // ================== PANGGILAN API ASLI (UPDATED) ==================
//             $response = Http::post(config('services.api_server') . '/v1/transaction', [
//                 'commands' => 'pay-pasca', // Diperbarui sesuai spesifikasi
//                 'username' => $username,
//                 'buyer_sku_code' => $inquiryData['buyer_sku_code'],
//                 'customer_no' => $inquiryData['customer_no'],
//                 'ref_id' => $inquiryData['ref_id'],
//                 'sign' => $sign,
//                 'testing' => true, // Tetap testing true sesuai permintaan sebelumnya
//             ]);
//             $apiResponseData = $response->json()['data'];
//             // ================== AKHIR PANGGILAN API ==================
            
//             $responseData = array_merge($inquiryData, $apiResponseData);

//             $updateData = [
//                 'status' => $responseData['status'], 'sn' => $responseData['sn'] ?? null,
//                 'rc' => $responseData['rc'], 'message' => $responseData['message'],
//             ];
            
//             $legacyTransaction->update($updateData);
//             $unifiedTransaction->update($updateData);

//             if ($responseData['status'] === 'Gagal') {
//                 $user->increment('balance', $totalPrice);
//             }

//             session()->forget('pln_inquiry_data');
//             return response()->json($responseData);

//         } catch (\Exception $e) {
//             $user->increment('balance', $totalPrice);
//             $errorMessage = ['status' => 'Gagal', 'message' => 'Gagal terhubung ke server provider.'];
//             $legacyTransaction->update($errorMessage);
//             $unifiedTransaction->update($errorMessage);

//             Log::error('PLN Payment Error: ' . $e->getMessage());
//             return response()->json(['message' => 'Terjadi kesalahan pada server provider.'], 500);
//         }
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
use App\Http\Traits\TransactionMapper; // Pastikan Trait ini ada

class PascaPlnController extends Controller
{
    use TransactionMapper;

    /**
     * Menampilkan halaman pembayaran PLN dengan daftar produk.
     */
    public function index()
    {
        $products = $this->fetchPlnProducts();
        return Inertia::render('Pascabayar/Pln', [
            'products' => $products,
        ]);
    }

    /**
     * Mengambil daftar produk PLN dari database lokal dan menghitung admin untuk frontend.
     */
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
     * Menghitung biaya admin final yang akan disimpan dan ditampilkan ke user.
     */
    private function calculateAdminFee($product)
    {
        $commission = $product->commission ?? 0;
        $commission_sell_percentage = $product->commission_sell_percentage ?? 0;
        $commission_sell_fixed = $product->commission_sell_fixed ?? 0;
        $originalAdmin = $product->admin ?? 0;
        $markup = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;
        return $originalAdmin - $markup;
    }

    /**
     * Menangani permintaan cek tagihan (inquiry) PLN.
     */
    public function inquiry(Request $request)
    {
        $request->validate(['customer_no' => 'required|string|min:10']);

        $availableProducts = PostpaidProduct::where('brand', 'PLN PASCABAYAR')
                                            ->where('seller_product_status', true)
                                            ->orderBy('buyer_sku_code', 'asc')
                                            ->get();

        if ($availableProducts->isEmpty()) {
            return response()->json(['message' => 'Layanan PLN Pascabayar tidak tersedia saat ini.'], 503);
        }

        $successfulInquiryData = null;
        $lastErrorMessage = 'Gagal melakukan pengecekan tagihan setelah mencoba semua provider.';

        foreach ($availableProducts as $product) {
            $current_sku = $product->buyer_sku_code;
            $ref_id = 'pln-' . Str::uuid();
            $username = env('P_U');
            $apiKey = env('P_AK');
            $sign = md5($username . $apiKey . $ref_id);

            try {
                $response = Http::post(config('services.api_server') . '/v1/transaction', [
                    'commands' => 'inq-pasca',
                    'username' => $username,
                    'buyer_sku_code' => $current_sku,
                    'customer_no' => $request->customer_no,
                    'ref_id' => $ref_id,
                    'sign' => $sign,
                    'testing' => true, 
                ]);
                
                $responseData = $response->json();

                if (isset($responseData['data']) && $responseData['data']['status'] === 'Sukses') {
                    $calculatedAdmin = $this->calculateAdminFee($product);
                    $inquiryDataFromApi = $responseData['data'];
                    
                    $apiPrice = $inquiryDataFromApi['price'];
                    $apiAdmin = $inquiryDataFromApi['admin'];
                    $finalPrice = ($apiPrice - $apiAdmin) + $calculatedAdmin;

                    $inquiryDataFromApi['admin'] = $calculatedAdmin;
                    $inquiryDataFromApi['price'] = $finalPrice;
                    $inquiryDataFromApi['selling_price'] = $finalPrice;
                    $inquiryDataFromApi['buyer_sku_code'] = $current_sku;
                    
                    $successfulInquiryData = $inquiryDataFromApi;
                    break; // Hentikan loop jika berhasil
                } else {
                    $lastErrorMessage = $responseData['data']['message'] ?? 'Provider sedang sibuk.';
                    Log::warning("Inquiry PLN Gagal untuk SKU: {$current_sku}. Pesan: {$lastErrorMessage}");
                }

            } catch (\Exception $e) {
                $lastErrorMessage = 'Gagal terhubung ke server provider.';
                Log::error("Inquiry PLN Error untuk SKU: {$current_sku}. Error: " . $e->getMessage());
                continue; // Lanjut ke SKU berikutnya
            }
        }

        if ($successfulInquiryData) {
            // Gunakan session key yang generik
            session(['postpaid_inquiry_data' => $successfulInquiryData]);
            return response()->json($successfulInquiryData);
        } else {
            return response()->json(['message' => $lastErrorMessage], 400);
        }
    }

    /**
     * Menangani permintaan pembayaran tagihan PLN.
     */
    public function payment(Request $request)
    {
        $user = Auth::user();
        // Gunakan session key yang generik
        $inquiryData = session('postpaid_inquiry_data');

        if (!$inquiryData || $inquiryData['customer_no'] !== $request->customer_no) {
            return response()->json(['message' => 'Sesi tidak valid atau nomor pelanggan tidak cocok.'], 400);
        }

        $totalPrice = $inquiryData['price'];
        $finalAdmin = $inquiryData['admin'];

        if ($user->balance < $totalPrice) {
            return response()->json(['message' => 'Saldo Anda tidak mencukupi.'], 402);
        }

        // 1. Kurangi saldo user terlebih dahulu
        $user->decrement('balance', $totalPrice);

        // 2. Buat transaksi awal di tabel terpadu dengan status 'Pending'
        $initialData = $this->mapToUnifiedTransaction($inquiryData, 'PLN', $totalPrice, $finalAdmin);
        $initialData['status'] = 'Pending';
        $initialData['message'] = 'Menunggu konfirmasi pembayaran dari provider';
        $unifiedTransaction = PostpaidTransaction::create($initialData);

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
                'testing' => true,
            ]);
            $apiResponseData = $response->json()['data'];

            // Gabungkan data inquiry dengan data respons pembayaran untuk mendapatkan data lengkap
            $fullResponseData = array_merge($inquiryData, $apiResponseData);

            // 3. Gunakan mapper lagi untuk menghasilkan data update yang lengkap
            $updatePayload = $this->mapToUnifiedTransaction($fullResponseData, 'PLN', $totalPrice, $finalAdmin);
            
            // Hapus atribut yang tidak boleh diubah saat update
            unset($updatePayload['user_id'], $updatePayload['ref_id'], $updatePayload['type'], $updatePayload['price'], $updatePayload['admin_fee']);
            
            // 4. Update transaksi yang sudah ada
            $unifiedTransaction->update($updatePayload);

            if ($updatePayload['status'] === 'Gagal') {
                $user->increment('balance', $totalPrice); // Kembalikan saldo jika gagal
            }

            session()->forget('postpaid_inquiry_data');
            return response()->json($fullResponseData);

        } catch (\Exception $e) {
            $user->increment('balance', $totalPrice);
            $errorMessage = ['status' => 'Gagal', 'message' => 'Gagal terhubung ke server provider.'];
            $unifiedTransaction->update($errorMessage);
            Log::error('PLN Payment Error: ' . $e->getMessage());
            return response()->json(['message' => 'Terjadi kesalahan pada server provider.'], 500);
        }
    }
}