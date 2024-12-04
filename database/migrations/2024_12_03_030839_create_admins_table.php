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
            
            // Menggunakan unsignedBigInteger untuk mendukung hingga 13 digit
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
            
            $table->string('qris')->nullable();
            $table->boolean('qris_status')->default(true);
            $table->string('qris_manual')->nullable();
            $table->boolean('qris_manual_status')->default(true);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('admins');
    }
}
