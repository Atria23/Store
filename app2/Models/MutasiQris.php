<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MutasiQris extends Model
{
    use HasFactory;

    protected $table = 'mutasi_qris';

    protected $fillable = [
        'date',
        'amount',
        'type',
        'qris',
        'brand_name',
        'issuer_reff',
        'buyer_reff',
        'balance',
    ];
}
