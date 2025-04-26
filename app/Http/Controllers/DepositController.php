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
        return Inertia::render('RequestDeposit');
    }

    public function store(Request $request)
    {
        // Validasi input
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'required|string|in:shopeepay,dana,gopay,ovo,linkaja,qris_otomatis,qris_dana,qris_shopeepay,qris_gopay,qris_ovo',
        ]);

        // Pilih admin berdasarkan prioritas (kecuali untuk QRIS manual)
        $admin = Admin::where('admin_status', true)
            ->where('wallet_is_active', true)
            ->where($validated['payment_method'] . '_status', true)
            ->orderBy('user_id', 'asc')
            ->first();

        // Deteksi metode QRIS dan tetapkan admin fee
        $qrisFees = [
            'qris_otomatis' => 0.7,
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
            ->exists()) {
            $uniqueCode += 1;
            $adminFee = $isQris ? ceil(($validated['amount'] + $uniqueCode) * $adminFeePercentage) : 0;
            $totalPay = $validated['amount'] + $uniqueCode + $adminFee;
        }

        // Total saldo diterima user (tanpa admin fee)
        $totalSaldo = $validated['amount'] + $uniqueCode;

        // Set expired time
        $expiresAt = $isQris ? now()->addMinutes(10) : now()->addMinutes(11);

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
        ]);

        return redirect()->route('deposit-history')
            ->with('success', 'Deposit requested successfully. Please pay the total amount: ' . $totalPay);
    }

    // Tampilkan riwayat deposit
    public function index()
    {
        $syncMessage = $this->syncMutasiQrisData();
        $deposits = Deposit::where('user_id', Auth::id())->get();

        return Inertia::render('DepositHistory', [
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

        // Ambil data mutasi dari API
        $response = Http::withHeaders([
            'Cookie' => env('API_MUTASI_COOKIE'),
        ])->get(env('API_MUTASI_URL'));

        if ($response->failed()) {
            return response()->json(['success' => false, 'error' => 'Failed to fetch transactions'], 500);
        }

        $mutasiData = $response->json();

        // Periksa apakah 'data' ada dan berupa array
        if (!isset($mutasiData['data']) || !is_array($mutasiData['data'])) {
            return response()->json(['success' => false, 'error' => 'Invalid data structure from API'], 500);
        }

        foreach ($mutasiData['data'] as $item) {
            if ($item['amount'] == ($deposit->amount + $deposit->unique_code + $deposit->admin_fee)) {
                $deposit->update(['status' => 'confirmed']);

                // Tambahkan saldo ke user
                $user = User::find($deposit->user_id);
                $user->increment('balance', $deposit->get_saldo);

                return response()->json(['success' => true]);
            }
        }

        return response()->json(['success' => false], 400);
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
        if ($user->id !== $deposit->user_id && !$user->hasRole('super-admin')) {
            abort(403, 'You are not authorized to view this file.');
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
        if ($deposit->user_id !== auth()->id()) {
            abort(403, 'You are not authorized to view this deposit.');
        }

        // Siapkan data untuk tampilan detail deposit
        return Inertia::render('DepositDetail', [
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
            ]
        ]);
    }

}