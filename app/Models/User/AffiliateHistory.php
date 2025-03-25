<?php

namespace App\Models\User;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Transaction;
use App\Models\User\Affiliator;
use App\Models\AffiliateProduct;

class AffiliateHistory extends Model
{
    use HasFactory;

    protected $table = 'affiliate_history';
    protected $fillable = ['affiliator_id', 'transaction_id', 'affiliate_product_id', 'commission', 'created_at', 'updated_at'];
    protected $dates = ['created_at', 'updated_at']; // Pastikan Laravel mengenali ini sebagai tanggal

    public function affiliator()
    {
        return $this->belongsTo(Affiliator::class, 'affiliator_id');
    }

    public function transaction()
    {
        return $this->belongsTo(Transaction::class, 'transaction_id');
    }

    public function affiliateProduct()
    {
        return $this->belongsTo(AffiliateProduct::class, 'affiliate_product_id');
    }
}
