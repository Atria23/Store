<?php

namespace App\Models\User;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Transaction;
use App\Models\Deposit;
use App\Models\User\PoinmuHistory;

class BalanceMutation extends Model
{
    use HasFactory;

    protected $table = 'balance_mutation';

    protected $fillable = [
        'user_id',
        'transaction_id',
        'deposit_id',
        'poinmu_history_id',
        'amount',
        'previous_balance',
        'new_balance',
        'type',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function deposit()
    {
        return $this->belongsTo(Deposit::class);
    }

    public function poinmuHistory()
    {
        return $this->belongsTo(PoinmuHistory::class);
    }
}
