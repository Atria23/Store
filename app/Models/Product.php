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


// CREATE OR REPLACE VIEW products AS
// SELECT 
//     b.id,  -- Menambahkan id dari tabel barangs sebagai primary key
//     b.buyer_sku_code,
//     b.product_name,
//     c.name AS category,
//     br.name AS brand,
//     t.name AS type,

//     -- Menentukan input_type_id berdasarkan prioritas
//     COALESCE(b.input_type_id, t.input_type_id, br.input_type_id) AS input_type_id,

//     -- Mengambil formula berdasarkan input_type_id yang sudah didapatkan
//     it.formula AS input_type,

//     -- Rumus harga dengan perhitungan profit dan dibulatkan ke bilangan bulat
//     ROUND(
//         CAST(b.price AS DECIMAL(18,4))  -- Gunakan DECIMAL(18,4) untuk nilai lebih besar
//         + (CAST(COALESCE(br.profit_persen, 0) AS DECIMAL(18,4)) * CAST(b.price AS DECIMAL(18,4)) / 100)
//         + CAST(COALESCE(br.profit_tetap, 0) AS DECIMAL(18,4)),
//         0
//     ) AS price,

//     b.`desc` AS `description`, -- Menghindari konflik keyword MySQL
//     b.seller_name,
//     b.seller_product_status,
//     b.unlimited_stock,
//     b.stock,
//     b.multi,
//     b.start_cut_off,
//     b.end_cut_off,
//     b.buyer_product_status,
//     b.created_at,
//     b.updated_at
// FROM barangs b
// LEFT JOIN categories c ON b.category_id = c.id
// LEFT JOIN brands br ON b.brand_id = br.id
// LEFT JOIN types t ON b.type_id = t.id

// -- Ambil input_type berdasarkan input_type_id yang telah ditentukan
// LEFT JOIN input_types it 
//     ON it.id = COALESCE(b.input_type_id, t.input_type_id, br.input_type_id);




















// CREATE OR REPLACE VIEW products AS
// SELECT 
//     b.id,
//     b.buyer_sku_code,
//     b.product_name,
//     c.name AS category,
//     br.name AS brand,
//     t.name AS type,

//     COALESCE(b.input_type_id, t.input_type_id, br.input_type_id) AS input_type_id,

//     it.formula AS input_type,

// ROUND(
//     CAST(b.price AS DECIMAL(18,4))  
//     + (
//         CAST(COALESCE(t.profit_persen, br.profit_persen, 0) AS DECIMAL(18,4)) 
//         * CAST(b.price AS DECIMAL(18,4)) / 100
//     )
//     + CAST(COALESCE(t.profit_tetap, br.profit_tetap, 0) AS DECIMAL(18,4)),
//     0
// ) AS price,

//     COALESCE(b.`desc`, pl.`desc`) AS `description`,
//     b.seller_name,
//     COALESCE(b.seller_product_status, pl.seller_product_status) AS seller_product_status,
//     COALESCE(b.unlimited_stock, pl.unlimited_stock) AS unlimited_stock,
//     COALESCE(b.stock, pl.stock) AS stock,
//     COALESCE(b.multi, pl.multi) AS multi,
//     COALESCE(b.start_cut_off, pl.start_cut_off) AS start_cut_off,
//     COALESCE(b.end_cut_off, pl.end_cut_off) AS end_cut_off,
//     COALESCE(b.buyer_product_status, pl.buyer_product_status) AS buyer_product_status,
//     COALESCE(b.created_at, pl.created_at) AS created_at,
//     COALESCE(b.updated_at, pl.updated_at) AS updated_at

// FROM barangs b
// LEFT JOIN categories c ON b.category_id = c.id
// LEFT JOIN brands br ON b.brand_id = br.id
// LEFT JOIN types t ON b.type_id = t.id
// LEFT JOIN input_types it ON it.id = COALESCE(b.input_type_id, t.input_type_id, br.input_type_id)
// LEFT JOIN price_list pl ON pl.buyer_sku_code = b.buyer_sku_code;