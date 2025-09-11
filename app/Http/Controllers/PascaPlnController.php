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
            // Log jika tidak ada produk yang tersedia
            Log::warning("Inquiry PLN: Tidak ada produk PLN Pascabayar yang aktif ditemukan.");
            return response()->json(['message' => 'Layanan PLN Pascabayar tidak tersedia saat ini.'], 503);
        }

        $successfulInquiryData = null;
        $lastErrorMessage = 'Gagal melakukan pengecekan tagihan setelah mencoba semua provider.';

        foreach ($availableProducts as $product) {
            $current_sku = $product->buyer_sku_code;
            $responseData = [];

            $ref_id = 'pln-' . substr(str_replace('-', '', Str::uuid()->toString()), 0, 15);
            $username = env('P_U');
            $apiKey = env('P_AK');
            $sign = md5($username . $apiKey . $ref_id);

            try {
                $response = Http::post(config('services.api_server') . '/v1/transaction', [
                    'commands' => 'inq-pasca', 'username' => $username, 'buyer_sku_code' => $current_sku,
                    'customer_no' => $customerNo, 'ref_id' => $ref_id, 'sign' => $sign, 'testing' => false,
                ]);
                $responseData = $response->json();
            } catch (\Exception $e) {
                $lastErrorMessage = 'Gagal terhubung ke server provider.';
                // Log error koneksi
                Log::error("Inquiry PLN Gagal Koneksi API untuk SKU: {$current_sku}. Customer No: {$customerNo}. Error: " . $e->getMessage(), [
                    'customer_no' => $customerNo,
                    'sku' => $current_sku,
                    'ref_id' => $ref_id,
                    'exception_message' => $e->getMessage(),
                    'exception_trace' => $e->getTraceAsString(),
                ]);
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
                $inquiryDataFromApi['ref_id'] = $ref_id; // Pastikan ref_id ikut disimpan

                $successfulInquiryData = $inquiryDataFromApi;

                // --- MODIFIKASI: Simpan log untuk inquiry yang berhasil ---
                Log::info("Inquiry PLN Sukses untuk SKU: {$current_sku}. Customer No: {$customerNo}", [
                    'customer_no' => $customerNo,
                    'sku' => $current_sku,
                    'ref_id' => $ref_id,
                    'api_response' => $responseData, // Respons API mentah
                    'processed_data' => $successfulInquiryData, // Data setelah diproses
                ]);

                break; // Hentikan loop jika ada yang sukses
            } else {
                $lastErrorMessage = $responseData['data']['message'] ?? 'Provider sedang sibuk.';
                // Log warning untuk setiap provider yang gagal
                Log::warning("Inquiry PLN Gagal dari Provider SKU: {$current_sku}. Customer No: {$customerNo}. Pesan: {$lastErrorMessage}", [
                    'customer_no' => $customerNo,
                    'sku' => $current_sku,
                    'ref_id' => $ref_id,
                    'api_response' => $responseData, // Respons API saat gagal
                ]);
            }
        }

        if ($successfulInquiryData) {
            session(['postpaid_inquiry_data' => $successfulInquiryData]);
            return response()->json($successfulInquiryData);
        } else {
            // Log error jika semua provider gagal
            Log::error("Inquiry PLN Total Gagal untuk Customer No: {$customerNo}. Pesan terakhir: {$lastErrorMessage}");
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
        $apiKey = env('P_AK');
        $sign = md5($username . $apiKey . $inquiryData['ref_id']);

        try {
            $response = Http::post(config('services.api_server') . '/v1/transaction', [
                'commands' => 'pay-pasca', 'username' => $username, 'buyer_sku_code' => $inquiryData['buyer_sku_code'],
                'customer_no' => $inquiryData['customer_no'], 'ref_id' => $inquiryData['ref_id'], 'sign' => $sign, 'testing' => false,
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





























// >>>>>>>>>>>>>>>       DUMMY DISKON BERDASARKAN JUMLAH LEMBAR TAGIHAN        <<<<<<<<<<<<<<<<

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
//      * Generates a dummy PLN inquiry response for testing purposes.
//      * This method is called directly by inquiry() to provide dummy data.
//      * @param string $customerNo
//      * @param string $buyerSkuCode
//      * @param string $refId
//      * @return array
//      */
//     private function getDummyPlnInquiryResponse(string $customerNo, string $buyerSkuCode, string $refId): array
//     {
//         $basePricePerBill = 80000;
//         $adminFeePerDetail = 2500; // Asumsi admin per lembar tagihan
//         $dendaPerDetail = 500;
//         $lembarTagihan = rand(1, 3); // Simulasikan 1 hingga 3 lembar tagihan (bulan)

//         $details = [];
//         $totalNilaiTagihan = 0;
//         $totalAdminDariDetail = 0;
//         $totalDendaDariDetail = 0;

//         $baseMeterAwal = 30000 + (int)substr($customerNo, -3); // Unik per customer
//         // Untuk PLN, biasanya tidak ada 'biaya_lain' di detail. Hanya 'nilai_tagihan', 'admin', 'denda'.

//         $lastMeterAkhir = $baseMeterAwal; // Mulai dari baseMeterAwal untuk periode terlama

//         for ($i = $lembarTagihan - 1; $i >= 0; $i--) { // Loop dari periode terlama ke terbaru
//             $period = date('Ym', strtotime("-$i month"));
//             $nilaiTagihanItem = $basePricePerBill + (rand(0, 50) * 100);

//             $currentMeterAwal = $lastMeterAkhir;
//             $currentMeterAkhir = $currentMeterAwal + rand(100, 200); // Konsumsi per bulan
            
//             $details[] = [
//                 "periode" => $period,
//                 "nilai_tagihan" => (string)$nilaiTagihanItem,
//                 "admin" => (string)$adminFeePerDetail,
//                 "denda" => (string)$dendaPerDetail,
//                 "meter_awal" => (string)$currentMeterAwal,
//                 "meter_akhir" => (string)$currentMeterAkhir,
//                 // "biaya_lain" => "0" // PLN jarang ada biaya_lain di detail, bisa ditambahkan jika diperlukan
//             ];
//             $totalNilaiTagihan += $nilaiTagihanItem;
//             $totalAdminDariDetail += $adminFeePerDetail;
//             $totalDendaDariDetail += $dendaPerDetail;

//             $lastMeterAkhir = $currentMeterAkhir; // Meter akhir periode ini jadi meter awal periode berikutnya
//         }

//         // Urutkan detail berdasarkan periode ascending (terlama ke terbaru)
//         usort($details, function($a, $b) {
//             return $a['periode'] <=> $b['periode'];
//         });

//         // Contoh PLN tidak ada 'alamat' dan 'jatuh_tempo' di 'desc' seperti PDAM,
//         // tapi kita bisa tambahkan jika memang ingin simulasi yang sangat mirip.
//         $descData = [
//             "tarif" => "R1",
//             "daya" => 1300,
//             "lembar_tagihan" => $lembarTagihan,
//             "detail" => $details
//         ];
        
//         return [
//             "data" => [
//                 "ref_id" => $refId,
//                 "customer_no" => $customerNo,
//                 "customer_name" => "PELANGGAN DUMMY PLN " . Str::upper(substr(md5($customerNo), 0, 5)),
//                 "buyer_sku_code" => $buyerSkuCode,
//                 "admin" => $totalAdminDariDetail, // Total admin dari semua lembar tagihan
//                 "message" => "Transaksi Sukses",
//                 "status" => "Sukses",
//                 "rc" => "00",
//                 "buyer_last_saldo" => 1000000,
//                 "price" => $totalNilaiTagihan, // Total nilai tagihan murni dari semua lembar tagihan
//                 "selling_price" => $totalNilaiTagihan + $totalAdminDariDetail + $totalDendaDariDetail, // Initial selling price (sebelum diskon)
//                 "desc" => $descData
//             ]
//         ];
//     }

//     public function inquiry(Request $request)
//     {
//         $request->validate(['customer_no' => 'required|string|min:10']);
//         $customerNo = $request->customer_no;

//         $availableProducts = PostpaidProduct::where('brand', 'PLN PASCABAYAR')
//                                             ->where('seller_product_status', true)
//                                             ->orderBy('buyer_sku_code', 'asc')
//                                             ->get();

//         if ($availableProducts->isEmpty()) {
//             Log::warning("Inquiry PLN: Tidak ada produk PLN Pascabayar yang aktif ditemukan (Dummy Mode).");
//             return response()->json(['message' => 'Layanan PLN Pascabayar tidak tersedia saat ini.'], 503);
//         }

//         $successfulInquiryData = null;
//         $current_sku = $availableProducts->first()->buyer_sku_code; // Ambil SKU dari produk pertama yang tersedia
//         $ref_id = 'pln-' . substr(str_replace('-', '', Str::uuid()->toString()), 0, 15);
        
//         // --- MODIFIKASI: Langsung gunakan respons dummy di sini ---
//         $responseData = $this->getDummyPlnInquiryResponse($customerNo, $current_sku, $ref_id);
//         // --- AKHIR MODIFIKASI ---

//         // Kode di bawah ini tetap sama, memproses $responseData seolah-olah dari API nyata
//         if (isset($responseData['data']) && $responseData['data']['status'] === 'Sukses') {
//             $inquiryDataFromApi = $responseData['data'];
            
//             if (!isset($inquiryDataFromApi['desc']) || !is_array($inquiryDataFromApi['desc'])) {
//                 $inquiryDataFromApi['desc'] = [];
//             }

//             $totalNilaiTagihan = 0;
//             $totalDenda = 0;
//             $totalBiayaLain = 0; // Untuk PLN, ini biasanya 0 atau diakumulasi ke price
//             $jumlahLembarTagihan = 0;

//             if (isset($inquiryDataFromApi['desc']['lembar_tagihan'])) {
//                 $jumlahLembarTagihan = (int) $inquiryDataFromApi['desc']['lembar_tagihan'];
//             } elseif (isset($inquiryDataFromApi['desc']['detail']) && is_array($inquiryDataFromApi['desc']['detail'])) {
//                 $jumlahLembarTagihan = count($inquiryDataFromApi['desc']['detail']);
//             } else {
//                 $jumlahLembarTagihan = 1;
//             }

//             $latestMeterAwal = null;
//             $latestMeterAkhir = null;

//             if (isset($inquiryDataFromApi['desc']['detail']) && is_array($inquiryDataFromApi['desc']['detail']) && !empty($inquiryDataFromApi['desc']['detail'])) {
//                 $latestDetail = end($inquiryDataFromApi['desc']['detail']);
//                 $latestMeterAwal = $latestDetail['meter_awal'] ?? null;
//                 $latestMeterAkhir = $latestDetail['meter_akhir'] ?? null;
//                 reset($inquiryDataFromApi['desc']['detail']);
//             }

//             if (isset($inquiryDataFromApi['desc']['detail']) && is_array($inquiryDataFromApi['desc']['detail'])) {
//                 foreach ($inquiryDataFromApi['desc']['detail'] as $detail) {
//                     $totalNilaiTagihan += (float) ($detail['nilai_tagihan'] ?? 0);
//                     $totalDenda += (float) ($detail['denda'] ?? 0); 
//                     // Jika ada biaya_lain di detail PLN, tambahkan di sini
//                     // $totalBiayaLain += (float) ($detail['biaya_lain'] ?? 0); 
//                 }
//             } else {
//                 $totalNilaiTagihan = (float) ($inquiryDataFromApi['price'] ?? 0);
//                 $totalDenda = (float) ($inquiryDataFromApi['desc']['denda'] ?? 0); 
//                 // Jika ada biaya_lain di root desc, tambahkan di sini
//                 // $totalBiayaLain = (float) ($inquiryDataFromApi['desc']['biaya_lain'] ?? 0);
//             }

//             $totalAdminFromProvider = (float) ($inquiryDataFromApi['admin'] ?? 0); // Ambil total admin dari root dummy response
//             $inquiryDataFromApi['admin'] = $totalAdminFromProvider; 
            
//             // Produk PLN yang digunakan untuk komisi
//             $productForCommission = $availableProducts->first(); 
//             $commission = $productForCommission->commission ?? 0;
//             $commission_sell_percentage = $productForCommission->commission_sell_percentage ?? 0;
//             $commission_sell_fixed = $productForCommission->commission_sell_fixed ?? 0;
//             $diskonPerLembar = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;

//             $finalDiskon = $diskonPerLembar * $jumlahLembarTagihan;
//             $finalDiskon = ceil($finalDiskon);


//             $finalSellingPrice = ($totalNilaiTagihan + $totalBiayaLain) + $totalAdminFromProvider + $totalDenda - $finalDiskon;
//             $finalSellingPrice = ceil($finalSellingPrice);

//             $inquiryDataFromApi['meter_awal'] = $latestMeterAwal;
//             $inquiryDataFromApi['meter_akhir'] = $latestMeterAkhir;

//             $inquiryDataFromApi['price']         = $totalNilaiTagihan + $totalBiayaLain;
//             $inquiryDataFromApi['denda']         = $totalDenda;
//             $inquiryDataFromApi['diskon']        = $finalDiskon;
//             $inquiryDataFromApi['jumlah_lembar_tagihan'] = $jumlahLembarTagihan;
//             $inquiryDataFromApi['selling_price'] = $finalSellingPrice;
//             $inquiryDataFromApi['buyer_sku_code'] = $current_sku;
//             $inquiryDataFromApi['ref_id'] = $ref_id;

//             $successfulInquiryData = $inquiryDataFromApi;

//             Log::info("Inquiry PLN Sukses (Dummy) untuk SKU: {$current_sku}. Customer No: {$customerNo}", [
//                 'customer_no' => $customerNo,
//                 'sku' => $current_sku,
//                 'ref_id' => $ref_id,
//                 'api_response' => $responseData,
//                 'processed_data' => $successfulInquiryData,
//             ]);

//             session(['postpaid_inquiry_data' => $successfulInquiryData]);
//             return response()->json($successfulInquiryData);
//         } else {
//             // Karena ini dummy, ini seharusnya tidak tercapai jika getDummyPlnInquiryResponse selalu Sukses
//             $errorMessage = $responseData['data']['message'] ?? 'Gagal melakukan pengecekan tagihan dummy PLN.';
//             Log::warning("Inquiry PLN Gagal (Dummy) untuk SKU: {$current_sku}. Customer No: {$customerNo}. Pesan: {$errorMessage}", [
//                 'customer_no' => $customerNo,
//                 'sku' => $current_sku,
//                 'ref_id' => $ref_id,
//                 'api_response' => $responseData,
//             ]);
//             return response()->json(['message' => $errorMessage], 400);
//         }
//     }
    
//     public function payment(Request $request)
//     {
//         $user = Auth::user(); 
//         // Untuk testing tanpa login, Anda bisa membuat user dummy:
//         // if (!$user) { $user = (object)['id' => 1, 'balance' => 10000000, 'decrement' => function($attr, $val){}, 'increment' => function($attr, $val){}]; }

//         $inquiryData = session('postpaid_inquiry_data');

//         if (!$inquiryData || $inquiryData['customer_no'] !== $request->customer_no) {
//             return response()->json(['message' => 'Sesi tidak valid atau nomor pelanggan tidak cocok.'], 400);
//         }

//         $totalPriceToPay     = $inquiryData['selling_price'];
//         $finalAdmin          = $inquiryData['admin'];
//         $pureBillPrice       = $inquiryData['price'];
//         $diskon              = $inquiryData['diskon'] ?? 0;
//         $jumlahLembarTagihan = $inquiryData['jumlah_lembar_tagihan'] ?? 0;
        
//         if ($user->balance < $totalPriceToPay) {
//             return response()->json(['message' => 'Saldo Anda tidak mencukupi.'], 402);
//         }

//         $user->decrement('balance', $totalPriceToPay);

//         $initialData = $this->mapToUnifiedTransaction($inquiryData, 'PLN', $pureBillPrice, $finalAdmin);
//         $initialData['selling_price'] = $totalPriceToPay;
//         $initialData['status'] = 'Pending';
//         $initialData['message'] = 'Menunggu konfirmasi pembayaran dari provider';
        
//         $initialData['rc'] = $inquiryData['rc'] ?? null;
//         $initialData['sn'] = null; 

//         $initialData['details'] = [
//             'diskon' => $diskon,
//             'jumlah_lembar_tagihan' => $jumlahLembarTagihan,
//             'meter_awal_terbaru' => $inquiryData['meter_awal'] ?? null,
//             'meter_akhir_terbaru' => $inquiryData['meter_akhir'] ?? null,
//         ];
        
//         $unifiedTransaction = PostpaidTransaction::create($initialData);

//         // --- MODIFIKASI: Langsung gunakan respons dummy untuk payment ---
//         $apiResponseData = [
//             "ref_id" => $inquiryData['ref_id'],
//             "customer_no" => $inquiryData['customer_no'],
//             "customer_name" => $inquiryData['customer_name'] ?? "PELANGGAN DUMMY PLN",
//             "buyer_sku_code" => $inquiryData['buyer_sku_code'],
//             "admin" => $inquiryData['admin'],
//             "message" => "Pembayaran Sukses. PLN dummy SN: DUMMYPLN" . Str::upper(substr(md5($inquiryData['ref_id']), 0, 8)),
//             "status" => "Sukses",
//             "rc" => "00",
//             "sn" => "DUMMYPLN" . Str::upper(substr(md5($inquiryData['ref_id']), 0, 8)), // Dummy serial number
//             "buyer_last_saldo" => $user->balance, // Refleksikan saldo baru setelah decrement
//             "price" => $inquiryData['price'],
//             "selling_price" => $inquiryData['selling_price'],
//             "desc" => $inquiryData['desc'] ?? [], // Gunakan desc dari inquiry data
//             "meter_awal" => $inquiryData['meter_awal'] ?? null,
//             "meter_akhir" => $inquiryData['meter_akhir'] ?? null,
//         ];
//         Log::info('PLN Payment DUMMY API Response:', ['response_data' => $apiResponseData, 'transaction_id' => $unifiedTransaction->id]);
//         // --- AKHIR MODIFIKASI ---
        
//         $fullResponseData = array_merge($inquiryData, $apiResponseData);

//         $updatePayload = $this->mapToUnifiedTransaction($fullResponseData, 'PLN', $pureBillPrice, $finalAdmin);
//         $updatePayload['selling_price'] = $totalPriceToPay;
        
//         $updatePayload['rc'] = $apiResponseData['rc'] ?? null;
//         $updatePayload['sn'] = $apiResponseData['sn'] ?? null;
//         $updatePayload['status'] = $apiResponseData['status'] ?? 'Gagal'; // Update status dari respons dummy
//         $updatePayload['message'] = $apiResponseData['message'] ?? 'Gagal melakukan pembayaran dummy.'; // Update message dari respons dummy

//         $keysToExcludeFromDetails = [
//             'ref_id', 'customer_no', 'customer_name', 'buyer_sku_code', 'message',
//             'rc', 'sn', 'buyer_last_saldo', 'price', 'selling_price', 'admin', 'status',
//             'diskon', 'jumlah_lembar_tagihan', 'meter_awal', 'meter_akhir'
//         ];

//         $detailsFromApiResponse = [];
//         foreach ($apiResponseData as $key => $value) {
//             if (!in_array($key, $keysToExcludeFromDetails)) {
//                 $detailsFromApiResponse[$key] = $value;
//             }
//         }
        
//         $updatePayload['details'] = array_merge(
//             $detailsFromApiResponse,
//             [
//                 'diskon' => $diskon,
//                 'jumlah_lembar_tagihan' => $jumlahLembarTagihan,
//                 'meter_awal_terbaru' => $inquiryData['meter_awal'] ?? null,
//                 'meter_akhir_terbaru' => $inquiryData['meter_akhir'] ?? null,
//             ]
//         );

//         unset($updatePayload['user_id'], $updatePayload['ref_id'], $updatePayload['type'], $updatePayload['price'], $updatePayload['admin_fee']);
        
//         $unifiedTransaction->update($updatePayload);

//         $unifiedTransaction->refresh(); 

//         $fullResponseData['selling_price'] = $unifiedTransaction->selling_price;
//         $fullResponseData['status'] = $unifiedTransaction->status;
//         $fullResponseData['customer_name'] = $unifiedTransaction->customer_name;
//         $fullResponseData['customer_no'] = $unifiedTransaction->customer_no;
//         $fullResponseData['diskon'] = $unifiedTransaction->details['diskon'] ?? 0;
//         $fullResponseData['sn'] = $unifiedTransaction->sn;
//         $fullResponseData['meter_awal'] = $unifiedTransaction->details['meter_awal_terbaru'] ?? null;
//         $fullResponseData['meter_akhir'] = $unifiedTransaction->details['meter_akhir_terbaru'] ?? null;

//         // Logika pengembalian saldo jika transaksi dummy gagal (jika Anda mensimulasikan itu)
//         if (($apiResponseData['status'] ?? 'Gagal') === 'Gagal') {
//             $user->increment('balance', $totalPriceToPay);
//         }

//         session()->forget('postpaid_inquiry_data');
//         return response()->json($fullResponseData);
//     }
// }