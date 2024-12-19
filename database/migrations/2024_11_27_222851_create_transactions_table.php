<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTransactionsTable extends Migration
{
    public function up()
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id'); // Tambahkan kolom user_id
            $table->string('ref_id')->unique();
            $table->string('buyer_sku_code');
            $table->string('product_name')->nullable();
            $table->string('category')->nullable();
            $table->string('brand')->nullable();
            $table->string('type')->nullable();
            $table->string('customer_no');
            $table->string('status');
            $table->integer('price')->nullable();
            $table->integer('price_product')->nullable(); // Tambahkan kolom price_product
            $table->string('rc');
            $table->string('sn')->nullable();
            $table->float('buyer_last_saldo')->nullable();
            $table->text('message');
            $table->timestamps();

            // Tambahkan foreign key
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('transactions');
    }
}
