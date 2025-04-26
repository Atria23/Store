<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AffiliateHistory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AffiliateHistorySeeder extends Seeder
{
    public function run(): void
    {
        $histories = [];

        for ($i = 1; $i <= 10; $i++) {
            $histories[] = [
                'affiliator_id' => 1,
                'affiliate_product_id' => 978,
                'transaction_id' => 100,
                'commission' => 13,
                'status' => collect(['Sukses', 'Gagal'])->random(),
                'created_at' => now()->subDays(rand(0, 30))->toDateTimeString(),
                'updated_at' => now()->toDateTimeString(),
            ];
        }

        // Insert batch
        foreach (array_chunk($histories, 200) as $chunk) {
            DB::table('affiliate_histories')->insert($chunk);
        }
    }
}
