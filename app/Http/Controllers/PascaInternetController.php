<?php

// >>>>>>>>>>>>>     DUMMY INTERNET POSTPAID CONTROLLER      <<<<<<<<<<<<<<<<<<<<<<<

namespace App\Http\Controllers;

use App\Models\PostpaidTransaction;
use App\Models\PostpaidProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http; // Tetap ada, tapi tidak dipanggil di dummy
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Http\Traits\TransactionMapper; // Pastikan trait ini sudah ada dan benar

class PascaInternetController extends Controller
{
    use TransactionMapper;

    /**
     * Menampilkan halaman pembayaran Internet pascabayar dengan daftar produk.
     */
    public function index()
    {
        $products = $this->fetchInternetProducts();
        return Inertia::render('Pascabayar/Internet', [ // Sesuaikan path Inertia
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
        // Ganti 'PDAM' menjadi 'INTERNET' atau brand yang sesuai untuk produk internet Anda
        $internetProducts = PostpaidProduct::where('brand', 'INTERNET PASCABAYAR')
                                           ->orderBy('product_name', 'asc')
                                           ->get();

        return $internetProducts->map(function ($product) {
            $commission = $product->commission ?? 0;
            $commission_sell_percentage = $product->commission_sell_percentage ?? 0;
            $commission_sell_fixed = $product->commission_sell_fixed ?? 0;
            $adminFromServer = $product->admin ?? 0; // Admin dari konfigurasi produk lokal

            // Hitung markup/diskon yang kita berikan ke user
            $markupForClient = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;
            // Admin yang dihitung ini adalah admin yang akan kita tunjukkan ke klien di list produk,
            // yang sudah termasuk diskon dari komisi kita.
            // BULATKAN KE ATAS biaya admin yang dihitung
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
                                ->where('seller_product_status', '1') // Tetap filter hanya produk aktif saat inquiry
                                ->first();

        if (!$product) {
            return response()->json(['message' => 'Produk Internet tidak tersedia atau tidak aktif untuk inquiry.'], 503);
        }

        $ref_id = 'internet-' . substr(str_replace('-', '', Str::uuid()->toString()), 0, 15);
        $username = env('P_U');
        $apiKey = env('P_AKD'); // Menggunakan dummy API Key. Pastikan ini ada di .env
        $sign = md5($username . $apiKey . $ref_id);

        // --- START DUMMY RESPONSE INQUIRY ---
        // Sesuaikan dengan struktur respons yang Anda berikan
        $specificDescData = [
            "lembar_tagihan" => 2,
            "detail" => [
                ["periode" => "MEI 2019", "nilai_tagihan" => "8000", "admin" => "2500"],
                ["periode" => "JUN 2019", "nilai_tagihan" => "11500", "admin" => "2500"]
            ]
        ];

        $dummyStatus = 'Sukses';
        $dummyMessage = 'Inquiry Internet berhasil.';
        $dummyCustomerName = 'Pelanggan Internet Dummy ' . substr($customerNo, 0, 4);
        $dummyRootPrice = 22500; // Contoh: Total nilai tagihan dari provider sebelum admin & diskon kita
        $dummyRootAdmin = 5000;  // Contoh: Biaya admin dari provider yang terpisah dari nilai tagihan
        $dummyBuyerLastSaldo = 100000; // Contoh: Saldo akhir pelanggan (jika ada dari provider)

        $responseData = [
            'data' => [
                'status' => $dummyStatus,
                'message' => $dummyMessage,
                'customer_name' => $dummyCustomerName,
                'customer_no' => $customerNo,
                'buyer_sku_code' => $current_sku,
                'price' => $dummyRootPrice,
                'admin' => $dummyRootAdmin,
                'rc' => '00',
                'sn' => 'SN-INQ-' . Str::random(12),
                'ref_id' => $ref_id,
                'desc' => $specificDescData,
                'buyer_last_saldo' => $dummyBuyerLastSaldo,
            ],
        ];
        // --- END DUMMY RESPONSE INQUIRY ---

        // >>>>>>>>>>>>>>>>> BAGIAN INI UNTUK PANGGILAN API ASLI JIKA SUDAH SIAP <<<<<<<<<<<<<<<<<
        // try {
        //     $response = Http::post(config('services.api_server') . '/v1/transaction', [
        //         'commands' => 'inq-pasca',
        //         'username' => $username,
        //         'buyer_sku_code' => $current_sku,
        //         'customer_no' => $customerNo,
        //         'ref_id' => $ref_id,
        //         'sign' => $sign,
        //         'testing' => false,
        //     ]);
        //     $responseData = $response->json();
        // } catch (\Exception $e) {
        //     Log::error('Internet Inquiry Error: ' . $e->getMessage(), ['customer_no' => $customerNo, 'sku' => $current_sku]);
        //     return response()->json(['message' => 'Terjadi kesalahan pada server provider.'], 500);
        // }
        // >>>>>>>>>>>>>>>>> AKHIR BAGIAN PANGGILAN API ASLI <<<<<<<<<<<<<<<<<


        if (isset($responseData['data']) && $responseData['data']['status'] === 'Sukses') {
            $inquiryDataFromApi = $responseData['data'];

            if (!isset($inquiryDataFromApi['desc']) || !is_array($inquiryDataFromApi['desc'])) {
                $inquiryDataFromApi['desc'] = [];
            }

            // Inisialisasi variabel perhitungan
            $totalNilaiTagihanFromDetails = 0; // Sum of 'nilai_tagihan' from desc.detail
            $totalAdminFromDetails = 0;      // Sum of 'admin' from desc.detail
            $totalDenda = 0; // Tidak ada di contoh Internet yang diberikan, jadi 0
            $jumlahLembarTagihan = 0;
            $totalAdminFromProvider = (float) ($inquiryDataFromApi['admin'] ?? 0); // Admin dari root API response

            // Ambil jumlah lembar tagihan dari 'desc.lembar_tagihan'
            if (isset($inquiryDataFromApi['desc']['lembar_tagihan'])) {
                $jumlahLembarTagihan = (int) $inquiryDataFromApi['desc']['lembar_tagihan'];
            } elseif (isset($inquiryDataFromApi['desc']['detail']) && is_array($inquiryDataFromApi['desc']['detail'])) {
                $jumlahLembarTagihan = count($inquiryDataFromApi['desc']['detail']);
            } else {
                $jumlahLembarTagihan = 1; // Default ke 1 jika tidak ditemukan sama sekali
            }

            // Akumulasikan nilai tagihan dan admin dari detail
            if (isset($inquiryDataFromApi['desc']['detail']) && is_array($inquiryDataFromApi['desc']['detail'])) {
                foreach ($inquiryDataFromApi['desc']['detail'] as $detail) {
                    $totalNilaiTagihanFromDetails += (float) ($detail['nilai_tagihan'] ?? 0);
                    $totalAdminFromDetails += (float) ($detail['admin'] ?? 0);
                }
            }
            // Catatan: inquiryDataFromApi['price'] dan inquiryDataFromApi['admin'] di root
            // diasumsikan sebagai total yang diberikan oleh provider, dan mungkin tidak selalu
            // sama dengan akumulasi dari detail jika provider menghitungnya secara berbeda.
            // Kita akan menggunakan nilai root price dan admin dari API untuk perhitungan akhir.


            // 1. Hitung Diskon dasar per lembar berdasarkan komisi produk
            $commission = $product->commission ?? 0;
            $commission_sell_percentage = $product->commission_sell_percentage ?? 0;
            $commission_sell_fixed = $product->commission_sell_fixed ?? 0;
            $diskonPerLembar = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;

            // 2. Kalikan diskon per lembar dengan jumlah lembar tagihan
            $finalDiskon = $diskonPerLembar * $jumlahLembarTagihan;
            // BULATKAN KE ATAS diskon
            $finalDiskon = ceil($finalDiskon);

            // Untuk mencapai selling_price 24500 dengan price 22500 dan admin 5000 (total 27500),
            // maka diskon yang diterapkan harus 3000.
            // Pastikan produk INTERNET yang digunakan memiliki komisi yang menghasilkan diskon ini.
            // Misalnya, jika jumlah_lembar_tagihan = 2, maka diskon per lembar = 1500.
            // Ini berarti (commission * commission_sell_percentage / 100) + commission_sell_fixed = 1500.
            // Contoh: Jika commission_sell_percentage = 100% dan commission_sell_fixed = 0, maka commission = 1500.


            // 3. Hitung Total Pembayaran Akhir (dengan Diskon)
            // selling_price = (price_dari_api_root) + (admin_dari_api_root) + total_denda - total_diskon_kita
            $finalSellingPrice = (float)($inquiryDataFromApi['price'] ?? 0) + $totalAdminFromProvider + $totalDenda - $finalDiskon;
            // Pastikan selling_price juga dibulatkan ke atas untuk menghindari pecahan sen
            $finalSellingPrice = ceil($finalSellingPrice);


            // 4. Susun kembali data untuk dikirim ke frontend dan disimpan di sesi
            // 'price' dan 'admin' di $inquiryDataFromApi sudah sesuai dengan dummy API response (22500 dan 5000)
            $inquiryDataFromApi['denda'] = $totalDenda; // Akan menjadi 0
            $inquiryDataFromApi['diskon'] = $finalDiskon; // Simpan diskon yang sudah dikalikan
            $inquiryDataFromApi['jumlah_lembar_tagihan'] = $jumlahLembarTagihan;
            $inquiryDataFromApi['selling_price'] = $finalSellingPrice;
            $inquiryDataFromApi['buyer_sku_code'] = $current_sku;
            $inquiryDataFromApi['ref_id'] = $ref_id;

            session(['postpaid_inquiry_data' => $inquiryDataFromApi]);
            return response()->json($inquiryDataFromApi);
        } else {
            $errorMessage = $responseData['data']['message'] ?? 'Gagal melakukan pengecekan tagihan dummy.';
            Log::warning("Inquiry Internet Dummy Gagal untuk SKU: {$current_sku}. Pesan: {$errorMessage}", ['response' => $responseData]);
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
        $finalAdmin          = $inquiryData['admin']; // Admin dari root API response inquiry (5000)
        $pureBillPrice       = $inquiryData['price']; // Price dari root API response inquiry (22500)
        $diskon              = $inquiryData['diskon'] ?? 0;
        $jumlahLembarTagihan = $inquiryData['jumlah_lembar_tagihan'] ?? 0;
        $denda               = $inquiryData['denda'] ?? 0; // 0 untuk Internet dummy

        if ($user->balance < $totalPriceToPay) {
            return response()->json(['message' => 'Saldo Anda tidak mencukupi.'], 402);
        }

        // Dekremen saldo sebelum memanggil API provider
        $user->decrement('balance', $totalPriceToPay);

        // Buat transaksi awal di tabel terpadu dengan status 'Pending'
        $initialData = $this->mapToUnifiedTransaction($inquiryData, 'INTERNET', $pureBillPrice, $finalAdmin);
        $initialData['selling_price'] = $totalPriceToPay;
        $initialData['status'] = 'Pending';
        $initialData['message'] = 'Menunggu konfirmasi pembayaran dari provider';

        $initialData['rc'] = $inquiryData['rc'] ?? null;
        $initialData['sn'] = null; // SN akan diisi dari response payment

        $initialData['details'] = [
            'diskon' => $diskon,
            'jumlah_lembar_tagihan' => $jumlahLembarTagihan,
            'denda' => $denda, // 0
            'desc' => $inquiryData['desc'] ?? null,
            // Anda bisa menambahkan detail lain dari inquiryData jika perlu disimpan
            // 'total_nilai_tagihan_detail_sum' => $totalNilaiTagihanFromDetails,
            // 'total_admin_detail_sum' => $totalAdminFromDetails,
        ];

        $unifiedTransaction = PostpaidTransaction::create($initialData);

        // --- START DUMMY RESPONSE PAYMENT ---
        $apiResponseData = [
            'status' => 'Sukses',
            'message' => 'Pembayaran Internet dummy berhasil diproses.',
            'rc' => '00',
            'sn' => 'SN-INTERNET-' . Str::random(15),
            'customer_name' => $inquiryData['customer_name'],
            'customer_no' => $inquiryData['customer_no'],
            'buyer_sku_code' => $inquiryData['buyer_sku_code'],
            'price' => $inquiryData['price'],
            'admin' => $inquiryData['admin'],
            'ref_id' => $inquiryData['ref_id'],
            'buyer_last_saldo' => $inquiryData['buyer_last_saldo'], // Sertakan saldo terakhir
        ];
        // --- END DUMMY RESPONSE PAYMENT ---

        Log::info('Internet Payment Dummy Response:', ['response_data' => $apiResponseData, 'transaction_id' => $unifiedTransaction->id]);

        // >>>>>>>>>>>>>>>>> BAGIAN INI UNTUK PANGGILAN API ASLI JIKA SUDAH SIAP <<<<<<<<<<<<<<<<<
        // try {
        //     $response = Http::post(config('services.api_server') . '/v1/transaction', [
        //         'commands' => 'pay-pasca',
        //         'username' => $username,
        //         'buyer_sku_code' => $inquiryData['buyer_sku_code'],
        //         'customer_no' => $inquiryData['customer_no'],
        //         'ref_id' => $inquiryData['ref_id'],
        //         'sign' => $sign,
        //         'testing' => false,
        //     ]);
        //     $apiResponseData = $response->json()['data'];
        // } catch (\Exception $e) {
        //     // Jika gagal terhubung ke provider, kembalikan saldo
        //     $user->increment('balance', $totalPriceToPay);
        //     $errorMessage = ['status' => 'Gagal', 'message' => 'Gagal terhubung ke server provider.'];

        //     // Update transaksi sebagai gagal
        //     $unifiedTransaction->update(array_merge($errorMessage, ['rc' => null, 'sn' => null]));

        //     Log::error('Internet Payment Error: ' . $e->getMessage(), ['transaction_id' => $unifiedTransaction->id, 'inquiry_data' => $inquiryData]);
        //     return response()->json(['message' => 'Terjadi kesalahan pada server provider.'], 500);
        // }
        // >>>>>>>>>>>>>>>>> AKHIR BAGIAN PANGGILAN API ASLI <<<<<<<<<<<<<<<<<


        $fullResponseData = array_merge($inquiryData, $apiResponseData);

        // Gunakan mapper lagi untuk menghasilkan data update yang lengkap
        $updatePayload = $this->mapToUnifiedTransaction($fullResponseData, 'INTERNET PASCABAYAR', $pureBillPrice, $finalAdmin);
        $updatePayload['selling_price'] = $totalPriceToPay; // Pastikan selling_price tidak berubah dari inquiry
        $updatePayload['status'] = $apiResponseData['status'] ?? 'Gagal'; // Ambil status dari dummy API response
        $updatePayload['message'] = $apiResponseData['message'] ?? 'Pembayaran gagal.';

        $updatePayload['rc'] = $apiResponseData['rc'] ?? null;
        $updatePayload['sn'] = $apiResponseData['sn'] ?? null;

        // Kunci yang tidak perlu disimpan berulang di 'details' jika sudah ada di kolom lain
        $keysToExcludeFromDetails = [
            'ref_id', 'customer_no', 'customer_name', 'buyer_sku_code', 'message',
            'rc', 'sn', 'buyer_last_saldo', 'price', 'selling_price', 'admin', 'status',
            'diskon', 'jumlah_lembar_tagihan', 'denda', 'desc', // 'desc' dikecualikan karena kita tangani secara eksplisit
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

        // Hapus kunci yang sudah ditangani oleh mapToUnifiedTransaction (seperti user_id yang diambil dari Auth::user()->id)
        unset($updatePayload['user_id'], $updatePayload['ref_id'], $updatePayload['type'], $updatePayload['price'], $updatePayload['admin_fee']);

        $unifiedTransaction->update($updatePayload);

        // Refresh model untuk mendapatkan data terbaru dari database
        $unifiedTransaction->refresh();

        // Update $fullResponseData dengan nilai aktual yang disimpan di database
        // Ini memastikan frontend menampilkan persis apa yang terekam.
        $fullResponseData['selling_price'] = $unifiedTransaction->selling_price;
        $fullResponseData['status'] = $unifiedTransaction->status;
        $fullResponseData['message'] = $unifiedTransaction->message;
        $fullResponseData['customer_name'] = $unifiedTransaction->customer_name;
        $fullResponseData['customer_no'] = $unifiedTransaction->customer_no;
        $fullResponseData['diskon'] = $unifiedTransaction->details['diskon'] ?? 0;
        $fullResponseData['denda'] = $unifiedTransaction->details['denda'] ?? 0;
        $fullResponseData['admin'] = $unifiedTransaction->admin_fee; // Ambil admin_fee dari transaksi
        $fullResponseData['price'] = $unifiedTransaction->price; // Ambil price dari transaksi
        $fullResponseData['sn'] = $unifiedTransaction->sn;
        $fullResponseData['ref_id'] = $unifiedTransaction->ref_id;
        $fullResponseData['details'] = $unifiedTransaction->details; // Pastikan details dikirim untuk 'desc'
        $fullResponseData['buyer_last_saldo'] = $unifiedTransaction->buyer_last_saldo ?? null; // Tambahkan saldo terakhir

        // Jika status transaksi dari provider adalah 'Gagal', kembalikan saldo
        if (($apiResponseData['status'] ?? 'Gagal') === 'Gagal' && $unifiedTransaction->status === 'Gagal') {
            $user->increment('balance', $totalPriceToPay);
        }

        session()->forget('postpaid_inquiry_data');
        return response()->json($fullResponseData);
    }
}