<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddQrisStringsToAdminsTable extends Migration
{
    public function up()
    {
        Schema::table('admins', function (Blueprint $table) {
            $table->text('qris_otomatis_string')->nullable()->after('qris_otomatis_status');
            $table->text('qris_dana_string')->nullable()->after('qris_dana_status');
            $table->text('qris_shopeepay_string')->nullable()->after('qris_shopeepay_status');
            $table->text('qris_gopay_string')->nullable()->after('qris_gopay_status');
            $table->text('qris_ovo_string')->nullable()->after('qris_ovo_status');
        });
    }

    public function down()
    {
        Schema::table('admins', function (Blueprint $table) {
            $table->dropColumn([
                'qris_otomatis_string',
                'qris_dana_string',
                'qris_shopeepay_string',
                'qris_gopay_string',
                'qris_ovo_string',
            ]);
        });
    }
}
