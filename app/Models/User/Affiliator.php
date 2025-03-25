<?php

namespace App\Models\User;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Affiliator extends Model
{
    use HasFactory;

    protected $table = 'affiliators';

    protected $fillable = [
        'user_id',
        'affiliate_by',
        'referral_code',
        'total_commission',
    ];

    /**
     * Relasi ke tabel users, setiap affiliator milik satu user
     */
    public function user()
    {
        return $this->belongsTo(\App\Models\User::class, 'user_id');
    }

    /**
     * Relasi ke affiliator lain (yang mereferensikan)
     */
    public function referredBy()
    {
        return $this->belongsTo(Affiliator::class, 'affiliate_by');
    }

    /**
     * Relasi ke semua affiliator yang direferensikan oleh affiliator ini
     */
    public function referrals()
    {
        return $this->hasMany(Affiliator::class, 'affiliate_by');
    }
}
