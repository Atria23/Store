<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'products';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'buyer_sku_code',
        'product_name',
        'category',
        'brand',
        'type',
        'price',
        'seller_product_status',
        'unlimited_stock',
        'multi',
        'start_cut_off',
        'end_cut_off',
        'desc',
    ];
} 










// ini mysql nya
// CREATE OR REPLACE VIEW products AS
// SELECT
//     buyer_sku_code,
//     -- Ambil custom jika ada, fallback ke default
//     COALESCE(product_name_custom, product_name) AS product_name,
//     COALESCE(category_custom, category) AS category,
//     COALESCE(brand_custom, brand) AS brand,
//     COALESCE(type_custom, type) AS type,
//     -- Hitung price_custom berdasarkan profit/profit_persen atau fallback ke price dan bulatkan ke atas
//     CASE
//         WHEN price_custom IS NOT NULL THEN CEIL(price_custom)
//         WHEN profit IS NOT NULL THEN CEIL(price + profit)
//         WHEN profit_persen IS NOT NULL THEN CEIL(price + (price * (profit_persen / 100)))
//         ELSE CEIL(price)
//     END AS price,
//     -- Ambil custom jika ada, fallback ke default
//     COALESCE(desc_custom, `desc`) AS `desc`,
//     seller_product_status,
//     unlimited_stock,
//     stock,
//     multi,
//     start_cut_off,
//     end_cut_off,
//     updated_at,
//     -- Ambil nilai tipe_inputan dari price_list
//     tipe_inputan
// FROM price_list;
