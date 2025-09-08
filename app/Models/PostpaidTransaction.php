<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PostpaidTransaction extends Model
{
    use HasFactory;

    protected $table = 'postpaid_transactions';
    protected $guarded = ['id'];
    protected $casts = [
        'details' => 'array',
        'price' => 'float',
        'selling_price' => 'float',
        'admin_fee' => 'float',
    ];

    /**
     * Get the PostpaidProduct associated with the transaction.
     */
    public function product()
    {
        // Relasi: Transaksi memiliki satu produk pascabayar
        // foreign_key: 'buyer_sku_code' di tabel 'postpaid_transactions'
        // owner_key: 'buyer_sku_code' di tabel 'postpaid_products'
        return $this->belongsTo(PostpaidProduct::class, 'buyer_sku_code', 'buyer_sku_code');
    }
}