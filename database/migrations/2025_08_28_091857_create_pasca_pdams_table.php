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
        Schema::create('pasca_pdams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('ref_id')->unique();
            $table->string('customer_no');
            $table->string('customer_name');
            $table->string('buyer_sku_code');
            $table->unsignedInteger('price');
            $table->unsignedInteger('selling_price');
            $table->unsignedInteger('admin_fee');
            $table->string('status');
            $table->string('message');
            $table->string('sn')->nullable();
            $table->string('rc')->nullable(); // Response Code
            $table->string('tarif')->nullable();
            $table->integer('lembar_tagihan')->nullable();
            $table->string('alamat')->nullable();
            $table->string('jatuh_tempo')->nullable();
            $table->json('bill_details')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pasca_pdams');
    }
};