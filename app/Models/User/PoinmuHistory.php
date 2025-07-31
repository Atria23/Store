<?php

namespace App\Models\User;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Transaction;
use App\Models\User\AffiliateHistory; 

class PoinmuHistory extends Model
{
    use HasFactory;

    protected $table = 'poinmu_history';

    protected $fillable = [
        'user_id',
        'transaction_id',
        'affiliate_history_id', // Tambahkan ini ke fillable
        'type',
        'points',
        'previous_points',
        'new_points',
        'description',
        'redeem_method',
        'destination',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function transaction()
    {
        return $this->belongsTo(Transaction::class, 'transaction_id');
    }

    public function affiliateHistory()
    {
        return $this->belongsTo(AffiliateHistory::class, 'affiliate_history_id');
    }
}
