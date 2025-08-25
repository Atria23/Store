<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\PascaPln; // Gunakan model spesifik kita
use App\Models\User;
use Illuminate\Support\Str;

class PascaPlnController extends Controller
{
    /**
     * Menangani permintaan cek tagihan (inquiry) PLN.
     */
    public function inquiry(Request $request)
    {
        $request->validate(['customer_no' => 'required|string|min:10']);

        $username = env('P_U');
        $apiKey = env('P_AK');
        $ref_id = 'pln-' . Str::uuid(); // Ref ID unik

        $sign = md5($username . $apiKey . $ref_id);

        try {
            $response = Http::post(config('services.api_server') . '/v1/transaction', [
                'commands' => 'inq-pasca',
                'username' => $username,
                'buyer_sku_code' => 'pln', // Hardcode untuk PLN
                'customer_no' => $request->customer_no,
                'ref_id' => $ref_id,
                'sign' => $sign,
                'testing' => false, // Ganti ke false saat produksi
            ]);

            $responseData = $response->json();

            if (isset($responseData['data']) && $responseData['data']['status'] === 'Sukses') {
                // Simpan data inquiry di session untuk divalidasi saat pembayaran
                session(['pln_inquiry_data' => $responseData['data']]);
                return response()->json($responseData['data']);
            } else {
                return response()->json($responseData['data'] ?? ['message' => 'Gagal melakukan pengecekan tagihan.'], 400);
            }

        } catch (\Exception $e) {
            Log::error('PLN Inquiry Error: ' . $e->getMessage());
            return response()->json(['message' => 'Terjadi kesalahan pada server provider.'], 500);
        }
    }

    /**
     * Menangani permintaan pembayaran tagihan PLN.
     */
    public function payment(Request $request)
    {
        $user = Auth::user();
        $inquiryData = session('pln_inquiry_data');

        // Validasi Sesi dan Data
        if (!$inquiryData) {
            return response()->json(['message' => 'Sesi pengecekan tagihan tidak ditemukan. Silakan cek tagihan kembali.'], 400);
        }
        if ($inquiryData['customer_no'] !== $request->customer_no) {
             return response()->json(['message' => 'Nomor pelanggan tidak cocok dengan data pengecekan terakhir.'], 400);
        }

        $totalPrice = $inquiryData['price'];
        if ($user->balance < $totalPrice) {
            return response()->json(['message' => 'Saldo Anda tidak mencukupi untuk melakukan pembayaran.'], 402);
        }

        // 1. Kurangi saldo user (Optimistic Update)
        $user->decrement('balance', $totalPrice);
        
        // 2. Buat record transaksi di tabel `pasca_plns`
        $transaction = PascaPln::create([
            'user_id' => $user->id,
            'ref_id' => $inquiryData['ref_id'],
            'customer_no' => $inquiryData['customer_no'],
            'customer_name' => $inquiryData['customer_name'],
            'buyer_sku_code' => $inquiryData['buyer_sku_code'],
            'price' => $inquiryData['price'],
            'selling_price' => $inquiryData['selling_price'],
            'admin_fee' => $inquiryData['admin'],
            'status' => 'Pending',
            'message' => 'Menunggu konfirmasi pembayaran dari provider',
            'tarif' => $inquiryData['desc']['tarif'] ?? null,
            'daya' => $inquiryData['desc']['daya'] ?? null,
            'lembar_tagihan' => $inquiryData['desc']['lembar_tagihan'] ?? null,
            'bill_details' => $inquiryData['desc']['detail'] ?? [],
        ]);

        // 3. Panggil API Server untuk pembayaran
        $username = env('P_U');
        $apiKey = env('P_AK');
        $sign = md5($username . $apiKey . $inquiryData['ref_id']);

        try {
            $response = Http::post(config('services.api_server') . '/v1/transaction', [
                'commands' => 'pay-pasca',
                'username' => $username,
                'buyer_sku_code' => $inquiryData['buyer_sku_code'],
                'customer_no' => $inquiryData['customer_no'],
                'ref_id' => $inquiryData['ref_id'], // WAJIB SAMA dengan ref_id inquiry
                'sign' => $sign,
                'testing' => false, // Ganti ke false saat produksi
            ]);

            $responseData = $response->json()['data'];

            // 4. Update status transaksi di database
            $transaction->update([
                'status' => $responseData['status'],
                'sn' => $responseData['sn'] ?? null,
                'rc' => $responseData['rc'],
                'message' => $responseData['message'],
            ]);

            // 5. Jika gagal, kembalikan saldo user
            if ($responseData['status'] === 'Gagal') {
                $user->increment('balance', $totalPrice);
                Log::warning("Saldo dikembalikan untuk user ID {$user->id} pada Transaksi PLN Ref ID {$transaction->ref_id}");
            }

            session()->forget('pln_inquiry_data');
            return response()->json($responseData);

        } catch (\Exception $e) {
            // Jika API error, kembalikan saldo dan update DB
            $user->increment('balance', $totalPrice);
            $transaction->update(['status' => 'Gagal', 'message' => 'Gagal terhubung ke server provider.']);
            Log::error('PLN Payment Error: ' . $e->getMessage());
            return response()->json(['message' => 'Terjadi kesalahan pada server provider.'], 500);
        }
    }
}












// namespace App\Http\Controllers;

// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Http;
// use Illuminate\Support\Facades\Auth;
// use Illuminate\Support\Facades\Log;
// use App\Models\PascaPln; // Gunakan model spesifik kita
// use App\Models\User;
// use Illuminate\Support\Str;

// class PascaPlnController extends Controller
// {
//     /**
//      * Menangani permintaan cek tagihan (inquiry) PLN.
//      */
//     public function inquiry(Request $request)
//     {
//         $request->validate(['customer_no' => 'required|string|min:10']);

//         // --- Bagian ini tetap sama ---
//         $username = env('P_U');
//         $apiKey = env('P_AK');
//         $ref_id = 'pln-' . Str::uuid(); // Ref ID unik

//         $sign = md5($username . $apiKey . $ref_id);

//         try {
//             // Jika Anda ingin menggunakan data live dari API, gunakan kode di bawah ini
//             // $response = Http::post(config('services.api_server') . '/v1/transaction', [
//             //     'commands' => 'inq-pasca',
//             //     'username' => $username,
//             //     'buyer_sku_code' => 'pln',
//             //     'customer_no' => $request->customer_no,
//             //     'ref_id' => $ref_id,
//             //     'sign' => $sign,
//             //     'testing' => true, // Ganti ke false saat produksi
//             // ]);
//             // $responseData = $response->json();


//             // --- AWAL: KODE SIMULASI UNTUK TESTING ---
//             // Kode ini digunakan untuk mensimulasikan respons sukses dari API
//             // Hapus atau beri komentar bagian ini saat sudah terhubung ke API production
//             $mockSuccessResponse = [
//               "data" => [
//                 "ref_id" => $ref_id, // Menggunakan ref_id yang di-generate
//                 "customer_no" => $request->customer_no,
//                 "customer_name" => "NAMA PELANGGAN CONTOH",
//                 "buyer_sku_code" => "pln", // Sesuaikan jika perlu
//                 "admin" => 2500,
//                 "message" => "Transaksi Sukses",
//                 "status" => "Sukses",
//                 "rc" => "00",
//                 "buyer_last_saldo" => 100000,
//                 "price" => 8500, // (nilai_tagihan + denda)
//                 "selling_price" => 11000, // (price + admin)
//                 "desc" => [
//                   "tarif" => "R1",
//                   "daya" => 1300,
//                   "lembar_tagihan" => 1,
//                   "detail" => [
//                     [
//                       "periode" => "202507", // Contoh periode
//                       "nilai_tagihan" => "8000",
//                       "admin" => "2500",
//                       "denda" => "500"
//                     ]
//                   ]
//                 ]
//               ]
//             ];
//             $responseData = $mockSuccessResponse;
//             // --- AKHIR: KODE SIMULASI UNTUK TESTING ---


//             if (isset($responseData['data']) && $responseData['data']['status'] === 'Sukses') {
//                 // Simpan data inquiry di session untuk divalidasi saat pembayaran
//                 session(['pln_inquiry_data' => $responseData['data']]);

//                 // Mengembalikan seluruh objek 'data' yang sudah sesuai format
//                 return response()->json($responseData['data']);
//             } else {
//                 // Menangani jika status bukan 'Sukses'
//                 return response()->json($responseData['data'] ?? ['message' => 'Gagal melakukan pengecekan tagihan.'], 400);
//             }

//         } catch (\Exception $e) {
//             Log::error('PLN Inquiry Error: ' . $e->getMessage());
//             return response()->json(['message' => 'Terjadi kesalahan pada server provider.'], 500);
//         }
//     }

//     /**
//      * Menangani permintaan pembayaran tagihan PLN.
//      * (Fungsi payment tidak diubah)
//      */
//     public function payment(Request $request)
//     {
//         $user = Auth::user();
//         $inquiryData = session('pln_inquiry_data');

//         // Validasi
//         if (!$inquiryData) {
//             return response()->json(['message' => 'Sesi pengecekan tagihan tidak ditemukan.'], 400);
//         }
//         if ($inquiryData['customer_no'] !== $request->customer_no) {
//              return response()->json(['message' => 'Nomor pelanggan tidak cocok dengan data pengecekan terakhir.'], 400);
//         }
//         $totalPrice = $inquiryData['selling_price'];
//         if ($user->balance < $totalPrice) {
//             return response()->json(['message' => 'Saldo Anda tidak mencukupi untuk melakukan pembayaran.'], 402);
//         }

//         // 1. Kurangi saldo user (Optimistic Update)
//         $user->decrement('balance', $totalPrice);
        
//         // 2. Buat record transaksi di database
//         $transaction = PascaPln::create([
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
//             'bill_details' => json_encode($inquiryData['desc']['detail'] ?? []),
//         ]);

//         try {
//             /*
//             // --- KODE ASLI (dinonaktifkan sementara) ---
//             $username = env('P_U');
//             $apiKey = env('P_AK');
//             $sign = md5($username . $apiKey . $inquiryData['ref_id']);
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
//             */

//             // --- AWAL: KODE SIMULASI/MOCKUP UNTUK TESTING PAYMENT ---
//             // Membangun respons sesuai format yang diminta
//             $mockPaymentResponse = [
//                 'data' => array_merge(
//                     $inquiryData, // Mengambil semua data dari inquiry
//                     [
//                         // Menimpa atau menambahkan field spesifik pembayaran
//                         'message' => 'PEMBAYARAN PLN PASCABAYAR SUKSES.',
//                         'status' => 'Sukses',
//                         'rc' => '00',
//                         'sn' => 'MOCKSN' . Str::upper(Str::random(12)),
//                         'buyer_last_saldo' => $user->balance, // Saldo setelah di-decrement
//                     ]
//                 )
//             ];
//             // --- AKHIR: KODE SIMULASI/MOCKUP UNTUK TESTING PAYMENT ---

//             // Ambil bagian 'data' untuk di-proses di backend (update DB)
//             $responseData = $mockPaymentResponse['data'];

//             // 4. Update status transaksi di database
//             $transaction->update([
//                 'status' => $responseData['status'],
//                 'sn' => $responseData['sn'] ?? null,
//                 'rc' => $responseData['rc'],
//                 'message' => $responseData['message'],
//             ]);

//             // 5. Jika gagal, kembalikan saldo user
//             if ($responseData['status'] === 'Gagal') {
//                 $user->increment('balance', $totalPrice);
//                 Log::warning("Saldo dikembalikan untuk user ID {$user->id} pada Transaksi PLN Ref ID {$transaction->ref_id}");
//             }

//             session()->forget('pln_inquiry_data');
            
//             // 6. Kirim respons LENGKAP ke frontend, termasuk wrapper 'data'
//             return response()->json($mockPaymentResponse);

//         } catch (\Exception $e) {
//             $user->increment('balance', $totalPrice);
//             $transaction->update(['status' => 'Gagal', 'message' => 'Gagal terhubung ke server provider.']);
//             Log::error('PLN Payment Error: ' . $e->getMessage());
//             return response()->json(['message' => 'Terjadi kesalahan pada server provider.'], 500);
//         }
//     }
// }