<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Transaction;
use App\Models\User\AffiliateHistory;
use App\Models\User;
use Illuminate\Support\Facades\DB;


class TransactionUpdateService
{
    /**
     * Update all transactions with status "Pending" and sync affiliate history.
     */
    public function updatePendingTransactions()
    {
        try {
            // Ambil semua transaksi dengan status "Pending"
            $pendingTransactions = Transaction::where('status', 'Pending')->get();

            foreach ($pendingTransactions as $transaction) {
                $username = env('P_U');
                $apiKey = env('P_AK');
                $sign = md5($username . $apiKey . $transaction->ref_id);

                $data = [
                    'username' => $username,
                    'ref_id' => $transaction->ref_id,
                    'sign' => $sign,
                ];

                // Kirim permintaan ke API
                $response = Http::withHeaders([
                    'Content-Type' => 'application/json',
                ])->post('https://api.digiflazz.com/v1/transaction', $data);

                $responseData = $response->json();
                $apiData = $responseData['data'] ?? null;

                if (!$apiData) {
                    Log::warning("Invalid response from API for Transaction ID {$transaction->ref_id}");
                    continue;
                }

                // Update status transaksi
                $transaction->update([
                    'status' => $apiData['status'] ?? 'Failed',
                    'rc' => $apiData['rc'] ?? 'UNKNOWN_ERROR',
                    'sn' => $apiData['sn'] ?? null,
                    'message' => $apiData['message'] ?? 'Transaction failed',
                ]);

                Log::info("Transaction ID {$transaction->ref_id} updated successfully.");

                // Jika transaksi gagal, kembalikan saldo pengguna
                if ($apiData['status'] === 'Gagal') {
                    $user = $transaction->user;
                    $user->balance += $transaction->price_product;
                    $user->save();

                    Log::info("Balance refunded for user ID {$user->id} for Transaction ID {$transaction->ref_id}");
                }

                // **Update status affiliate history setelah transaksi diperbarui**
                $this->updateAffiliateHistoryStatus($transaction);
            }

            return "Successfully updated all pending transactions.";
        } catch (\Exception $e) {
            Log::error("Error updating pending transactions: " . $e->getMessage());
            return "Failed to update pending transactions: " . $e->getMessage();
        }
    }

    private function updateAffiliateHistoryStatus($transaction)
    {
        try {
            Log::info("=== DEBUG: Coba Insert ke Poinmu History ===");

            // Ambil affiliate history berdasarkan transaction_id
            $affiliateHistory = AffiliateHistory::where('transaction_id', $transaction->id)->first();

            if (!$affiliateHistory) {
                Log::warning("Affiliate History not found for Transaction ID {$transaction->id}");
                return;
            }

            // Update status affiliate history sesuai transaksi
            $affiliateHistory->update([
                'status' => $transaction->status,
            ]);

            Log::info("Updated Affiliate History ID {$affiliateHistory->id} to status {$transaction->status}");
            Log::info("Looking for affiliator with ID: {$affiliateHistory->affiliator_id}");

            // **Jika transaksi sukses, konversi commission ke points & simpan ke PoinmuHistory**
            if ($transaction->status === 'Sukses') { // Pastikan ini sesuai dengan status sukses di sistem
                // Ambil affiliator berdasarkan affiliateHistory
                $affiliator = \App\Models\User\Affiliator::find($affiliateHistory->affiliator_id);

                if (!$affiliator) {
                    Log::warning("Affiliator not found for Affiliate History ID {$affiliateHistory->id}");
                    return;
                }

                // Ambil user berdasarkan user_id dari affiliator
                $user = \App\Models\User::find($affiliator->user_id);
                Log::info("Looking for user with ID: {$affiliator->user_id}");

                if (!$user) {
                    Log::warning("User not found for Affiliator ID {$affiliator->id}");
                    return;
                }

                $commissionAsPoints = $affiliateHistory->commission ?? 0; // Pastikan tidak null

                Log::info("Commission for Transaction ID {$transaction->id}: {$commissionAsPoints}");

                // Pastikan nilai points tidak null sebelum dijumlahkan
                $previousPoints = $user->points ?? 0;
                $newPoints = $previousPoints + $commissionAsPoints;

                Log::info("Trying to create PoinmuHistory", [
                    'user_id' => $user->id,
                    'transaction_id' => $transaction->id,
                    'affiliate_history_id' => $affiliateHistory->id,
                    'type' => 'perolehan',
                    'points' => $commissionAsPoints,
                    'previous_points' => $previousPoints,
                    'new_points' => $newPoints,
                    'description' => "Komisi dari riwayat afiliasi dengan ID: {$affiliateHistory->id}",
                ]);

                // Insert data ke tabel PoinmuHistory
                \App\Models\User\PoinmuHistory::create([
                    'user_id' => $user->id,
                    'transaction_id' => $transaction->id,
                    'affiliate_history_id' => $affiliateHistory->id,
                    'type' => 'perolehan',
                    'points' => $commissionAsPoints,
                    'previous_points' => $previousPoints,
                    'new_points' => $newPoints,
                    'description' => "Komisi dari riwayat afiliasi dengan ID: {$affiliateHistory->id}",
                ]);

                // Update points di tabel users
                $user->points = $newPoints;
                $user->save();

                Log::info("Added {$commissionAsPoints} points to User ID {$user->id} in Poinmu History");
            }

        } catch (\Exception $e) {
            Log::error("Error updating affiliate history status: " . $e->getMessage());
        }
    }
}
