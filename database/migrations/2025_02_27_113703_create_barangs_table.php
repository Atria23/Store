<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
{
    Schema::create('barangs', function (Blueprint $table) {
        $table->id();
        $table->string('buyer_sku_code')->unique();
        $table->string('product_name');
        $table->foreignId('category_id')->nullable()->constrained('categories')->onDelete('cascade');
        $table->foreignId('brand_id')->nullable()->constrained('brands')->onDelete('cascade');
        $table->foreignId('type_id')->nullable()->constrained('types')->onDelete('cascade');
        $table->foreignId('input_type_id')->nullable()->constrained('input_types')->onDelete('cascade');
        $table->string('seller_name')->nullable(); // Dibuat nullable ✅
        $table->string('price'); // Harga tetap sebagai string sesuai dengan price_list
        $table->boolean('buyer_product_status')->nullable()->default(true);
        $table->boolean('seller_product_status')->default(true);
        $table->boolean('unlimited_stock')->nullable()->default(true);
        $table->string('stock')->nullable(); // Sesuai dengan price_list (nullable)
        $table->boolean('multi')->nullable()->default(true);
        $table->string('start_cut_off')->nullable(); 
        $table->string('end_cut_off')->nullable();   
        $table->text('desc')->nullable();
        $table->timestamps();
    });
}


    public function down(): void
    {
        Schema::dropIfExists('barangs');
    }
};