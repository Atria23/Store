<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon; // <--- INI YANG KURANG


class TransactionSeeder extends Seeder
{
    public function run()
    {
        \DB::table('transactions')->insert(
            collect(range(1, 300))->map(function ($i) {
                return [
                    'user_id' => 2,
                    'ref_id' => Str::random(14),
                    'buyer_sku_code' => '8b5668',
                    'product_name' => 'Pulsa Random ' . rand(5, 100) . '.000',
                    'category' => 'Pulsa',
                    'brand' => 'INDOSAT - Pulsa',
                    'type' => 'Umum - INDOSAT - Pulsa - Pulsa',
                    'customer_no' => '08' . rand(1000000000, 9999999999),
                    'status' => collect(['Pending', 'Sukses', 'Gagal'])->random(),
                    'price' => rand(5000, 100000),
                    'points' => rand(1, 20),
                    'price_product' => rand(4800, 95000),
                    'rc' => 45,
                    'sn' => rand(242000, 243000),
                    'buyer_last_saldo' => rand(10000, 500000),
                    'message' => 'Auto-generated transaction #' . $i,
                    'created_at' => Carbon::now()->subDays(rand(0, 10)),
                    'updated_at' => Carbon::now(),
                ];
            })->toArray()
        );
    }
}
