<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePostpaidProductsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('postpaid_products', function (Blueprint $table) {
            $table->id();
            $table->string('product_name');
            $table->string('category');
            $table->string('brand');
            $table->string('seller_name');
            $table->integer('admin');
            $table->integer('commission'); // Commission from the API
            $table->decimal('commission_sell_percentage', 5, 2)->nullable(); // Max 99.99
            $table->integer('commission_sell_fixed')->nullable();
            $table->string('buyer_sku_code')->unique();
            $table->boolean('buyer_product_status');
            $table->boolean('seller_product_status');
            $table->text('desc')->nullable();
            $table->string('image')->nullable(); // <<< NEW: Add image column
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('postpaid_products');
    }
}