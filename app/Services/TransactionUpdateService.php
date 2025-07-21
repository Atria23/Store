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
                // Lewati jika SKU mengandung '#'
                if (strpos($transaction->buyer_sku_code, '#') !== false) {
                    continue;
                }
            
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
                ])->post(config('services.api_server') . '/v1/transaction', $data);
            
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
            
                // Update status affiliate history
                $this->updateAffiliateHistoryStatus($transaction);
            }
            

            return "Successfully updated all pending transactions.";
        } catch (\Exception $e) {
            Log::error("Error updating pending transactions: " . $e->getMessage());
            return "Failed to update pending transactions: " . $e->getMessage();
        }
    }
    
    public function updateAffiliateHistoryStatus()
    {
        try {

            // Ambil semua affiliate history dengan status 'Pending'
            $pendingHistories = AffiliateHistory::where('status', 'Pending')->get();

            foreach ($pendingHistories as $affiliateHistory) {
                $transaction = \App\Models\Transaction::find($affiliateHistory->transaction_id);

                if (!$transaction) {
                    continue;
                }

                // Hanya update jika status transaksi sudah berubah dari 'Pending'
                if ($transaction->status !== 'Pending') {
                    $affiliateHistory->update([
                        'status' => $transaction->status,
                    ]);

                    Log::info("Affiliate History ID {$affiliateHistory->id} diupdate dengan status {$transaction->status}");

                    if ($transaction->status === 'Sukses') {
                        $this->updatePoinmuHistory($transaction, $affiliateHistory);
                    }
                } else {
                    Log::info("Transaction ID {$transaction->id} masih dalam status Pending, tidak ada update.");
                }
            }
        } catch (\Exception $e) {
            Log::error("Error dalam updateAffiliateHistoryStatus: " . $e->getMessage());
        }
    }

    private function updatePoinmuHistory($transaction, $affiliateHistory)
    {
        try {
            // Ambil affiliator berdasarkan affiliateHistory
            $affiliator = \App\Models\User\Affiliator::find($affiliateHistory->affiliator_id);

            if (!$affiliator) {
                Log::warning("Affiliator not found for Affiliate History ID {$affiliateHistory->id}");
                return;
            }

            // Ambil user berdasarkan user_id dari affiliator
            $user = \App\Models\User::find($affiliator->user_id);

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

        } catch (\Exception $e) {
            Log::error("Error updating PoinmuHistory: " . $e->getMessage());
        }
    }

}
