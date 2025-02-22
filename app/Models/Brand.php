<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Brand extends Model
{
    use HasFactory;

    protected $fillable = ['image', 'name', 'category_id', 'input_type_id', 'profit_persen', 'profit_tetap'];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function inputType()
    {
        return $this->belongsTo(InputType::class);
    }
}
