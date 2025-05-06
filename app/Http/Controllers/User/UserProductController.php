<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Brand;
use App\Models\Type;
use App\Models\InputType;
use App\Models\Category;
use App\Models\AffiliateProduct;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

class UserProductController extends Controller
{
    public function detectOperator(Request $request, $category)
    {
        $nomor = $request->input('phone_number');

        $operatorPrefixes = [
            'Telkomsel' => ['0811', '0812', '0813', '0821', '0822', '0823', '0852', '0853'],
            'Indosat' => ['0814', '0815', '0816', '0855', '0856', '0857', '0858'],
            'XL' => ['0817', '0818', '0819', '0859', '0877', '0878'],
            'Axis' => ['0838', '0831', '0832', '0833'],
            'Tri' => ['0895', '0896', '0897', '0898', '0899'],
            'Smartfren' => ['0881', '0882', '0883', '0884', '0885', '0886', '0887', '0888'],
            'By.U' => ['0851']
        ];

        $detectedOperator = null;
        foreach ($operatorPrefixes as $operator => $prefixes) {
            foreach ($prefixes as $prefix) {
                if (strpos($nomor, $prefix) === 0) {
                    $detectedOperator = $operator;
                    break 2;
                }
            }
        }

        if (!$detectedOperator) {
            return back()->withErrors(['phone_number' => 'Nomor tidak valid']);
        }

        $brand = Brand::where('name', $detectedOperator)->first();
        if (!$brand) {
            return back()->withErrors(['phone_number' => 'Operator tidak ditemukan']);
        }

        $types = Type::where('brand_id', $brand->id)->get();

        return Inertia::render('User/PulsaPage', [
            'category' => $category,
            'phone_number' => $nomor,
            'operator' => $detectedOperator,
            'types' => $types
        ]);
    }

    public function showBrand($categoryName)
    {
        $category = Category::where('name', urldecode($categoryName))->firstOrFail();
        $brands = Brand::where('category_id', $category->id)->get();

        return Inertia::render('User/CategoryPage', [
            'category' => $category,
            'brands' => $brands
        ]);
    }

    public function showTypeOrProducts($categoryName, $brandName, Request $request, $typeName = null)
    {
        $category = Category::where('name', urldecode($categoryName))->firstOrFail();
        $brand = Brand::where('name', urldecode($brandName))
            ->whereHas('category', function ($query) use ($category) {
                $query->where('name', $category->name);
            })
            ->firstOrFail();

        $brands = Brand::join('categories', 'brands.category_id', '=', 'categories.id')
            ->where('categories.name', $category->name)
            ->select('brands.*')
            ->get();

        $type = $typeName ? Type::where('name', trim(urldecode($typeName)))
            ->whereHas('brand', function ($query) use ($brand) {
                $query->where('name', $brand->name);
            })
            ->whereHas('category', function ($query) use ($category) {
                $query->where('name', $category->name);
            })
            ->first() : null;

        $types = Type::whereHas('brand', function ($query) use ($brand) {
                $query->where('name', $brand->name);
            })
            ->whereHas('category', function ($query) use ($category) {
                $query->where('name', $category->name);
            })
            ->get();

        $query = Product::where('category', $category->name)
            ->where('brand', $brand->name);

        if ($type) {
            $query->where('type', $type->name);
        }

        // Ambil contoh ID dan contoh gambar dari tabel types, jika tidak ada ambil dari brands
        $exampleIdProduct = $type->example_id_product ?? $brand->example_id_product;
        $exampleImage = $type->example_image ?? $brand->example_image;

        // Ambil input_type_id dari types dulu, jika tidak ada baru ambil dari brands
        $inputTypeId = optional($type)->input_type_id ?: $brand->input_type_id;

        // Ambil data input_types berdasarkan inputTypeId (jika ada)
        $inputTypes = $inputTypeId ? InputType::where('id', $inputTypeId)->get() : collect();

        $products = $query->get()->map(function ($product) {
            $affiliateProduct = AffiliateProduct::where('buyer_sku_code', $product->buyer_sku_code)->first();
            $product->commission = $affiliateProduct?->commission ?? 0;
            return $product;
        });

        return Inertia::render('User/ProductPage', [
            'category' => $category,
            'brand' => $brand,
            'brands' => $brands,
            'types' => $types,
            'isPulsaOrData' => in_array($category->name, ['Pulsa', 'Data', 'Masa Aktif']),
            'type' => $type,
            'products' => $products,
            'inputTypes' => $inputTypes,
            'exampleIdProduct' => $exampleIdProduct,
            'exampleImage' => $exampleImage,
            'user' => Auth::user(), // <-- ini yang ditambahkan
        ]);
    }


    public function checkout(Request $request)
    {
        $product = Product::findOrFail($request->id);

        return Inertia::render('User/CheckoutPage', [
            'product' => $product,
            'balance' => auth()->user()->balance
        ]);
    }

}
