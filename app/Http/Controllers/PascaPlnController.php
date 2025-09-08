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

class PascaPlnController extends Controller
{
    use TransactionMapper;

    // Fungsi index() dan fetchPlnProducts() tidak berubah
    public function index()
    {
        $products = $this->fetchPlnProducts();
        return Inertia::render('Pascabayar/Pln', [
            'products' => $products,
        ]);
    }

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

    // Metode getDummyInquiryResponse telah dihapus

    public function inquiry(Request $request)
    {
        $request->validate(['customer_no' => 'required|string|min:10']);
        $customerNo = $request->customer_no;

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
            $responseData = [];

            // Logika asli: Panggil API provider
            $ref_id = 'pln-' . substr(str_replace('-', '', Str::uuid()->toString()), 0, 15);
            $username = env('P_U');
            $apiKey = env('P_AKD');
            $sign = md5($username . $apiKey . $ref_id);

            try {
                $response = Http::post(config('services.api_server') . '/v1/transaction', [
                    'commands' => 'inq-pasca', 'username' => $username, 'buyer_sku_code' => $current_sku,
                    'customer_no' => $customerNo, 'ref_id' => $ref_id, 'sign' => $sign, 'testing' => true,
                ]);
                $responseData = $response->json();
            } catch (\Exception $e) {
                $lastErrorMessage = 'Gagal terhubung ke server provider.';
                Log::error("Inquiry PLN Error untuk SKU: {$current_sku}. Error: " . $e->getMessage());
                continue; // Coba provider berikutnya
            }
            
            // Logika pemrosesan respons
            if (isset($responseData['data']) && $responseData['data']['status'] === 'Sukses') {
                $inquiryDataFromApi = $responseData['data'];
                
                // Inisialisasi variabel perhitungan
                $totalNilaiTagihan = 0;
                $totalDenda = 0;
                $totalAdminFromDetails = 0; // Akumulasi admin dari setiap detail
                $jumlahLembarTagihan = 0;

                // --- PENTING: Prioritas Ambil jumlah lembar tagihan dari 'desc.lembar_tagihan' ---
                if (isset($inquiryDataFromApi['desc']['lembar_tagihan'])) {
                    $jumlahLembarTagihan = (int) $inquiryDataFromApi['desc']['lembar_tagihan'];
                } elseif (isset($inquiryDataFromApi['desc']['detail']) && is_array($inquiryDataFromApi['desc']['detail'])) {
                    // Fallback ke count detail jika 'lembar_tagihan' tidak ada
                    $jumlahLembarTagihan = count($inquiryDataFromApi['desc']['detail']);
                } else {
                    $jumlahLembarTagihan = 1; // Default ke 1 jika tidak ditemukan sama sekali
                }

                // Akumulasikan nilai tagihan, denda, dan admin dari detail
                if (isset($inquiryDataFromApi['desc']['detail']) && is_array($inquiryDataFromApi['desc']['detail'])) {
                    foreach ($inquiryDataFromApi['desc']['detail'] as $detail) {
                        $totalNilaiTagihan += (float) ($detail['nilai_tagihan'] ?? 0);
                        $totalDenda += (float) ($detail['denda'] ?? 0); 
                        $totalAdminFromDetails += (float) ($detail['admin'] ?? 0); // Akumulasi admin dari detail
                    }
                } else {
                    // Fallback jika tidak ada detail
                    $totalNilaiTagihan = (float) ($inquiryDataFromApi['price'] ?? 0);
                    $totalDenda = (float) ($inquiryDataFromApi['desc']['denda'] ?? 0); 
                    // Jika tidak ada detail, kita asumsikan 'admin' di root adalah total admin.
                    $totalAdminFromDetails = (float) ($inquiryDataFromApi['admin'] ?? 0);
                }

                // --- PENTING: Set $inquiryDataFromApi['admin'] menjadi total admin dari details ---
                // Ini akan menjadi nilai 'admin_fee' yang diinginkan (total admin dari tiap lembar tagihan).
                $inquiryDataFromApi['admin'] = $totalAdminFromDetails; 
                
                // 1. Hitung Diskon dasar per lembar berdasarkan komisi produk
                $commission = $product->commission ?? 0;
                $commission_sell_percentage = $product->commission_sell_percentage ?? 0;
                $commission_sell_fixed = $product->commission_sell_fixed ?? 0;
                $diskonPerLembar = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;

                // 2. Kalikan diskon per lembar dengan jumlah lembar tagihan
                $finalDiskon = $diskonPerLembar * $jumlahLembarTagihan;

                // 3. Hitung Total Pembayaran Akhir (dengan Diskon)
                // selling_price = price + admin_fee (total dari detail) + total denda - total diskon
                $finalSellingPrice = $totalNilaiTagihan + $totalAdminFromDetails + $totalDenda - $finalDiskon;

                // 4. Susun kembali data untuk dikirim ke frontend dan disimpan di sesi
                $inquiryDataFromApi['price']         = $totalNilaiTagihan; // Nilai tagihan murni (total dari detail)
                // $inquiryDataFromApi['admin'] sudah diset ke $totalAdminFromDetails di atas
                $inquiryDataFromApi['denda']         = $totalDenda; // Total denda dari detail
                $inquiryDataFromApi['diskon']        = $finalDiskon; // Simpan diskon yang sudah dikalikan
                $inquiryDataFromApi['jumlah_lembar_tagihan'] = $jumlahLembarTagihan; // Jumlah lembar tagihan
                $inquiryDataFromApi['selling_price'] = $finalSellingPrice; // Total yang harus dibayar pelanggan
                $inquiryDataFromApi['buyer_sku_code'] = $current_sku;
                
                $successfulInquiryData = $inquiryDataFromApi;
                break; // Hentikan loop jika ada yang sukses
            } else {
                $lastErrorMessage = $responseData['data']['message'] ?? 'Provider sedang sibuk.';
                Log::warning("Inquiry PLN Gagal untuk SKU: {$current_sku}. Pesan: {$lastErrorMessage}");
            }
        }

        if ($successfulInquiryData) {
            session(['postpaid_inquiry_data' => $successfulInquiryData]);
            return response()->json($successfulInquiryData);
        } else {
            return response()->json(['message' => $lastErrorMessage], 400);
        }
    }
    
    public function payment(Request $request)
    {
        $user = Auth::user();
        $inquiryData = session('postpaid_inquiry_data');

        if (!$inquiryData || $inquiryData['customer_no'] !== $request->customer_no) {
            return response()->json(['message' => 'Sesi tidak valid atau nomor pelanggan tidak cocok.'], 400);
        }

        $totalPriceToPay     = $inquiryData['selling_price'];
        $finalAdmin          = $inquiryData['admin'];
        $pureBillPrice       = $inquiryData['price'];
        $diskon              = $inquiryData['diskon'] ?? 0;
        $jumlahLembarTagihan = $inquiryData['jumlah_lembar_tagihan'] ?? 0;
        
        if ($user->balance < $totalPriceToPay) {
            return response()->json(['message' => 'Saldo Anda tidak mencukupi.'], 402);
        }

        $user->decrement('balance', $totalPriceToPay);

        $initialData = $this->mapToUnifiedTransaction($inquiryData, 'PLN', $pureBillPrice, $finalAdmin);
        $initialData['selling_price'] = $totalPriceToPay;
        $initialData['status'] = 'Pending';
        $initialData['message'] = 'Menunggu konfirmasi pembayaran dari provider';
        
        $initialData['rc'] = $inquiryData['rc'] ?? null;
        $initialData['sn'] = null; 

        $initialData['details'] = [
            'diskon' => $diskon,
            'jumlah_lembar_tagihan' => $jumlahLembarTagihan,
        ];
        
        $unifiedTransaction = PostpaidTransaction::create($initialData);

        $apiResponseData = [];

        $username = env('P_U');
        $apiKey = env('P_AKD');
        $sign = md5($username . $apiKey . $inquiryData['ref_id']);

        try {
            $response = Http::post(config('services.api_server') . '/v1/transaction', [
                'commands' => 'pay-pasca', 'username' => $username, 'buyer_sku_code' => $inquiryData['buyer_sku_code'],
                'customer_no' => $inquiryData['customer_no'], 'ref_id' => $inquiryData['ref_id'], 'sign' => $sign, 'testing' => true,
            ]);
            $apiResponseData = $response->json()['data'];

            Log::info('PLN Payment API Response:', ['response_data' => $apiResponseData, 'transaction_id' => $unifiedTransaction->id]);

        } catch (\Exception $e) {
            $user->increment('balance', $totalPriceToPay);
            $errorMessage = ['status' => 'Gagal', 'message' => 'Gagal terhubung ke server provider.'];
            
            $unifiedTransaction->update(array_merge($errorMessage, ['rc' => null, 'sn' => null]));

            Log::error('PLN Payment Error: ' . $e->getMessage(), ['transaction_id' => $unifiedTransaction->id, 'inquiry_data' => $inquiryData]);
            return response()->json(['message' => 'Terjadi kesalahan pada server provider.'], 500);
        }
        
        $fullResponseData = array_merge($inquiryData, $apiResponseData);

        $updatePayload = $this->mapToUnifiedTransaction($fullResponseData, 'PLN', $pureBillPrice, $finalAdmin);
        $updatePayload['selling_price'] = $totalPriceToPay;
        
        $updatePayload['rc'] = $apiResponseData['rc'] ?? null;
        $updatePayload['sn'] = $apiResponseData['sn'] ?? null;

        $keysToExcludeFromDetails = [
            'ref_id', 'customer_no', 'customer_name', 'buyer_sku_code', 'message',
            'rc', 'sn', 'buyer_last_saldo', 'price', 'selling_price', 'admin', 'status',
            'diskon', 'jumlah_lembar_tagihan'
        ];

        $detailsFromApiResponse = [];
        foreach ($apiResponseData as $key => $value) {
            if (!in_array($key, $keysToExcludeFromDetails)) {
                $detailsFromApiResponse[$key] = $value;
            }
        }
        
        $updatePayload['details'] = array_merge(
            $detailsFromApiResponse,
            ['diskon' => $diskon, 'jumlah_lembar_tagihan' => $jumlahLembarTagihan]
        );

        unset($updatePayload['user_id'], $updatePayload['ref_id'], $updatePayload['type'], $updatePayload['price'], $updatePayload['admin_fee']);
        
        $unifiedTransaction->update($updatePayload);

        // --- START OF MODIFICATION ---
        // Refresh the model to get the very latest data from the database
        $unifiedTransaction->refresh(); 

        // Update the $fullResponseData with the actual values saved in the database
        // This ensures the frontend displays exactly what's recorded.
        $fullResponseData['selling_price'] = $unifiedTransaction->selling_price;
        $fullResponseData['status'] = $unifiedTransaction->status;
        $fullResponseData['customer_name'] = $unifiedTransaction->customer_name;
        $fullResponseData['customer_no'] = $unifiedTransaction->customer_no;
        // Jika diskon disimpan dalam kolom 'details' JSON, pastikan untuk mengambilnya dari sana.
        $fullResponseData['diskon'] = $unifiedTransaction->details['diskon'] ?? 0;
        // --- END OF MODIFICATION ---

        if (($apiResponseData['status'] ?? 'Gagal') === 'Gagal') {
            $user->increment('balance', $totalPriceToPay);
        }

        session()->forget('postpaid_inquiry_data');
        return response()->json($fullResponseData);
    }
}

// >>>>>>>>>>>>>>>       DUMMY DISKON BERDASARKAN JUMLAH LEMBAR TAGIHAN        <<<<<<<<<<<<<<<<,

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

// class PascaPlnController extends Controller
// {
//     use TransactionMapper;

//     // Fungsi index() dan fetchPlnProducts() tidak berubah
//     public function index()
//     {
//         $products = $this->fetchPlnProducts();
//         return Inertia::render('Pascabayar/Pln', [
//             'products' => $products,
//         ]);
//     }

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
//      * Membuat data inquiry dummy untuk pengujian, sesuai struktur yang diberikan.
//      * Disesuaikan agar `data.admin` mencerminkan total admin dari detail, dan `data.selling_price`
//      * dihitung berdasarkan `data.price` + `data.admin` (total dari detail) + `total denda dari detail`.
//      */
//     private function getDummyInquiryResponse(string $customerNo, string $refId, int $numBills = 2)
//     {
//         // Nilai-nilai ini diambil langsung dari contoh JSON yang Anda berikan
//         $baseNilaiTagihanPerLembar = 8000;
//         // $flatProviderAdminFee = 2500; // Ini adalah `admin` di root data sebelumnya, sekarang tidak dipakai langsung
//         $dendaPerLembar = 500;
//         $adminPerDetail = 2500; // Ini adalah `admin` di dalam array detail

//         $details = [];
//         $totalNilaiTagihanFromDetails = 0; // Untuk menghitung `data.price`
//         $totalDendaFromDetails = 0; // Untuk menghitung total denda dari detail
//         $totalAdminFromDetailsForDummy = 0; // Untuk menghitung total admin dari detail

//         for ($i = 0; $i < $numBills; $i++) {
//             $details[] = [
//                 'periode' => '201901', // Sesuai contoh, periode sama untuk semua detail
//                 'nilai_tagihan' => (string) $baseNilaiTagihanPerLembar,
//                 'admin' => (string) $adminPerDetail,
//                 'denda' => (string) $dendaPerLembar
//             ];
//             $totalNilaiTagihanFromDetails += $baseNilaiTagihanPerLembar;
//             $totalDendaFromDetails += $dendaPerLembar;
//             $totalAdminFromDetailsForDummy += $adminPerDetail; // Akumulasi admin dari setiap detail
//         }
        
//         // Perhitungan `data.price` dan `data.selling_price` agar konsisten dengan logika yang diinginkan
//         // `data.price` adalah total nilai tagihan murni dari semua detail
//         $dataPrice = $totalNilaiTagihanFromDetails;
        
//         // `data.admin` (di level root) sekarang mencerminkan total admin dari semua detail
//         $dataAdminRoot = $totalAdminFromDetailsForDummy;

//         // `data.selling_price` adalah `data.price` + `data.admin` (total dari detail) + `total denda` (dari detail)
//         // Diskon akan ditambahkan pada metode inquiry, jadi tidak termasuk di sini.
//         $dataSellingPrice = $dataPrice + $dataAdminRoot + $totalDendaFromDetails;

//         return [
//             'data' => [
//                 'ref_id' => $refId,
//                 'customer_no' => $customerNo,
//                 'customer_name' => 'Nama Pelanggan Dummy',
//                 'buyer_sku_code' => 'pln',
//                 'admin' => $dataAdminRoot, // Diubah: Sekarang ini adalah total admin dari detail
//                 'message' => 'Transaksi Sukses',
//                 'status' => 'Sukses',
//                 'rc' => '00',
//                 'buyer_last_saldo' => 100000,
//                 'price' => $dataPrice, 
//                 'selling_price' => $dataSellingPrice, // Diubah: Menggunakan total admin dari detail
//                 'desc' => [
//                     'tarif' => 'R1',
//                     'daya' => 1300,
//                     'lembar_tagihan' => $numBills,
//                     'detail' => $details,
//                     'last_bill_periode' => '201901',
//                     'total_bill' => $numBills,
//                     'bill_status' => 'BELUM LUNAS',
//                     'bill_info' => 'Tagihan PLN Pasca Dummy',
//                     'due_date' => now()->addDays(7)->format('Y-m-d')
//                 ]
//             ]
//         ];
//     }

//     public function inquiry(Request $request)
//     {
//         $request->validate(['customer_no' => 'required|string|min:10']);
//         $customerNo = $request->customer_no;

//         // --- Pemicu Mode Dummy ---
//         // Jika nomor pelanggan diawali dengan '999', aktifkan mode dummy.
//         $isDummyMode = Str::startsWith($customerNo, '999');

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
//             $responseData = [];

//             if ($isDummyMode) {
//                 // Untuk dummy, kita bisa atur jumlah lembar tagihan berdasarkan digit akhir customer_no
//                 // Misalnya, '999...1' -> 1 lembar, '999...2' -> 2 lembar, dst.
//                 $numBills = (int) substr($customerNo, -1);
//                 if ($numBills == 0 || $numBills > 5) $numBills = 2; // Default 2 lembar jika berakhir 0 atau > 5
                
//                 // ref_id dummy yang lebih pendek, seperti contoh "some1d"
//                 $ref_id = 'dmy' . Str::random(rand(3, 5)); // Contoh: dmyabc, dmy1234
//                 if (strlen($ref_id) > 10) $ref_id = substr($ref_id, 0, 10); // Pastikan tidak terlalu panjang

//                 $responseData = $this->getDummyInquiryResponse($customerNo, $ref_id, $numBills);
//                 Log::info("Inquiry PLN (Dummy Mode) untuk SKU: {$current_sku}, Customer: {$customerNo}");
//             } else {
//                 // Logika asli: Panggil API provider
//                 $ref_id = 'pln-' . Str::uuid(); // UUID untuk ref_id asli
//                 $username = env('P_U');
//                 $apiKey = env('P_AKD');
//                 $sign = md5($username . $apiKey . $ref_id);

//                 try {
//                     $response = Http::post(config('services.api_server') . '/v1/transaction', [
//                         'commands' => 'inq-pasca', 'username' => $username, 'buyer_sku_code' => $current_sku,
//                         'customer_no' => $customerNo, 'ref_id' => $ref_id, 'sign' => $sign, 'testing' => true,
//                     ]);
//                     $responseData = $response->json();
//                 } catch (\Exception $e) {
//                     $lastErrorMessage = 'Gagal terhubung ke server provider.';
//                     Log::error("Inquiry PLN Error untuk SKU: {$current_sku}. Error: " . $e->getMessage());
//                     continue; // Coba provider berikutnya
//                 }
//             }
            
//             // Logika pemrosesan respons (berlaku untuk data asli maupun dummy)
//             if (isset($responseData['data']) && $responseData['data']['status'] === 'Sukses') {
//                 $inquiryDataFromApi = $responseData['data'];
                
//                 // Inisialisasi variabel perhitungan
//                 $totalNilaiTagihan = 0;
//                 $totalDenda = 0;
//                 $totalAdminFromDetails = 0; // NEW: Akumulasi admin dari setiap detail
//                 $jumlahLembarTagihan = 0;

//                 // --- PENTING: Prioritas Ambil jumlah lembar tagihan dari 'desc.lembar_tagihan' ---
//                 if (isset($inquiryDataFromApi['desc']['lembar_tagihan'])) {
//                     $jumlahLembarTagihan = (int) $inquiryDataFromApi['desc']['lembar_tagihan'];
//                 } elseif (isset($inquiryDataFromApi['desc']['detail']) && is_array($inquiryDataFromApi['desc']['detail'])) {
//                     // Fallback ke count detail jika 'lembar_tagihan' tidak ada
//                     $jumlahLembarTagihan = count($inquiryDataFromApi['desc']['detail']);
//                 } else {
//                     $jumlahLembarTagihan = 1; // Default ke 1 jika tidak ditemukan sama sekali
//                 }

//                 // Akumulasikan nilai tagihan, denda, dan admin dari detail
//                 if (isset($inquiryDataFromApi['desc']['detail']) && is_array($inquiryDataFromApi['desc']['detail'])) {
//                     foreach ($inquiryDataFromApi['desc']['detail'] as $detail) {
//                         $totalNilaiTagihan += (float) ($detail['nilai_tagihan'] ?? 0);
//                         $totalDenda += (float) ($detail['denda'] ?? 0); 
//                         $totalAdminFromDetails += (float) ($detail['admin'] ?? 0); // Akumulasi admin dari detail
//                     }
//                 } else {
//                     // Fallback jika tidak ada detail, dan user menginginkan admin_fee dari total admin tiap lembar tagihan.
//                     // Jika tidak ada detail, kita asumsikan 'price' di root adalah nilai tagihan, 'denda' di root desc adalah total denda.
//                     // Untuk admin, kita bisa fallback ke 'admin' di root data jika tidak ada detail.
//                     $totalNilaiTagihan = (float) ($inquiryDataFromApi['price'] ?? 0);
//                     $totalDenda = (float) ($inquiryDataFromApi['desc']['denda'] ?? 0); 
//                     // Jika tidak ada detail, kita asumsikan 'admin' di root adalah total admin.
//                     $totalAdminFromDetails = (float) ($inquiryDataFromApi['admin'] ?? 0);
//                 }

//                 // --- PENTING: Set $inquiryDataFromApi['admin'] menjadi total admin dari details ---
//                 // Ini akan menjadi nilai 'admin_fee' yang diinginkan (total admin dari tiap lembar tagihan).
//                 $inquiryDataFromApi['admin'] = $totalAdminFromDetails; 
                
//                 // 1. Hitung Diskon dasar per lembar berdasarkan komisi produk
//                 $commission = $product->commission ?? 0;
//                 $commission_sell_percentage = $product->commission_sell_percentage ?? 0;
//                 $commission_sell_fixed = $product->commission_sell_fixed ?? 0;
//                 $diskonPerLembar = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;

//                 // 2. Kalikan diskon per lembar dengan jumlah lembar tagihan
//                 $finalDiskon = $diskonPerLembar * $jumlahLembarTagihan;

//                 // 3. Hitung Total Pembayaran Akhir (dengan Diskon)
//                 // selling_price = price + admin_fee (total dari detail) + total denda - total diskon
//                 $finalSellingPrice = $totalNilaiTagihan + $totalAdminFromDetails + $totalDenda - $finalDiskon;

//                 // 4. Susun kembali data untuk dikirim ke frontend dan disimpan di sesi
//                 $inquiryDataFromApi['price']         = $totalNilaiTagihan; // Nilai tagihan murni (total dari detail)
//                 // $inquiryDataFromApi['admin'] sudah diset ke $totalAdminFromDetails di atas
//                 $inquiryDataFromApi['denda']         = $totalDenda; // Total denda dari detail
//                 $inquiryDataFromApi['diskon']        = $finalDiskon; // Simpan diskon yang sudah dikalikan
//                 $inquiryDataFromApi['jumlah_lembar_tagihan'] = $jumlahLembarTagihan; // Jumlah lembar tagihan
//                 $inquiryDataFromApi['selling_price'] = $finalSellingPrice; // Total yang harus dibayar pelanggan
//                 $inquiryDataFromApi['buyer_sku_code'] = $current_sku;
                
//                 $successfulInquiryData = $inquiryDataFromApi;
//                 break; // Hentikan loop jika ada yang sukses
//             } else {
//                 $lastErrorMessage = $responseData['data']['message'] ?? 'Provider sedang sibuk.';
//                 Log::warning("Inquiry PLN Gagal untuk SKU: {$current_sku}. Pesan: {$lastErrorMessage}");
//             }
//         }

//         if ($successfulInquiryData) {
//             session(['postpaid_inquiry_data' => $successfulInquiryData]);
//             return response()->json($successfulInquiryData);
//         } else {
//             return response()->json(['message' => $lastErrorMessage], 400);
//         }
//     }

//     /**
//      * Membuat data payment dummy untuk pengujian.
//      */
//     private function getDummyPaymentResponse(array $inquiryData)
//     {
//         return [
//             'data' => array_merge($inquiryData, [
//                 'status' => 'Sukses',
//                 'sn' => 'DUMMYSN' . strtoupper(Str::random(10)) . '/PLNDUMMY/' . now()->format('Ymd'),
//                 'message' => 'PEMBAYARAN PLN PASCABAYAR SUKSES (MODE DUMMY)',
//                 'balance' => 1000000, // Sisa saldo dummy
//                 'price' => $inquiryData['selling_price'], // Price di sini biasanya harga yang dibayar
//                 'rc' => '00', // Response Code sukses
//             ])
//         ];
//     }

//     public function payment(Request $request)
//     {
//         $user = Auth::user();
//         $inquiryData = session('postpaid_inquiry_data');

//         if (!$inquiryData || $inquiryData['customer_no'] !== $request->customer_no) {
//             return response()->json(['message' => 'Sesi tidak valid atau nomor pelanggan tidak cocok.'], 400);
//         }

//         // --- Pemicu Mode Dummy ---
//         $isDummyMode = Str::startsWith($request->customer_no, '999');

//         // Ambil data yang sudah dihitung dari sesi (sekarang sudah benar setelah revisi inquiry)
//         $totalPriceToPay     = $inquiryData['selling_price']; 
//         $finalAdmin          = $inquiryData['admin']; // Ini sekarang adalah total admin dari detail
//         $pureBillPrice       = $inquiryData['price'];
//         $diskon              = $inquiryData['diskon'] ?? 0; 
//         $jumlahLembarTagihan = $inquiryData['jumlah_lembar_tagihan'] ?? 0;
        
//         if ($user->balance < $totalPriceToPay) {
//             return response()->json(['message' => 'Saldo Anda tidak mencukupi.'], 402);
//         }

//         // Kurangi saldo sebelum memproses transaksi (baik dummy maupun asli)
//         $user->decrement('balance', $totalPriceToPay);

//         $initialData = $this->mapToUnifiedTransaction($inquiryData, 'PLN', $pureBillPrice, $finalAdmin);
//         $initialData['selling_price'] = $totalPriceToPay;
//         $initialData['status'] = 'Pending';
//         $initialData['message'] = 'Menunggu konfirmasi pembayaran dari provider';
        
//         // Simpan diskon dan jumlah lembar tagihan yang sudah dikalikan ke dalam kolom 'details' JSON
//         $initialData['details']['diskon'] = $diskon;
//         $initialData['details']['jumlah_lembar_tagihan'] = $jumlahLembarTagihan; 
        
//         $unifiedTransaction = PostpaidTransaction::create($initialData);

//         $apiResponseData = [];

//         if ($isDummyMode) {
//             // Gunakan data dummy, tidak perlu panggil API
//             $response = $this->getDummyPaymentResponse($inquiryData);
//             $apiResponseData = $response['data'];
//             Log::info("Payment PLN (Dummy Mode) untuk Ref ID: {$inquiryData['ref_id']}, Customer: {$request->customer_no}");
            
//             // Simulasi penundaan jika diperlukan untuk pengujian
//             // sleep(1); 
//         } else {
//             // Logika asli: Panggil API provider
//             $username = env('P_U');
//             $apiKey = env('P_AKD');
//             $sign = md5($username . $apiKey . $inquiryData['ref_id']);

//             try {
//                 $response = Http::post(config('services.api_server') . '/v1/transaction', [
//                     'commands' => 'pay-pasca', 'username' => $username, 'buyer_sku_code' => $inquiryData['buyer_sku_code'],
//                     'customer_no' => $inquiryData['customer_no'], 'ref_id' => $inquiryData['ref_id'], 'sign' => $sign, 'testing' => true,
//                 ]);
//                 $apiResponseData = $response->json()['data'];
//             } catch (\Exception $e) {
//                 // Jika gagal terhubung ke provider, kembalikan saldo
//                 $user->increment('balance', $totalPriceToPay);
//                 $errorMessage = ['status' => 'Gagal', 'message' => 'Gagal terhubung ke server provider.'];
//                 $unifiedTransaction->update($errorMessage);
//                 Log::error('PLN Payment Error: ' . $e->getMessage());
//                 return response()->json(['message' => 'Terjadi kesalahan pada server provider.'], 500);
//             }
//         }
        
//         // Logika pembaruan transaksi (berlaku untuk data asli maupun dummy)
//         $fullResponseData = array_merge($inquiryData, $apiResponseData);

//         // Pastikan `pureBillPrice` dan `finalAdmin` (total admin dari detail) yang asli tetap digunakan
//         // karena `mapToUnifiedTransaction` membutuhkannya untuk kolom `price` dan `admin_fee`.
//         $updatePayload = $this->mapToUnifiedTransaction($fullResponseData, 'PLN', $pureBillPrice, $finalAdmin);
//         $updatePayload['selling_price'] = $totalPriceToPay;
        
//         // Simpan diskon (yang sudah dikalikan) dan jumlah lembar tagihan saat update, untuk konsistensi
//         $updatePayload['details']['diskon'] = $diskon;
//         $updatePayload['details']['jumlah_lembar_tagihan'] = $jumlahLembarTagihan;

//         // Hapus hanya field yang tidak boleh di-update dari API response ke model kita
//         unset($updatePayload['user_id'], $updatePayload['ref_id'], $updatePayload['type'], $updatePayload['price'], $updatePayload['admin_fee']);
        
//         $unifiedTransaction->update($updatePayload);

//         // Jika transaksi gagal (setelah update dari API), kembalikan saldo
//         if (($apiResponseData['status'] ?? 'Gagal') === 'Gagal') { // Gunakan 'Gagal' sebagai default jika status tidak ada
//             $user->increment('balance', $totalPriceToPay);
//         }

//         session()->forget('postpaid_inquiry_data');
//         return response()->json($fullResponseData);
//     }
// }