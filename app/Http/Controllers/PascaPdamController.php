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
//         return Inertia::render('Pascabayar/Pdam', [
//             'products' => $products,
//             'auth' => [
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
//             $adminFromServer = $product->admin ?? 0; // Ini adalah biaya admin yang diatur oleh platform untuk produk ini.

//             // Ini menghitung markup (atau 'diskon' efektif terhadap admin nominal platform)
//             $markupForClient = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;
            
//             // 'calculated_admin' ini kemungkinan adalah biaya admin efektif yang dikenakan kepada pengguna akhir oleh platform
//             // setelah mempertimbangkan komisi internal. Digunakan untuk tampilan, bukan perhitungan transaksi langsung di sini.
//             $product->calculated_admin = ceil($adminFromServer - $markupForClient);

//             return $product;
//         })->values()->all();
//     }

//     /**
//      * Helper method to perform a single PDAM inquiry.
//      * Handles API calls and data processing for a given customer number and product.
//      *
//      * @param string $customerNo The customer number to inquire.
//      * @param PostpaidProduct $product The PostpaidProduct model associated with the inquiry.
//      * @return array|null Returns processed inquiry data on success, null on failure.
//      */
//     private function _performSinglePdamInquiry(string $customerNo, PostpaidProduct $product): ?array
//     {
//         $current_sku = $product->buyer_sku_code;
//         $ref_id = 'pdam-' . substr(str_replace('-', '', Str::uuid()->toString()), 0, 15);
//         $username = env('P_U');
//         $apiKey = env('P_AK'); // Menggunakan P_AK dari env
//         $sign = md5($username . $apiKey . $ref_id);

//         $responseData = [];

//         // --- START DUMMY DATA FOR TESTING INQUIRY (if APP_ENV is local) ---
//         if (env('APP_ENV') === 'local') {
//             $customerNoLength = strlen($customerNo);
//             $lastDigit = $customerNo[$customerNoLength - 1] ?? '0'; // Default ke '0' jika customerNo kosong
//             $isOverdue = ((int)$lastDigit % 2 === 0); // Simulasi tunggakan untuk digit terakhir genap
//             $customerNameSeed = substr(preg_replace('/[^0-9]/', '', $customerNo), 0, 5); // Gunakan digit dari customerNo

//             $basePricePerBill = 25000 + (substr($customerNo, -2, 1) * 1000); // Variasi harga pokok per lembar
//             $providerAdminFeePerTransaction = 2500; // Biaya admin per transaksi oleh provider
//             $biayaLainPerBill = 1500;
//             $dendaPerBill = $isOverdue ? (5000 + (substr($customerNo, -3, 1) * 500)) : 0; // Variasi denda

//             $numBills = 1;
//             if ((int)$lastDigit % 3 === 0) { // Beberapa pelanggan mungkin memiliki 2 lembar tagihan
//                 $numBills = 2;
//             } elseif ((int)$lastDigit % 5 === 0) { // Beberapa mungkin memiliki 3 lembar tagihan
//                 $numBills = 3;
//             }

//             $dummyDescDetails = [];
//             $totalPureBillAmountDummy = 0; // Total harga pokok murni (tanpa denda/biaya lain)
//             $totalDendaAmountDummy = 0;
//             $totalBiayaLainAmountDummy = 0;

//             for ($i = 0; $i < $numBills; $i++) {
//                 $periodeMonth = date('m', strtotime("-{$i} month"));
//                 $periodeYear = date('Y', strtotime("-{$i} month"));
//                 $billPrice = $basePricePerBill + ($i * 1000); // Harga pokok per detail
//                 $billDenda = $isOverdue ? ceil($dendaPerBill / $numBills) : 0; // Distribusi denda
//                 $billBiayaLain = $biayaLainPerBill;

//                 $dummyDescDetails[] = [
//                     "periode" => "{$periodeYear}{$periodeMonth}",
//                     "nilai_tagihan" => $billPrice, // Ini harga pokok murni per lembar
//                     "denda" => $billDenda,
//                     "meter_awal" => '000' . Str::random(5),
//                     "meter_akhir" => '000' . Str::random(5),
//                     "biaya_lain" => $billBiayaLain
//                 ];
//                 $totalPureBillAmountDummy += $billPrice;
//                 $totalDendaAmountDummy += $billDenda;
//                 $totalBiayaLainAmountDummy += $billBiayaLain;
//             }

//             $dummyCustomerName = 'Pelanggan PDAM ' . $product->product_name . ' ' . $customerNameSeed . ($isOverdue ? ' (OVERDUE)' : '');
//             $dummyAddress = 'Jl. Dummy No.' . $customerNoLength . ', Kota ' . Str::upper(substr($current_sku, 0, 3));
//             $dummyJatuhTempo = date('d-M-Y', strtotime('+5 days'));

//             // 'price' field: Ini adalah (harga pokok + denda + biaya_lain) dari sisi provider sebelum biaya admin mereka.
//             $dummyPriceComponent = $totalPureBillAmountDummy + $totalDendaAmountDummy + $totalBiayaLainAmountDummy;
            
//             // 'selling_price' field: Ini adalah total harga dari provider, sudah termasuk biaya admin mereka.
//             $dummyProviderTotalSellingPrice = $dummyPriceComponent + $providerAdminFeePerTransaction;
//             // Simulasi sedikit variasi dari base jika diperlukan untuk 'selling_price'
//             $dummyProviderTotalSellingPrice = ceil($dummyProviderTotalSellingPrice * (1 + (int)$lastDigit / 100000)); 


//             $responseData = [
//                 'data' => [
//                     'status' => 'Sukses',
//                     'message' => 'Inquiry PDAM dummy berhasil.',
//                     'customer_name' => $dummyCustomerName,
//                     'customer_no' => $customerNo,
//                     'buyer_sku_code' => $current_sku,
//                     'price' => $dummyPriceComponent, // (Harga pokok + Denda + Biaya Lain) sebelum admin dari sisi provider
//                     'admin' => $providerAdminFeePerTransaction, // Biaya admin per transaksi dari provider
//                     'rc' => '00',
//                     'sn' => 'SN-INQ-' . Str::random(12),
//                     'ref_id' => $ref_id,
//                     'desc' => [
//                         "tarif" => "R" . (2 + (int)$lastDigit % 3),
//                         "lembar_tagihan" => $numBills,
//                         "alamat" => $dummyAddress,
//                         "jatuh_tempo" => $dummyJatuhTempo,
//                         "detail" => $dummyDescDetails,
//                         "denda" => $totalDendaAmountDummy, // Total denda (untuk info di desc)
//                         "biaya_lain" => $totalBiayaLainAmountDummy, // Total biaya lain (untuk info di desc)
//                     ],
//                     'selling_price' => $dummyProviderTotalSellingPrice, // ORIGINAL provider selling_price (total termasuk admin)
//                     'original_api_price' => $dummyProviderTotalSellingPrice, // Untuk konsistensi, gunakan ini sebagai total jika tidak didefinisikan secara eksplisit
//                     'original_api_selling_price' => $dummyProviderTotalSellingPrice, // Redundant, tetapi dipertahankan jika provider lain menggunakannya.
//                 ],
//             ];
//             Log::info('PDAM Inquiry API Response (DUMMY):', ['response_data' => $responseData, 'customer_no' => $customerNo, 'sku' => $current_sku, 'ref_id' => $ref_id]);
//         } else {
//             // --- END DUMMY DATA ---

//             // --- ORIGINAL API CALL (only if not in local dummy mode) ---
//             if (!$product->seller_product_status) {
//                 Log::warning("Inquiry PDAM: Produk tidak aktif untuk SKU: {$current_sku}, Customer No: {$customerNo}.");
//                 return null; // Jangan coba jika produk tidak aktif dalam mode real
//             }

//             try {
//                 $response = Http::post(config('services.api_server') . '/v1/transaction', [
//                     'commands' => 'inq-pasca',
//                     'username' => $username,
//                     'buyer_sku_code' => $current_sku,
//                     'customer_no' => $customerNo,
//                     'ref_id' => $ref_id,
//                     'sign' => $sign,
//                     'testing' => false,
//                 ]);

//                 $responseData = $response->json();
//                 Log::info('PDAM Inquiry API Response:', ['response_data' => $responseData, 'customer_no' => $customerNo, 'sku' => $current_sku, 'ref_id' => $ref_id]);

//                 if (!isset($responseData['data']) || $responseData['data']['status'] !== 'Sukses') {
//                     $errorMessage = $responseData['data']['message'] ?? 'Gagal melakukan pengecekan tagihan dari provider.';
//                     Log::warning("Inquiry PDAM Gagal dari Provider untuk SKU: {$current_sku}. Pesan: {$errorMessage}", ['response' => $responseData, 'customer_no' => $customerNo]);
//                     return null;
//                 }
//             } catch (\Exception $e) {
//                 Log::error('PDAM Inquiry Error (API Call): ' . $e->getMessage(), ['customer_no' => $customerNo, 'sku' => $current_sku, 'exception_trace' => $e->getTraceAsString()]);
//                 return null;
//             }
//         }

//         // --- COMMON PROCESSING LOGIC (for both real and dummy data) ---
//         $inquiryDataFromApi = $responseData['data'];

//         // Ekstrak nilai-nilai mentah dari respons API
//         $apiProviderTotalSellingPrice = (float) ($inquiryDataFromApi['selling_price'] ?? 0); // Total harga dari provider (termasuk semuanya)
//         $apiProviderAdminFee          = (float) ($inquiryDataFromApi['admin'] ?? 0);          // Komponen biaya admin dari provider
//         $apiProviderPriceComponent    = (float) ($inquiryDataFromApi['price'] ?? 0);         // **Tambahan: 'price' dari API (pure bill + denda + biaya_lain, tanpa admin provider)**

//         // Pastikan array 'desc' ada dan diinisialisasi
//         if (!isset($inquiryDataFromApi['desc']) || !is_array($inquiryDataFromApi['desc'])) {
//             $inquiryDataFromApi['desc'] = [];
//         }

//         // Pastikan field 'desc' yang penting ada atau disetel null
//         $inquiryDataFromApi['desc']['tarif']       = $inquiryDataFromApi['desc']['tarif'] ?? null;
//         $inquiryDataFromApi['desc']['alamat']      = $inquiryDataFromApi['desc']['alamat'] ?? null;
//         $inquiryDataFromApi['desc']['jatuh_tempo'] = $inquiryDataFromApi['desc']['jatuh_tempo'] ?? null;

//         $sumOfPureBillAmounts  = 0; // Jumlah tagihan pokok murni yang dihitung (tidak termasuk denda, biaya_lain, admin)
//         $sumOfDendaAmounts     = 0; // Total denda, diakumulasikan
//         $sumOfBiayaLainAmounts = 0; // Total biaya lain, diakumulasikan
//         $jumlahLembarTagihan   = 0;

//         // Tentukan jumlahLembarTagihan dan akumulasikan total denda dan biaya lain
//         if (isset($inquiryDataFromApi['desc']['lembar_tagihan'])) {
//             $jumlahLembarTagihan = (int) $inquiryDataFromApi['desc']['lembar_tagihan'];
//         }

//         if (isset($inquiryDataFromApi['desc']['detail']) && is_array($inquiryDataFromApi['desc']['detail'])) {
//             // Jika detail ada, hitung jumlah tagihan dan jumlahkan denda/biaya_lain dari detail
//             if (!$jumlahLembarTagihan) { // Hanya setel jika belum dari 'lembar_tagihan'
//                 $jumlahLembarTagihan = count($inquiryDataFromApi['desc']['detail']);
//             }
//             foreach ($inquiryDataFromApi['desc']['detail'] as $detail) {
//                 $sumOfDendaAmounts     += (float) ($detail['denda'] ?? 0);
//                 $sumOfBiayaLainAmounts += (float) ($detail['biaya_lain'] ?? 0);
//             }
//         } else {
//             // Jika 'desc.detail' tidak tersedia, ambil total denda dan biaya_lain dari root 'desc'
//             $sumOfDendaAmounts     = (float) ($inquiryDataFromApi['desc']['denda'] ?? 0);
//             $sumOfBiayaLainAmounts = (float) ($inquiryDataFromApi['desc']['biaya_lain'] ?? 0);
//             if (!$jumlahLembarTagihan) { // Default ke 1 jika tidak ada detail dan tidak ada lembar_tagihan eksplisit
//                 $jumlahLembarTagihan = 1;
//             }
//         }

//         // Hitung "gross bill amount" dari perspektif provider, tidak termasuk biaya admin mereka
//         // Ini adalah (Harga Pokok + Denda + Biaya Lain)
//         $providerGrossBillAmountExclAdmin = $apiProviderTotalSellingPrice - $apiProviderAdminFee;

//         // Hitung "Jumlah Tagihan Pokok Murni" dengan mengurangi denda dan biaya_lain dari jumlah gross
//         $sumOfPureBillAmounts = $providerGrossBillAmountExclAdmin - $sumOfDendaAmounts - $sumOfBiayaLainAmounts;

//         // Pastikan sumOfPureBillAmounts tidak menjadi negatif karena inkonsistensi data
//         if ($sumOfPureBillAmounts < 0) {
//             Log::warning("PDAM Inquiry: Calculated sumOfPureBillAmounts went negative for customer {$customerNo}. Adjusting to 0.", [
//                 'apiProviderTotalSellingPrice' => $apiProviderTotalSellingPrice,
//                 'apiProviderAdminFee' => $apiProviderAdminFee,
//                 'providerGrossBillAmountExclAdmin' => $providerGrossBillAmountExclAdmin,
//                 'sumOfDendaAmounts' => $sumOfDendaAmounts,
//                 'sumOfBiayaLainAmounts' => $sumOfBiayaLainAmounts,
//                 'inquiryDataFromApi' => $inquiryDataFromApi
//             ]);
//             $sumOfPureBillAmounts = 0;
//         }

//         // Hitung diskon yang diberikan kepada pengguna
//         $commission_sell_percentage = $product->commission_sell_percentage ?? 0;
//         $commission_sell_fixed      = $product->commission_sell_fixed ?? 0;
//         $commission                 = $product->commission ?? 0;

//         $discountPerBillUnit = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;
//         $finalDiscount = ceil($discountPerBillUnit * $jumlahLembarTagihan); // Bulatkan total diskon ke atas

//         // Hitung harga akhir yang harus dibayar pengguna
//         // Berdasarkan komentar pengguna, apiProviderTotalSellingPrice sudah termasuk admin provider.
//         // Jadi, harga akhir untuk pengguna adalah total provider dikurangi diskon kita.
//         $finalSellingPrice = $apiProviderTotalSellingPrice - $finalDiscount;
//         $finalSellingPrice = ceil($finalSellingPrice); // Bulatkan harga jual akhir ke atas

//         // --- START OF MODIFIED OVERRIDE LOGIC ---
//         // Logika override yang diubah: jika 'price' dari API (tanpa admin provider) lebih tinggi dari
//         // 'finalSellingPrice' yang dihitung (yang sudah termasuk admin provider & diskon),
//         // maka gunakan 'price' dari API sebagai finalSellingPrice.
//         // IMPLIKASI: Ini berarti platform bersedia untuk mengabaikan biaya admin provider
//         // dan sebagian atau seluruh diskon yang diberikan, jika diskon kita membuat
//         // total harga akhir jatuh di bawah harga pokok murni dari provider.
//         // Ini mengubah tujuan dari "mencegah penjualan di bawah total harga provider" menjadi
//         // "mencegah penjualan di bawah harga pokok murni provider (tanpa admin mereka)".
//         if ($apiProviderPriceComponent > $finalSellingPrice && $apiProviderPriceComponent > 0) {
//             Log::info("PDAM Inquiry: finalSellingPrice overridden by apiProviderPriceComponent. (Client discount and provider admin fee partially/fully ignored)", [
//                 'calculated_finalSellingPrice_with_discount' => $finalSellingPrice,
//                 'apiProviderPriceComponent' => $apiProviderPriceComponent,
//                 'apiProviderTotalSellingPrice' => $apiProviderTotalSellingPrice, // Untuk konteks log
//                 'customer_no' => $customerNo
//             ]);
//             $finalSellingPrice = $apiProviderPriceComponent;
//         }
//         // --- END OF MODIFIED OVERRIDE LOGIC ---

//         // Update inquiryDataFromApi dengan nilai-nilai yang sudah diproses untuk penggunaan internal dan tampilan frontend
//         $inquiryDataFromApi['price']         = $sumOfPureBillAmounts;       // Harga pokok murni yang kita hitung (untuk mapping transaksi)
//         $inquiryDataFromApi['admin']         = $apiProviderAdminFee;        // Biaya admin provider (untuk mapping transaksi)
//         $inquiryDataFromApi['denda']         = $sumOfDendaAmounts;          // Total denda
//         $inquiryDataFromApi['biaya_lain']    = $sumOfBiayaLainAmounts;      // Total biaya lain
//         $inquiryDataFromApi['diskon']        = $finalDiscount;              // Total diskon yang diberikan platform
//         $inquiryDataFromApi['jumlah_lembar_tagihan'] = $jumlahLembarTagihan;
//         $inquiryDataFromApi['selling_price'] = $finalSellingPrice;          // Harga akhir yang dibayar pengguna
//         $inquiryDataFromApi['buyer_sku_code'] = $current_sku;
//         $inquiryDataFromApi['ref_id'] = $ref_id;
//         $inquiryDataFromApi['provider_original_selling_price'] = $apiProviderTotalSellingPrice; // Untuk referensi
//         $inquiryDataFromApi['product_name'] = $product->product_name; // Tambahkan nama produk untuk tampilan frontend

//         unset($inquiryDataFromApi['buyer_last_saldo']); // Hapus jika tidak relevan untuk konteks saat ini
//         // unset($inquiryDataFromApi['original_api_price']); // Ini sebelumnya digunakan untuk logika override, tetapi kini langsung menggunakan apiProviderTotalSellingPrice.

//         return $inquiryDataFromApi;
//     }

//     /**
//      * Helper method to process a single PDAM payment after balance has been debited.
//      * This method creates the transaction record, calls the provider API, and updates the transaction.
//      *
//      * @param array $inquiryData Processed inquiry data for a single customer.
//      * @param \App\Models\User $user The authenticated user (for logging/context, not balance modification).
//      * @return array Returns an array with transaction status and details.
//      * @throws \Exception If the API call or transaction update fails critically.
//      */
//     private function _processIndividualPdamPayment(array $inquiryData, \App\Models\User $user): array
//     {
//         $totalPriceToPay     = (float) $inquiryData['selling_price'];         // Harga akhir yang dibayar pengguna
//         $providerAdminFee    = (float) $inquiryData['admin'];                 // Biaya admin provider
//         $pureBillPrice       = (float) $inquiryData['price'];                 // Tagihan pokok murni yang dihitung
//         $diskon              = (float) ($inquiryData['diskon'] ?? 0);
//         $jumlahLembarTagihan = (int) ($inquiryData['jumlah_lembar_tagihan'] ?? 0);
//         $denda               = (float) ($inquiryData['denda'] ?? 0);
//         $biayaLain           = (float) ($inquiryData['biaya_lain'] ?? 0);

//         // Petakan data inquiry awal ke struktur transaksi terpadu untuk pembuatan
//         // 'price' di sini mengacu pada tagihan pokok murni, 'admin_fee' mengacu pada biaya admin provider.
//         $initialData = $this->mapToUnifiedTransaction($inquiryData, 'PDAM', $pureBillPrice, $providerAdminFee);
//         $initialData['user_id'] = $user->id;
//         $initialData['selling_price'] = $totalPriceToPay; // Ini adalah harga akhir yang dibebankan kepada pengguna
//         $initialData['status'] = 'Pending';
//         $initialData['message'] = 'Menunggu konfirmasi pembayaran dari provider';

//         $initialData['rc'] = $inquiryData['rc'] ?? null;
//         $initialData['sn'] = null;

//         $initialData['details'] = [
//             'diskon' => $diskon,
//             'jumlah_lembar_tagihan' => $jumlahLembarTagihan,
//             'denda' => $denda,
//             'biaya_lain' => $biayaLain,
//             'desc' => $inquiryData['desc'] ?? null, // Simpan deskripsi lengkap dari inquiry
//         ];
//         unset($initialData['buyer_last_saldo'], $initialData['provider_original_selling_price']);

//         $unifiedTransaction = PostpaidTransaction::create($initialData);

//         $apiResponseData = [];

//         // --- START DUMMY RESPONSE PAYMENT ---
//         if (env('APP_ENV') === 'local') {
//             $isPaymentSuccess = (substr($inquiryData['customer_no'], -1) % 2 !== 0); // Simulasi sukses untuk digit terakhir ganjil

//             if ($isPaymentSuccess) {
//                 $apiResponseData = [
//                     'status' => 'Sukses',
//                     'message' => 'Pembayaran PDAM dummy berhasil diproses.',
//                     'rc' => '00',
//                     'sn' => 'SN-PDAM-' . Str::random(15),
//                     'customer_name' => $inquiryData['customer_name'],
//                     'customer_no' => $inquiryData['customer_no'],
//                     'buyer_sku_code' => $inquiryData['buyer_sku_code'],
//                     'price' => $pureBillPrice, // Tagihan pokok murni (dari data inquiry)
//                     'admin' => $providerAdminFee, // Biaya admin provider (dari data inquiry)
//                     'ref_id' => $inquiryData['ref_id'],
//                     'selling_price' => $totalPriceToPay, // Harga jual akhir kita
//                 ];
//             } else {
//                 $apiResponseData = [
//                     'status' => 'Gagal',
//                     'message' => 'Pembayaran PDAM dummy gagal. Saldo provider tidak cukup (simulasi).',
//                     'rc' => '14', // Contoh kode kegagalan
//                     'sn' => null,
//                     'customer_name' => $inquiryData['customer_name'],
//                     'customer_no' => $inquiryData['customer_no'],
//                     'buyer_sku_code' => $inquiryData['buyer_sku_code'],
//                     'price' => $pureBillPrice,
//                     'admin' => $providerAdminFee,
//                     'ref_id' => $inquiryData['ref_id'],
//                     'selling_price' => $totalPriceToPay,
//                 ];
//             }
//             Log::info('PDAM Payment Dummy Response:', ['response_data' => $apiResponseData, 'transaction_id' => $unifiedTransaction->id]);

//         } else {
//             // --- END DUMMY DATA ---

//             // --- ORIGINAL API CALL (only if not in local dummy mode) ---
//             $username = env('P_U');
//             $apiKey = env('P_AK');
//             $sign = md5($username . $apiKey . $inquiryData['ref_id']);

//             try {
//                 $response = Http::post(config('services.api_server') . '/v1/transaction', [
//                     'commands' => 'pay-pasca',
//                     'username' => $username,
//                     'buyer_sku_code' => $inquiryData['buyer_sku_code'],
//                     'customer_no' => $inquiryData['customer_no'],
//                     'ref_id' => $inquiryData['ref_id'],
//                     'sign' => $sign,
//                     'testing' => false,
//                 ]);
//                 $apiResponseData = $response->json()['data']; // Asumsikan kunci 'data' ada untuk respons yang sukses

//                 Log::info('PDAM Payment API Response:', ['response_data' => $apiResponseData, 'transaction_id' => $unifiedTransaction->id]);

//             } catch (\Exception $e) {
//                 $errorMessage = ['status' => 'Gagal', 'message' => 'Gagal terhubung ke server provider.'];
//                 $unifiedTransaction->update(array_merge($errorMessage, ['rc' => null, 'sn' => null]));
//                 Log::error('PDAM Payment Error: ' . $e->getMessage(), ['transaction_id' => $unifiedTransaction->id, 'inquiry_data' => $inquiryData]);
//                 throw new \Exception('Terjadi kesalahan pada server provider.');
//             }
//         }

//         // Gabungkan data inquiry asli dengan data respons pembayaran API yang sebenarnya
//         // Ini memastikan semua field yang diperlukan tersedia untuk mapping
//         $fullResponseData = array_merge($inquiryData, $apiResponseData);

//         // Secara eksplisit setel nilai inti untuk mapToUnifiedTransaction untuk memastikan konsistensi
//         $fullResponseData['price'] = $pureBillPrice;       // Tagihan pokok murni yang kita hitung
//         $fullResponseData['admin'] = $providerAdminFee;    // Biaya admin provider
//         $fullResponseData['selling_price'] = $totalPriceToPay; // Harga akhir yang dibebankan kepada pengguna

//         // Hapus kunci-kunci yang seharusnya tidak berada di tingkat root transaksi, atau bersifat redundant untuk mapping
//         unset($fullResponseData['buyer_last_saldo'], $fullResponseData['provider_original_selling_price'], $fullResponseData['biaya_lain']);

//         // Siapkan payload untuk memperbarui record transaksi
//         // Kolom 'price' dan 'admin_fee' di DB akan menyimpan tagihan pokok murni dan biaya admin provider masing-masing.
//         $updatePayload = $this->mapToUnifiedTransaction($fullResponseData, 'PDAM', $pureBillPrice, $providerAdminFee);
//         $updatePayload['selling_price'] = $totalPriceToPay; // Disimpan di DB sebagai jumlah aktual yang dibayar pengguna
//         $updatePayload['status'] = $apiResponseData['status'] ?? 'Gagal';
//         $updatePayload['message'] = $apiResponseData['message'] ?? 'Pembayaran gagal.';

//         $updatePayload['rc'] = $apiResponseData['rc'] ?? null;
//         $updatePayload['sn'] = $apiResponseData['sn'] ?? null;

//         // Definisikan kunci-kunci dari respons API yang harus secara eksplisit dikecualikan dari array 'details'
//         // (karena sudah dipetakan ke kolom root atau redundant).
//         $keysToExcludeFromDetails = [
//             'ref_id', 'customer_no', 'customer_name', 'buyer_sku_code', 'message',
//             'rc', 'sn', 'buyer_last_saldo', 'price', 'selling_price', 'admin', 'status',
//             'diskon', 'jumlah_lembar_tagihan', 'denda', 'biaya_lain', 'desc',
//             'provider_original_selling_price', 'product_name'
//         ];

//         // Filter detail tambahan dari respons API
//         $detailsFromApiResponse = [];
//         foreach ($apiResponseData as $key => $value) {
//             if (!in_array($key, $keysToExcludeFromDetails)) {
//                 $detailsFromApiResponse[$key] = $value;
//             }
//         }

//         // Gabungkan detail terhitung spesifik dengan detail respons API yang difilter
//         $updatePayload['details'] = array_merge(
//             $detailsFromApiResponse,
//             ['diskon' => $diskon, 'jumlah_lembar_tagihan' => $jumlahLembarTagihan, 'denda' => $denda, 'biaya_lain' => $biayaLain],
//             ['desc' => $inquiryData['desc'] ?? null] // Pertahankan deskripsi inquiry lengkap
//         );

//         // Hapus kunci-kunci dari updatePayload yang ditangani oleh mapToUnifiedTransaction atau redundant
//         unset(
//             $updatePayload['user_id'], $updatePayload['ref_id'], $updatePayload['type'],
//             $updatePayload['price'], $updatePayload['admin_fee'],
//             $updatePayload['buyer_last_saldo'], $updatePayload['provider_original_selling_price']
//         );

//         $unifiedTransaction->update($updatePayload);
//         $unifiedTransaction->refresh();

//         // Kembalikan hasil terstruktur untuk metode pemanggil
//         return [
//             'transaction_id' => $unifiedTransaction->id,
//             'ref_id' => $unifiedTransaction->ref_id,
//             'customer_no' => $unifiedTransaction->customer_no,
//             'customer_name' => $unifiedTransaction->customer_name,
//             'selling_price' => $unifiedTransaction->selling_price,
//             'status' => $unifiedTransaction->status,
//             'message' => $unifiedTransaction->message,
//             'diskon' => $unifiedTransaction->details['diskon'] ?? 0,
//             'jumlah_lembar_tagihan' => $unifiedTransaction->details['jumlah_lembar_tagihan'] ?? 0,
//             'denda' => $unifiedTransaction->details['denda'] ?? 0,
//             'biaya_lain' => $unifiedTransaction->details['biaya_lain'] ?? 0,
//             'admin' => $unifiedTransaction->admin_fee, // Ini adalah biaya admin provider yang tersimpan
//             'price' => $unifiedTransaction->price,     // Ini adalah tagihan pokok murni yang tersimpan
//             'sn' => $unifiedTransaction->sn,
//             'product_name' => $inquiryData['product_name'],
//             'details' => $unifiedTransaction->details,
//         ];
//     }

//     public function inquiry(Request $request)
//     {
//         $request->validate([
//             'customer_no' => 'required|string|min:4',
//             'buyer_sku_code' => 'required|string|exists:postpaid_products,buyer_sku_code',
//         ]);

//         $customerNo = $request->customer_no;
//         $current_sku = $request->buyer_sku_code;

//         $product = PostpaidProduct::where('buyer_sku_code', $current_sku)->first();

//         if (!$product || !$product->seller_product_status) {
//             return response()->json(['message' => 'Produk PDAM tidak tersedia atau tidak aktif.'], 503);
//         }

//         $inquiryData = $this->_performSinglePdamInquiry($customerNo, $product);

//         if ($inquiryData) {
//             session(['postpaid_inquiry_data' => $inquiryData]);
//             return response()->json($inquiryData);
//         } else {
//             return response()->json(['message' => 'Gagal melakukan pengecekan tagihan. Silakan coba lagi nanti.'], 400);
//         }
//     }

//     public function payment(Request $request)
//     {
//         $user = Auth::user();
//         $inquiryData = session('postpaid_inquiry_data');

//         if (!$inquiryData || $inquiryData['customer_no'] !== $request->customer_no) {
//             return response()->json(['message' => 'Sesi tidak valid atau nomor pelanggan tidak cocok.'], 400);
//         }

//         $totalPriceToPay = (float) $inquiryData['selling_price'];

//         if ($user->balance < $totalPriceToPay) {
//             return response()->json(['message' => 'Saldo Anda tidak mencukupi.'], 402);
//         }

//         $user->decrement('balance', $totalPriceToPay);
//         Log::info("PDAM Single Payment: User {$user->id} debited {$totalPriceToPay} for single payment.");

//         try {
//             $paymentResult = $this->_processIndividualPdamPayment($inquiryData, $user);

//             if (($paymentResult['status'] ?? 'Gagal') === 'Gagal') {
//                 $user->increment('balance', $totalPriceToPay);
//                 Log::warning("PDAM Single Payment: Transaction {$paymentResult['transaction_id']} failed, balance refunded {$totalPriceToPay}.");
//             }
//             session()->forget('postpaid_inquiry_data');
//             return response()->json($paymentResult);
//         } catch (\Exception $e) {
//             $user->increment('balance', $totalPriceToPay);
//             Log::error('PDAM Single Payment Error (Controller): ' . $e->getMessage(), ['customer_no' => $request->customer_no, 'inquiry_data' => $inquiryData]);
//             return response()->json(['message' => 'Terjadi kesalahan saat memproses pembayaran: ' . $e->getMessage()], 500);
//         }
//     }

//     /**
//      * NEW: Handles bulk PDAM inquiry for multiple customer numbers.
//      *
//      * @param Request $request Contains 'customer_nos' array and 'buyer_sku_code'.
//      * @return \Illuminate\Http\JsonResponse
//      */
//     public function bulkInquiry(Request $request)
//     {
//         $request->validate([
//             'customer_nos' => 'required|array',
//             'customer_nos.*' => 'required|string|min:4',
//             'buyer_sku_code' => 'required|string|exists:postpaid_products,buyer_sku_code',
//         ]);

//         $customerNos = array_unique($request->customer_nos);
//         $buyerSkuCode = $request->buyer_sku_code;

//         $results = [
//             'successful' => [],
//             'failed' => [],
//         ];

//         $product = PostpaidProduct::where('buyer_sku_code', $buyerSkuCode)->first();

//         if (!$product || !$product->seller_product_status) {
//             Log::warning("Bulk Inquiry PDAM: Produk PDAM tidak tersedia atau tidak aktif: {$buyerSkuCode}.");
//             return response()->json(['message' => 'Produk PDAM yang dipilih tidak tersedia atau tidak aktif.'], 503);
//         }

//         foreach ($customerNos as $customerNo) {
//             try {
//                 $inquiryData = $this->_performSinglePdamInquiry($customerNo, $product);

//                 if ($inquiryData) {
//                     $results['successful'][] = $inquiryData;
//                 } else {
//                     $results['failed'][] = [
//                         'customer_no' => $customerNo,
//                         'product_name' => $product->product_name,
//                         'message' => 'Tidak dapat menemukan tagihan atau layanan tidak tersedia.',
//                         'buyer_sku_code' => $buyerSkuCode,
//                     ];
//                 }
//             } catch (\Exception $e) {
//                 Log::error("Bulk Inquiry PDAM: Unexpected error for customer {$customerNo}, SKU {$buyerSkuCode}. Error: " . $e->getMessage());
//                 $results['failed'][] = [
//                     'customer_no' => $customerNo,
//                     'product_name' => $product->product_name,
//                     'message' => 'Terjadi kesalahan saat pengecekan tagihan: ' . $e->getMessage(),
//                     'buyer_sku_code' => $buyerSkuCode,
//                 ];
//             }
//         }

//         if (empty($results['successful']) && empty($results['failed'])) {
//             return response()->json(['message' => 'Tidak ada nomor pelanggan yang diproses.'], 400);
//         }

//         if (!empty($results['successful'])) {
//             session(['postpaid_bulk_pdam_inquiry_data' => $results['successful']]);
//         } else {
//             session()->forget('postpaid_bulk_pdam_inquiry_data');
//         }

//         return response()->json($results);
//     }

//     /**
//      * NEW: Handles bulk PDAM payment for multiple previously inquired customer numbers.
//      *
//      * @param Request $request Contains 'customer_nos_to_pay' array (for validation against session).
//      * @return \Illuminate\Http\JsonResponse
//      */
//     public function bulkPayment(Request $request)
//     {
//         $user = Auth::user();
//         $inquiryDataForPayment = session('postpaid_bulk_pdam_inquiry_data');

//         if (!$inquiryDataForPayment || empty($inquiryDataForPayment)) {
//             return response()->json(['message' => 'Sesi pembayaran massal tidak valid atau kosong. Silakan lakukan pengecekan tagihan ulang.'], 400);
//         }

//         // Filter inquiryDataForPayment untuk hanya menyertakan yang diminta di customer_nos_to_pay
//         $requestedCustomerNos = collect($request->customer_nos_to_pay)->unique();
//         $filteredInquiryDataForPayment = collect($inquiryDataForPayment)->filter(function ($item) use ($requestedCustomerNos) {
//             return $requestedCustomerNos->contains($item['customer_no']);
//         })->values()->all();

//         if (count($requestedCustomerNos) !== count($filteredInquiryDataForPayment)) {
//             Log::warning("Bulk Payment PDAM: Mismatch between requested customer_nos and session data after filtering.", [
//                'request_customer_nos' => $requestedCustomerNos->all(),
//                'session_filtered_customer_nos' => collect($filteredInquiryDataForPayment)->pluck('customer_no')->all(),
//                'user_id' => $user->id,
//            ]);
//            return response()->json(['message' => 'Beberapa data pelanggan untuk pembayaran tidak cocok dengan sesi. Silakan coba lagi.'], 400);
//         }


//         $totalPriceForBulkPayment = collect($filteredInquiryDataForPayment)->sum('selling_price');

//         if ($user->balance < $totalPriceForBulkPayment) {
//             return response()->json(['message' => 'Saldo Anda tidak mencukupi untuk semua transaksi ini.'], 402);
//         }

//         $user->decrement('balance', $totalPriceForBulkPayment);
//         Log::info("Bulk Payment PDAM: User {$user->id} debited total {$totalPriceForBulkPayment} for bulk payment.");

//         $paymentResults = [];
//         $totalRefundAmount = 0;

//         foreach ($filteredInquiryDataForPayment as $inquiryData) {
//             try {
//                 $individualPaymentResult = $this->_processIndividualPdamPayment($inquiryData, $user);
//                 $paymentResults[] = $individualPaymentResult;

//                 if (($individualPaymentResult['status'] ?? 'Gagal') === 'Gagal') {
//                     $totalRefundAmount += $inquiryData['selling_price'];
//                     Log::warning("Bulk Payment PDAM: Individual transaction for {$inquiryData['customer_no']} failed, adding {$inquiryData['selling_price']} to refund amount.");
//                 }
//             } catch (\Exception $e) {
//                 Log::error('PDAM Bulk Payment Error for customer ' . $inquiryData['customer_no'] . ': ' . $e->getMessage(), ['inquiry_data' => $inquiryData, 'user_id' => $user->id]);
//                 $paymentResults[] = array_merge($inquiryData, [
//                     'customer_no' => $inquiryData['customer_no'],
//                     'customer_name' => $inquiryData['customer_name'] ?? 'N/A',
//                     'selling_price' => $inquiryData['selling_price'],
//                     'status' => 'Gagal',
//                     'message' => 'Terjadi kesalahan saat memproses tagihan ini: ' . $e->getMessage(),
//                     'product_name' => $inquiryData['product_name'],
//                 ]);
//                 $totalRefundAmount += $inquiryData['selling_price'];
//             }
//         }

//         if ($totalRefundAmount > 0) {
//             $user->increment('balance', $totalRefundAmount);
//             Log::info("Bulk Payment PDAM: Refunded {$totalRefundAmount} to user {$user->id} for failed transactions.");
//         }

//         session()->forget('postpaid_bulk_pdam_inquiry_data');
//         return response()->json([
//             'results' => $paymentResults,
//             'total_refund_amount' => $totalRefundAmount,
//             'total_paid_amount' => $totalPriceForBulkPayment - $totalRefundAmount
//         ]);
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
            'auth' => [
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
            $adminFromServer = $product->admin ?? 0; // Ini adalah biaya admin yang diatur oleh platform untuk produk ini.

            // Ini menghitung markup (atau 'diskon' efektif terhadap admin nominal platform)
            $markupForClient = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;
            
            // 'calculated_admin' ini kemungkinan adalah biaya admin efektif yang dikenakan kepada pengguna akhir oleh platform
            // setelah mempertimbangkan komisi internal. Digunakan untuk tampilan, bukan perhitungan transaksi langsung di sini.
            $product->calculated_admin = ceil($adminFromServer - $markupForClient);

            return $product;
        })->values()->all();
    }

    /**
     * Helper method to perform a single PDAM inquiry.
     * Handles API calls and data processing for a given customer number and product.
     *
     * @param string $customerNo The customer number to inquire.
     * @param PostpaidProduct $product The PostpaidProduct model associated with the inquiry.
     * @return array|null Returns processed inquiry data on success, null on failure.
     */

    private function _performSinglePdamInquiry(string $customerNo, PostpaidProduct $product): array // MODIFIED: Always return array
    {
        $current_sku = $product->buyer_sku_code;
        $ref_id = 'pdam-' . substr(str_replace('-', '', Str::uuid()->toString()), 0, 15);
        $username = env('P_U');
        $apiKey = env('P_AK'); // Menggunakan P_AK dari env
        $sign = md5($username . $apiKey . $ref_id);

        // --- START DUMMY DATA FOR TESTING INQUIRY (if APP_ENV is local) ---
        if (env('APP_ENV') === 'local') {
            // NEW: Dummy error conditions for testing
            if ($customerNo === '9999') { // Simulate customer not found
                return [
                    'success' => false,
                    'message' => 'ID Pelanggan PDAM tidak ditemukan (DUMMY).',
                    'rc' => '50' // Contoh RC: Transaksi Tidak Ditemukan
                ];
            }
            if ($customerNo === '8888') { // Simulate product gangguan
                return [
                    'success' => false,
                    'message' => 'Produk PDAM mengalami gangguan (DUMMY).',
                    'rc' => '55' // Contoh RC: Produk Gangguan
                ];
            }
            if ($customerNo === '7777') { // Simulate tagihan sudah lunas
                return [
                    'success' => false,
                    'message' => 'Tagihan PDAM untuk ID ini sudah lunas (DUMMY).',
                    'rc' => '02' // Contoh RC: Transaksi Gagal (sering juga untuk sudah lunas)
                ];
            }


            $customerNoLength = strlen($customerNo);
            $lastDigit = $customerNo[$customerNoLength - 1] ?? '0'; // Default ke '0' jika customerNo kosong
            $isOverdue = ((int)$lastDigit % 2 === 0); // Simulasi tunggakan untuk digit terakhir genap
            $customerNameSeed = substr(preg_replace('/[^0-9]/', '', $customerNo), 0, 5); // Gunakan digit dari customerNo

            $basePricePerBill = 25000 + (substr($customerNo, -2, 1) * 1000); // Variasi harga pokok per lembar
            $providerAdminFeePerTransaction = 2500; // Biaya admin per transaksi oleh provider
            $biayaLainPerBill = 1500;
            $dendaPerBill = $isOverdue ? (5000 + (substr($customerNo, -3, 1) * 500)) : 0; // Variasi denda

            $numBills = 1;
            if ((int)$lastDigit % 3 === 0) { // Beberapa pelanggan mungkin memiliki 2 lembar tagihan
                $numBills = 2;
            } elseif ((int)$lastDigit % 5 === 0) { // Beberapa mungkin memiliki 3 lembar tagihan
                $numBills = 3;
            }

            $dummyDescDetails = [];
            $totalPureBillAmountDummy = 0; // Total harga pokok murni (tanpa denda/biaya lain)
            $totalDendaAmountDummy = 0;
            $totalBiayaLainAmountDummy = 0;

            for ($i = 0; $i < $numBills; $i++) {
                $periodeMonth = date('m', strtotime("-{$i} month"));
                $periodeYear = date('Y', strtotime("-{$i} month"));
                $billPrice = $basePricePerBill + ($i * 1000); // Harga pokok per detail
                $billDenda = $isOverdue ? ceil($dendaPerBill / $numBills) : 0; // Distribusi denda
                $billBiayaLain = $biayaLainPerBill;

                $dummyDescDetails[] = [
                    "periode" => "{$periodeYear}{$periodeMonth}",
                    "nilai_tagihan" => $billPrice, // Ini harga pokok murni per lembar
                    "denda" => $billDenda,
                    "meter_awal" => '000' . Str::random(5),
                    "meter_akhir" => '000' . Str::random(5),
                    "biaya_lain" => $billBiayaLain
                ];
                $totalPureBillAmountDummy += $billPrice;
                $totalDendaAmountDummy += $billDenda;
                $totalBiayaLainAmountDummy += $billBiayaLain;
            }

            $dummyCustomerName = 'Pelanggan PDAM ' . $product->product_name . ' ' . $customerNameSeed . ($isOverdue ? ' (OVERDUE)' : '');
            $dummyAddress = 'Jl. Dummy No.' . $customerNoLength . ', Kota ' . Str::upper(substr($current_sku, 0, 3));
            $dummyJatuhTempo = date('d-M-Y', strtotime('+5 days'));

            // 'price' field: Ini adalah (harga pokok + denda + biaya_lain) dari sisi provider sebelum biaya admin mereka.
            $dummyPriceComponent = $totalPureBillAmountDummy + $totalDendaAmountDummy + $totalBiayaLainAmountDummy;

            // 'selling_price' field: Ini adalah total harga dari provider, sudah termasuk biaya admin mereka.
            $dummyProviderTotalSellingPrice = $dummyPriceComponent + $providerAdminFeePerTransaction;
            // Simulasi sedikit variasi dari base jika diperlukan untuk 'selling_price'
            $dummyProviderTotalSellingPrice = ceil($dummyProviderTotalSellingPrice * (1 + (int)$lastDigit / 100000));


            $inquiryDataFromApi = [ // Use a temporary variable to build data
                'status' => 'Sukses',
                'message' => 'Inquiry PDAM dummy berhasil.', // MODIFIED: Always include message
                'customer_name' => $dummyCustomerName,
                'customer_no' => $customerNo,
                'buyer_sku_code' => $current_sku,
                'price' => $dummyPriceComponent, // (Harga pokok + Denda + Biaya Lain) sebelum admin dari sisi provider
                'admin' => $providerAdminFeePerTransaction, // Biaya admin per transaksi dari provider
                'rc' => '00', // MODIFIED: Always include RC
                'sn' => 'SN-INQ-' . Str::random(12),
                'ref_id' => $ref_id,
                'desc' => [
                    "tarif" => "R" . (2 + (int)$lastDigit % 3),
                    "lembar_tagihan" => $numBills,
                    "alamat" => $dummyAddress,
                    "jatuh_tempo" => $dummyJatuhTempo,
                    "detail" => $dummyDescDetails,
                    "denda" => $totalDendaAmountDummy, // Total denda (untuk info di desc)
                    "biaya_lain" => $totalBiayaLainAmountDummy, // Total biaya lain (untuk info di desc)
                ],
                'selling_price' => $dummyProviderTotalSellingPrice, // ORIGINAL provider selling_price (total termasuk admin)
                'original_api_price' => $dummyProviderTotalSellingPrice, // Untuk konsistensi, gunakan ini sebagai total jika tidak didefinisikan secara eksplisit
                'original_api_selling_price' => $dummyProviderTotalSellingPrice, // Redundant, tetapi dipertahankan jika provider lain menggunakannya.
            ];
            Log::info('PDAM Inquiry API Response (DUMMY):', ['response_data' => $inquiryDataFromApi, 'customer_no' => $customerNo, 'sku' => $current_sku, 'ref_id' => $ref_id]);
        } else {
            // --- END DUMMY DATA ---

            // --- ORIGINAL API CALL (only if not in local dummy mode) ---
            if (!$product->seller_product_status) {
                Log::warning("Inquiry PDAM: Produk tidak aktif untuk SKU: {$current_sku}, Customer No: {$customerNo}.");
                // MODIFIED: Return an array on failure
                return [
                    'success' => false,
                    'message' => 'Produk PDAM tidak aktif.',
                    'rc' => 'PRODUCT_NOT_ACTIVE' // Custom RC
                ];
            }

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
                Log::info('PDAM Inquiry API Response:', ['response_data' => $responseData, 'customer_no' => $customerNo, 'sku' => $current_sku, 'ref_id' => $ref_id]);

                if (!isset($responseData['data']) || $responseData['data']['status'] !== 'Sukses') {
                    $errorMessage = $responseData['data']['message'] ?? 'Gagal melakukan pengecekan tagihan dari provider.';
                    $errorCode = $responseData['data']['rc'] ?? 'PROVIDER_ERROR_UNKNOWN'; // NEW: Capture provider's RC
                    Log::warning("Inquiry PDAM Gagal dari Provider untuk SKU: {$current_sku}. Pesan: {$errorMessage} (RC: {$errorCode})", ['response' => $responseData, 'customer_no' => $customerNo]);
                    // MODIFIED: Return an array on provider-side failure
                    return [
                        'success' => false,
                        'message' => $errorMessage,
                        'rc' => $errorCode // MODIFIED: Return actual RC from provider
                    ];
                }
            } catch (\Exception $e) {
                Log::error('PDAM Inquiry Error (API Call): ' . $e->getMessage(), ['customer_no' => $customerNo, 'sku' => $current_sku, 'exception_trace' => $e->getTraceAsString()]);
                // MODIFIED: Return an array on API connection failure
                return [
                    'success' => false,
                    'message' => 'Gagal terhubung ke server provider.',
                    'rc' => 'API_CONNECTION_FAILED' // Custom RC
                ];
            }
            $inquiryDataFromApi = $responseData['data']; // Assign to a common variable
        }

        // --- COMMON PROCESSING LOGIC (for both real and dummy data) ---

        // Ekstrak nilai-nilai mentah dari respons API
        $apiProviderTotalSellingPrice = (float) ($inquiryDataFromApi['selling_price'] ?? 0); // Total harga dari provider (termasuk semuanya)
        $apiProviderAdminFee          = (float) ($inquiryDataFromApi['admin'] ?? 0);          // Komponen biaya admin dari provider
        $apiProviderPriceComponent    = (float) ($inquiryDataFromApi['price'] ?? 0);         // 'price' dari API (pure bill + denda + biaya_lain, tanpa admin provider)

        // Pastikan array 'desc' ada dan diinisialisasi
        if (!isset($inquiryDataFromApi['desc']) || !is_array($inquiryDataFromApi['desc'])) {
            $inquiryDataFromApi['desc'] = [];
        }

        // Pastikan field 'desc' yang penting ada atau disetel null
        $inquiryDataFromApi['desc']['tarif']       = $inquiryDataFromApi['desc']['tarif'] ?? null;
        $inquiryDataFromApi['desc']['alamat']      = $inquiryDataFromApi['desc']['alamat'] ?? null;
        $inquiryDataFromApi['desc']['jatuh_tempo'] = $inquiryDataFromApi['desc']['jatuh_tempo'] ?? null;

        $sumOfPureBillAmounts  = 0; // Jumlah tagihan pokok murni yang dihitung (tidak termasuk denda, biaya_lain, admin)
        $sumOfDendaAmounts     = 0; // Total denda, diakumulasikan
        $sumOfBiayaLainAmounts = 0; // Total biaya lain, diakumulasikan
        $jumlahLembarTagihan   = 0;

        // Tentukan jumlahLembarTagihan dan akumulasikan total denda dan biaya lain
        if (isset($inquiryDataFromApi['desc']['lembar_tagihan'])) {
            $jumlahLembarTagihan = (int) $inquiryDataFromApi['desc']['lembar_tagihan'];
        }

        if (isset($inquiryDataFromApi['desc']['detail']) && is_array($inquiryDataFromApi['desc']['detail'])) {
            // Jika detail ada, hitung jumlah tagihan dan jumlahkan denda/biaya_lain dari detail
            if (!$jumlahLembarTagihan) { // Hanya setel jika belum dari 'lembar_tagihan'
                $jumlahLembarTagihan = count($inquiryDataFromApi['desc']['detail']);
            }
            foreach ($inquiryDataFromApi['desc']['detail'] as $detail) {
                $sumOfDendaAmounts     += (float) ($detail['denda'] ?? 0);
                $sumOfBiayaLainAmounts += (float) ($detail['biaya_lain'] ?? 0);
            }
        } else {
            // Jika 'desc.detail' tidak tersedia, ambil total denda dan biaya_lain dari root 'desc'
            $sumOfDendaAmounts     = (float) ($inquiryDataFromApi['desc']['denda'] ?? 0);
            $sumOfBiayaLainAmounts = (float) ($inquiryDataFromApi['desc']['biaya_lain'] ?? 0);
            if (!$jumlahLembarTagihan) { // Default ke 1 jika tidak ada detail dan tidak ada lembar_tagihan eksplisit
                $jumlahLembarTagihan = 1;
            }
        }

        // Hitung "gross bill amount" dari perspektif provider, tidak termasuk biaya admin mereka
        // Ini adalah (Harga Pokok + Denda + Biaya Lain)
        $providerGrossBillAmountExclAdmin = $apiProviderTotalSellingPrice - $apiProviderAdminFee;

        // Hitung "Jumlah Tagihan Pokok Murni" dengan mengurangi denda dan biaya_lain dari jumlah gross
        $sumOfPureBillAmounts = $providerGrossBillAmountExclAdmin - $sumOfDendaAmounts - $sumOfBiayaLainAmounts;

        // Pastikan sumOfPureBillAmounts tidak menjadi negatif karena inkonsistensi data
        if ($sumOfPureBillAmounts < 0) {
            Log::warning("PDAM Inquiry: Calculated sumOfPureBillAmounts went negative for customer {$customerNo}. Adjusting to 0.", [
                'apiProviderTotalSellingPrice' => $apiProviderTotalSellingPrice,
                'apiProviderAdminFee' => $apiProviderAdminFee,
                'providerGrossBillAmountExclAdmin' => $providerGrossBillAmountExclAdmin,
                'sumOfDendaAmounts' => $sumOfDendaAmounts,
                'sumOfBiayaLainAmounts' => $sumOfBiayaLainAmounts,
                'inquiryDataFromApi' => $inquiryDataFromApi
            ]);
            $sumOfPureBillAmounts = 0;
        }

        // Hitung diskon yang diberikan kepada pengguna
        $commission_sell_percentage = $product->commission_sell_percentage ?? 0;
        $commission_sell_fixed      = $product->commission_sell_fixed ?? 0;
        $commission                 = $product->commission ?? 0;

        $discountPerBillUnit = (($commission * $commission_sell_percentage) / 100) + $commission_sell_fixed;
        $finalDiscount = ceil($discountPerBillUnit * $jumlahLembarTagihan); // Bulatkan total diskon ke atas

        // Hitung harga akhir yang harus dibayar pengguna
        // Berdasarkan komentar pengguna, apiProviderTotalSellingPrice sudah termasuk admin provider.
        // Jadi, harga akhir untuk pengguna adalah total provider dikurangi diskon kita.
        $finalSellingPrice = $apiProviderTotalSellingPrice - $finalDiscount;
        $finalSellingPrice = ceil($finalSellingPrice); // Bulatkan harga jual akhir ke atas

        // --- START OF MODIFIED OVERRIDE LOGIC ---
        // Logika override yang diubah: jika 'price' dari API (tanpa admin provider) lebih tinggi dari
        // 'finalSellingPrice' yang dihitung (yang sudah termasuk admin provider & diskon),
        // maka gunakan 'price' dari API sebagai finalSellingPrice.
        // IMPLIKASI: Ini berarti platform bersedia untuk mengabaikan biaya admin provider
        // dan sebagian atau seluruh diskon yang diberikan, jika diskon kita membuat
        // total harga akhir jatuh di bawah harga pokok murni dari provider.
        // Ini mengubah tujuan dari "mencegah penjualan di bawah total harga provider" menjadi
        // "mencegah penjualan di bawah harga pokok murni provider (tanpa admin mereka)".
        if ($apiProviderPriceComponent > $finalSellingPrice && $apiProviderPriceComponent > 0) {
            Log::info("PDAM Inquiry: finalSellingPrice overridden by apiProviderPriceComponent. (Client discount and provider admin fee partially/fully ignored)", [
                'calculated_finalSellingPrice_with_discount' => $finalSellingPrice,
                'apiProviderPriceComponent' => $apiProviderPriceComponent,
                'apiProviderTotalSellingPrice' => $apiProviderTotalSellingPrice, // Untuk konteks log
                'customer_no' => $customerNo
            ]);
            $finalSellingPrice = $apiProviderPriceComponent;
        }
        // --- END OF MODIFIED OVERRIDE LOGIC ---

        // Update inquiryDataFromApi dengan nilai-nilai yang sudah diproses untuk penggunaan internal dan tampilan frontend
        $inquiryDataFromApi['success'] = true; // NEW: Indicate success
        $inquiryDataFromApi['message'] = $inquiryDataFromApi['message'] ?? 'Inquiry berhasil.'; // NEW: Ensure message is present
        $inquiryDataFromApi['rc'] = $inquiryDataFromApi['rc'] ?? '00'; // NEW: Ensure RC is present, default to '00' for success

        $inquiryDataFromApi['price']         = $sumOfPureBillAmounts;       // Harga pokok murni yang kita hitung (untuk mapping transaksi)
        $inquiryDataFromApi['admin']         = $apiProviderAdminFee;        // Biaya admin provider (untuk mapping transaksi)
        $inquiryDataFromApi['denda']         = $sumOfDendaAmounts;          // Total denda
        $inquiryDataFromApi['biaya_lain']    = $sumOfBiayaLainAmounts;      // Total biaya lain
        $inquiryDataFromApi['diskon']        = $finalDiscount;              // Total diskon yang diberikan platform
        $inquiryDataFromApi['jumlah_lembar_tagihan'] = $jumlahLembarTagihan;
        $inquiryDataFromApi['selling_price'] = $finalSellingPrice;          // Harga akhir yang dibayar pengguna
        $inquiryDataFromApi['buyer_sku_code'] = $current_sku;
        $inquiryDataFromApi['ref_id'] = $ref_id;
        $inquiryDataFromApi['provider_original_selling_price'] = $apiProviderTotalSellingPrice; // Untuk referensi
        $inquiryDataFromApi['product_name'] = $product->product_name; // Tambahkan nama produk untuk tampilan frontend

        unset($inquiryDataFromApi['buyer_last_saldo']); // Hapus jika tidak relevan untuk konteks saat ini
        // unset($inquiryDataFromApi['original_api_price']); // Ini sebelumnya digunakan untuk logika override, tetapi kini langsung menggunakan apiProviderTotalSellingPrice.

        return $inquiryDataFromApi;
    }
    
    public function inquiry(Request $request)
    {
        $request->validate([
            'customer_no' => 'required|string|min:4',
            'buyer_sku_code' => 'required|string|exists:postpaid_products,buyer_sku_code',
        ]);

        $customerNo = $request->customer_no;
        $current_sku = $request->buyer_sku_code;

        $product = PostpaidProduct::where('buyer_sku_code', $current_sku)->first();

        if (!$product || !$product->seller_product_status) {
            // MODIFIED: Return object with RC if product not found/active
            return response()->json([
                'message' => 'Produk PDAM tidak tersedia atau tidak aktif.',
                'rc' => 'PRODUCT_NOT_ACTIVE' // Custom RC
            ], 503);
        }

        $inquiryResult = $this->_performSinglePdamInquiry($customerNo, $product); // MODIFIED: Use $inquiryResult

        // MODIFIED: Check the 'success' key from the returned array
        if ($inquiryResult['success']) {
            session(['postpaid_inquiry_data' => $inquiryResult]);
            return response()->json($inquiryResult);
        } else {
            // MODIFIED: Directly use message and RC from the returned inquiryResult array
            return response()->json([
                'message' => $inquiryResult['message'] ?? 'Gagal melakukan pengecekan tagihan. Silakan coba lagi nanti.', // Fallback message
                'rc' => $inquiryResult['rc'] ?? 'UNKNOWN_ERROR' // Fallback RC
            ], 400); // Use 400 for bad request/client-side errors
        }
    }

    /**
     * Helper method to process a single PDAM payment after balance has been debited.
     * This method creates the transaction record, calls the provider API, and updates the transaction.
     *
     * @param array $inquiryData Processed inquiry data for a single customer.
     * @param \App\Models\User $user The authenticated user (for logging/context, not balance modification).
     * @return array Returns an array with transaction status and details.
     * @throws \Exception If the API call or transaction update fails critically.
     */
    private function _processIndividualPdamPayment(array $inquiryData, \App\Models\User $user): array
    {
        $totalPriceToPay     = (float) $inquiryData['selling_price'];         // Harga akhir yang dibayar pengguna
        $providerAdminFee    = (float) $inquiryData['admin'];                 // Biaya admin provider
        $pureBillPrice       = (float) $inquiryData['price'];                 // Tagihan pokok murni yang dihitung
        $diskon              = (float) ($inquiryData['diskon'] ?? 0);
        $jumlahLembarTagihan = (int) ($inquiryData['jumlah_lembar_tagihan'] ?? 0);
        $denda               = (float) ($inquiryData['denda'] ?? 0);
        $biayaLain           = (float) ($inquiryData['biaya_lain'] ?? 0);

        // Petakan data inquiry awal ke struktur transaksi terpadu untuk pembuatan
        // 'price' di sini mengacu pada tagihan pokok murni, 'admin_fee' mengacu pada biaya admin provider.
        $initialData = $this->mapToUnifiedTransaction($inquiryData, 'PDAM', $pureBillPrice, $providerAdminFee);
        $initialData['user_id'] = $user->id;
        $initialData['selling_price'] = $totalPriceToPay; // Ini adalah harga akhir yang dibebankan kepada pengguna
        $initialData['status'] = 'Pending';
        $initialData['message'] = 'Menunggu konfirmasi pembayaran dari provider';

        $initialData['rc'] = $inquiryData['rc'] ?? null;
        $initialData['sn'] = null;

        $initialData['details'] = [
            'diskon' => $diskon,
            'jumlah_lembar_tagihan' => $jumlahLembarTagihan,
            'denda' => $denda,
            'biaya_lain' => $biayaLain,
            'desc' => $inquiryData['desc'] ?? null, // Simpan deskripsi lengkap dari inquiry
        ];
        unset($initialData['buyer_last_saldo'], $initialData['provider_original_selling_price']);

        $unifiedTransaction = PostpaidTransaction::create($initialData);

        $apiResponseData = [];

        // --- START DUMMY RESPONSE PAYMENT ---
        if (env('APP_ENV') === 'local') {
            $isPaymentSuccess = (substr($inquiryData['customer_no'], -1) % 2 !== 0); // Simulasi sukses untuk digit terakhir ganjil

            if ($isPaymentSuccess) {
                $apiResponseData = [
                    'status' => 'Sukses',
                    'message' => 'Pembayaran PDAM dummy berhasil diproses.',
                    'rc' => '00',
                    'sn' => 'SN-PDAM-' . Str::random(15),
                    'customer_name' => $inquiryData['customer_name'],
                    'customer_no' => $inquiryData['customer_no'],
                    'buyer_sku_code' => $inquiryData['buyer_sku_code'],
                    'price' => $pureBillPrice, // Tagihan pokok murni (dari data inquiry)
                    'admin' => $providerAdminFee, // Biaya admin provider (dari data inquiry)
                    'ref_id' => $inquiryData['ref_id'],
                    'selling_price' => $totalPriceToPay, // Harga jual akhir kita
                ];
            } else {
                $apiResponseData = [
                    'status' => 'Gagal',
                    'message' => 'Pembayaran PDAM dummy gagal. Saldo provider tidak cukup (simulasi).',
                    'rc' => '14', // Contoh kode kegagalan
                    'sn' => null,
                    'customer_name' => $inquiryData['customer_name'],
                    'customer_no' => $inquiryData['customer_no'],
                    'buyer_sku_code' => $inquiryData['buyer_sku_code'],
                    'price' => $pureBillPrice,
                    'admin' => $providerAdminFee,
                    'ref_id' => $inquiryData['ref_id'],
                    'selling_price' => $totalPriceToPay,
                ];
            }
            Log::info('PDAM Payment Dummy Response:', ['response_data' => $apiResponseData, 'transaction_id' => $unifiedTransaction->id]);

        } else {
            // --- END DUMMY DATA ---

            // --- ORIGINAL API CALL (only if not in local dummy mode) ---
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
                $apiResponseData = $response->json()['data']; // Asumsikan kunci 'data' ada untuk respons yang sukses

                Log::info('PDAM Payment API Response:', ['response_data' => $apiResponseData, 'transaction_id' => $unifiedTransaction->id]);

            } catch (\Exception $e) {
                $errorMessage = ['status' => 'Gagal', 'message' => 'Gagal terhubung ke server provider.'];
                $unifiedTransaction->update(array_merge($errorMessage, ['rc' => null, 'sn' => null]));
                Log::error('PDAM Payment Error: ' . $e->getMessage(), ['transaction_id' => $unifiedTransaction->id, 'inquiry_data' => $inquiryData]);
                throw new \Exception('Terjadi kesalahan pada server provider.');
            }
        }

        // Gabungkan data inquiry asli dengan data respons pembayaran API yang sebenarnya
        // Ini memastikan semua field yang diperlukan tersedia untuk mapping
        $fullResponseData = array_merge($inquiryData, $apiResponseData);

        // Secara eksplisit setel nilai inti untuk mapToUnifiedTransaction untuk memastikan konsistensi
        $fullResponseData['price'] = $pureBillPrice;       // Tagihan pokok murni yang kita hitung
        $fullResponseData['admin'] = $providerAdminFee;    // Biaya admin provider
        $fullResponseData['selling_price'] = $totalPriceToPay; // Harga akhir yang dibebankan kepada pengguna

        // Hapus kunci-kunci yang seharusnya tidak berada di tingkat root transaksi, atau bersifat redundant untuk mapping
        unset($fullResponseData['buyer_last_saldo'], $fullResponseData['provider_original_selling_price'], $fullResponseData['biaya_lain']);

        // Siapkan payload untuk memperbarui record transaksi
        // Kolom 'price' dan 'admin_fee' di DB akan menyimpan tagihan pokok murni dan biaya admin provider masing-masing.
        $updatePayload = $this->mapToUnifiedTransaction($fullResponseData, 'PDAM', $pureBillPrice, $providerAdminFee);
        $updatePayload['selling_price'] = $totalPriceToPay; // Disimpan di DB sebagai jumlah aktual yang dibayar pengguna
        $updatePayload['status'] = $apiResponseData['status'] ?? 'Gagal';
        $updatePayload['message'] = $apiResponseData['message'] ?? 'Pembayaran gagal.';

        $updatePayload['rc'] = $apiResponseData['rc'] ?? null;
        $updatePayload['sn'] = $apiResponseData['sn'] ?? null;

        // Definisikan kunci-kunci dari respons API yang harus secara eksplisit dikecualikan dari array 'details'
        // (karena sudah dipetakan ke kolom root atau redundant).
        $keysToExcludeFromDetails = [
            'ref_id', 'customer_no', 'customer_name', 'buyer_sku_code', 'message',
            'rc', 'sn', 'buyer_last_saldo', 'price', 'selling_price', 'admin', 'status',
            'diskon', 'jumlah_lembar_tagihan', 'denda', 'biaya_lain', 'desc',
            'provider_original_selling_price', 'product_name'
        ];

        // Filter detail tambahan dari respons API
        $detailsFromApiResponse = [];
        foreach ($apiResponseData as $key => $value) {
            if (!in_array($key, $keysToExcludeFromDetails)) {
                $detailsFromApiResponse[$key] = $value;
            }
        }

        // Gabungkan detail terhitung spesifik dengan detail respons API yang difilter
        $updatePayload['details'] = array_merge(
            $detailsFromApiResponse,
            ['diskon' => $diskon, 'jumlah_lembar_tagihan' => $jumlahLembarTagihan, 'denda' => $denda, 'biaya_lain' => $biayaLain],
            ['desc' => $inquiryData['desc'] ?? null] // Pertahankan deskripsi inquiry lengkap
        );

        // Hapus kunci-kunci dari updatePayload yang ditangani oleh mapToUnifiedTransaction atau redundant
        unset(
            $updatePayload['user_id'], $updatePayload['ref_id'], $updatePayload['type'],
            $updatePayload['price'], $updatePayload['admin_fee'],
            $updatePayload['buyer_last_saldo'], $updatePayload['provider_original_selling_price']
        );

        $unifiedTransaction->update($updatePayload);
        $unifiedTransaction->refresh();

        // Kembalikan hasil terstruktur untuk metode pemanggil
        return [
            'transaction_id' => $unifiedTransaction->id,
            'ref_id' => $unifiedTransaction->ref_id,
            'customer_no' => $unifiedTransaction->customer_no,
            'customer_name' => $unifiedTransaction->customer_name,
            'selling_price' => $unifiedTransaction->selling_price,
            'status' => $unifiedTransaction->status,
            'message' => $unifiedTransaction->message,
            'diskon' => $unifiedTransaction->details['diskon'] ?? 0,
            'jumlah_lembar_tagihan' => $unifiedTransaction->details['jumlah_lembar_tagihan'] ?? 0,
            'denda' => $unifiedTransaction->details['denda'] ?? 0,
            'biaya_lain' => $unifiedTransaction->details['biaya_lain'] ?? 0,
            'admin' => $unifiedTransaction->admin_fee, // Ini adalah biaya admin provider yang tersimpan
            'price' => $unifiedTransaction->price,     // Ini adalah tagihan pokok murni yang tersimpan
            'sn' => $unifiedTransaction->sn,
            'product_name' => $inquiryData['product_name'],
            'details' => $unifiedTransaction->details,
        ];
    }

    public function payment(Request $request)
    {
        $user = Auth::user();
        $inquiryData = session('postpaid_inquiry_data');

        if (!$inquiryData || $inquiryData['customer_no'] !== $request->customer_no) {
            return response()->json(['message' => 'Sesi tidak valid atau nomor pelanggan tidak cocok.'], 400);
        }

        $totalPriceToPay = (float) $inquiryData['selling_price'];

        if ($user->balance < $totalPriceToPay) {
            return response()->json(['message' => 'Saldo Anda tidak mencukupi.'], 402);
        }

        $user->decrement('balance', $totalPriceToPay);
        Log::info("PDAM Single Payment: User {$user->id} debited {$totalPriceToPay} for single payment.");

        try {
            $paymentResult = $this->_processIndividualPdamPayment($inquiryData, $user);

            if (($paymentResult['status'] ?? 'Gagal') === 'Gagal') {
                $user->increment('balance', $totalPriceToPay);
                Log::warning("PDAM Single Payment: Transaction {$paymentResult['transaction_id']} failed, balance refunded {$totalPriceToPay}.");
            }
            session()->forget('postpaid_inquiry_data');
            return response()->json($paymentResult);
        } catch (\Exception $e) {
            $user->increment('balance', $totalPriceToPay);
            Log::error('PDAM Single Payment Error (Controller): ' . $e->getMessage(), ['customer_no' => $request->customer_no, 'inquiry_data' => $inquiryData]);
            return response()->json(['message' => 'Terjadi kesalahan saat memproses pembayaran: ' . $e->getMessage()], 500);
        }
    }

    /**
     * NEW: Handles bulk PDAM inquiry for multiple customer numbers.
     *
     * @param Request $request Contains 'customer_nos' array and 'buyer_sku_code'.
     * @return \Illuminate\Http\JsonResponse
     */
    public function bulkInquiry(Request $request)
    {
        $request->validate([
            'customer_nos' => 'required|array',
            'customer_nos.*' => 'required|string|min:4',
            'buyer_sku_code' => 'required|string|exists:postpaid_products,buyer_sku_code',
        ]);

        $customerNos = array_unique($request->customer_nos);
        $buyerSkuCode = $request->buyer_sku_code;

        $results = [
            'successful' => [],
            'failed' => [],
        ];

        $product = PostpaidProduct::where('buyer_sku_code', $buyerSkuCode)->first();

        if (!$product || !$product->seller_product_status) {
            Log::warning("Bulk Inquiry PDAM: Produk PDAM tidak tersedia atau tidak aktif: {$buyerSkuCode}.");
            return response()->json(['message' => 'Produk PDAM yang dipilih tidak tersedia atau tidak aktif.'], 503);
        }

        foreach ($customerNos as $customerNo) {
            try {
                $inquiryData = $this->_performSinglePdamInquiry($customerNo, $product);

                if ($inquiryData) {
                    $results['successful'][] = $inquiryData;
                } else {
                    $results['failed'][] = [
                        'customer_no' => $customerNo,
                        'product_name' => $product->product_name,
                        'message' => 'Tidak dapat menemukan tagihan atau layanan tidak tersedia.',
                        'buyer_sku_code' => $buyerSkuCode,
                    ];
                }
            } catch (\Exception $e) {
                Log::error("Bulk Inquiry PDAM: Unexpected error for customer {$customerNo}, SKU {$buyerSkuCode}. Error: " . $e->getMessage());
                $results['failed'][] = [
                    'customer_no' => $customerNo,
                    'product_name' => $product->product_name,
                    'message' => 'Terjadi kesalahan saat pengecekan tagihan: ' . $e->getMessage(),
                    'buyer_sku_code' => $buyerSkuCode,
                ];
            }
        }

        if (empty($results['successful']) && empty($results['failed'])) {
            return response()->json(['message' => 'Tidak ada nomor pelanggan yang diproses.'], 400);
        }

        if (!empty($results['successful'])) {
            session(['postpaid_bulk_pdam_inquiry_data' => $results['successful']]);
        } else {
            session()->forget('postpaid_bulk_pdam_inquiry_data');
        }

        return response()->json($results);
    }

    /**
     * NEW: Handles bulk PDAM payment for multiple previously inquired customer numbers.
     *
     * @param Request $request Contains 'customer_nos_to_pay' array (for validation against session).
     * @return \Illuminate\Http\JsonResponse
     */
    public function bulkPayment(Request $request)
    {
        $user = Auth::user();
        $inquiryDataForPayment = session('postpaid_bulk_pdam_inquiry_data');

        if (!$inquiryDataForPayment || empty($inquiryDataForPayment)) {
            return response()->json(['message' => 'Sesi pembayaran massal tidak valid atau kosong. Silakan lakukan pengecekan tagihan ulang.'], 400);
        }

        // Filter inquiryDataForPayment untuk hanya menyertakan yang diminta di customer_nos_to_pay
        $requestedCustomerNos = collect($request->customer_nos_to_pay)->unique();
        $filteredInquiryDataForPayment = collect($inquiryDataForPayment)->filter(function ($item) use ($requestedCustomerNos) {
            return $requestedCustomerNos->contains($item['customer_no']);
        })->values()->all();

        if (count($requestedCustomerNos) !== count($filteredInquiryDataForPayment)) {
            Log::warning("Bulk Payment PDAM: Mismatch between requested customer_nos and session data after filtering.", [
               'request_customer_nos' => $requestedCustomerNos->all(),
               'session_filtered_customer_nos' => collect($filteredInquiryDataForPayment)->pluck('customer_no')->all(),
               'user_id' => $user->id,
           ]);
           return response()->json(['message' => 'Beberapa data pelanggan untuk pembayaran tidak cocok dengan sesi. Silakan coba lagi.'], 400);
        }


        $totalPriceForBulkPayment = collect($filteredInquiryDataForPayment)->sum('selling_price');

        if ($user->balance < $totalPriceForBulkPayment) {
            return response()->json(['message' => 'Saldo Anda tidak mencukupi untuk semua transaksi ini.'], 402);
        }

        $user->decrement('balance', $totalPriceForBulkPayment);
        Log::info("Bulk Payment PDAM: User {$user->id} debited total {$totalPriceForBulkPayment} for bulk payment.");

        $paymentResults = [];
        $totalRefundAmount = 0;

        foreach ($filteredInquiryDataForPayment as $inquiryData) {
            try {
                $individualPaymentResult = $this->_processIndividualPdamPayment($inquiryData, $user);
                $paymentResults[] = $individualPaymentResult;

                if (($individualPaymentResult['status'] ?? 'Gagal') === 'Gagal') {
                    $totalRefundAmount += $inquiryData['selling_price'];
                    Log::warning("Bulk Payment PDAM: Individual transaction for {$inquiryData['customer_no']} failed, adding {$inquiryData['selling_price']} to refund amount.");
                }
            } catch (\Exception $e) {
                Log::error('PDAM Bulk Payment Error for customer ' . $inquiryData['customer_no'] . ': ' . $e->getMessage(), ['inquiry_data' => $inquiryData, 'user_id' => $user->id]);
                $paymentResults[] = array_merge($inquiryData, [
                    'customer_no' => $inquiryData['customer_no'],
                    'customer_name' => $inquiryData['customer_name'] ?? 'N/A',
                    'selling_price' => $inquiryData['selling_price'],
                    'status' => 'Gagal',
                    'message' => 'Terjadi kesalahan saat memproses tagihan ini: ' . $e->getMessage(),
                    'product_name' => $inquiryData['product_name'],
                ]);
                $totalRefundAmount += $inquiryData['selling_price'];
            }
        }

        if ($totalRefundAmount > 0) {
            $user->increment('balance', $totalRefundAmount);
            Log::info("Bulk Payment PDAM: Refunded {$totalRefundAmount} to user {$user->id} for failed transactions.");
        }

        session()->forget('postpaid_bulk_pdam_inquiry_data');
        return response()->json([
            'results' => $paymentResults,
            'total_refund_amount' => $totalRefundAmount,
            'total_paid_amount' => $totalPriceForBulkPayment - $totalRefundAmount
        ]);
    }
}