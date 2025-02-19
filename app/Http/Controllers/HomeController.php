<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class HomeController extends Controller
{
    public function index()
    {
        $categories = DB::table('price_list')
            ->select('categories.id', 'categories.name', 'categories.image')
            ->join('categories', 'price_list.category', '=', 'categories.name')
            ->groupBy('categories.id', 'categories.name', 'categories.image')
            ->get();

        return Inertia::render('Home', [
            'categories' => $categories
        ]);
    }
}
