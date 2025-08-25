<?php

// namespace App\Http\Controllers;

// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Http;
// use Illuminate\Support\Facades\Auth;
// use Illuminate\Support\Facades\Log;
// use App\Models\PascaBpjs; // Gunakan model PascaBpjs
// use App\Models\User;
// use Illuminate\Support\Str;

// class PascaBpjsController extends Controller // Nama class disesuaikan
// {
//     /**
//      * Menangani permintaan cek tagihan (inquiry) BPJS.
//      */
//     public function inquiry(Request $request)
//     {
//         $request->validate(['customer_no' => 'required|string|min:10']);

//         $username = env('P_U');
//         $apiKey = env('P_AK');
//         $ref_id = 'pascabpjs-' . Str::uuid(); // Ref ID unik

//         $sign = md5($username . $apiKey . $ref_id);

//         try {
//             $response = Http::post(config('services.api_server') . '/v1/transaction', [
//                 'commands' => 'inq-pasca',
//                 'username' => $username,
//                 'buyer_sku_code' => 'bpjs', // Kode produk tetap 'bpjs' sesuai API provider
//                 'customer_no' => $request->customer_no,
//                 'ref_id' => $ref_id,
//                 'sign' => $sign,
//                 'testing' => false,
//             ]);

//             $responseData = $response->json();

//             if (isset($responseData['data']) && $responseData['data']['status'] === 'Sukses') {
//                 session(['pascabpjs_inquiry_data' => $responseData['data']]); // Session key disesuaikan
//                 return response()->json($responseData['data']);
//             } else {
//                 return response()->json($responseData['data'] ?? ['message' => 'Gagal melakukan pengecekan tagihan.'], 400);
//             }

//         } catch (\Exception $e) {
//             Log::error('PascaBPJS Inquiry Error: ' . $e->getMessage());
//             return response()->json(['message' => 'Terjadi kesalahan pada server provider.'], 500);
//         }
//     }

//     /**
//      * Menangani permintaan pembayaran tagihan BPJS.
//      */
//     public function payment(Request $request)
//     {
//         $user = Auth::user();
//         $inquiryData = session('pascabpjs_inquiry_data'); // Session key disesuaikan

//         if (!$inquiryData) {
//             return response()->json(['message' => 'Sesi pengecekan tagihan tidak ditemukan. Silakan cek tagihan kembali.'], 400);
//         }
//         if ($inquiryData['customer_no'] !== $request->customer_no) {
//              return response()->json(['message' => 'Nomor pelanggan tidak cocok dengan data pengecekan terakhir.'], 400);
//         }

//         $totalPrice = $inquiryData['selling_price'];
//         if ($user->balance < $totalPrice) {
//             return response()->json(['message' => 'Saldo Anda tidak mencukupi untuk melakukan pembayaran.'], 402);
//         }

//         $user->decrement('balance', $totalPrice);
        
//         $transaction = PascaBpjs::create([ // Gunakan model PascaBpjs
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
//             'jumlah_peserta' => $inquiryData['desc']['jumlah_peserta'] ?? null,
//             'lembar_tagihan' => $inquiryData['desc']['lembar_tagihan'] ?? null,
//             'alamat' => $inquiryData['desc']['alamat'] ?? null,
//             'bill_details' => $inquiryData['desc']['detail'] ?? [],
//         ]);

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

//             $responseData = $response->json();
//             $paymentData = ['data' => $responseData['data'] ?? $responseData];

//             $transaction->update([
//                 'status' => $paymentData['data']['status'],
//                 'sn' => $paymentData['data']['sn'] ?? null,
//                 'rc' => $paymentData['data']['rc'],
//                 'message' => $paymentData['data']['message'],
//             ]);

//             if ($paymentData['data']['status'] === 'Gagal') {
//                 $user->increment('balance', $totalPrice);
//                 Log::warning("Saldo dikembalikan untuk user ID {$user->id} pada Transaksi PascaBPJS Ref ID {$transaction->ref_id}");
//             }

//             session()->forget('pascabpjs_inquiry_data'); // Session key disesuaikan
//             return response()->json($paymentData);

//         } catch (\Exception $e) {
//             $user->increment('balance', $totalPrice);
//             $transaction->update(['status' => 'Gagal', 'message' => 'Gagal terhubung ke server provider.']);
//             Log::error('PascaBPJS Payment Error: ' . $e->getMessage());
//             return response()->json(['message' => 'Terjadi kesalahan pada server provider.'], 500);
//         }
//     }
// }




























namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\PascaBpjs; // Pastikan model di-import
use Illuminate\Support\Str;

class PascaBpjsController extends Controller
{
    /**
     * Menangani permintaan cek tagihan (inquiry) BPJS (MODE TESTING).
     * Fungsi ini tidak berubah, karena inquiry tidak menulis ke database.
     */
    public function inquiry(Request $request)
    {
        $request->validate(['customer_no' => 'required|string']);
        $customerNo = $request->customer_no;
        $ref_id = 'pascabpjs-' . Str::uuid();

        if ($customerNo === '8801234560001' || $customerNo === '8801234560005') {
            $responseData = [
                "ref_id" => $ref_id,
                "customer_no" => $customerNo,
                "customer_name" => "NAMA PELANGGAN (TEST)",
                "buyer_sku_code" => "bpjs",
                "admin" => 2500,
                "message" => "Pengecekan Tagihan Berhasil",
                "status" => "Sukses",
                "price" => 24700,
                "selling_price" => 25000,
                "desc" => [
                    "jumlah_peserta" => "2",
                    "lembar_tagihan" => 1,
                    "alamat" => "JAKARTA PUSAT",
                    "detail" => [["periode" => "01"]]
                ]
            ];
            session(['pascabpjs_inquiry_data' => $responseData]);
            return response()->json($responseData);
        } elseif ($customerNo === '8801234560002') {
            $responseData = [
                'status' => 'Gagal',
                'message' => 'Inquiry Gagal: Nomor Pelanggan Tidak Ditemukan. (TEST)',
                'customer_no' => $customerNo,
            ];
            return response()->json($responseData, 400);
        } else {
            $responseData = [
                'status' => 'Gagal',
                'message' => 'Nomor pelanggan ini tidak terdaftar untuk testing.',
                'customer_no' => $customerNo,
            ];
            return response()->json($responseData, 404);
        }
    }

    /**
     * Menangani permintaan pembayaran tagihan BPJS (MODE TESTING DENGAN DATABASE).
     */
    public function payment(Request $request)
    {
        $user = Auth::user();
        $inquiryData = session('pascabpjs_inquiry_data');

        // Validasi Sesi dan Data
        if (!$inquiryData) {
            return response()->json(['message' => 'Sesi pengecekan tagihan tidak ditemukan.'], 400);
        }
        if ($inquiryData['customer_no'] !== $request->customer_no) {
             return response()->json(['message' => 'Nomor pelanggan tidak cocok.'], 400);
        }

        $totalPrice = $inquiryData['selling_price'];
        if ($user->balance < $totalPrice) {
            return response()->json(['message' => 'Saldo Anda tidak mencukupi.'], 402);
        }

        // 1. Kurangi saldo user (Optimistic Update)
        $user->decrement('balance', $totalPrice);
        
        // 2. Buat record transaksi di database dengan status 'Pending'
        $transaction = PascaBpjs::create([
            'user_id' => $user->id,
            'ref_id' => $inquiryData['ref_id'],
            'customer_no' => $inquiryData['customer_no'],
            'customer_name' => $inquiryData['customer_name'],
            'buyer_sku_code' => $inquiryData['buyer_sku_code'],
            'price' => $inquiryData['price'],
            'selling_price' => $inquiryData['selling_price'],
            'admin_fee' => $inquiryData['admin'],
            'status' => 'Pending', // Status awal
            'message' => 'Menunggu konfirmasi pembayaran dari provider',
            'jumlah_peserta' => $inquiryData['desc']['jumlah_peserta'] ?? null,
            'lembar_tagihan' => $inquiryData['desc']['lembar_tagihan'] ?? null,
            'alamat' => $inquiryData['desc']['alamat'] ?? null,
            'bill_details' => $inquiryData['desc']['detail'] ?? [],
        ]);

        // 3. Simulasi Response API berdasarkan customer_no dari session
        $customerNo = $inquiryData['customer_no'];
        $paymentData = null;

        if ($customerNo === '8801234560001') { // Skenario SUKSES
            $paymentData = [
                "data" => [
                    "ref_id" => $inquiryData['ref_id'],
                    "customer_no" => $customerNo,
                    "customer_name" => "NAMA PELANGGAN (TEST)",
                    "buyer_sku_code" => "bpjs", "admin" => 2500, "message" => "Transaksi Sukses",
                    "status" => "Sukses", "sn" => "BP1234554321JS", "rc" => "00",
                    "buyer_last_saldo" => $user->balance, "price" => 24700, "selling_price" => 25000,
                    "desc" => $inquiryData['desc']
                ]
            ];
        } elseif ($customerNo === '8801234560005') { // Skenario GAGAL
            $paymentData = [
                "data" => [
                    "ref_id" => $inquiryData['ref_id'], "customer_no" => $customerNo,
                    "customer_name" => "NAMA PELANGGAN (TEST)", "buyer_sku_code" => "bpjs",
                    "message" => "Pembayaran Gagal (TEST)",
                    "status" => "Gagal", "rc" => "40", "selling_price" => 25000,
                ]
            ];
        }

        // 4. Update status transaksi di database berdasarkan hasil simulasi
        $transaction->update([
            'status' => $paymentData['data']['status'],
            'sn' => $paymentData['data']['sn'] ?? null,
            'rc' => $paymentData['data']['rc'] ?? null,
            'message' => $paymentData['data']['message'],
        ]);

        // 5. Jika simulasi gagal, kembalikan saldo user (Rollback)
        if ($paymentData['data']['status'] === 'Gagal') {
            $user->increment('balance', $totalPrice);
            Log::warning("TESTING: Saldo dikembalikan untuk user ID {$user->id} pada Transaksi PascaBPJS Ref ID {$transaction->ref_id}");
        }

        session()->forget('pascabpjs_inquiry_data');
        return response()->json($paymentData);
    }
}