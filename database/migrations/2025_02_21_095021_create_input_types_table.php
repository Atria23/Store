<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('input_types', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('formula');
            $table->string('example');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('input_types');
    }
};