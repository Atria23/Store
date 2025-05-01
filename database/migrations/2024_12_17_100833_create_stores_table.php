<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStoresTable extends Migration
{
    public function up()
    {
        Schema::create('stores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Relasi dengan tabel users
            $table->string('name'); // Nama toko
            $table->string('address')->nullable(); // Deskripsi toko
            $table->string('phone_number'); // Nomor handphone toko
            $table->string('image')->nullable(); // Foto toko
            $table->timestamps(); // Kolom created_at dan updated_at
        });
    }

    public function down()
    {
        Schema::dropIfExists('stores');
    }
}
