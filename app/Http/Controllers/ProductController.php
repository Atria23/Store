<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Type;
use App\Models\InputType;
use App\Models\Barang;

class ProductController extends Controller
{
    public function destroy($id)
    {
        $barang = Barang::findOrFail($id);
        $barang->delete();
    
        return Inertia::location('/manage-products'); // 🔥 Redirect setelah menghapus
    }
    
    public function index($id = null)
    {
        $product = $id ? Barang::findOrFail($id) : null;

        return Inertia::render('Products/AddProduct', [
            'product' => $product,
            'categories' => Category::all(['id', 'name', 'image']),
            'brands' => Brand::all(['id', 'name', 'category_id', 'image']),
            'types' => Type::all(['id', 'name', 'brand_id']),
            'input_types' => InputType::all(['id', 'name']),
        ]);
    }


    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'buyer_sku_code' => 'required|string|unique:barangs,buyer_sku_code',
            'brand_id' => 'required|exists:brands,id',
            'category_id' => 'required|exists:categories,id',
            'type_id' => 'required|exists:types,id',
            'input_type_id' => 'nullable|exists:input_types,id',
            'price' => 'nullable|string',
            'buyer_product_status' => 'nullable|boolean',
            'seller_product_status' => 'nullable|boolean',
            'unlimited_stock' => 'nullable|boolean',
            'stock' => 'nullable|string',
            'multi' => 'nullable|boolean',
            'start_cut_off' => 'nullable|string',
            'end_cut_off' => 'nullable|string',
            'desc' => 'nullable|string',
            'seller_name' => 'nullable|string',
            'product_name' => 'required|string',
        ]);

        $barang = Barang::create([
            'product_name' => $validatedData['product_name'],
            'buyer_sku_code' => $validatedData['buyer_sku_code'],
            'brand_id' => $validatedData['brand_id'],
            'category_id' => $validatedData['category_id'],
            'type_id' => $validatedData['type_id'],
            'input_type_id' => $validatedData['input_type_id'] ?? null,
            'price' => (string) ($validatedData['price'] ?? '0'),
            'buyer_product_status' => $validatedData['buyer_product_status'] ?? true,
            'seller_product_status' => $validatedData['seller_product_status'] ?? true,
            'unlimited_stock' => $validatedData['unlimited_stock'] ?? false,
            'stock' => $validatedData['stock'] ?? null,
            'multi' => $validatedData['multi'] ?? false,
            'start_cut_off' => $validatedData['start_cut_off'] ?? null,
            'end_cut_off' => $validatedData['end_cut_off'] ?? null,
            'desc' => $validatedData['desc'] ?? null,
            'seller_name' => $validatedData['seller_name'] ?? null,
            'updated_at' => now(),
        ]);

        return Inertia::location('/manage-products'); // 🔥 Redirect langsung tanpa refresh manual

    }

    public function update(Request $request, $id)
    {
        $validatedData = $request->validate([
            'buyer_sku_code' => 'required|string|unique:barangs,buyer_sku_code,' . $id,
            'brand_id' => 'required|exists:brands,id',
            'category_id' => 'required|exists:categories,id',
            'type_id' => 'required|exists:types,id',
            'input_type_id' => 'nullable|exists:input_types,id',
            'price' => 'nullable|string',
            'buyer_product_status' => 'nullable|boolean',
            'seller_product_status' => 'nullable|boolean',
            'unlimited_stock' => 'nullable|boolean',
            'stock' => 'nullable|string',
            'multi' => 'nullable|boolean',
            'start_cut_off' => 'nullable|string',
            'end_cut_off' => 'nullable|string',
            'desc' => 'nullable|string',
            'seller_name' => 'nullable|string',
            'product_name' => 'required|string',
        ]);

        $barang = Barang::findOrFail($id);

        $barang->update([
            'product_name' => $validatedData['product_name'],
            'buyer_sku_code' => $validatedData['buyer_sku_code'],
            'brand_id' => $validatedData['brand_id'],
            'category_id' => $validatedData['category_id'],
            'type_id' => $validatedData['type_id'],
            'input_type_id' => $validatedData['input_type_id'] ?? null,
            'price' => (string) ($validatedData['price'] ?? '0'),
            'buyer_product_status' => $validatedData['buyer_product_status'] ?? true,
            'seller_product_status' => $validatedData['seller_product_status'] ?? true,
            'unlimited_stock' => $validatedData['unlimited_stock'] ?? false,
            'stock' => $validatedData['stock'] ?? null,
            'multi' => $validatedData['multi'] ?? false,
            'start_cut_off' => $validatedData['start_cut_off'] ?? null,
            'end_cut_off' => $validatedData['end_cut_off'] ?? null,
            'desc' => $validatedData['desc'] ?? null,
            'seller_name' => $validatedData['seller_name'] ?? null,
            'updated_at' => now(),
        ]);

        return Inertia::location('/manage-products'); // 🔥 Redirect langsung tanpa refresh manual

    }

}
