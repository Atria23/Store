<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PascaPln extends Model
{
    use HasFactory;

    protected $table = 'pasca_plns';

    protected $fillable = [
        'user_id', 'ref_id', 'customer_no', 'customer_name', 'buyer_sku_code',
        'price', 'selling_price', 'admin_fee', 'status', 'message', 'rc', 'sn',
        'tarif', 'daya', 'lembar_tagihan', 'bill_details',
    ];

    protected $casts = [
        'bill_details' => 'array', // Otomatis cast JSON ke array PHP
        'price' => 'float',
        'selling_price' => 'float',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}