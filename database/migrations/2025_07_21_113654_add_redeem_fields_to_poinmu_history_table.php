<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('poinmu_history', function (Blueprint $table) {
            $table->string('redeem_method')->nullable()->after('description');
            $table->string('destination')->nullable()->after('redeem_method');
            $table->enum('status', ['pending', 'sukses', 'gagal'])->nullable()->after('destination');
        });
    }

    public function down(): void
    {
        Schema::table('poinmu_history', function (Blueprint $table) {
            $table->dropColumn(['redeem_method', 'destination', 'status']);
        });
    }
};
