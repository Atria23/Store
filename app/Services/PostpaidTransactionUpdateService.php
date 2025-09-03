<?php

namespace App\Services;

use App\Models\PostpaidTransaction;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PostpaidTransactionUpdateService
{
    /**
     * Memperbarui semua transaksi pascabayar yang statusnya "Pending".
     */
    public function updatePendingTransactions()
    {
        // Ambil semua transaksi pascabayar dengan status "Pending"
        $pendingTransactions = PostpaidTransaction::where('status', 'Pending')->get();

        if ($pendingTransactions->isEmpty()) {
            return "No pending postpaid transactions to update.";
        }

        $updatedCount = 0;
        $failedCount = 0;

        foreach ($pendingTransactions as $transaction) {
            try {
                $username = env('P_U');
                $apiKey = env('P_AK');
                $sign = md5($username . $apiKey . $transaction->ref_id);

                $payload = [
                    'commands'       => 'status-pasca',
                    'username'       => $username,
                    'buyer_sku_code' => $transaction->buyer_sku_code,
                    'customer_no'    => $transaction->customer_no,
                    'ref_id'         => $transaction->ref_id,
                    'sign'           => $sign,
                ];

                // Kirim permintaan status ke API provider
                $response = Http::post(config('services.api_server') . '/v1/transaction', $payload);
                $apiData = $response->json()['data'] ?? null;

                if (!$apiData || !isset($apiData['status'])) {
                    Log::warning("Invalid response from API for Postpaid Transaction Ref ID {$transaction->ref_id}", ['response' => $response->body()]);
                    $failedCount++;
                    continue;
                }

                // Hanya update jika statusnya berubah
                if ($apiData['status'] !== 'Pending') {
                    // Siapkan data untuk update di kolom 'details' (JSON)
                    $newDetails = $transaction->details; // Ambil data details yang sudah ada
                    $newDetails['sn'] = $apiData['sn'] ?? $newDetails['sn'] ?? null;
                    $newDetails['rc'] = $apiData['rc'] ?? $newDetails['rc'] ?? null;

                    $transaction->update([
                        'status'  => $apiData['status'],
                        'message' => $apiData['message'],
                        'details' => $newDetails, // Update kolom JSON dengan SN/RC baru
                    ]);

                    Log::info("Postpaid Transaction Ref ID {$transaction->ref_id} updated to status: {$apiData['status']}");

                    // Jika transaksi Gagal setelah dicek, kembalikan saldo pengguna
                    if ($apiData['status'] === 'Gagal') {
                        $user = $transaction->user;
                        if ($user) {
                            $user->increment('balance', $transaction->selling_price);
                            Log::info("Balance refunded for user ID {$user->id} for Postpaid Transaction Ref ID {$transaction->ref_id}");
                        }
                    }
                    $updatedCount++;
                }
            } catch (\Exception $e) {
                $failedCount++;
                Log::error("Error updating Postpaid Transaction Ref ID {$transaction->ref_id}: " . $e->getMessage());
                continue;
            }
        }

        return "Successfully processed postpaid transactions. Updated: {$updatedCount}, Failed to check: {$failedCount}.";
    }
}