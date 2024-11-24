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
            $table->integer('amount'); // Menggunakan integer untuk amount
            $table->integer('unique_code'); // Kode unik dalam bentuk integer
            $table->integer('admin_fee')->default(0); // Kolom admin_fee dalam bentuk integer
            $table->integer('get_saldo')->default(0); // Kolom get_saldo dalam bentuk integer
            $table->integer('total_pay')->default(0); // Total yang harus dibayar (amount + unique_code + admin_fee)
            $table->enum('status', ['pending', 'confirmed', 'expired'])->default('pending');
            $table->timestamp('expires_at')->nullable(); // Waktu expired deposit
            $table->string('payment_method'); // Kolom untuk menyimpan metode pembayaran
            $table->string('proof_of_payment')->nullable(); // Menyimpan bukti pembayaran
            $table->boolean('has_admin_fee')->default(true); // Kolom untuk menandakan apakah deposit memiliki biaya admin
            $table->timestamps();

            // Relasi ke tabel users
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            // Constraint unik untuk total_pay
            $table->unique('total_pay', 'unique_total_pay');
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
