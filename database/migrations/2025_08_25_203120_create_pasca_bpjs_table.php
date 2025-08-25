<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pasca_bpjs', function (Blueprint $table) { // Nama tabel disesuaikan
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('ref_id')->unique();
            $table->string('customer_no');
            $table->string('customer_name');
            $table->string('buyer_sku_code');
            $table->unsignedBigInteger('price');
            $table->unsignedBigInteger('selling_price');
            $table->unsignedInteger('admin_fee');
            $table->string('status')->default('Pending');
            $table->string('message')->nullable();
            $table->string('sn')->nullable();
            $table->string('rc')->nullable();
            $table->string('jumlah_peserta')->nullable();
            $table->integer('lembar_tagihan')->nullable();
            $table->text('alamat')->nullable();
            $table->json('bill_details')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pasca_bpjs'); // Disesuaikan
    }
};