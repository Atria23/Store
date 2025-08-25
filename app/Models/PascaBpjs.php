<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PascaBpjs extends Model // Nama class disesuaikan
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'bill_details' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}