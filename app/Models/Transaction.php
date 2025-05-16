<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'transactions';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */

    protected $fillable = [
        'id',
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
        'category',
        'brand',
        'type',
    ];

    // Transaction.php
    public function user()
    {
        return $this->belongsTo(User::class);
    }

}
