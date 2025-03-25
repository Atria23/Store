<?php

// use Illuminate\Database\Migrations\Migration;
// use Illuminate\Database\Schema\Blueprint;
// use Illuminate\Support\Facades\Schema;

// return new class extends Migration {
//     public function up() {
//         Schema::create('affiliate_history', function (Blueprint $table) {
//             $table->id();
//             $table->foreignId('affiliator_id')
//                 ->constrained('affiliators') // Menghubungkan ke tabel affiliators (default ke id)
//                 ->onDelete('cascade'); // Jika affiliator dihapus, riwayatnya juga ikut terhapus
//             $table->foreignId('transaction_id')
//                 ->constrained('transactions') // Secara default mengacu ke kolom 'id'
//                 ->onDelete('cascade');
//             $table->decimal('commission', 10, 2); // Komisi dari affiliate_products tanpa foreign key
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
    public function up() {
        Schema::create('affiliate_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('affiliator_id')
                ->constrained('affiliators')
                ->onDelete('cascade');

            $table->foreignId('transaction_id')
                ->constrained('transactions')
                ->onDelete('cascade');

            $table->unsignedBigInteger('affiliate_product_id'); // Menyimpan ID dari affiliate_products
            // Tidak ada FOREIGN KEY karena affiliate_products adalah VIEW

            $table->decimal('commission', 10, 2);
            $table->timestamps();
        });
    }

    public function down() {
        Schema::dropIfExists('affiliate_history');
    }
};
