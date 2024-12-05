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
        Schema::create('deposits', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->integer('amount'); // Jumlah nominal deposit
            $table->integer('unique_code')->nullable(); // Kode unik tambahan
            $table->integer('admin_fee')->default(0); // Biaya admin
            $table->integer('get_saldo')->default(0); // Saldo yang didapatkan
            $table->integer('total_pay')->default(0); // Total pembayaran (amount + unique_code + admin_fee)
            $table->enum('status', ['pending', 'confirmed', 'expired'])->default('pending'); // Status deposit
            $table->timestamp('expires_at')->nullable(); // Waktu kedaluwarsa
            $table->string('payment_method'); // Metode pembayaran
            $table->string('proof_of_payment')->nullable(); // Bukti pembayaran
            $table->boolean('has_admin_fee')->default(true); // Apakah ada biaya admin
            $table->string('admin_account')->nullable(); // Akun admin yang digunakan untuk pembayaran
            $table->timestamps();

            // Relasi ke tabel users
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deposits');
    }
};
