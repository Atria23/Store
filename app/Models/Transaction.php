<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'ref_id',
        'buyer_sku_code',
        'product_name',
        'customer_no',
        'status',
        'price',
        'rc',
        'sn',
        'buyer_last_saldo',
        'message',
        'price_product',
    ];
}
