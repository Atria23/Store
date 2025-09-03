<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PostpaidProduct extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_name',
        'category',
        'brand',
        'seller_name',
        'admin',
        'commission',
        'commission_sell_percentage',
        'commission_sell_fixed',
        'buyer_sku_code',
        'buyer_product_status',
        'seller_product_status',
        'desc',
        'image', // <<< NEW: Add to fillable
    ];
}