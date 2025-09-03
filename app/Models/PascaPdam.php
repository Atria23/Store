<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PascaPdam extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'ref_id',
        'customer_no',
        'customer_name',
        'buyer_sku_code',
        'price',
        'selling_price',
        'admin_fee',
        'status',
        'message',
        'sn',
        'rc',
        'tarif',
        'lembar_tagihan',
        'alamat',
        'jatuh_tempo',
        'bill_details',
    ];

    protected $casts = [
        'bill_details' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}