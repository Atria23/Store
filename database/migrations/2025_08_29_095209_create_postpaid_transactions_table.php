<?php

// database/migrations/YYYY_MM_DD_HHMMSS_create_postpaid_transactions_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('postpaid_transactions', function (Blueprint $table) {
            // == KOLOM UMUM (COMMON COLUMNS) ==
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('ref_id')->unique();

            // Kolom untuk membedakan jenis produk
            $table->string('type'); // Contoh: 'PDAM', 'PLN', 'BPJS'

            // Data Pelanggan & Produk
            $table->string('customer_no');
            $table->string('customer_name');

            // **MODIFIKASI DI SINI:**
            // 1. Buat kolom buyer_sku_code nullable
            // 2. Tambahkan foreign key constraint
            $table->string('buyer_sku_code')->nullable(); // <-- Dibuat nullable
            $table->foreign('buyer_sku_code')
                  ->references('buyer_sku_code')
                  ->on('postpaid_products')
                  ->onDelete('set null'); // <-- onDelete('set null')

            // Data Harga & Biaya (Gunakan decimal untuk presisi)
            $table->decimal('price', 15, 2);
            $table->decimal('selling_price', 15, 2);
            $table->decimal('admin_fee', 15, 2);

            // Status Transaksi
            $table->string('status', 20)->default('Pending');
            $table->string('message')->nullable();
            $table->string('rc', 10)->nullable(); // Response Code
            $table->text('sn')->nullable(); // Serial Number

            // == KOLOM DETAIL SPESIFIK (UNIQUE DETAILS) ==
            $table->json('details')->nullable();

            $table->timestamps();

            // Tambahkan index untuk pencarian lebih cepat
            $table->index('user_id');
            $table->index('type');
            // Tambahkan index juga untuk buyer_sku_code jika sering digunakan dalam query
            $table->index('buyer_sku_code');
        });
    }

    public function down(): void
    {
        Schema::table('postpaid_transactions', function (Blueprint $table) {
            // Drop foreign key sebelum drop kolom
            $table->dropForeign(['buyer_sku_code']);
            $table->dropColumn('buyer_sku_code');
        });
        Schema::dropIfExists('postpaid_transactions');
    }
};