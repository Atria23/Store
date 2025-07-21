<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use App\Models\Deposit;
use App\Models\Admin;
use App\Models\User;
use App\Models\MutasiQris;
use Inertia\Inertia;
use App\Services\DepositService;
use App\Mail\AdminDepositNotification;
use Illuminate\Support\Facades\Mail;
use App\Mail\AdminDepositNotificationFallback;
use Illuminate\Support\Facades\Log;


class DepositController extends Controller
{

    public function checkAndExpire(DepositService $service)
    {
        $expiredCount = $service->expireIfPastDue();
        return response()->json(['expired' => $expiredCount]);
    }

    // Menampilkan halaman pembuatan deposit
    public function create()
    {
        return Inertia::render('User/RequestDeposit');
    }

    public function store(Request $request)
    {
        // Validasi input
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1000',
            'payment_method' => 'required|string|in:shopeepay,dana,gopay,ovo,linkaja,qris_otomatis,qris_dana,qris_shopeepay,qris_gopay,qris_ovo',
        ]);

        $admin = Admin::where('admin_status', true)
            ->where('wallet_is_active', true)
            ->where($validated['payment_method'] . '_status', true)
            ->orderBy('user_id', 'asc')
            ->first();

        if (!$admin) {
            \Log::warning('No active admin found for method: ' . $validated['payment_method']);
            return back()->withErrors(['payment_method' => 'No admin available for this method.']);
        }

        // Deteksi metode QRIS dan tetapkan admin fee
        $qrisFees = [
            'qris_otomatis' => 0,
            'qris_shopeepay' => 0,
            'qris_ovo' => 0.7,
            'qris_gopay' => 0.3,
        ];

        $uniqueCode = 1;
        $isQris = array_key_exists($validated['payment_method'], $qrisFees);
        $adminFeePercentage = $isQris ? $qrisFees[$validated['payment_method']] / 100 : 0;
        $adminFee = $isQris ? ceil(($validated['amount'] + $uniqueCode) * $adminFeePercentage) : 0;

        // Hitung total yang harus dibayar
        $totalPay = $validated['amount'] + $uniqueCode + $adminFee;

        // Pastikan total_pay unik pada tanggal yang sama
        $today = now()->toDateString();
        while (DB::table('deposits')
            ->whereDate('created_at', $today)
            ->where('total_pay', $totalPay)
            ->exists()
        ) {
            $uniqueCode += 1;
            $adminFee = $isQris ? ceil(($validated['amount'] + $uniqueCode) * $adminFeePercentage) : 0;
            $totalPay = $validated['amount'] + $uniqueCode + $adminFee;
        }

        // Total saldo diterima user (tanpa admin fee)
        $totalSaldo = $validated['amount'] + $uniqueCode;

        // Set expired time
        $expiresAt = $isQris ? now()->addMinutes(10) : now()->addMinutes(11);

        $qrisString = null;

        if ($isQris) {
            $qrisColumn = $validated['payment_method'] . '_string';
            $qrisTemplate = $admin->{$qrisColumn} ?? null;

            \Log::info("QRIS COLUMN: $qrisColumn");
            \Log::info("QRIS TEMPLATE RAW: " . ($qrisTemplate ?? 'NULL'));

            if ($qrisTemplate) {
                $feeType = $adminFee > 0 ? 'p' : null;
                $feeValue = $adminFee > 0 ? $adminFee : null;

                $qrisString = $this->generateDynamicQris($qrisTemplate, $totalPay, $feeType, $feeValue);

                \Log::info("QRIS GENERATED STRING: $qrisString");
            }
        }
        
        try {
            $username = env('P_U');
            $apiKey = env('P_AK');
            $sign = md5($username . $apiKey . 'depo');
        
            $responseSaldo = Http::post(config('services.api_server') . 'v1/cek-saldo', [
                'cmd' => 'deposit',
                'username' => $username,
                'sign' => $sign,
            ]);
        
            if ($responseSaldo->successful()) {
                $muvausaserverBalance = (int) ($responseSaldo['data']['deposit'] ?? 0);
                $userTotalBalance = DB::table('users')->sum(DB::raw('balance + points'));
                $threshold = $validated['amount'] + $userTotalBalance + 500000;
        
                if ($threshold > $muvausaserverBalance) {
                    $nominal = $validated['amount'] < 200000 ? 200000 : $validated['amount'];
                    $adminEmails = config('custom.admin_deposit_emails');
        
                    // === Kirim deposit ke userA (BCA)
                    $responseA = Http::post(config('services.api_server') . 'v1/deposit', [
                        'username' => $username,
                        'amount' => $nominal,
                        'bank' => 'BCA',
                        'owner_name' => 'Danu Trianggoro',
                        'sign' => md5($username . $apiKey . 'deposit'),
                    ]);
        
                    if ($responseA->successful() && $responseA->json('data.rc') === '00') {
                        $amount = $responseA->json('data.amount');
                        $notes = $responseA->json('data.notes');
        
                        foreach ($adminEmails as $email) {
                            Mail::to(trim($email))->send(new \App\Mail\AdminDepositNotificationFallback(
                                $amount,
                                $notes,
                                '6042888890',
                                'BCA',
                                'Danu Trianggoro'
                            ));
                        }
                    } else {
                        \Log::error('Gagal request deposit admin fallback untuk userA (BCA)', [
                            'response' => $responseA->json()
                        ]);
                    }
        
                    // === Kirim deposit ke userB (BRI)
                    $responseB = Http::post(config('services.api_server') . 'v1/deposit', [
                        'username' => $username,
                        'amount' => $nominal,
                        'bank' => 'BRI',
                        'owner_name' => 'Dian Setyawati',
                        'sign' => md5($username . $apiKey . 'deposit'),
                    ]);
        
                    if ($responseB->successful() && $responseB->json('data.rc') === '00') {
                        $amount = $responseB->json('data.amount');
                        $notes = $responseB->json('data.notes');
        
                        foreach ($adminEmails as $email) {
                            Mail::to(trim($email))->send(new \App\Mail\AdminDepositNotificationFallback(
                                $amount,
                                $notes,
                                '213501000291307',
                                'BRI',
                                'Dian Setyawati'
                            ));
                        }
                    } else {
                        \Log::error('Gagal request deposit admin fallback untuk userB (BRI)', [
                            'response' => $responseB->json()
                        ]);
                    }
        
                    \Log::info('Fallback deposit admin berhasil dikirim ke userA dan userB.');
                }
            }
        } catch (\Exception $e) {
            \Log::error('Gagal memproses fallback deposit admin: ' . $e->getMessage());
        }
                

        // Simpan data deposit
        $deposit = Deposit::create([
            'user_id' => auth()->id(),
            'amount' => $validated['amount'],
            'unique_code' => $uniqueCode,
            'admin_fee' => $adminFee,
            'get_saldo' => $totalSaldo,
            'total_pay' => $totalPay,
            'status' => 'pending',
            'expires_at' => $expiresAt,
            'payment_method' => $validated['payment_method'],
            'has_admin_fee' => $isQris,
            'admin_account' => $admin->{$validated['payment_method']} ?? null,
            'qris_dinamis' => $qrisString,
        ]);

        // Kirim notifikasi ke admin
        $adminEmails = config('custom.admin_deposit_emails');
        foreach ($adminEmails as $email) {
            Mail::to(trim($email))->send(new AdminDepositNotification($deposit, 'create'));
        }

        return redirect()->route('deposit.history')
            ->with('success', 'Deposit requested successfully. Please pay the total amount: ' . $totalPay);
    }
    
    private function generateDynamicQris($qris, $amount, $feeType = null, $feeValue = null)
    {
        $qris = substr($qris, 0, -4);
        $step1 = str_replace("010211", "010212", $qris);
        $step2 = explode("5802ID", $step1);
        $uang = "54" . sprintf("%02d", strlen($amount)) . $amount;

        if ($feeType && $feeValue) {
            if ($feeType === 'r') {
                $uang .= "55020256" . sprintf("%02d", strlen($feeValue)) . $feeValue;
            } elseif ($feeType === 'p') {
                $uang .= "55020357" . sprintf("%02d", strlen($feeValue)) . $feeValue;
            }
        }

        $uang .= "5802ID";
        $fix = trim($step2[0]) . $uang . trim($step2[1]);
        $fix .= $this->convertCRC16($fix);

        return $fix;
    }

    private function convertCRC16($str)
    {
        $crc = 0xFFFF;
        for ($c = 0; $c < strlen($str); $c++) {
            $crc ^= ord($str[$c]) << 8;
            for ($i = 0; $i < 8; $i++) {
                if ($crc & 0x8000) {
                    $crc = ($crc << 1) ^ 0x1021;
                } else {
                    $crc <<= 1;
                }
            }
        }
        $hex = strtoupper(dechex($crc & 0xFFFF));
        return str_pad($hex, 4, '0', STR_PAD_LEFT);
    }

    // Tampilkan riwayat deposit
    public function index()
    {
        $syncMessage = $this->syncMutasiQrisData();
        $deposits = Deposit::where('user_id', Auth::id())->get();

        return Inertia::render('User/DepositHistory', [
            'deposits' => $deposits->map(function ($deposit) {
                return [
                    'id' => $deposit->id,
                    'amount' => $deposit->amount,
                    'unique_code' => $deposit->unique_code,
                    'total_pay' => $deposit->total_pay, // Sertakan total_pay
                    'admin_fee' => $deposit->admin_fee,
                    'has_admin_fee' => $deposit->has_admin_fee,
                    'expires_at' => $deposit->expires_at,
                    'status' => $deposit->status,
                    'created_at' => $deposit->created_at,
                    'get_saldo' => $deposit->get_saldo,
                    'proof_of_payment' => $deposit->proof_of_payment,
                    'payment_method' => $deposit->payment_method,
                    'admin_account' => $deposit->admin_account,
                ];
            }),
        ]);
    }

    // Konfirmasi deposit berdasarkan mutasi
    public function confirm($id)
    {
        $deposit = Deposit::findOrFail($id);

        // Cegah konfirmasi ulang
        if ($deposit->status === 'confirmed') {
            return response()->json(['success' => false, 'error' => 'Deposit already confirmed'], 400);
        }

        // Ambil data mutasi dari API
        $response = Http::withHeaders([
            'Cookie' => env('API_MUTASI_COOKIE'),
        ])->get(env('API_MUTASI_URL'));

        if ($response->failed()) {
            return response()->json(['success' => false, 'error' => 'Failed to fetch transactions'], 500);
        }

        $mutasiData = $response->json();

        // Validasi struktur data
        if (!isset($mutasiData['data']) || !is_array($mutasiData['data'])) {
            return response()->json(['success' => false, 'error' => 'Invalid data structure from API'], 500);
        }

        foreach ($mutasiData['data'] as $item) {
            if ($item['amount'] == ($deposit->amount + $deposit->unique_code + $deposit->admin_fee)) {
                $deposit->update(['status' => 'confirmed']);

                // Tambah saldo user
                $user = User::find($deposit->user_id);
                $user->increment('balance', $deposit->get_saldo);

                return response()->json(['success' => true]);
            }
        }

        return response()->json(['success' => false, 'error' => 'Matching transaction not found'], 400);
    }

    public function uploadProof($id, Request $request)
    {
        // Validasi file yang di-upload
        $request->validate([
            'proof_of_payment' => 'required|image|mimes:jpg,png,jpeg,gif|max:2048', // Sesuaikan dengan kebutuhan Anda
        ]);

        // Cari deposit berdasarkan ID
        $deposit = Deposit::findOrFail($id);

        // Cek jika ada file yang di-upload
        if ($request->hasFile('proof_of_payment')) {
            $file = $request->file('proof_of_payment');

            // Generate nama file unik dengan ekstensi asli
            $uniqueFileName = uniqid() . '.' . $file->getClientOriginalExtension();

            // Menyimpan file ke storage/app/secret/proof_of_payment dengan nama unik
            $path = $file->storeAs('secret/proof_of_payment', $uniqueFileName);

            // Simpan path file di database
            $deposit->proof_of_payment = $path;
            $deposit->save();

            $adminEmails = config('custom.admin_deposit_emails');

            foreach ($adminEmails as $email) {
                Mail::to(trim($email))->send(new AdminDepositNotification($deposit, 'proof'));
            }


            return response()->json([
                'success' => true,
                'proof_of_payment' => $path, // Berikan path file yang disimpan
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'No file uploaded.',
        ]);
    }

    public function getProofOfPayment($id)
    {
        // Cari deposit berdasarkan ID
        $deposit = Deposit::findOrFail($id);

        // Pastikan hanya pengunggah atau admin yang dapat mengakses file
        $user = auth()->user();
        if (!($user->id == $deposit->user_id || $user->hasRole('super-admin'))) {
            abort(403, 'You are not authorized to view this deposit.');
        }

        // Pastikan file ada
        $filePath = storage_path('app/' . $deposit->proof_of_payment);
        if (!file_exists($filePath)) {
            abort(404, 'File not found.');
        }

        // Kembalikan file
        return response()->file($filePath);
    }

    public function syncMutasiQrisData()
    {
        try {
            // Mengambil data dari API
            $response = Http::withHeaders([
                'Cookie' => env('API_MUTASI_COOKIE'),
            ])->get(env('API_MUTASI_URL'));

            // Periksa apakah respon berhasil
            if ($response->successful()) {
                $data = $response->json(); // Mendapatkan data JSON

                // Pastikan data ada dalam key 'data'
                if (isset($data['data']) && is_array($data['data'])) {
                    // Proses setiap item data dalam 'data'
                    foreach ($data['data'] as $item) {
                        MutasiQris::updateOrCreate(
                            ['issuer_reff' => $item['issuer_reff']], // Kondisi unik
                            [
                                'date' => $item['date'] ?? null,
                                'amount' => $item['amount'] ?? null,
                                'type' => $item['type'] ?? null,
                                'qris_otomatis' => $item['qris_otomatis'] ?? null,
                                'brand_name' => $item['brand_name'] ?? null,
                                'buyer_reff' => $item['buyer_reff'] ?? null,
                                'balance' => $item['balance'] ?? null,
                            ]
                        );
                    }

                    return "Data berhasil disinkronisasi.";
                } else {
                    return "Data tidak ditemukan dalam respons API.";
                }
            } else {
                return "Gagal mendapatkan data dari API. Kode status: " . $response->status();
            }
        } catch (\Exception $e) {
            return "Terjadi kesalahan: " . $e->getMessage();
        }
    }

    public function show($id)
    {
        // Cari deposit berdasarkan ID
        $deposit = Deposit::findOrFail($id);

        // Pastikan deposit tersebut milik user yang sedang login
        $user = auth()->user();

        if (!($user->id == $deposit->user_id || $user->hasRole('super-admin'))) {
            abort(403, 'You are not authorized to view this deposit.');
        }


        // Siapkan data untuk tampilan detail deposit
        return Inertia::render('User/DepositDetail', [
            'deposit' => [
                'id' => $deposit->id,
                'amount' => $deposit->amount,
                'unique_code' => $deposit->unique_code,
                'total_pay' => $deposit->total_pay,
                'admin_fee' => $deposit->admin_fee,
                'get_saldo' => $deposit->get_saldo,
                'status' => $deposit->status,
                'expires_at' => $deposit->expires_at,
                'created_at' => $deposit->created_at,
                'payment_method' => $deposit->payment_method,
                'proof_of_payment' => $deposit->proof_of_payment,
                'admin_account' => $deposit->admin_account,
                'qris_dinamis' => $deposit->qris_dinamis, // <-- tambahkan ini
            ]
        ]);
    }

    public function tutorial(Request $request)
    {
        $method = $request->input('method', 'shopeepay');
        return Inertia::render('User/DepositTutorial', [
            'method' => $method
        ]);
    }

}
