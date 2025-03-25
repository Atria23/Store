<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('poinmu_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained('users') // Relasi ke tabel users (kolom id)
                ->onDelete('cascade'); // Hapus history jika user dihapus

            $table->foreignId('transaction_id')
                ->nullable()
                ->constrained('transactions')
                ->onDelete('cascade');
            
            $table->string('type'); // Jenis transaksi (misal: reward, penalty, dll.)
            $table->integer('points'); // Poin yang ditambahkan/dikurangi (mendukung negatif)
            $table->integer('previous_points'); // Poin sebelum transaksi
            $table->integer('new_points'); // Poin setelah transaksi
            $table->text('description')->nullable(); // Deskripsi transaksi
            $table->timestamps(); // created_at & updated_at
        });
    }

    public function down() {
        Schema::dropIfExists('poinmu_history');
    }
};
