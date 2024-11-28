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
            $table->string('ref_id')->unique();
            $table->string('buyer_sku_code');
            $table->string('customer_no');
            $table->string('status');
            $table->integer('price');
            $table->string('rc');
            $table->string('sn')->nullable();
            $table->float('buyer_last_saldo')->nullable();
            $table->text('message');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('transactions');
    }
}
