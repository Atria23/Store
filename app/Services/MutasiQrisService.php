<?php

namespace App\Services;

use App\Models\MutasiQris;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MutasiQrisService
{
    public function syncData()
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
                                'qris' => $item['qris'] ?? null,
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
}
