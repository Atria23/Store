<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::table('transactions', function (Blueprint $table) {
            $table->integer('points')->nullable()->after('price'); // Tambah kolom points setelah price
        });
    }

    public function down() {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn('points');
        });
    }
};
