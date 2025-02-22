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
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->foreignId('input_type_id')->nullable()->constrained('input_types')->onDelete('set null');
            $table->decimal('profit_persen', 8, 2)->nullable()->default(0);
            $table->decimal('profit_tetap', 10, 2)->nullable()->default(0);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('brands');
    }
};
