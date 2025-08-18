<?php

// namespace App\Http\Controllers;

// use Illuminate\Http\Request;
// use Inertia\Inertia;

// class QrisConverterController extends Controller
// {
//     public function index()
//     {
//         return Inertia::render('QrisConverter');
//     }

//     public function convert(Request $request)
//     {
//         $request->validate([
//             'qris' => 'required|string',
//             'amount' => 'required|numeric|min:1',
//             'fee_type' => 'nullable|in:r,p',
//             'fee_value' => 'nullable|numeric|min:0',
//         ]);

//         $qris = substr($request->qris, 0, -4);
//         $step1 = str_replace("010211", "010212", $qris);
//         $step2 = explode("5802ID", $step1);
//         $amount = $request->amount;

//         $uang = "54" . sprintf("%02d", strlen($amount)) . $amount;

//         if ($request->fee_type && $request->fee_value) {
//             if ($request->fee_type === 'r') {
//                 $uang .= "55020256" . sprintf("%02d", strlen($request->fee_value)) . $request->fee_value;
//             } elseif ($request->fee_type === 'p') {
//                 $uang .= "55020357" . sprintf("%02d", strlen($request->fee_value)) . $request->fee_value;
//             }
//         }

//         $uang .= "5802ID";
//         $fix = trim($step2[0]) . $uang . trim($step2[1]);
//         $fix .= $this->convertCRC16($fix);

//         return response()->json([
//             'result' => $fix,
//         ]);
//     }

//     private function convertCRC16($str)
//     {
//         $crc = 0xFFFF;
//         for ($c = 0; $c < strlen($str); $c++) {
//             $crc ^= ord($str[$c]) << 8;
//             for ($i = 0; $i < 8; $i++) {
//                 if ($crc & 0x8000) {
//                     $crc = ($crc << 1) ^ 0x1021;
//                 } else {
//                     $crc <<= 1;
//                 }
//             }
//         }
//         $hex = strtoupper(dechex($crc & 0xFFFF));
//         return str_pad($hex, 4, '0', STR_PAD_LEFT);
//     }
// }


namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Zxing\QrReader; // Pastikan Anda import library ini

class QrisConverterController extends Controller
{
    public function index()
    {
        return Inertia::render('QrisConverter');
    }

    public function convert(Request $request)
    {
        // 1. Validasi input: Bisa menerima string atau gambar
        $request->validate([
            'qris_string' => 'nullable|string|required_without:qris_image',
            'qris_image'  => 'nullable|image|mimes:jpeg,png,jpg|max:2048|required_without:qris_string',
            'amount'      => 'required|numeric|min:1',
            'fee_type'    => 'nullable|in:r,p',
            'fee_value'   => 'nullable|numeric|min:0',
        ], [
            'qris_string.required_without' => 'Silakan isi QRIS string atau unggah gambar.',
            'qris_image.required_without'  => 'Silakan unggah gambar atau isi QRIS string.',
        ]);

        $staticQris = '';

        // 2. Ambil string QRIS, baik dari teks maupun dari hasil scan gambar
        try {
            if ($request->hasFile('qris_image')) {
                $imagePath = $request->file('qris_image')->getRealPath();
                $qrReader = new QrReader($imagePath);
                $staticQris = $qrReader->text();

                if (empty($staticQris)) {
                    return Redirect::back()->withErrors(['qris_image' => 'Tidak dapat menemukan QR code pada gambar.']);
                }
            } else {
                $staticQris = $request->input('qris_string');
            }
        } catch (\Exception $e) {
            return Redirect::back()->withErrors(['qris_image' => 'Gagal memproses gambar QR. Pastikan gambar valid.']);
        }

        // 3. Logika Konversi (diadaptasi dari kode Anda dengan perbaikan)
        // Menggunakan preg_replace lebih aman daripada substr untuk menghapus CRC
        $qrisWithoutCrc = preg_replace('/6304[0-9A-F]{4}$/', '', $staticQris);

        // Ubah Point of Initiation Method dari 11 (statis) ke 12 (dinamis)
        $payload = preg_replace('/(0102)11/', '$112', $qrisWithoutCrc);

        // Hapus tag untuk nominal (54) dan biaya (55) jika sudah ada
        $payload = preg_replace('/5[45]\d{2}.*?/', '', $payload);

        // Buat tag untuk nominal transaksi
        $amountStr = (string) $request->amount;
        $amountTag = '54' . str_pad(strlen($amountStr), 2, '0', STR_PAD_LEFT) . $amountStr;

        // Buat tag untuk biaya layanan jika ada
        $feeTag = '';
        if ($request->fee_type && $request->fee_value > 0) {
            // Struktur: [ID Parent][Length Parent][ID Child][Length Child][Value]
            if ($request->fee_type === 'r') { // Biaya Tetap (Rupiah)
                $feeValueStr = (string) $request->fee_value;
                $subTag = '02' . str_pad(strlen($feeValueStr), 2, '0', STR_PAD_LEFT) . $feeValueStr; // 02 = fixed fee
                $feeTag = '55' . str_pad(strlen($subTag), 2, '0', STR_PAD_LEFT) . $subTag;
            } elseif ($request->fee_type === 'p') { // Biaya Persentase
                // Format persentase adalah "05.00" untuk 5%
                $feeValueStr = number_format($request->fee_value, 2, '.', ''); 
                $subTag = '03' . str_pad(strlen($feeValueStr), 2, '0', STR_PAD_LEFT) . $feeValueStr; // 03 = percentage fee
                $feeTag = '55' . str_pad(strlen($subTag), 2, '0', STR_PAD_LEFT) . $subTag;
            }
        }
        
        // Gabungkan semua bagian sebelum menghitung CRC
        // Urutan: payload utama, nominal, biaya (jika ada), lalu tag CRC (6304)
        $finalPayload = $payload . $amountTag . $feeTag . '6304';
        
        // Hitung CRC baru dan gabungkan
        $crc = $this->convertCRC16($finalPayload);
        $dynamicQris = $finalPayload . $crc;

        // 4. Kembalikan hasil via flash data agar bisa dibaca Inertia
        return Redirect::back()->with('result', $dynamicQris);
    }

    /**
     * Fungsi untuk menghitung CRC16-CCITT-FALSE.
     * (Fungsi ini diambil dari kode Anda, sudah benar)
     */
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
}