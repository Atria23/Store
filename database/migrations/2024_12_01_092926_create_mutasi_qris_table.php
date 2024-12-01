<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMutasiQrisTable extends Migration
{
    public function up()
    {
        Schema::create('mutasi_qris', function (Blueprint $table) {
            $table->id();
            $table->timestamp('date')->nullable(); // Tanggal transaksi
            $table->decimal('amount', 15, 2); // Jumlah transaksi
            $table->string('type', 5); // Tipe transaksi (CR/DR)
            $table->string('qris', 50)->nullable(); // Jenis QRIS (static/dynamic)
            $table->string('brand_name', 100)->nullable(); // Nama brand
            $table->string('issuer_reff', 100)->unique(); // Referensi issuer
            $table->string('buyer_reff', 255)->nullable(); // Referensi pembeli
            $table->decimal('balance', 15, 2)->nullable(); // Saldo
            $table->timestamps(); // Timestamps created_at dan updated_at
        });
    }

    public function down()
    {
        Schema::dropIfExists('mutasi_qris');
    }
}
