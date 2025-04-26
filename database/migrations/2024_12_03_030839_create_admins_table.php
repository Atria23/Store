<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAdminsTable extends Migration
{
    public function up()
    {
        Schema::create('admins', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->boolean('admin_status')->default(true);
            $table->boolean('wallet_is_active')->default(true);

            // Dompet Digital
            $table->unsignedBigInteger('shopeepay')->nullable();
            $table->boolean('shopeepay_status')->default(true);

            $table->unsignedBigInteger('dana')->nullable();
            $table->boolean('dana_status')->default(true);

            $table->unsignedBigInteger('gopay')->nullable();
            $table->boolean('gopay_status')->default(true);

            $table->unsignedBigInteger('ovo')->nullable();
            $table->boolean('ovo_status')->default(true);

            $table->unsignedBigInteger('linkaja')->nullable();
            $table->boolean('linkaja_status')->default(true);

            // QRIS dan Manual
            $table->string('qris_otomatis')->nullable();
            $table->boolean('qris_otomatis_status')->default(true);

            $table->string('qris_dana')->nullable();
            $table->boolean('qris_dana_status')->default(true);

            // Tambahan QRIS khusus
            $table->string('qris_shopeepay')->nullable();
            $table->boolean('qris_shopeepay_status')->default(true);

            $table->string('qris_gopay')->nullable();
            $table->boolean('qris_gopay_status')->default(true);

            $table->string('qris_ovo')->nullable();
            $table->boolean('qris_ovo_status')->default(true);

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('admins');
    }
}
