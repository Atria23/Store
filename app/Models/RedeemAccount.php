<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RedeemAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'redeem_method',
        'destination',
        'account_name',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
