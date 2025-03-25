<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('brands', function (Blueprint $table) {
            $table->id();
            $table->string('image')->nullable();
            $table->string('name');
            $table->foreignId('category_id')->nullable()->constrained('categories')->onDelete('cascade');
            $table->foreignId('input_type_id')->nullable()->default(1)->constrained('input_types')->onDelete('set null');
            $table->string('example_id_product')->nullable();
            $table->string('example_image')->nullable();

            // Gunakan DECIMAL(10,4) untuk angka dengan 4 desimal
            $table->decimal('profit_persen', 10, 4)->nullable()->default(1.0000);
            $table->decimal('profit_tetap', 10, 4)->nullable()->default(0.0000);

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('brands');
    }
};
