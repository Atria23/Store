<?php

namespace App\Services;

use App\Models\Deposit;
use Illuminate\Support\Facades\Log;

class DepositService
{
    /**
     * Mengubah status deposit menjadi expired jika sudah melewati expires_at
     *
     * @return int Jumlah deposit yang diupdate
     */
    public function expireIfPastDue(): int
    {
        try {
            // Ambil semua deposit yang masih pending dan sudah melewati waktu expired
            $expiredCount = Deposit::where('status', 'pending')
                ->whereNotNull('expires_at')
                ->where('expires_at', '<', now())
                ->update(['status' => 'expired']);

            return $expiredCount;
        } catch (\Throwable $e) {
            Log::error('Gagal mengubah status deposit menjadi expired', [
                'message' => $e->getMessage(),
            ]);

            return 0;
        }
    }
}
