// database/migrations/xxxx_xx_xx_xxxxxx_create_pasca_plns_table.php

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pasca_plns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('ref_id')->unique()->comment('Ref ID unik, sama untuk inquiry dan payment');
            
            // Data Pelanggan & Produk
            $table->string('customer_no');
            $table->string('customer_name');
            $table->string('buyer_sku_code');
            
            // Data Harga & Biaya
            $table->decimal('price', 15, 2)->comment('Harga potong dari deposit kita');
            $table->decimal('selling_price', 15, 2)->comment('Harga jual ke user');
            $table->integer('admin_fee')->comment('Total biaya admin');

            // Status Transaksi
            $table->string('status', 20)->default('Pending');
            $table->string('message')->nullable()->comment('Deskripsi status dari Digiflazz');
            $table->string('rc', 10)->nullable()->comment('Response Code dari Digiflazz');
            $table->text('sn')->nullable()->comment('Serial Number / Token');

            // Detail Spesifik PLN
            $table->string('tarif')->nullable();
            $table->string('daya')->nullable();
            $table->integer('lembar_tagihan')->nullable();
            $table->json('bill_details')->nullable()->comment('Detail setiap lembar tagihan dalam format JSON');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pasca_plns');
    }
};