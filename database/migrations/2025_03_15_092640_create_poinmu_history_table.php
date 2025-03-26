<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('poinmu_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained('users')
                ->onDelete('cascade');
    
            $table->foreignId('transaction_id')
                ->nullable()
                ->constrained('transactions')
                ->onDelete('cascade');
    
            $table->foreignId('affiliate_history_id')
                ->nullable()
                ->constrained('affiliate_histories')
                ->onDelete('cascade');
            
            $table->string('type');
            $table->double('points', 22, 2); // Ubah dari integer ke double(22,2)
            $table->double('previous_points', 22, 2); // Ubah dari integer ke double(22,2)
            $table->double('new_points', 22, 2); // Ubah dari integer ke double(22,2)
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }    

    public function down() {
        Schema::dropIfExists('poinmu_history');
    }
};
