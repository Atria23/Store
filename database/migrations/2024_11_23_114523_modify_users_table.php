<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class ModifyUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->unique()->nullable();
            $table->string('phone_number')->nullable();
            $table->text('profile_image')->nullable();
            $table->string('pin')->nullable();
            $table->decimal('balance', 10, 2)->default(0); // Ganti saldo dengan balance
            $table->enum('membership_status', ['reguler', 'bronze', 'silver', 'gold', 'reseller'])->default('reguler');
            $table->integer('points')->default(0);
            $table->string('referral_code')->nullable()->unique();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            // Hapus kolom jika sudah ada
            if (Schema::hasColumn('users', 'username')) {
                $table->dropColumn('username');
            }
            if (Schema::hasColumn('users', 'phone_number')) {
                $table->dropColumn('phone_number');
            }
            if (Schema::hasColumn('users', 'profile_image')) {
                $table->dropColumn('profile_image');
            }
            if (Schema::hasColumn('users', 'pin')) {
                $table->dropColumn('pin');
            }
            if (Schema::hasColumn('users', 'balance')) {
                $table->dropColumn('balance'); // Menghapus kolom balance
            }
            if (Schema::hasColumn('users', 'membership_status')) {
                $table->dropColumn('membership_status');
            }
            if (Schema::hasColumn('users', 'points')) {
                $table->dropColumn('points');
            }
            if (Schema::hasColumn('users', 'referral_code')) {
                $table->dropColumn('referral_code');
            }
        });
    }
}
