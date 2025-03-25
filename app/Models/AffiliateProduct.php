<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AffiliateProduct extends Model
{
    use HasFactory;

    protected $table = 'affiliate_products';
    protected $primaryKey = 'id';
    public $timestamps = false; // Karena ini adalah VIEW, biasanya tidak ada timestamps

    protected $fillable = [
        'id',
        'buyer_sku_code',
        'product_name',
        'category',
        'brand',
        'type',
        'komisi',
    ];
}














// <!-- CREATE OR REPLACE VIEW affiliate_products AS
// SELECT 
//     b.id, -- Menambahkan ID sebagai primary key
//     b.buyer_sku_code,
//     b.product_name,
//     c.name AS category,
//     br.name AS brand,
//     t.name AS type,
//     b.price AS price_barangs,
//     p.price AS price_products,
//     -- Komisi dihitung sebagai (price_products - price_barangs) * 20%
//     ROUND((p.price - b.price) * 0.2) AS komisi
// FROM barangs b
// LEFT JOIN products p ON b.buyer_sku_code = p.buyer_sku_code
// LEFT JOIN categories c ON b.category_id = c.id
// LEFT JOIN brands br ON b.brand_id = br.id
// LEFT JOIN types t ON b.type_id = t.id; -->













// <!-- CREATE OR REPLACE VIEW affiliate_products AS
// SELECT 
//     b.id, -- Menambahkan ID sebagai primary key
//     b.buyer_sku_code,
//     b.product_name,
//     c.name AS category,
//     br.name AS brand,
//     t.name AS type,
//     -- Komisi dihitung sebagai (price_products - price_barangs) * 20%
//     ROUND((p.price - b.price) * 0.2) AS komisi
// FROM barangs b
// LEFT JOIN products p ON b.buyer_sku_code = p.buyer_sku_code
// LEFT JOIN categories c ON b.category_id = c.id
// LEFT JOIN brands br ON b.brand_id = br.id
// LEFT JOIN types t ON b.type_id = t.id; -->