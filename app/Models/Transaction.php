<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $table = 'transactions';

    protected $fillable = [
        'ref_id',
        'buyer_sku_code',
        'customer_no',
        'status',
        'price',
        'rc',
        'sn',
        'buyer_last_saldo',
        'message',
    ];
}
