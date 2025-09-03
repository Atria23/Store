<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PostpaidTransaction extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'postpaid_transactions';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $guarded = ['id']; // Lebih mudah menggunakan guarded

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        // Ini akan secara otomatis mengubah kolom JSON menjadi array/object PHP
        'details' => 'array', 
        
        // Casting untuk tipe data harga agar konsisten
        'price' => 'float',
        'selling_price' => 'float',
        'admin_fee' => 'float',
    ];
}