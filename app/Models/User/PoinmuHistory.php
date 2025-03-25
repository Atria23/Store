<?php

namespace App\Models\User;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Transaction;

class PoinmuHistory extends Model
{
    use HasFactory;

    protected $table = 'poinmu_history';

    protected $fillable = [
        'user_id',
        'transaction_id',
        'type',
        'points',
        'previous_points',
        'new_points',
        'description'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function transaction()
    {
        return $this->belongsTo(Transaction::class, 'transaction_id');
    }
}
