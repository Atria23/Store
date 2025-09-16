<?php

namespace App\Http\Traits;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Arr;

trait TransactionMapper
{
    /**
     * Mengubah data respons API menjadi format standar untuk tabel postpaid_transactions.
     * Menggunakan Arr::get() untuk keamanan dari key yang tidak ada.
     */
    private function mapToUnifiedTransaction(array $apiData, string $type, float $finalPrice, float $finalAdmin): array
    {
        // 1. Data Umum (Tidak perlu diubah)
        $commonData = [
            'user_id' => Auth::id(),
            'ref_id' => Arr::get($apiData, 'ref_id'),
            'type' => $type,
            'customer_no' => Arr::get($apiData, 'customer_no'),
            'customer_name' => Arr::get($apiData, 'customer_name'),
            'buyer_sku_code' => Arr::get($apiData, 'buyer_sku_code'),
            'price' => $finalPrice,
            'selling_price' => $finalPrice,
            'admin_fee' => $finalAdmin,
            'status' => Arr::get($apiData, 'status'),
            'message' => Arr::get($apiData, 'message'),
        ];

        // 2. Data Spesifik (Details) - Bagian ini yang diperbarui
        $specificDetails = [];
        $desc = Arr::get($apiData, 'desc', []); // Ambil bagian 'desc' dengan aman

        switch ($type) {
            case 'PLN': // Tetap sama seperti sebelumnya
                $specificDetails = [
                    'sn' => Arr::get($apiData, 'sn'),
                    'rc' => Arr::get($apiData, 'rc'),
                    'tarif' => Arr::get($desc, 'tarif'),
                    'daya' => Arr::get($desc, 'daya'),
                    'lembar_tagihan' => Arr::get($desc, 'lembar_tagihan'),
                    'bill_details' => Arr::get($desc, 'detail', []),
                ];
                break;

            case 'PDAM': // Diperbarui
                $specificDetails = [
                    'sn' => Arr::get($apiData, 'sn'),
                    'rc' => Arr::get($apiData, 'rc'),
                    'tarif' => Arr::get($desc, 'tarif'), // <-- DITAMBAHKAN
                    'alamat' => Arr::get($desc, 'alamat'),
                    'jatuh_tempo' => Arr::get($desc, 'jatuh_tempo'),
                    'lembar_tagihan' => Arr::get($desc, 'lembar_tagihan'),
                    'bill_details' => Arr::get($desc, 'detail', []), // detail PDAM berisi: periode, nilai_tagihan, denda, meter_awal, meter_akhir, biaya_lain
                ];
                break;

            case 'INTERNET PASCABAYAR': // Diperbarui (Struktur sudah benar, hanya konfirmasi)
                 $specificDetails = [
                    'sn' => Arr::get($apiData, 'sn'),
                    'rc' => Arr::get($apiData, 'rc'),
                    'lembar_tagihan' => Arr::get($desc, 'lembar_tagihan'),
                    'bill_details' => Arr::get($desc, 'detail', []), // detail INTERNET berisi: periode, nilai_tagihan, admin
                ];
                break;

            case 'BPJS': // Diperbarui
                 $specificDetails = [
                    'sn' => Arr::get($apiData, 'sn'),
                    'rc' => Arr::get($apiData, 'rc'),
                    'jumlah_peserta' => Arr::get($desc, 'jumlah_peserta'),
                    'alamat' => Arr::get($desc, 'alamat'), // <-- DITAMBAHKAN
                    'lembar_tagihan' => Arr::get($desc, 'lembar_tagihan'),
                    'bill_details' => Arr::get($desc, 'detail', []), // detail BPJS berisi: periode
                ];
                break;
        }
        
        $commonData['details'] = $specificDetails;
        return $commonData;
    }
}