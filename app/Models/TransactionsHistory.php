<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransactionsHistory extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'transactions_history';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'id',
        'user_id',
        'ref_id',
        'product_name',
        'customer_no',
        'status',
        'price',
        'saldo_terakhir',
        'rc',
        'message',
        'sn',
        'created_at',
        'category',
        'brand',
        'type',
    ];
} 


// DROP VIEW IF EXISTS transactions_history;

// CREATE VIEW transactions_history AS
// SELECT
//     id,
//     user_id,
//     ref_id,
//     product_name,
//     customer_no,
//     status,
//     price_product AS price,
//     buyer_last_saldo AS saldo_terakhir,
//     sn,
//     rc,
//     created_at,
//     category,
//     brand,
//     type

// FROM
//     transactions;

