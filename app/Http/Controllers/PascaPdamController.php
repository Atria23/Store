<?php

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
//         // dd($products);
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

//             // Hitung markup/diskon yang kita berikan ke user
//             $markupForClient = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;
//             // Admin yang dihitung ini adalah admin yang akan kita tunjukkan ke klien di list produk,
//             // yang sudah termasuk diskon dari komisi kita.
//             // BULATKAN KE ATAS biaya admin yang dihitung
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
//                                 ->where('seller_product_status', true) // Tetap filter hanya produk aktif saat inquiry
//                                 ->first();

//         if (!$product) {
//             return response()->json(['message' => 'Produk PDAM tidak tersedia atau tidak aktif.'], 503);
//         }

//         $ref_id = 'pdam-' . substr(str_replace('-', '', Str::uuid()->toString()), 0, 15);
//         $username = env('P_U');
//         $apiKey = env('P_AKD'); // Pastikan ini adalah API Key yang benar untuk PDAM
//         $sign = md5($username . $apiKey . $ref_id);

//         try {
//             $response = Http::post(config('services.api_server') . '/v1/transaction', [
//                 'commands' => 'inq-pasca',
//                 'username' => $username,
//                 'buyer_sku_code' => $current_sku,
//                 'customer_no' => $customerNo,
//                 'ref_id' => $ref_id,
//                 'sign' => $sign,
//                 'testing' => true,
//             ]);

//             $responseData = $response->json();

//             if (isset($responseData['data']) && $responseData['data']['status'] === 'Sukses') {
//                 $inquiryDataFromApi = $responseData['data'];

//                 // Pastikan 'desc' ada dan merupakan array
//                 if (!isset($inquiryDataFromApi['desc']) || !is_array($inquiryDataFromApi['desc'])) {
//                     $inquiryDataFromApi['desc'] = [];
//                 }

//                 // Tambahkan atau pertahankan nilai 'tarif', 'alamat', 'jatuh_tempo'
//                 // Jika sudah ada dari API, gunakan nilai API. Jika tidak, set ke null.
//                 $inquiryDataFromApi['desc']['tarif']       = $inquiryDataFromApi['desc']['tarif'] ?? null;
//                 $inquiryDataFromApi['desc']['alamat']      = $inquiryDataFromApi['desc']['alamat'] ?? null;
//                 $inquiryDataFromApi['desc']['jatuh_tempo'] = $inquiryDataFromApi['desc']['jatuh_tempo'] ?? null;


//                 // Inisialisasi variabel perhitungan
//                 $totalNilaiTagihan = 0;
//                 $totalDenda = 0;
//                 $totalBiayaLain = 0; // Untuk PDAM, ada biaya lain-lain
//                 $jumlahLembarTagihan = 0;
//                 $totalAdminFromProvider = (float) ($inquiryDataFromApi['admin'] ?? 0); // Admin dari provider

//                 // --- PENTING: Prioritas Ambil jumlah lembar tagihan dari 'desc.lembar_tagihan' ---
//                 if (isset($inquiryDataFromApi['desc']['lembar_tagihan'])) {
//                     $jumlahLembarTagihan = (int) $inquiryDataFromApi['desc']['lembar_tagihan'];
//                 } elseif (isset($inquiryDataFromApi['desc']['detail']) && is_array($inquiryDataFromApi['desc']['detail'])) {
//                     // Fallback ke count detail jika 'lembar_tagihan' tidak ada
//                     $jumlahLembarTagihan = count($inquiryDataFromApi['desc']['detail']);
//                 } else {
//                     $jumlahLembarTagihan = 1; // Default ke 1 jika tidak ditemukan sama sekali
//                 }

//                 // Akumulasikan nilai tagihan, denda, dan biaya lain dari detail
//                 if (isset($inquiryDataFromApi['desc']['detail']) && is_array($inquiryDataFromApi['desc']['detail'])) {
//                     foreach ($inquiryDataFromApi['desc']['detail'] as $detail) {
//                         $totalNilaiTagihan += (float) ($detail['nilai_tagihan'] ?? 0);
//                         $totalDenda += (float) ($detail['denda'] ?? 0);
//                         $totalBiayaLain += (float) ($detail['biaya_lain'] ?? 0); // Akumulasi biaya_lain
//                     }
//                 } else {
//                     // Fallback jika tidak ada detail, asumsikan 'price' adalah total tagihan murni dari provider
//                     // dan 'denda' serta 'biaya_lain' mungkin ada di root desc
//                     // Ini perlu dikonfirmasi dengan struktur respons API aktual jika detail tidak ada.
//                     $totalNilaiTagihan = (float) ($inquiryDataFromApi['price'] ?? 0); // Asumsi ini adalah total tagihan murni + biaya lain jika tidak ada detail
//                     $totalDenda = (float) ($inquiryDataFromApi['desc']['denda'] ?? 0);
//                     $totalBiayaLain = (float) ($inquiryDataFromApi['desc']['biaya_lain'] ?? 0);
//                 }

//                 // 1. Hitung Diskon dasar per lembar berdasarkan komisi produk
//                 $commission = $product->commission ?? 0;
//                 $commission_sell_percentage = $product->commission_sell_percentage ?? 0;
//                 $commission_sell_fixed = $product->commission_sell_fixed ?? 0;
//                 $diskonPerLembar = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;

//                 // 2. Kalikan diskon per lembar dengan jumlah lembar tagihan
//                 $finalDiskon = $diskonPerLembar * $jumlahLembarTagihan;
//                 // BULATKAN KE ATAS diskon
//                 $finalDiskon = ceil($finalDiskon);


//                 // 3. Hitung Total Pembayaran Akhir (dengan Diskon)
//                 // selling_price = (nilai_tagihan_murni + biaya_lain) + admin_dari_provider + total_denda - total_diskon_kita
//                 $finalSellingPrice = ($totalNilaiTagihan + $totalBiayaLain) + $totalAdminFromProvider + $totalDenda - $finalDiskon;
//                 // Pastikan selling_price juga dibulatkan ke atas untuk menghindari pecahan sen
//                 $finalSellingPrice = ceil($finalSellingPrice);


//                 // 4. Susun kembali data untuk dikirim ke frontend dan disimpan di sesi
//                 $inquiryDataFromApi['price']         = $totalNilaiTagihan + $totalBiayaLain; // Total nilai tagihan murni + biaya lain
//                 $inquiryDataFromApi['admin']         = $totalAdminFromProvider; // Admin dari provider
//                 $inquiryDataFromApi['denda']         = $totalDenda; // Total denda
//                 $inquiryDataFromApi['diskon']        = $finalDiskon; // Simpan diskon yang sudah dikalikan
//                 $inquiryDataFromApi['jumlah_lembar_tagihan'] = $jumlahLembarTagihan; // Jumlah lembar tagihan
//                 $inquiryDataFromApi['selling_price'] = $finalSellingPrice; // Total yang harus dibayar pelanggan
//                 $inquiryDataFromApi['buyer_sku_code'] = $current_sku;
//                 $inquiryDataFromApi['ref_id'] = $ref_id; // Pastikan ref_id ikut disimpan

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
//      */
//     public function payment(Request $request)
//     {
//         $user = Auth::user();
//         $inquiryData = session('postpaid_inquiry_data');

//         if (!$inquiryData || $inquiryData['customer_no'] !== $request->customer_no) {
//             return response()->json(['message' => 'Sesi tidak valid atau nomor pelanggan tidak cocok.'], 400);
//         }

//         $totalPriceToPay     = $inquiryData['selling_price'];
//         $finalAdmin          = $inquiryData['admin']; // Admin dari provider
//         $pureBillPrice       = $inquiryData['price']; // Total nilai tagihan + biaya lain
//         $diskon              = $inquiryData['diskon'] ?? 0;
//         $jumlahLembarTagihan = $inquiryData['jumlah_lembar_tagihan'] ?? 0;
//         $denda               = $inquiryData['denda'] ?? 0; // Total denda dari inquiry

//         if ($user->balance < $totalPriceToPay) {
//             return response()->json(['message' => 'Saldo Anda tidak mencukupi.'], 402);
//         }

//         // Dekremen saldo sebelum memanggil API provider
//         $user->decrement('balance', $totalPriceToPay);

//         // Buat transaksi awal di tabel terpadu dengan status 'Pending'
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
//             'desc' => $inquiryData['desc'] ?? null, // Simpan seluruh deskripsi dari API inquiry jika perlu
//         ];

//         $unifiedTransaction = PostpaidTransaction::create($initialData);

//         $apiResponseData = [];

//         $username = env('P_U');
//         $apiKey = env('P_AKD'); // Pastikan ini adalah API Key yang benar untuk PDAM
//         $sign = md5($username . $apiKey . $inquiryData['ref_id']); // Gunakan ref_id dari inquiry

//         try {
//             $response = Http::post(config('services.api_server') . '/v1/transaction', [
//                 'commands' => 'pay-pasca',
//                 'username' => $username,
//                 'buyer_sku_code' => $inquiryData['buyer_sku_code'],
//                 'customer_no' => $inquiryData['customer_no'],
//                 'ref_id' => $inquiryData['ref_id'], // Gunakan ref_id yang sama dengan inquiry
//                 'sign' => $sign,
//                 'testing' => true,
//             ]);
//             $apiResponseData = $response->json()['data'];

//             Log::info('PDAM Payment API Response:', ['response_data' => $apiResponseData, 'transaction_id' => $unifiedTransaction->id]);

//         } catch (\Exception $e) {
//             // Jika gagal terhubung ke provider, kembalikan saldo
//             $user->increment('balance', $totalPriceToPay);
//             $errorMessage = ['status' => 'Gagal', 'message' => 'Gagal terhubung ke server provider.'];

//             // Update transaksi sebagai gagal
//             $unifiedTransaction->update(array_merge($errorMessage, ['rc' => null, 'sn' => null]));

//             Log::error('PDAM Payment Error: ' . $e->getMessage(), ['transaction_id' => $unifiedTransaction->id, 'inquiry_data' => $inquiryData]);
//             return response()->json(['message' => 'Terjadi kesalahan pada server provider.'], 500);
//         }

//         $fullResponseData = array_merge($inquiryData, $apiResponseData);

//         // Gunakan mapper lagi untuk menghasilkan data update yang lengkap
//         $updatePayload = $this->mapToUnifiedTransaction($fullResponseData, 'PDAM', $pureBillPrice, $finalAdmin);
//         $updatePayload['selling_price'] = $totalPriceToPay; // Pastikan selling_price tidak berubah dari inquiry

//         $updatePayload['rc'] = $apiResponseData['rc'] ?? null;
//         $updatePayload['sn'] = $apiResponseData['sn'] ?? null;

//         // Kunci yang tidak perlu disimpan berulang di 'details' jika sudah ada di kolom lain
//         $keysToExcludeFromDetails = [
//             'ref_id', 'customer_no', 'customer_name', 'buyer_sku_code', 'message',
//             'rc', 'sn', 'buyer_last_saldo', 'price', 'selling_price', 'admin', 'status',
//             'diskon', 'jumlah_lembar_tagihan', 'denda', 'desc', // Exclude desc here as we explicitly handle it below
//         ];

//         $detailsFromApiResponse = [];
//         foreach ($apiResponseData as $key => $value) {
//             if (!in_array($key, $keysToExcludeFromDetails)) {
//                 $detailsFromApiResponse[$key] = $value;
//             }
//         }

//         // Merge detail dari inquiry dengan detail tambahan dari response API
//         // dan pastikan data diskon, jumlah lembar tagihan, denda, dan desc tetap ada
//         $updatePayload['details'] = array_merge(
//             $detailsFromApiResponse,
//             ['diskon' => $diskon, 'jumlah_lembar_tagihan' => $jumlahLembarTagihan, 'denda' => $denda],
//             ['desc' => $inquiryData['desc'] ?? null] // Simpan desc asli dari inquiry
//         );

//         // Hapus kunci yang sudah ditangani oleh mapToUnifiedTransaction
//         unset($updatePayload['user_id'], $updatePayload['ref_id'], $updatePayload['type'], $updatePayload['price'], $updatePayload['admin_fee']);

//         $unifiedTransaction->update($updatePayload);

//         // --- START OF MODIFICATION ---
//         // Refresh the model to get the very latest data from the database
//         $unifiedTransaction->refresh();

//         // Update the $fullResponseData with the actual values saved in the database
//         // This ensures the frontend displays exactly what's recorded.
//         $fullResponseData['selling_price'] = $unifiedTransaction->selling_price;
//         $fullResponseData['status'] = $unifiedTransaction->status;
//         $fullResponseData['message'] = $unifiedTransaction->message; // Update message
//         $fullResponseData['customer_name'] = $unifiedTransaction->customer_name;
//         $fullResponseData['customer_no'] = $unifiedTransaction->customer_no;
//         $fullResponseData['diskon'] = $unifiedTransaction->details['diskon'] ?? 0;
//         $fullResponseData['denda'] = $unifiedTransaction->details['denda'] ?? 0;
//         $fullResponseData['admin'] = $unifiedTransaction->admin_fee; // Ambil admin_fee dari transaksi
//         $fullResponseData['price'] = $unifiedTransaction->price; // Ambil price dari transaksi
//         $fullResponseData['sn'] = $unifiedTransaction->sn;
//         $fullResponseData['ref_id'] = $unifiedTransaction->ref_id;
//         $fullResponseData['details'] = $unifiedTransaction->details; // Ensure details are passed for 'desc'
//         // --- END OF MODIFICATION ---

//         // Jika status transaksi dari provider adalah 'Gagal', kembalikan saldo
//         if (($apiResponseData['status'] ?? 'Gagal') === 'Gagal' && $unifiedTransaction->status === 'Gagal') {
//             $user->increment('balance', $totalPriceToPay);
//         }

//         session()->forget('postpaid_inquiry_data');
//         return response()->json($fullResponseData);
//     }
// }
















// >>>>>>>>>>>>>     ASLI BELUM NYOBA BENERNYA      <<<<<<<<<<<<<<<<<<<<<<<

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
            'auth' => [ // Pastikan data auth user juga dikirim
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

            // Hitung markup/diskon yang kita berikan ke user
            $markupForClient = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;
            // Admin yang dihitung ini adalah admin yang akan kita tunjukkan ke klien di list produk,
            // yang sudah termasuk diskon dari komisi kita.
            // BULATKAN KE ATAS biaya admin yang dihitung
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
                                ->where('seller_product_status', '1') // Tetap filter hanya produk aktif saat inquiry
                                ->first();

        if (!$product) {
            return response()->json(['message' => 'Produk PDAM tidak tersedia atau tidak aktif.'], 503);
        }

        $ref_id = 'pdam-' . substr(str_replace('-', '', Str::uuid()->toString()), 0, 15);
        $username = env('P_U');
        $apiKey = env('P_AK'); // Pastikan ini adalah API Key yang benar untuk PDAM
        $sign = md5($username . $apiKey . $ref_id);

        try {
            // --- ASLI: Panggilan ke API eksternal untuk inquiry ---
            $response = Http::post(config('services.api_server') . '/v1/transaction', [
                'commands' => 'inq-pasca',
                'username' => $username,
                'buyer_sku_code' => $current_sku,
                'customer_no' => $customerNo,
                'ref_id' => $ref_id,
                'sign' => $sign,
                'testing' => false, // Pertimbangkan untuk mengubah ini ke false di produksi
            ]);

            $responseData = $response->json();

            if (isset($responseData['data']) && $responseData['data']['status'] === 'Sukses') {
                $inquiryDataFromApi = $responseData['data'];

                // Pastikan 'desc' ada dan merupakan array
                if (!isset($inquiryDataFromApi['desc']) || !is_array($inquiryDataFromApi['desc'])) {
                    $inquiryDataFromApi['desc'] = [];
                }

                // Tambahkan atau pertahankan nilai 'tarif', 'alamat', 'jatuh_tempo'
                // Jika sudah ada dari API, gunakan nilai API. Jika tidak, set ke null.
                $inquiryDataFromApi['desc']['tarif']       = $inquiryDataFromApi['desc']['tarif'] ?? null;
                $inquiryDataFromApi['desc']['alamat']      = $inquiryDataFromApi['desc']['alamat'] ?? null;
                $inquiryDataFromApi['desc']['jatuh_tempo'] = $inquiryDataFromApi['desc']['jatuh_tempo'] ?? null;


                // Inisialisasi variabel perhitungan
                $totalNilaiTagihan = 0;
                $totalDenda = 0;
                $totalBiayaLain = 0; // Untuk PDAM, ada biaya lain-lain
                $jumlahLembarTagihan = 0;
                $totalAdminFromProvider = (float) ($inquiryDataFromApi['admin'] ?? 0); // Admin dari provider

                // --- PENTING: Prioritas Ambil jumlah lembar tagihan dari 'desc.lembar_tagihan' ---
                if (isset($inquiryDataFromApi['desc']['lembar_tagihan'])) {
                    $jumlahLembarTagihan = (int) $inquiryDataFromApi['desc']['lembar_tagihan'];
                } elseif (isset($inquiryDataFromApi['desc']['detail']) && is_array($inquiryDataFromApi['desc']['detail'])) {
                    // Fallback ke count detail jika 'lembar_tagihan' tidak ada
                    $jumlahLembarTagihan = count($inquiryDataFromApi['desc']['detail']);
                } else {
                    $jumlahLembarTagihan = 1; // Default ke 1 jika tidak ditemukan sama sekali
                }

                // Akumulasikan nilai tagihan, denda, dan biaya lain dari detail
                if (isset($inquiryDataFromApi['desc']['detail']) && is_array($inquiryDataFromApi['desc']['detail'])) {
                    foreach ($inquiryDataFromApi['desc']['detail'] as $detail) {
                        $totalNilaiTagihan += (float) ($detail['nilai_tagihan'] ?? 0);
                        $totalDenda += (float) ($detail['denda'] ?? 0);
                        $totalBiayaLain += (float) ($detail['biaya_lain'] ?? 0); // Akumulasi biaya_lain
                    }
                } else {
                    // Fallback jika tidak ada detail, asumsikan 'price' adalah total tagihan murni dari provider
                    // dan 'denda' serta 'biaya_lain' mungkin ada di root desc
                    // Ini perlu dikonfirmasi dengan struktur respons API aktual jika detail tidak ada.
                    $totalNilaiTagihan = (float) ($inquiryDataFromApi['price'] ?? 0); // Asumsi ini adalah total tagihan murni + biaya lain jika tidak ada detail
                    $totalDenda = (float) ($inquiryDataFromApi['desc']['denda'] ?? 0);
                    $totalBiayaLain = (float) ($inquiryDataFromApi['desc']['biaya_lain'] ?? 0);
                }

                // 1. Hitung Diskon dasar per lembar berdasarkan komisi produk
                $commission = $product->commission ?? 0;
                $commission_sell_percentage = $product->commission_sell_percentage ?? 0;
                $commission_sell_fixed = $product->commission_sell_fixed ?? 0;
                $diskonPerLembar = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;

                // 2. Kalikan diskon per lembar dengan jumlah lembar tagihan
                $finalDiskon = $diskonPerLembar * $jumlahLembarTagihan;
                // BULATKAN KE ATAS diskon
                $finalDiskon = ceil($finalDiskon);


                // 3. Hitung Total Pembayaran Akhir (dengan Diskon)
                // selling_price = (nilai_tagihan_murni + biaya_lain) + admin_dari_provider + total_denda - total_diskon_kita
                $finalSellingPrice = ($totalNilaiTagihan + $totalBiayaLain) + $totalAdminFromProvider + $totalDenda - $finalDiskon;
                // Pastikan selling_price juga dibulatkan ke atas untuk menghindari pecahan sen
                $finalSellingPrice = ceil($finalSellingPrice);


                // 4. Susun kembali data untuk dikirim ke frontend dan disimpan di sesi
                $inquiryDataFromApi['price']         = $totalNilaiTagihan + $totalBiayaLain; // Total nilai tagihan murni + biaya lain
                $inquiryDataFromApi['admin']         = $totalAdminFromProvider; // Admin dari provider
                $inquiryDataFromApi['denda']         = $totalDenda; // Total denda
                $inquiryDataFromApi['diskon']        = $finalDiskon; // Simpan diskon yang sudah dikalikan
                $inquiryDataFromApi['jumlah_lembar_tagihan'] = $jumlahLembarTagihan; // Jumlah lembar tagihan
                $inquiryDataFromApi['selling_price'] = $finalSellingPrice; // Total yang harus dibayar pelanggan
                $inquiryDataFromApi['buyer_sku_code'] = $current_sku;
                $inquiryDataFromApi['ref_id'] = $ref_id; // Pastikan ref_id ikut disimpan

                session(['postpaid_inquiry_data' => $inquiryDataFromApi]);
                return response()->json($inquiryDataFromApi);
            } else {
                $errorMessage = $responseData['data']['message'] ?? 'Gagal melakukan pengecekan tagihan.';
                Log::warning("Inquiry PDAM Gagal untuk SKU: {$current_sku}. Pesan: {$errorMessage}", ['response' => $responseData]);
                return response()->json(['message' => $errorMessage], 400);
            }
        } catch (\Exception $e) {
            Log::error('PDAM Inquiry Error: ' . $e->getMessage(), ['customer_no' => $customerNo, 'sku' => $current_sku]);
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

        $totalPriceToPay     = $inquiryData['selling_price'];
        $finalAdmin          = $inquiryData['admin']; // Admin dari provider
        $pureBillPrice       = $inquiryData['price']; // Total nilai tagihan + biaya lain
        $diskon              = $inquiryData['diskon'] ?? 0;
        $jumlahLembarTagihan = $inquiryData['jumlah_lembar_tagihan'] ?? 0;
        $denda               = $inquiryData['denda'] ?? 0; // Total denda dari inquiry

        if ($user->balance < $totalPriceToPay) {
            return response()->json(['message' => 'Saldo Anda tidak mencukupi.'], 402);
        }

        // Dekremen saldo sebelum memanggil API provider
        $user->decrement('balance', $totalPriceToPay);

        // Buat transaksi awal di tabel terpadu dengan status 'Pending'
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
            'desc' => $inquiryData['desc'] ?? null, // Simpan seluruh deskripsi dari API inquiry jika perlu
        ];

        $unifiedTransaction = PostpaidTransaction::create($initialData);

        $apiResponseData = [];

        $username = env('P_U');
        $apiKey = env('P_AK'); // Pastikan ini adalah API Key yang benar untuk PDAM
        $sign = md5($username . $apiKey . $inquiryData['ref_id']); // Gunakan ref_id dari inquiry

        try {
            // --- ASLI: Panggilan ke API eksternal untuk payment ---
            $response = Http::post(config('services.api_server') . '/v1/transaction', [
                'commands' => 'pay-pasca',
                'username' => $username,
                'buyer_sku_code' => $inquiryData['buyer_sku_code'],
                'customer_no' => $inquiryData['customer_no'],
                'ref_id' => $inquiryData['ref_id'], // Gunakan ref_id yang sama dengan inquiry
                'sign' => $sign,
                'testing' => false, // Pertimbangkan untuk mengubah ini ke false di produksi
            ]);
            $apiResponseData = $response->json()['data'];

            Log::info('PDAM Payment API Response:', ['response_data' => $apiResponseData, 'transaction_id' => $unifiedTransaction->id]);

        } catch (\Exception $e) {
            // Jika gagal terhubung ke provider, kembalikan saldo
            $user->increment('balance', $totalPriceToPay);
            $errorMessage = ['status' => 'Gagal', 'message' => 'Gagal terhubung ke server provider.'];

            // Update transaksi sebagai gagal
            $unifiedTransaction->update(array_merge($errorMessage, ['rc' => null, 'sn' => null]));

            Log::error('PDAM Payment Error: ' . $e->getMessage(), ['transaction_id' => $unifiedTransaction->id, 'inquiry_data' => $inquiryData]);
            return response()->json(['message' => 'Terjadi kesalahan pada server provider.'], 500);
        }

        $fullResponseData = array_merge($inquiryData, $apiResponseData);

        // Gunakan mapper lagi untuk menghasilkan data update yang lengkap
        $updatePayload = $this->mapToUnifiedTransaction($fullResponseData, 'PDAM', $pureBillPrice, $finalAdmin);
        $updatePayload['selling_price'] = $totalPriceToPay; // Pastikan selling_price tidak berubah dari inquiry

        $updatePayload['rc'] = $apiResponseData['rc'] ?? null;
        $updatePayload['sn'] = $apiResponseData['sn'] ?? null;

        // Kunci yang tidak perlu disimpan berulang di 'details' jika sudah ada di kolom lain
        $keysToExcludeFromDetails = [
            'ref_id', 'customer_no', 'customer_name', 'buyer_sku_code', 'message',
            'rc', 'sn', 'buyer_last_saldo', 'price', 'selling_price', 'admin', 'status',
            'diskon', 'jumlah_lembar_tagihan', 'denda', 'desc', // Exclude desc here as we explicitly handle it below
        ];

        $detailsFromApiResponse = [];
        foreach ($apiResponseData as $key => $value) {
            if (!in_array($key, $keysToExcludeFromDetails)) {
                $detailsFromApiResponse[$key] = $value;
            }
        }

        // Merge detail dari inquiry dengan detail tambahan dari response API
        // dan pastikan data diskon, jumlah lembar tagihan, denda, dan desc tetap ada
        $updatePayload['details'] = array_merge(
            $detailsFromApiResponse,
            ['diskon' => $diskon, 'jumlah_lembar_tagihan' => $jumlahLembarTagihan, 'denda' => $denda],
            ['desc' => $inquiryData['desc'] ?? null] // Simpan desc asli dari inquiry
        );

        // Hapus kunci yang sudah ditangani oleh mapToUnifiedTransaction
        unset($updatePayload['user_id'], $updatePayload['ref_id'], $updatePayload['type'], $updatePayload['price'], $updatePayload['admin_fee']);

        $unifiedTransaction->update($updatePayload);

        // --- START OF MODIFICATION ---
        // Refresh the model to get the very latest data from the database
        $unifiedTransaction->refresh();

        // Update the $fullResponseData with the actual values saved in the database
        // This ensures the frontend displays exactly what's recorded.
        $fullResponseData['selling_price'] = $unifiedTransaction->selling_price;
        $fullResponseData['status'] = $unifiedTransaction->status;
        $fullResponseData['message'] = $unifiedTransaction->message; // Update message
        $fullResponseData['customer_name'] = $unifiedTransaction->customer_name;
        $fullResponseData['customer_no'] = $unifiedTransaction->customer_no;
        $fullResponseData['diskon'] = $unifiedTransaction->details['diskon'] ?? 0;
        $fullResponseData['denda'] = $unifiedTransaction->details['denda'] ?? 0;
        $fullResponseData['admin'] = $unifiedTransaction->admin_fee; // Ambil admin_fee dari transaksi
        $fullResponseData['price'] = $unifiedTransaction->price; // Ambil price dari transaksi
        $fullResponseData['sn'] = $unifiedTransaction->sn;
        $fullResponseData['ref_id'] = $unifiedTransaction->ref_id;
        $fullResponseData['details'] = $unifiedTransaction->details; // Ensure details are passed for 'desc'
        // --- END OF MODIFICATION ---

        // Jika status transaksi dari provider adalah 'Gagal', kembalikan saldo
        if (($apiResponseData['status'] ?? 'Gagal') === 'Gagal' && $unifiedTransaction->status === 'Gagal') {
            $user->increment('balance', $totalPriceToPay);
        }

        session()->forget('postpaid_inquiry_data');
        return response()->json($fullResponseData);
    }
}




















// >>>>>>>>>> DUMMY BENAR <<<<<<<<<<<<<<

// namespace App\Http\Controllers;

// use App\Models\PostpaidTransaction;
// use App\Models\PostpaidProduct;
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Auth;
// use Illuminate\Support\Facades\Http; // Tetap ada, tapi tidak dipanggil di dummy
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

//             // Hitung markup/diskon yang kita berikan ke user
//             $markupForClient = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;
//             // Admin yang dihitung ini adalah admin yang akan kita tunjukkan ke klien di list produk,
//             // yang sudah termasuk diskon dari komisi kita.
//             // BULATKAN KE ATAS biaya admin yang dihitung
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
//                                 ->where('seller_product_status', '1')
//                                 ->first();

//         if (!$product) {
//             return response()->json(['message' => 'Produk PDAM tidak tersedia atau tidak aktif untuk inquiry.'], 503);
//         }

//         $ref_id = 'pdam-' . substr(str_replace('-', '', Str::uuid()->toString()), 0, 15);
//         $username = env('P_U');
//         $apiKey = env('P_AKD');
//         $sign = md5($username . $apiKey . $ref_id);

//         // --- START DUMMY RESPONSE INQUIRY ---

//         // Definisikan secara spesifik struktur 'desc' yang Anda inginkan
//         $specificDescData = [
//             "tarif" => "3A",
//             "lembar_tagihan" => 1,
//             "alamat" => "-",
//             "jatuh_tempo" => "1-15 DES 2014",
//             "detail" => [
//                 [
//                     "periode" => "201901",
//                     "nilai_tagihan" => "8000",
//                     "denda" => "500",
//                     "meter_awal" => "00080000",
//                     "meter_akhir" => "00090000",
//                     "biaya_lain" => "1500"
//                 ]
//             ]
//         ];

//         $dummyStatus = 'Sukses';
//         $dummyMessage = 'Inquiry PDAM berhasil.';
//         $dummyCustomerName = 'Pelanggan PDAM Dummy ' . substr($customerNo, 0, 4);

//         // Hitung total nilai dari specificDescData untuk dummy price
//         $calculatedPrice = 0;
//         $calculatedDenda = 0;
//         $calculatedBiayaLain = 0;
//         if (isset($specificDescData['detail']) && is_array($specificDescData['detail'])) {
//             foreach ($specificDescData['detail'] as $detail) {
//                 $calculatedPrice += (float) ($detail['nilai_tagihan'] ?? 0);
//                 $calculatedDenda += (float) ($detail['denda'] ?? 0);
//                 $calculatedBiayaLain += (float) ($detail['biaya_lain'] ?? 0);
//             }
//         } else {
//             // Fallback jika tidak ada detail, ambil dari root (sesuai contoh Anda tidak ada)
//             // Anda bisa menyesuaikan ini jika ada skenario tanpa detail tapi dengan price di root
//         }

//         // Dummy admin dari provider
//         $dummyAdminFromProvider = 2500; // Contoh admin dari provider

//         // Bangun respons dummy
//         $responseData = [
//             'data' => [
//                 'status' => $dummyStatus,
//                 'message' => $dummyMessage,
//                 'customer_name' => $dummyCustomerName,
//                 'customer_no' => $customerNo,
//                 'buyer_sku_code' => $current_sku,
//                 'price' => $calculatedPrice + $calculatedBiayaLain, // Total nilai tagihan + biaya lain dari dummy detail
//                 'admin' => $dummyAdminFromProvider,
//                 'rc' => '00',
//                 'sn' => 'SN-INQ-' . Str::random(12),
//                 'ref_id' => $ref_id,
//                 'desc' => $specificDescData, // <-- Ini yang kita ganti, langsung pakai data spesifik
//             ],
//         ];

//         // --- END DUMMY RESPONSE INQUIRY ---

//         if (isset($responseData['data']) && $responseData['data']['status'] === 'Sukses') {
//             $inquiryDataFromApi = $responseData['data'];

//             // Bagian ini sekarang sebagian besar tidak perlu mengubah `desc` lagi
//             // karena sudah dibentuk sesuai keinginan di $specificDescData.
//             // Namun, tetap pastikan `desc` ada dan valid.
//             if (!isset($inquiryDataFromApi['desc']) || !is_array($inquiryDataFromApi['desc'])) {
//                 $inquiryDataFromApi['desc'] = [];
//             }

//             // Variabel ini sudah diatur dalam $specificDescData, tidak perlu di-override lagi di sini
//             // $inquiryDataFromApi['desc']['tarif']       = $inquiryDataFromApi['desc']['tarif'] ?? null;
//             // $inquiryDataFromApi['desc']['alamat']      = $inquiryDataFromApi['desc']['alamat'] ?? null;
//             // $inquiryDataFromApi['desc']['jatuh_tempo'] = $inquiryDataFromApi['desc']['jatuh_tempo'] ?? null;


//             // Inisialisasi variabel perhitungan
//             $totalNilaiTagihan = 0;
//             $totalDenda = 0;
//             $totalBiayaLain = 0;
//             $jumlahLembarTagihan = 0;
//             $totalAdminFromProvider = (float) ($inquiryDataFromApi['admin'] ?? 0);

//             // Ambil jumlah lembar tagihan dari 'desc.lembar_tagihan'
//             if (isset($inquiryDataFromApi['desc']['lembar_tagihan'])) {
//                 $jumlahLembarTagihan = (int) $inquiryDataFromApi['desc']['lembar_tagihan'];
//             } elseif (isset($inquiryDataFromApi['desc']['detail']) && is_array($inquiryDataFromApi['desc']['detail'])) {
//                 $jumlahLembarTagihan = count($inquiryDataFromApi['desc']['detail']);
//             } else {
//                 $jumlahLembarTagihan = 1;
//             }

//             // Akumulasikan nilai tagihan, denda, dan biaya lain dari detail
//             if (isset($inquiryDataFromApi['desc']['detail']) && is_array($inquiryDataFromApi['desc']['detail'])) {
//                 foreach ($inquiryDataFromApi['desc']['detail'] as $detail) {
//                     $totalNilaiTagihan += (float) ($detail['nilai_tagihan'] ?? 0);
//                     $totalDenda += (float) ($detail['denda'] ?? 0);
//                     $totalBiayaLain += (float) ($detail['biaya_lain'] ?? 0);
//                 }
//             } else {
//                 // Fallback jika tidak ada detail, asumsikan 'price' adalah total tagihan murni dari provider
//                 // dan 'denda' serta 'biaya_lain' mungkin ada di root desc
//                 $totalNilaiTagihan = (float) ($inquiryDataFromApi['price'] ?? 0); // Ini adalah total tagihan murni + biaya lain jika tidak ada detail
//                 $totalDenda = (float) ($inquiryDataFromApi['desc']['denda'] ?? 0);
//                 $totalBiayaLain = (float) ($inquiryDataFromApi['desc']['biaya_lain'] ?? 0);
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
//             $finalSellingPrice = ($totalNilaiTagihan + $totalBiayaLain) + $totalAdminFromProvider + $totalDenda - $finalDiskon;
//             $finalSellingPrice = ceil($finalSellingPrice);


//             // 4. Susun kembali data untuk dikirim ke frontend dan disimpan di sesi
//             $inquiryDataFromApi['price']         = $totalNilaiTagihan + $totalBiayaLain;
//             $inquiryDataFromApi['admin']         = $totalAdminFromProvider;
//             $inquiryDataFromApi['denda']         = $totalDenda;
//             $inquiryDataFromApi['diskon']        = $finalDiskon;
//             $inquiryDataFromApi['jumlah_lembar_tagihan'] = $jumlahLembarTagihan;
//             $inquiryDataFromApi['selling_price'] = $finalSellingPrice;
//             $inquiryDataFromApi['buyer_sku_code'] = $current_sku;
//             $inquiryDataFromApi['ref_id'] = $ref_id;

//             session(['postpaid_inquiry_data' => $inquiryDataFromApi]);
//             return response()->json($inquiryDataFromApi);
//         } else {
//             $errorMessage = $responseData['data']['message'] ?? 'Gagal melakukan pengecekan tagihan dummy.';
//             Log::warning("Inquiry PDAM Dummy Gagal untuk SKU: {$current_sku}. Pesan: {$errorMessage}", ['response' => $responseData]);
//             return response()->json(['message' => $errorMessage], 400);
//         }
//     }

//     public function payment(Request $request)
//     {
//         $user = Auth::user();
//         $inquiryData = session('postpaid_inquiry_data');

//         if (!$inquiryData || $inquiryData['customer_no'] !== $request->customer_no) {
//             return response()->json(['message' => 'Sesi tidak valid atau nomor pelanggan tidak cocok.'], 400);
//         }

//         $totalPriceToPay     = $inquiryData['selling_price'];
//         $finalAdmin          = $inquiryData['admin'];
//         $pureBillPrice       = $inquiryData['price'];
//         $diskon              = $inquiryData['diskon'] ?? 0;
//         $jumlahLembarTagihan = $inquiryData['jumlah_lembar_tagihan'] ?? 0;
//         $denda               = $inquiryData['denda'] ?? 0;

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

//         // --- PENTING: Pastikan desc dari inquiryData masuk ke sini
//         $initialData['details'] = [
//             'diskon' => $diskon,
//             'jumlah_lembar_tagihan' => $jumlahLembarTagihan,
//             'denda' => $denda,
//             'desc' => $inquiryData['desc'] ?? null, // Ini sudah benar untuk mengambil desc dari inquiryData
//         ];

//         $unifiedTransaction = PostpaidTransaction::create($initialData);

//         // --- START DUMMY RESPONSE PAYMENT ---
//         $apiResponseData = [
//             'status' => 'Sukses',
//             'message' => 'Pembayaran PDAM dummy berhasil diproses.',
//             'rc' => '00',
//             'sn' => 'SN-PDAM-' . Str::random(15),
//             'customer_name' => $inquiryData['customer_name'],
//             'customer_no' => $inquiryData['customer_no'],
//             'buyer_sku_code' => $inquiryData['buyer_sku_code'],
//             'price' => $inquiryData['price'],
//             'admin' => $inquiryData['admin'],
//             'ref_id' => $inquiryData['ref_id'],
//         ];
//         // --- END DUMMY RESPONSE PAYMENT ---

//         Log::info('PDAM Payment Dummy Response:', ['response_data' => $apiResponseData, 'transaction_id' => $unifiedTransaction->id]);

//         $fullResponseData = array_merge($inquiryData, $apiResponseData);

//         $updatePayload = $this->mapToUnifiedTransaction($fullResponseData, 'PDAM', $pureBillPrice, $finalAdmin);
//         $updatePayload['selling_price'] = $totalPriceToPay;

//         $updatePayload['rc'] = $apiResponseData['rc'] ?? null;
//         $updatePayload['sn'] = $apiResponseData['sn'] ?? null;

//         $keysToExcludeFromDetails = [
//             'ref_id', 'customer_no', 'customer_name', 'buyer_sku_code', 'message',
//             'rc', 'sn', 'buyer_last_saldo', 'price', 'selling_price', 'admin', 'status',
//             'diskon', 'jumlah_lembar_tagihan', 'denda', 'desc', // 'desc' dikecualikan karena kita tangani secara eksplisit
//         ];

//         $detailsFromApiResponse = [];
//         foreach ($apiResponseData as $key => $value) {
//             if (!in_array($key, $keysToExcludeFromDetails)) {
//                 $detailsFromApiResponse[$key] = $value;
//             }
//         }

//         // Merge detail dari inquiry dengan detail tambahan dari response API
//         // dan pastikan data diskon, jumlah lembar tagihan, denda, dan desc tetap ada
//         $updatePayload['details'] = array_merge(
//             $detailsFromApiResponse,
//             ['diskon' => $diskon, 'jumlah_lembar_tagihan' => $jumlahLembarTagihan, 'denda' => $denda],
//             ['desc' => $inquiryData['desc'] ?? null] // Ini juga sudah benar untuk memastikan desc tetap ada
//         );

//         unset($updatePayload['user_id'], $updatePayload['ref_id'], $updatePayload['type'], $updatePayload['price'], $updatePayload['admin_fee']);

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

//         if (($apiResponseData['status'] ?? 'Gagal') === 'Gagal' && $unifiedTransaction->status === 'Gagal') {
//             $user->increment('balance', $totalPriceToPay);
//         }

//         session()->forget('postpaid_inquiry_data');
//         return response()->json($fullResponseData);
//     }
// }