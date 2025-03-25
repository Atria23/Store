<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('balance_mutation', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('amount'); // Jumlah perubahan saldo (tidak boleh null)
            $table->unsignedBigInteger('previous_balance'); // Saldo sebelum perubahan
            $table->unsignedBigInteger('new_balance'); // Saldo setelah perubahan

            // Relasi ke tabel users (tidak boleh null)
            $table->foreignId('user_id')
                ->constrained('users')
                ->onDelete('cascade');

            // Relasi ke tabel transactions (opsional)
            $table->foreignId('transaction_id')
                ->nullable()
                ->constrained('transactions')
                ->onDelete('cascade');

            // Relasi ke tabel deposits (opsional)
            $table->foreignId('deposit_id')
                ->nullable()
                ->constrained('deposits')
                ->onDelete('cascade');

            // Relasi ke tabel poinmu_history (opsional)
            $table->foreignId('poinmu_history_id')
                ->nullable()
                ->constrained('poinmu_history')
                ->onDelete('cascade');

            // Jenis mutasi (pengeluaran atau pemasukan)
            $table->enum('type', ['pengeluaran', 'pemasukan']);

            $table->timestamps(); // Kolom created_at & updated_at
        });
    }

    public function down() {
        Schema::dropIfExists('balance_mutation');
    }
};
