<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Transaction;

class TransactionUpdateService
{
    /**
     * Update all transactions with status "Pending".
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

                // Update data transaksi di database
                $transaction->update([
                    'status' => $apiData['status'] ?? 'Failed',
                    'rc' => $apiData['rc'] ?? 'UNKNOWN_ERROR',
                    'sn' => $apiData['sn'] ?? null,
                    'message' => $apiData['message'] ?? 'Transaction failed',
                ]);

                // Jika status transaksi gagal, kembalikan saldo pengguna
                if ($apiData['status'] === 'Gagal') {
                    $user = $transaction->user;
                    $user->balance += $transaction->price_product;
                    $user->save();

                    Log::info("Balance refunded for user ID {$user->id} for Transaction ID {$transaction->ref_id}");
                }

                Log::info("Transaction ID {$transaction->ref_id} updated successfully.");
            }

            return "Successfully updated all pending transactions.";
        } catch (\Exception $e) {
            Log::error("Error updating pending transactions: " . $e->getMessage());
            return "Failed to update pending transactions: " . $e->getMessage();
        }
    }
}
