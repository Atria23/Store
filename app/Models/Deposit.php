<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Deposit extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'amount',
        'unique_code',
        'admin_fee',
        'get_saldo',
        'total_pay', 
        'status',
        'expires_at',
        'payment_method',
        'proof_of_payment',
        'has_admin_fee',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    // Relasi ke user
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Primary key, jika menggunakan nama berbeda
    protected $primaryKey = 'id';

    // Pastikan auto increment diaktifkan
    public $incrementing = true;

    // Pastikan tipe kunci primary key sesuai (default: int)
    protected $keyType = 'int';
}
