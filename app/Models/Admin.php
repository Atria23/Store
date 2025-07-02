<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Admin extends Model
{
    use HasFactory;

    protected $table = 'admins';

    protected $fillable = [
        'user_id',
        'shopeepay',
        'shopeepay_status',
        'dana',
        'dana_status',
        'gopay',
        'gopay_status',
        'ovo',
        'ovo_status',
        'linkaja',
        'linkaja_status',
        'wallet_is_active',
        'qris',
        'qris_status',
        'qris_manual',
        'qris_manual_status',
        'qris_shopeepay',
        'qris_shopeepay_status',
        'qris_gopay',
        'qris_gopay_status',
        'qris_ovo',
        'qris_ovo_status',
        'admin_status',
        'qris_otomatis_string',
        'qris_gopay_string',
        'qris_dana_string',
        'qris_ovo_string',
        'qris_shopeepay_string',
    ];

    // Relasi ke User
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
