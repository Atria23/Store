<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Barang extends Model
{
    use HasFactory;

    protected $fillable = [
        'buyer_sku_code', 'product_name', 'category_id', 'brand_id', 'type_id', 'input_type_id',
        'seller_name', 'price', 'buyer_product_status', 'seller_product_status',
        'unlimited_stock', 'stock', 'start_cut_off', 'end_cut_off', 'multi', 'desc'
    ];

    public function category() { return $this->belongsTo(Category::class); }
    public function brand() { return $this->belongsTo(Brand::class); }
    public function type() { return $this->belongsTo(Type::class); }
    public function inputType() { return $this->belongsTo(InputType::class); }
}