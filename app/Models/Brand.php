<?php

// namespace App\Models;

// use Illuminate\Database\Eloquent\Factories\HasFactory;
// use Illuminate\Database\Eloquent\Model;

// class Brand extends Model
// {
//     use HasFactory;

//     protected $fillable = ['image', 'name', 'category_id', 'input_type_id', 'profit_persen', 'profit_tetap'];

//     public function category()
//     {
//         return $this->belongsTo(Category::class);
//     }

//     public function inputType()
//     {
//         return $this->belongsTo(InputType::class);
//     }
// }


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Brand extends Model
{
    use HasFactory;

    protected $table = 'brands';

    protected $fillable = [
        'image',
        'name',
        'category_id',
        'input_type_id',
        'example_id_product',
        'example_image',
        'profit_persen',
        'profit_tetap',
    ];

    /**
     * Relasi ke kategori.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Relasi ke input type.
     */
    public function inputType()
    {
        return $this->belongsTo(InputType::class);
    }
}
