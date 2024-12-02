<?php

// use Illuminate\Database\Migrations\Migration;
// use Illuminate\Database\Schema\Blueprint;
// use Illuminate\Support\Facades\Schema;

// class CreatePriceListTable extends Migration
// {
//     /**
//      * Run the migrations.
//      *
//      * @return void
//      */
//     public function up()
//     {
//         Schema::create('price_list', function (Blueprint $table) {
//             $table->id();
//             $table->string('product_name');
//             $table->string('category');
//             $table->string('brand');
//             $table->string('type');
//             $table->string('seller_name');
//             $table->string('price'); // Harga disimpan sebagai string
//             $table->string('buyer_sku_code');
//             $table->boolean('buyer_product_status');
//             $table->boolean('seller_product_status');
//             $table->boolean('unlimited_stock');
//             $table->string('stock')->nullable(); // Stok disimpan sebagai string
//             $table->boolean('multi');
//             $table->string('start_cut_off'); // Format hh:mm
//             $table->string('end_cut_off');   // Format hh:mm
//             $table->string('desc')->nullable(); // Deskripsi disimpan sebagai string
//             $table->timestamps();

//             // Kolom custom
//             $table->string('product_name_custom')->nullable();
//             $table->string('category_custom')->nullable();
//             $table->string('brand_custom')->nullable();
//             $table->string('type_custom')->nullable();
//             $table->string('price_custom')->nullable();
//             $table->string('desc_custom')->nullable(); // Deskripsi custom disimpan sebagai string

//             // Kolom tambahan untuk perhitungan profit
//             $table->decimal('profit', 10, 2)->nullable(); // Profit dalam nominal
//             $table->decimal('profit_persen', 5, 2)->nullable(); // Profit dalam persentase
//             $table->string('tipe_inputan')->default('angka'); // Tipe inputan (angka/angka+huruf/)
//         });
//     }

//     /**
//      * Reverse the migrations.
//      *
//      * @return void
//      */
//     public function down()
//     {
//         Schema::dropIfExists('price_list');
//     }
// }


























use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePriceListTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('price_list', function (Blueprint $table) {
            $table->id();
            $table->string('product_name');
            $table->string('category');
            $table->string('brand');
            $table->string('type');
            $table->string('seller_name');
            $table->string('price'); // Harga disimpan sebagai string
            $table->string('buyer_sku_code')->unique(); // Membuat buyer_sku_code unik
            $table->boolean('buyer_product_status');
            $table->boolean('seller_product_status');
            $table->boolean('unlimited_stock');
            $table->string('stock')->nullable(); // Stok disimpan sebagai string
            $table->boolean('multi');
            $table->string('start_cut_off'); // Format hh:mm
            $table->string('end_cut_off');   // Format hh:mm
            $table->string('desc')->nullable(); // Deskripsi disimpan sebagai string
            $table->timestamps();

            // Kolom custom
            $table->string('product_name_custom')->nullable();
            $table->string('category_custom')->nullable();
            $table->string('brand_custom')->nullable();
            $table->string('type_custom')->nullable();
            $table->string('price_custom')->nullable();
            $table->string('desc_custom')->nullable(); // Deskripsi custom disimpan sebagai string

            // Kolom tambahan untuk perhitungan profit
            $table->decimal('profit', 10, 2)->nullable(); // Profit dalam nominal
            $table->decimal('profit_persen', 5, 2)->nullable()->default(1); // Profit dalam persentase dengan default 1
            $table->string('tipe_inputan')->default('angka'); // Tipe inputan (angka/angka+huruf/)
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('price_list');
    }
}
