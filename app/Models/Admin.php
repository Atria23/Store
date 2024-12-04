<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

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
        'admin_status',
    ];

    // Relasi ke User
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
