<?php

// use Illuminate\Database\Migrations\Migration;
// use Illuminate\Database\Schema\Blueprint;
// use Illuminate\Support\Facades\Schema;

// return new class extends Migration {
//     public function up() {
//         Schema::create('affiliate_history', function (Blueprint $table) {
//             $table->id();
//             $table->foreignId('affiliator_id')
//                 ->constrained('affiliators')
//                 ->onDelete('cascade');

//             $table->foreignId('transaction_id')
//                 ->constrained('transactions')
//                 ->onDelete('cascade');

//             $table->unsignedBigInteger('affiliate_product_id'); // Menyimpan ID dari affiliate_products
//             // Tidak ada FOREIGN KEY karena affiliate_products adalah VIEW

//             $table->decimal('commission', 10, 2);
//             $table->timestamps();
//         });
//     }

//     public function down() {
//         Schema::dropIfExists('affiliate_history');
//     }
// };


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('affiliate_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('affiliator_id')->constrained('affiliators')->onDelete('cascade');
            $table->unsignedBigInteger('affiliate_product_id'); // Menyimpan ID dari affiliate_products
            $table->foreignId('transaction_id')->constrained('transactions')->onDelete('cascade');
            $table->double('commission', 22, 2);
            $table->string('status')->default('Pending');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('affiliate_histories');
    }
};

