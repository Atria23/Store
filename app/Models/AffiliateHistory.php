<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AffiliateHistory extends Model {
    use HasFactory;

    protected $table = 'affiliate_history'; 
    protected $fillable = ['affiliator_id', 'transaction_id', 'commission'];

    // Relasi ke Affiliators
    public function affiliator() {
        return $this->belongsTo(Affiliator::class, 'affiliator_id', 'affiliate_by');
    }

    // Relasi ke Transactions
    public function transaction() {
        return $this->belongsTo(Transaction::class, 'transaction_id', 'ref_id');
    }
}
