<?php

// namespace App\Http\Controllers;

// use App\Models\PascaPdam;
// use App\Models\PostpaidProduct; // Import model PostpaidProduct
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Auth;
// use Illuminate\Support\Facades\Http;
// use Illuminate\Support\Facades\Log;
// use Illuminate\Support\Str;
// use Inertia\Inertia;
// use App\Models\PostpaidTransaction;

// class PascaPdamController extends Controller
// {
//     /**
//      * Menampilkan halaman pembayaran PDAM dengan daftar produk.
//      */
//     public function index()
//     {
//         $products = $this->fetchPdamProducts();
//         return Inertia::render('Pascabayar/Pdam', [
//             'products' => $products,
//         ]);
//     }

//     /**
//      * Mengambil daftar produk PDAM dari database lokal.
//      */
//     private function fetchPdamProducts()
// {
//     $pdamProducts = PostpaidProduct::where('brand', 'PDAM')->get();

//     return $pdamProducts->map(function ($product) {
//         // Logika perhitungan admin tetap sama untuk semua produk
//         $commission = $product->commission ?? 0;
//         $commission_sell_percentage = $product->commission_sell_percentage ?? 0;
//         $commission_sell_fixed = $product->commission_sell_fixed ?? 0;
//         $adminFromServer = $product->admin ?? 0;
        
//         $markupForClient = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;
//         $product->calculated_admin = $adminFromServer - $markupForClient;

//         // Properti 'seller_product_status' (true/false) akan otomatis ikut terkirim
//         // ke frontend. Tidak perlu menambah properti baru.
//         return $product;
        
//     })->values()->all();
// }


//     public function inquiry(Request $request)
//     {
//         $request->validate([
//             'customer_no' => 'required|string|min:4',
//             'buyer_sku_code' => 'required|string',
//         ]);

//         $username = env('P_U');
//         $apiKey = env('P_AK');
//         $ref_id = 'pdam-' . Str::uuid();
//         $sign = md5($username . $apiKey . $ref_id);

//         try {
//             // ================== SIMULASI API CALL (BAGIAN ASLI DIKOMENTARI) ==================
//             /* 
//             $response = Http::post(config('services.api_server') . '/v1/transaction', [
//                 'commands' => 'inq-pasca',
//                 'username' => $username,
//                 'buyer_sku_code' => $request->buyer_sku_code,
//                 'customer_no' => $request->customer_no,
//                 'ref_id' => $ref_id,
//                 'sign' => $sign,
//                 'testing' => true, // Gunakan true untuk testing jika perlu
//             ]);
//             $responseData = $response->json();
//             */

//             // Data Dummy yang mensimulasikan respons sukses dari server
//             $dummyResponseData = [
//                 'data' => [
//                     'ref_id' => $ref_id, // Gunakan ref_id yang sudah kita buat
//                     'customer_no' => $request->customer_no,
//                     'customer_name' => 'PELANGGAN DUMMY',
//                     'buyer_sku_code' => $request->buyer_sku_code,
//                     'admin' => 2500, // Admin asli dari provider
//                     'message' => 'INQUIRY SUKSES (SIMULASI)',
//                     'status' => 'Sukses',
//                     'rc' => '00',
//                     'buyer_last_saldo' => 500000,
//                     'price' => 127500, // Harga total asli dari provider (Tagihan + Admin Provider)
//                     'selling_price' => 128000,
//                     'desc' => [
//                         'tarif' => 'R3',
//                         'lembar_tagihan' => 1,
//                         'alamat' => 'ALAMAT DUMMY NO. 123',
//                         'jatuh_tempo' => '20-09-2025',
//                         'detail' => [
//                             [
//                                 'periode' => '202508',
//                                 'nilai_tagihan' => '125000', // Harga tagihan murni
//                                 'denda' => '0',
//                                 'meter_awal' => '00987600',
//                                 'meter_akhir' => '00999900',
//                                 'biaya_lain' => '0'
//                             ]
//                         ]
//                     ]
//                 ]
//             ];
//             // Variabel $responseData sekarang berisi data dummy kita
//             $responseData = $dummyResponseData;
//             // ================== AKHIR SIMULASI ==================


//             if (isset($responseData['data']) && $responseData['data']['status'] === 'Sukses') {
                
//                 // Logika internal Anda tetap berjalan seperti biasa
//                 $product = PostpaidProduct::where('buyer_sku_code', $request->buyer_sku_code)->first();
//                 if (!$product) {
//                     return response()->json(['message' => 'Produk tidak ditemukan di sistem kami.'], 404);
//                 }

//                 $commission = $product->commission ?? 0;
//                 $commission_sell_percentage = $product->commission_sell_percentage ?? 0;
//                 $commission_sell_fixed = $product->commission_sell_fixed ?? 0;
//                 $originalAdmin = $product->admin ?? 0;
                
//                 $markup = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;
//                 $calculatedAdmin = $originalAdmin - $markup;

//                 $inquiryDataFromApi = $responseData['data'];
//                 $apiPrice = $inquiryDataFromApi['price'];
//                 $apiAdmin = $inquiryDataFromApi['admin'];

//                 $finalPrice = ($apiPrice - $apiAdmin) + $calculatedAdmin;

//                 $inquiryDataFromApi['admin'] = $calculatedAdmin;
//                 $inquiryDataFromApi['price'] = $finalPrice;      
                
//                 session(['pdam_inquiry_data' => $inquiryDataFromApi]);
                
//                 return response()->json($inquiryDataFromApi);

//             } else {
//                 // Blok ini akan menangani jika 'status' di data dummy diubah menjadi 'Gagal'
//                 return response()->json($responseData['data'] ?? ['message' => 'Gagal melakukan pengecekan tagihan (simulasi).'], 400);
//             }

//         } catch (\Exception $e) {
//             Log::error('PDAM Inquiry Error (Simulasi): ' . $e->getMessage());
//             return response()->json(['message' => 'Terjadi kesalahan pada server provider (simulasi).'], 500);
//         }
//     }

//     public function payment(Request $request)
//     {
//         $user = Auth::user();
//         $inquiryData = session('pdam_inquiry_data');

//         // Semua logika validasi dan database sebelum call API tetap berjalan
//         if (!$inquiryData) {
//             return response()->json(['message' => 'Sesi pengecekan tagihan tidak ditemukan.'], 400);
//         }
//         if ($inquiryData['customer_no'] !== $request->customer_no) {
//              return response()->json(['message' => 'Nomor pelanggan tidak cocok dengan data pengecekan terakhir.'], 400);
//         }
//         $totalPrice = $inquiryData['price']; 
//         if ($user->balance < $totalPrice) {
//             return response()->json(['message' => 'Saldo Anda tidak mencukupi untuk melakukan pembayaran.'], 402);
//         }
//         $user->decrement('balance', $totalPrice);
//         $transaction = PascaPdam::create([ 
//             'user_id' => $user->id,
//             'ref_id' => $inquiryData['ref_id'],
//             'customer_no' => $inquiryData['customer_no'],
//             'customer_name' => $inquiryData['customer_name'],
//             'buyer_sku_code' => $inquiryData['buyer_sku_code'],
//             'price' => $inquiryData['price'], // Simpan harga final
//             'selling_price' => $inquiryData['price'], // Ini bisa Anda sesuaikan jika perlu
            
//             // PERUBAHAN KUNCI: Simpan admin yang sudah dihitung
//             'admin_fee' => $inquiryData['admin'], 
            
//             'status' => 'Pending',
//             'message' => 'Menunggu konfirmasi pembayaran dari provider',
//             'tarif' => $inquiryData['desc']['tarif'] ?? null,
//             'lembar_tagihan' => $inquiryData['desc']['lembar_tagihan'] ?? null,
//             'alamat' => $inquiryData['desc']['alamat'] ?? null,
//             'jatuh_tempo' => $inquiryData['desc']['jatuh_tempo'] ?? null,
//             'bill_details' => $inquiryData['desc']['detail'] ?? [],
//         ]);

//         // 1. Siapkan array untuk kolom 'details'
//         $transactionDetails = [
//             'tarif' => $inquiryData['desc']['tarif'] ?? null,
//             'lembar_tagihan' => $inquiryData['desc']['lembar_tagihan'] ?? null,
//             'alamat' => $inquiryData['desc']['alamat'] ?? null,
//             'jatuh_tempo' => $inquiryData['desc']['jatuh_tempo'] ?? null,
//             'bill_details' => $inquiryData['desc']['detail'] ?? [],
//         ];

//         // 2. Buat record di tabel terpadu
//         $transaction = PostpaidTransaction::create([ 
//             // Kolom Umum
//             'user_id' => $user->id,
//             'ref_id' => $inquiryData['ref_id'],
//             'type' => 'PDAM', // Tentukan tipe transaksinya
//             'customer_no' => $inquiryData['customer_no'],
//             'customer_name' => $inquiryData['customer_name'],
//             'buyer_sku_code' => $inquiryData['buyer_sku_code'],
//             'price' => $inquiryData['price'],
//             'selling_price' => $inquiryData['selling_price'],
//             'admin_fee' => $inquiryData['admin'], 
//             'status' => 'Pending',
//             'message' => 'Menunggu konfirmasi pembayaran dari provider',

//             // Kolom Detail (JSON)
//             'details' => $transactionDetails,
//         ]);

//         $username = env('P_U');
//         $apiKey = env('P_AK');
//         $sign = md5($username . $apiKey . $inquiryData['ref_id']);

//         try {
//             // ================== SIMULASI API CALL (BAGIAN ASLI DIKOMENTARI) ==================
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
//             $responseData = $response->json()['data'];
//             */
            
//             // Data Dummy yang mensimulasikan respons pembayaran sukses
//                 $inquiryData = [
//                 'ref_id' => '353688162',
//                 'customer_no' => $request->input('customer_no', '1013226'), // Ambil dari request jika ada
//                 'customer_name' => 'Nama Pelanggan Pertama',
//                 'buyer_sku_code' => 'pdam',
//                 'admin' => 2500,
//                 'price' => 11500,
//                 'selling_price' => 12500,
//                 'desc' => [
//                 'tarif' => '3A',
//                 'lembar_tagihan' => 1,
//                 'alamat' => 'WONOKROMO S.S BARU 2 8',
//                 'jatuh_tempo' => '1-15 DES 2014',
//                 'detail' => [
//                     [
//                     'periode' => '201901',
//                     'nilai_tagihan' => '8000',
//                     'denda' => '500',
//                     'meter_awal' => '00080000',
//                     'meter_akhir' => '00090000',
//                     'biaya_lain' => '1500'
//                     ]
//                 ]
//                 ]
//             ];

//             // --- LANGKAH 2: Buat Data Pembayaran Dummy ---
//             // Ini adalah bagian dari kode yang Anda berikan.
//             $dummyPaymentResponseData = [
//                 'sn' => 'DUMMYSN-'.strtoupper(Str::random(12)), // SN dinamis
//                 'status' => 'Sukses',
//                 'rc' => '00',
//                 'message' => 'PEMBAYARAN SUKSES (SIMULASI). Struk: '.strtoupper(Str::random(10)),
//                 'buyer_last_saldo' => 88500, // Contoh saldo terakhir
//             ];

//             // --- LANGKAH 3: Gabungkan Data Inquiry dan Data Pembayaran ---
//             // Kita akan menggunakan semua data dari inquiry dan menimpa/menambah
//             // beberapa field dengan data dari respons pembayaran.
//             $responseData = array_merge($inquiryData, $dummyPaymentResponseData);

//             // ================== AKHIR SIMULASI ==================

//             // Logika update database setelah call API tetap berjalan
//             $transaction->update([
//                 'status' => $responseData['status'],
//                 'sn' => $responseData['sn'] ?? null,
//                 'rc' => $responseData['rc'],
//                 'message' => $responseData['message'],
//             ]);

//             // Blok pengembalian saldo ini tidak akan berjalan karena status dummy adalah 'Sukses'
//             if ($responseData['status'] === 'Gagal') {
//                 $user->increment('balance', $totalPrice);
//                 Log::warning("Saldo dikembalikan untuk user ID {$user->id} (Simulasi Gagal)");
//             }

//             session()->forget('pdam_inquiry_data');
//             return response()->json($responseData);

//         } catch (\Exception $e) {
//             // Logika recovery jika terjadi error juga tetap ada
//             $user->increment('balance', $totalPrice);
//             $transaction->update(['status' => 'Gagal', 'message' => 'Gagal terhubung ke server provider (simulasi).']);
//             Log::error('PDAM Payment Error (Simulasi): ' . $e->getMessage());
//             return response()->json(['message' => 'Terjadi kesalahan pada server provider (simulasi).'], 500);
//         }
//     }


























    // public function inquiry(Request $request)
    // {
        // $request->validate([
        //     'customer_no' => 'required|string|min:4',
        //     'buyer_sku_code' => 'required|string',
        // ]);

        // $username = env('P_U');
        // $apiKey = env('P_AK');
        // $ref_id = 'pdam-' . Str::uuid();
        // $sign = md5($username . $apiKey . $ref_id);

        // try {
        //     $response = Http::post(config('services.api_server') . '/v1/transaction', [
        //         'commands' => 'inq-pasca',
        //         'username' => $username,
        //         'buyer_sku_code' => $request->buyer_sku_code,
        //         'customer_no' => $request->customer_no,
        //         'ref_id' => $ref_id,
        //         'sign' => $sign,
        //         'testing' => false,
        //     ]);

        //     $responseData = $response->json();

        //     if (isset($responseData['data']) && $responseData['data']['status'] === 'Sukses') {
                
        //         // ====== PERUBAHAN DIMULAI DI SINI ======
                
        //         // 1. Ambil produk dari database lokal untuk mendapatkan data komisi
        //         $product = PostpaidProduct::where('buyer_sku_code', $request->buyer_sku_code)->first();
        //         if (!$product) {
        //             return response()->json(['message' => 'Produk tidak ditemukan di sistem kami.'], 404);
        //         }

        //         // 2. Hitung ulang biaya admin yang akan dilihat pengguna
        //         $commission = $product->commission ?? 0;
        //         $commission_sell_percentage = $product->commission_sell_percentage ?? 0;
        //         $commission_sell_fixed = $product->commission_sell_fixed ?? 0;
        //         $originalAdmin = $product->admin ?? 0;
                
        //         $markup = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;
        //         $calculatedAdmin = $originalAdmin - $markup;

        //         // 3. Ambil data asli dari API
        //         $inquiryDataFromApi = $responseData['data'];
        //         $apiPrice = $inquiryDataFromApi['price'];
        //         $apiAdmin = $inquiryDataFromApi['admin'];

        //         // 4. Hitung harga jual akhir untuk pengguna
        //         // Rumus: (Harga Total API - Admin API) + Admin yang sudah kita hitung
        //         $finalPrice = ($apiPrice - $apiAdmin) + $calculatedAdmin;

        //         // 5. Ganti/Tambahkan nilai admin dan price di data inquiry
        //         $inquiryDataFromApi['admin'] = $calculatedAdmin; // Ganti admin asli dengan hasil hitungan kita
        //         $inquiryDataFromApi['price'] = $finalPrice;      // Ganti harga asli dengan harga final kita
                
        //         // 6. Simpan data yang sudah dimodifikasi ke session
        //         session(['pdam_inquiry_data' => $inquiryDataFromApi]);
                
        //         // 7. Kembalikan data yang sudah dimodifikasi ke frontend
        //         return response()->json($inquiryDataFromApi);
                
        //         // ====== AKHIR DARI PERUBAHAN ======

        //     } else {
        //         return response()->json($responseData['data'] ?? ['message' => 'Gagal melakukan pengecekan tagihan.'], 400);
        //     }

        // } catch (\Exception $e) {
        //     Log::error('PDAM Inquiry Error: ' . $e->getMessage());
        //     return response()->json(['message' => 'Terjadi kesalahan pada server provider.'], 500);
        // }
    // }
    



    // public function payment(Request $request)
    // {
    //     $user = Auth::user();
    //     $inquiryData = session('pdam_inquiry_data');

    //     if (!$inquiryData) {
    //         return response()->json(['message' => 'Sesi pengecekan tagihan tidak ditemukan. Silakan cek tagihan kembali.'], 400);
    //     }
    //     if ($inquiryData['customer_no'] !== $request->customer_no) {
    //          return response()->json(['message' => 'Nomor pelanggan tidak cocok dengan data pengecekan terakhir.'], 400);
    //     }

        // $totalPrice = $inquiryData['price']; 
        // if ($user->balance < $totalPrice) {
        //     return response()->json(['message' => 'Saldo Anda tidak mencukupi untuk melakukan pembayaran.'], 402);
        // }

        // $user->decrement('balance', $totalPrice);
        
        // $transaction = PascaPdam::create([
        //     'user_id' => $user->id,
        //     'ref_id' => $inquiryData['ref_id'],
        //     'customer_no' => $inquiryData['customer_no'],
        //     'customer_name' => $inquiryData['customer_name'],
        //     'buyer_sku_code' => $inquiryData['buyer_sku_code'],
        //     'price' => $inquiryData['price'], // Simpan harga final
        //     'selling_price' => $inquiryData['selling_price'], // Ini bisa Anda sesuaikan jika perlu
            
        //     // PERUBAHAN KUNCI: Simpan admin yang sudah dihitung
        //     'admin_fee' => $inquiryData['admin'], 
            
        //     'status' => 'Pending',
        //     'message' => 'Menunggu konfirmasi pembayaran dari provider',
        //     'tarif' => $inquiryData['desc']['tarif'] ?? null,
        //     'lembar_tagihan' => $inquiryData['desc']['lembar_tagihan'] ?? null,
        //     'alamat' => $inquiryData['desc']['alamat'] ?? null,
        //     'jatuh_tempo' => $inquiryData['desc']['jatuh_tempo'] ?? null,
        //     'bill_details' => $inquiryData['desc']['detail'] ?? [],
        // ]);

    //     $username = env('P_U');
    //     $apiKey = env('P_AK');
    //     $sign = md5($username . $apiKey . $inquiryData['ref_id']);

    //     try {
    //         $response = Http::post(config('services.api_server') . '/v1/transaction', [
    //             'commands' => 'pay-pasca',
    //             'username' => $username,
    //             'buyer_sku_code' => $inquiryData['buyer_sku_code'],
    //             'customer_no' => $inquiryData['customer_no'],
    //             'ref_id' => $inquiryData['ref_id'],
    //             'sign' => $sign,
    //             'testing' => false,
    //         ]);

    //         $responseData = $response->json()['data'];

    //         $transaction->update([
    //             'status' => $responseData['status'],
    //             'sn' => $responseData['sn'] ?? null,
    //             'rc' => $responseData['rc'],
    //             'message' => $responseData['message'],
    //         ]);

    //         if ($responseData['status'] === 'Gagal') {
    //             $user->increment('balance', $totalPrice);
    //             Log::warning("Saldo dikembalikan untuk user ID {$user->id} pada Transaksi PDAM Ref ID {$transaction->ref_id}");
    //         }

    //         session()->forget('pdam_inquiry_data');
    //         return response()->json($responseData);

    //     } catch (\Exception $e) {
    //         $user->increment('balance', $totalPrice);
    //         $transaction->update(['status' => 'Gagal', 'message' => 'Gagal terhubung ke server provider.']);
    //         Log::error('PDAM Payment Error: ' . $e->getMessage());
    //         return response()->json(['message' => 'Terjadi kesalahan pada server provider.'], 500);
    //     }
    // }
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
        ]);
    }

    /**
     * Mengambil daftar produk PDAM dari database lokal.
     */
    private function fetchPdamProducts()
    {
        $pdamProducts = PostpaidProduct::where('brand', 'PDAM')->get();

        return $pdamProducts->map(function ($product) {
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
     * Menghitung biaya admin final yang akan disimpan.
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
     * Menangani permintaan cek tagihan (inquiry) PDAM.
     */
    public function inquiry(Request $request)
    {
        $request->validate([
            'customer_no' => 'required|string|min:4',
            'buyer_sku_code' => 'required|string|exists:postpaid_products,buyer_sku_code',
        ]);

        $product = PostpaidProduct::where('buyer_sku_code', $request->buyer_sku_code)->firstOrFail();

        $ref_id = 'pdam-' . Str::uuid();
        $username = env('P_U');
        $apiKey = env('P_AK');
        $sign = md5($username . $apiKey . $ref_id);

        try {
            $response = Http::post(config('services.api_server') . '/v1/transaction', [
                'commands' => 'inq-pasca',
                'username' => $username,
                'buyer_sku_code' => $request->buyer_sku_code,
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

                // Timpa data dari API dengan kalkulasi kita
                $inquiryDataFromApi['admin'] = $calculatedAdmin;
                $inquiryDataFromApi['price'] = $finalPrice;
                $inquiryDataFromApi['selling_price'] = $finalPrice;
                
                session(['postpaid_inquiry_data' => $inquiryDataFromApi]);
                return response()->json($inquiryDataFromApi);
            } else {
                return response()->json($responseData['data'] ?? ['message' => 'Gagal melakukan pengecekan tagihan.'], 400);
            }

        } catch (\Exception $e) {
            Log::error('PDAM Inquiry Error: ' . $e->getMessage());
            return response()->json(['message' => 'Terjadi kesalahan pada server provider.'], 500);
        }
    }

    /**
     * Menangani permintaan pembayaran tagihan PDAM.
     */
    public function payment(Request $request)
    {
        $user = Auth::user();
        $inquiryData = session('postpaid_inquiry_data');

        if (!$inquiryData || $inquiryData['customer_no'] !== $request->customer_no) {
            return response()->json(['message' => 'Sesi tidak valid atau nomor pelanggan tidak cocok.'], 400);
        }

        $totalPrice = $inquiryData['price'];
        $finalAdmin = $inquiryData['admin'];

        if ($user->balance < $totalPrice) {
            return response()->json(['message' => 'Saldo Anda tidak mencukupi.'], 402);
        }

        $user->decrement('balance', $totalPrice);

        // Buat transaksi awal di tabel terpadu dengan status 'Pending'
        $initialData = $this->mapToUnifiedTransaction($inquiryData, 'PDAM', $totalPrice, $finalAdmin);
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

            $fullResponseData = array_merge($inquiryData, $apiResponseData);

            // Gunakan mapper lagi untuk menghasilkan data update yang lengkap
            $updatePayload = $this->mapToUnifiedTransaction($fullResponseData, 'PDAM', $totalPrice, $finalAdmin);
            
            unset($updatePayload['user_id'], $updatePayload['ref_id'], $updatePayload['type'], $updatePayload['price'], $updatePayload['admin_fee']);
            
            $unifiedTransaction->update($updatePayload);

            if ($updatePayload['status'] === 'Gagal') {
                $user->increment('balance', $totalPrice);
            }

            session()->forget('postpaid_inquiry_data');
            return response()->json($fullResponseData);

        } catch (\Exception $e) {
            $user->increment('balance', $totalPrice);
            $errorMessage = ['status' => 'Gagal', 'message' => 'Gagal terhubung ke server provider.'];
            $unifiedTransaction->update($errorMessage);
            Log::error('PDAM Payment Error: ' . $e->getMessage());
            return response()->json(['message' => 'Terjadi kesalahan pada server provider.'], 500);
        }
    }
}