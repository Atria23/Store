<?php

// namespace App\Http\Controllers\User;

// use App\Http\Controllers\Controller;
// use App\Models\Product;
// use App\Models\Brand;
// use App\Models\Type;
// use App\Models\Category;
// use App\Models\Transaction;
// use Illuminate\Http\Request;
// use Inertia\Inertia;
// use Illuminate\Support\Facades\Auth;
// use Illuminate\Support\Facades\Http;

// class UserProductController extends Controller
// {
//     public function detectOperator(Request $request, $category)
//     {
//         $nomor = $request->input('phone_number');

//         $operatorPrefixes = [
//             'Telkomsel' => ['0811', '0812', '0813', '0821', '0822', '0823', '0852', '0853'],
//             'Indosat' => ['0814', '0815', '0816', '0855', '0856', '0857', '0858'],
//             'XL' => ['0817', '0818', '0819', '0859', '0877', '0878'],
//             'Axis' => ['0838', '0831', '0832', '0833'],
//             'Tri' => ['0895', '0896', '0897', '0898', '0899'],
//             'Smartfren' => ['0881', '0882', '0883', '0884', '0885', '0886', '0887', '0888'],
//             'By.U' => ['0851']
//         ];

//         $detectedOperator = null;
//         foreach ($operatorPrefixes as $operator => $prefixes) {
//             foreach ($prefixes as $prefix) {
//                 if (strpos($nomor, $prefix) === 0) {
//                     $detectedOperator = $operator;
//                     break 2;
//                 }
//             }
//         }

//         if (!$detectedOperator) {
//             return back()->withErrors(['phone_number' => 'Nomor tidak valid']);
//         }

//         $brand = Brand::where('name', $detectedOperator)->first();
//         if (!$brand) {
//             return back()->withErrors(['phone_number' => 'Operator tidak ditemukan']);
//         }

//         $types = Type::where('brand_id', $brand->id)->get();

//         return Inertia::render('User/PulsaPage', [
//             'category' => $category,
//             'phone_number' => $nomor,
//             'operator' => $detectedOperator,
//             'types' => $types
//         ]);
//     }

//     public function showBrand($categoryName)
//     {
//         $category = Category::where('name', urldecode($categoryName))->firstOrFail();
//         $brands = Brand::where('category_id', $category->id)->get();

//         return Inertia::render('User/CategoryPage', [
//             'category' => $category,
//             'brands' => $brands
//         ]);
//     }
    
//     public function showTypeOrProducts($categoryName, $brandName, Request $request, $typeName = null)
//     {
//         $category = Category::where('name', urldecode($categoryName))->firstOrFail();
//         $brand = Brand::where('name', urldecode($brandName))
//             ->whereHas('category', function ($query) use ($category) {
//                 $query->where('name', $category->name);
//             })
//             ->firstOrFail();

//         $brands = Brand::join('categories', 'brands.category_id', '=', 'categories.id')
//             ->where('categories.name', $category->name)
//             ->select('brands.*') // Hanya mengambil data dari tabel brands
//             ->get();



//         // Ambil type (jika ada)
//         $type = $typeName ? Type::where('name', trim(urldecode($typeName)))
//         ->whereHas('brand', function ($query) use ($brand) {
//             $query->where('name', $brand->name);
//         })
//         ->whereHas('category', function ($query) use ($category) {
//             $query->where('name', $category->name);
//         })
//         ->first() : null;


//         // Ambil semua type berdasarkan brand dan kategori
//         $types = Type::whereHas('brand', function ($query) use ($brand) {
//                 $query->where('name', $brand->name);
//             })
//             ->whereHas('category', function ($query) use ($category) {
//                 $query->where('name', $category->name);
//             })
//             ->get();


//         // Ambil produk berdasarkan kategori, brand, dan type (jika ada)
//         $query = Product::where('category', $category->name)
//             ->where('brand', $brand->name);

//         if ($type) {
//             $query->where('type', $type->name);
//         }

//         $products = $query->get();

//         return Inertia::render('User/TypePage', [
//             'category' => $category,
//             'brand' => $brand,
//             'brands' => $brands,
//             'types' => $types,
//             'isPulsaOrData' => in_array($category->name, ['Pulsa', 'Data', 'Masa aktif']),
//             'type' => $type,
//             'products' => $products
//         ]);
//     }

//     public function makeTransaction(Request $request)
//     {
//         $user = Auth::user();

//         if (!$user) {
//             return response()->json(['message' => 'User not authenticated'], 401);
//         }

//         $username = env('P_U');
//         $apiKey = env('P_AK');
//         $ref_id = uniqid();
//         $buyer_sku_code = $request->input('buyer_sku_code');
//         $customer_no = $request->input('customer_no');
//         $price = $request->input('price');
//         $sign = md5($username . $apiKey . $ref_id);

//         $data = [
//             'username' => $username,
//             'buyer_sku_code' => $buyer_sku_code,
//             'customer_no' => $customer_no,
//             'ref_id' => $ref_id,
//             'sign' => $sign,
//         ];

//         $response = Http::withHeaders([
//             'Content-Type' => 'application/json',
//         ])->post('https://api.digiflazz.com/v1/transaction', $data);

//         $responseData = $response->json();
//         $product = Product::where('buyer_sku_code', $buyer_sku_code)->first();

//         if (!$product) {
//             return response()->json(['message' => 'Product not found'], 404);
//         }

//         $transaction = Transaction::create([
//             'user_id' => $user->id,
//             'ref_id' => $ref_id,
//             'buyer_sku_code' => $buyer_sku_code,
//             'customer_no' => $customer_no,
//             'status' => $responseData['data']['status'] ?? 'Failed',
//             'price' => $price,
//             'price_product' => $product->price,
//             'product_name' => $product->product_name,
//             'category' => $product->category,
//             'brand' => $product->brand,
//             'type' => $product->type,
//             'rc' => $responseData['data']['rc'] ?? 'UNKNOWN_ERROR',
//             'sn' => $responseData['data']['sn'] ?? null,
//             'buyer_last_saldo' => $user->balance,
//             'message' => $responseData['data']['message'] ?? 'Transaction failed',
//         ]);

//         if ($responseData['data']['status'] !== 'Gagal') {
//             $user->balance -= $product->price;
//             $user->save();
//             $transaction->buyer_last_saldo = $user->balance;
//             $transaction->save();

//             return response()->json(['message' => 'Transaction successful', 'data' => $responseData['data'], 'balance' => $user->balance], 200);
//         } else {
//             return response()->json(['message' => 'Transaction failed', 'data' => $responseData['data'] ?? null, 'balance' => $user->balance], $response->status());
//         }
//     }
// }
























namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Brand;
use App\Models\Type;
use App\Models\InputType;
use App\Models\Category;
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
    
    // public function showTypeOrProducts($categoryName, $brandName, Request $request, $typeName = null)
    // {
    //     $category = Category::where('name', urldecode($categoryName))->firstOrFail();
    //     $brand = Brand::where('name', urldecode($brandName))
    //         ->whereHas('category', function ($query) use ($category) {
    //             $query->where('name', $category->name);
    //         })
    //         ->firstOrFail();

    //     $brands = Brand::join('categories', 'brands.category_id', '=', 'categories.id')
    //         ->where('categories.name', $category->name)
    //         ->select('brands.*')
    //         ->get();

    //     $type = $typeName ? Type::where('name', trim(urldecode($typeName)))
    //         ->whereHas('brand', function ($query) use ($brand) {
    //             $query->where('name', $brand->name);
    //         })
    //         ->whereHas('category', function ($query) use ($category) {
    //             $query->where('name', $category->name);
    //         })
    //         ->first() : null;

    //     $types = Type::whereHas('brand', function ($query) use ($brand) {
    //             $query->where('name', $brand->name);
    //         })
    //         ->whereHas('category', function ($query) use ($category) {
    //             $query->where('name', $category->name);
    //         })
    //         ->get();

    //     $query = Product::where('category', $category->name)
    //         ->where('brand', $brand->name);

    //     if ($type) {
    //         $query->where('type', $type->name);
    //     }

    //     $products = $query->get();

    //     // Ambil input_type_id dari types dulu, jika tidak ada baru ambil dari brands
    //     $inputTypeId = optional($type)->input_type_id ?: $brand->input_type_id;

    //     // Ambil data input_types berdasarkan inputTypeId (jika ada)
    //     $inputTypes = $inputTypeId ? InputType::where('id', $inputTypeId)->get() : collect();

    //     return Inertia::render('User/TypePage', [
    //         'category' => $category,
    //         'brand' => $brand,
    //         'brands' => $brands,
    //         'types' => $types,
    //         'isPulsaOrData' => in_array($category->name, ['Pulsa', 'Data', 'Masa aktif']),
    //         'type' => $type,
    //         'products' => $products,
    //         'inputTypes' => $inputTypes, // Kirim input_types ke frontend
    //     ]);
    // }

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
    
        $products = $query->get();
    
        // Ambil contoh ID dan contoh gambar dari tabel types, jika tidak ada ambil dari brands
        $exampleIdProduct = $type->example_id_product ?? $brand->example_id_product;
        $exampleImage = $type->example_image ?? $brand->example_image;
    
        // Ambil input_type_id dari types dulu, jika tidak ada baru ambil dari brands
        $inputTypeId = optional($type)->input_type_id ?: $brand->input_type_id;
    
        // Ambil data input_types berdasarkan inputTypeId (jika ada)
        $inputTypes = $inputTypeId ? InputType::where('id', $inputTypeId)->get() : collect();
    
        return Inertia::render('User/TypePage', [
            'category' => $category,
            'brand' => $brand,
            'brands' => $brands,
            'types' => $types,
            'isPulsaOrData' => in_array($category->name, ['Pulsa', 'Data', 'Masa aktif']),
            'type' => $type,
            'products' => $products,
            'inputTypes' => $inputTypes, // Kirim input_types ke frontend
            'exampleIdProduct' => $exampleIdProduct, // Kirim contoh ID pelanggan ke frontend
            'exampleImage' => $exampleImage, // Kirim contoh gambar ke frontend
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
