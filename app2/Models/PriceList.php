<?php

// namespace App\Models;

// use Illuminate\Database\Eloquent\Factories\HasFactory;
// use Illuminate\Database\Eloquent\Model;

// class PriceList extends Model
// {
//     use HasFactory;

//     /**
//      * The table associated with the model.
//      *
//      * @var string
//      */
//     protected $table = 'price_list';

//     /**
//      * The attributes that are mass assignable.
//      *
//      * @var array
//      */
//     protected $fillable = [
//         'product_name',
//         'category',
//         'brand',
//         'type',
//         'seller_name',
//         'price',
//         'buyer_sku_code',
//         'buyer_product_status',
//         'seller_product_status',
//         'unlimited_stock',
//         'stock',
//         'multi',
//         'start_cut_off',
//         'end_cut_off',
//         'desc',
//         'product_name_custom',
//         'category_custom',
//         'brand_custom',
//         'type_custom',
//         'price_custom',
//         'desc_custom',
//         'profit',
//         'profit_persen',
//         'tipe_inputan',
//     ];

//     /**
//      * The attributes that should be cast to native types.
//      *
//      * @var array
//      */
//     protected $casts = [
//         'price' => 'string', // Harga disimpan sebagai string
//         'buyer_product_status' => 'boolean',
//         'seller_product_status' => 'boolean',
//         'unlimited_stock' => 'boolean',
//         'multi' => 'boolean',
//         'start_cut_off' => 'string', // Format hh:mm
//         'end_cut_off' => 'string',  // Format hh:mm
//         'stock' => 'string', // Stok sebagai string karena unlimited_stock relevan
//         'desc' => 'string', // Deskripsi produk sebagai string
//         'product_name_custom' => 'string',
//         'category_custom' => 'string',
//         'brand_custom' => 'string',
//         'type_custom' => 'string',
//         'price_custom' => 'string',
//         'desc_custom' => 'string',
//         'profit' => 'decimal:2', // Profit sebagai decimal
//         'profit_persen' => 'decimal:2', // Profit persen sebagai decimal
//         'tipe_inputan' => 'string', // Tipe inputan sebagai string
//     ];

//     /**
//      * Accessor for dynamically calculating price_custom.
//      *
//      * @return string
//      */
//     public function getPriceCustomAttribute($value)
//     {
//         // Return existing custom price if available
//         if ($value !== null) {
//             return $value;
//         }

//         // Calculate price_custom based on profit or profit_persen
//         $basePrice = (float) $this->price;

//         if ($this->profit !== null) {
//             return (string) ($basePrice + (float) $this->profit);
//         }

//         if ($this->profit_persen !== null) {
//             return (string) ($basePrice + ($basePrice * ((float) $this->profit_persen / 100)));
//         }

//         // Default: return the original price
//         return (string) $basePrice;
//     }
// }











namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PriceList extends Model
{
    use HasFactory;

    protected $table = 'price_list';

    protected $fillable = [
        'product_name', 'category', 'brand', 'type', 'seller_name', 'price',
        'buyer_sku_code', 'buyer_product_status', 'seller_product_status', 'unlimited_stock',
        'stock', 'multi', 'start_cut_off', 'end_cut_off', 'desc', 'product_name_custom',
        'category_custom', 'brand_custom', 'type_custom', 'price_custom', 'desc_custom',
        'profit', 'profit_persen', 'tipe_inputan', 'brand_image', 'category_image'
    ];

    protected $casts = [
        'buyer_product_status' => 'boolean',
        'seller_product_status' => 'boolean',
        'unlimited_stock' => 'boolean',
        'multi' => 'boolean',
        'profit' => 'decimal:2',
        'profit_persen' => 'decimal:2',
    ];

    public function getPriceCustomAttribute($value)
    {
        if ($value !== null) {
            return $value;
        }

        $basePrice = (float) $this->price;

        if ($this->profit !== null) {
            return (string) ($basePrice + (float) $this->profit);
        }

        if ($this->profit_persen !== null) {
            return (string) ($basePrice + ($basePrice * ((float) $this->profit_persen / 100)));
        }

        return (string) $basePrice;
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category', 'name');
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class, 'brand', 'name');
    }
}
