<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('types', function (Blueprint $table) {
            $table->decimal('profit_persen', 10, 4)->nullable();
            $table->decimal('profit_tetap', 10, 4)->nullable();
        });
    }

    public function down()
    {
        Schema::table('types', function (Blueprint $table) {
            $table->dropColumn(['profit_persen', 'profit_tetap']);
        });
    }

};
