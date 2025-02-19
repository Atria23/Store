<?php

// use Illuminate\Database\Migrations\Migration;
// use Illuminate\Database\Schema\Blueprint;
// use Illuminate\Support\Facades\Schema;

// return new class extends Migration {
//     public function up()
//     {
//         Schema::create('categories', function (Blueprint $table) {
//             $table->id();
//             $table->string('name')->unique();
//             $table->timestamps();
//         });
//     }

//     public function down()
//     {
//         Schema::dropIfExists('categories');
//     }
// };









use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('image')->nullable(); // Tambahkan kolom image
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('categories');
    }
};