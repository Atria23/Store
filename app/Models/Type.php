<?php

// namespace App\Models;

// use Illuminate\Database\Eloquent\Factories\HasFactory;
// use Illuminate\Database\Eloquent\Model;

// class Type extends Model
// {
//     use HasFactory;

//     protected $fillable = ['name', 'brand_id', 'input_type_id'];

//     public function brand()
//     {
//         return $this->belongsTo(Brand::class);
//     }

//     public function inputType()
//     {
//         return $this->belongsTo(InputType::class);
//     }
// }





namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Type extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'brand_id', 'category_id', 'input_type_id'];

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function inputType()
    {
        return $this->belongsTo(InputType::class);
    }
}
