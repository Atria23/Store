<?php

namespace App\Http\Controllers;

use App\Models\Type;
use App\Models\Brand;
use App\Models\Category;
use App\Models\InputType;
use App\Models\PriceList;
use App\Models\Barang;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BarangController extends Controller
{

    public function index()
    {
        $barangs = Barang::with(['category', 'brand', 'type'])
            ->leftJoin('products', 'barangs.buyer_sku_code', '=', 'products.buyer_sku_code')
            ->select(
                'barangs.*',
                'products.price as product_price' // Ambil harga dari tabel products
            )
            ->get()
            ->map(function ($barang) {
                $isUsed = PriceList::where('category', $barang->category?->name)
                    ->where('brand', $barang->brand?->name)
                    ->where('type', $barang->type?->name)
                    ->where('product_name', $barang->product_name)
                    ->exists();

                return [
                    'id' => $barang->id,
                    'buyer_sku_code' => $barang->buyer_sku_code,
                    'product_name' => $barang->product_name,
                    'category_id' => $barang->category_id,
                    'category_name' => $barang->category?->name,
                    'brand_id' => $barang->brand_id,
                    'brand_name' => explode(' - ', $barang->brand?->name ?? '')[0],
                    'brand_image' => $barang->brand?->image,
                    'type_id' => $barang->type_id,
                    'type_name' => explode(' - ', $barang->type?->name ?? '')[0],
                    'input_type_id' => $barang->input_type_id,
                    'seller_name' => $barang->seller_name,
                    'price' => $barang->price, // Harga dari tabel barangs
                    'sell_price' => $barang->product_price, // Harga dari tabel products
                    'buyer_product_status' => $barang->buyer_product_status,
                    'seller_product_status' => $barang->seller_product_status,
                    'unlimited_stock' => $barang->unlimited_stock,
                    'stock' => $barang->stock,
                    'start_cut_off' => $barang->start_cut_off,
                    'end_cut_off' => $barang->end_cut_off,
                    'multi' => $barang->multi,
                    'desc' => $barang->desc,
                    'image' => $barang->image,
                    'created_at' => $barang->created_at,
                    'updated_at' => $barang->updated_at,
                    'is_used' => $isUsed,
                ];
            });

    
        // Ambil semua kategori, brand, type, dan input type
        $categories = Category::all(['id', 'name', 'image']);
        $brands = Brand::all(['id', 'name', 'category_id', 'image']);
        $types = Type::all(['id', 'name', 'brand_id']);
        $inputTypes = InputType::all(['id', 'name']);
    
        return Inertia::render('ManageProducts', [
            'barangs' => $barangs,
            'categories' => $categories,
            'brands' => $brands,
            'types' => $types,
            'inputTypes' => $inputTypes,
        ]);
    }

    public function bulkUpdate(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:barangs,id',
            'fields' => 'required|array',
        ]);

        $allowedFields = [
            'desc',
            'unlimited_stock',
            'stock',
            'multi',
            'start_cut_off',
            'end_cut_off',
            'buyer_product_status',
            'seller_product_status',
        ];

        $updates = collect($validated['fields'])->only($allowedFields)->toArray();

        if (empty($updates)) {
            return redirect()->back()->with('error', 'Tidak ada field yang dapat diperbarui.');
        }

        Barang::whereIn('id', $validated['ids'])->update($updates);

        return redirect()->route('products.index')->with('success', 'Pembaruan massal berhasil.');
    }
    
    public function syncBarangs()
    {
        $priceListItems = PriceList::select(
                'buyer_sku_code', 
                'product_name', 
                'category', 
                'brand', 
                'type', 
                'seller_name', 
                'price', 
                'buyer_product_status', 
                'seller_product_status', 
                'unlimited_stock', 
                'stock', 
                'multi', 
                'start_cut_off', 
                'end_cut_off', 
                'desc'
            )
            ->whereNotNull('buyer_sku_code')
            ->whereNotNull('category')
            ->whereNotNull('brand')
            ->whereNotNull('type')
            ->distinct()
            ->get();

        foreach ($priceListItems as $item) {
            $categoryName = trim($item->category);
            $brandFullName = trim($item->brand);
            $typeFullName = trim($item->type);

            // Ambil bagian pertama dari nama brand dan type sebelum " - "
            $brandBaseName = explode(' - ', $brandFullName)[0];
            $typeBaseName = explode(' - ', $typeFullName)[0];

            // Cari kategori berdasarkan nama
            $category = Category::where('name', $categoryName)->first();

            // Cari brand berdasarkan nama depannya
            $brand = Brand::whereRaw("LEFT(name, LENGTH(?)) = ?", [$brandBaseName, $brandBaseName])
                ->where('category_id', optional($category)->id)
                ->first();

            // Cari type berdasarkan nama depannya
            $type = Type::whereRaw("LEFT(name, LENGTH(?)) = ?", [$typeBaseName, $typeBaseName])
                ->where('brand_id', optional($brand)->id)
                ->first();

            if (!$category || !$brand || !$type) {
                continue; // Lewati jika salah satu tidak ditemukan
            }

            Barang::updateOrCreate(
                [
                    'buyer_sku_code' => trim($item->buyer_sku_code)
                ],
                [
                    'product_name' => trim($item->product_name),
                    'category_id' => $category->id,
                    'brand_id' => $brand->id,
                    'type_id' => $type->id,
                    // 'seller_name' => trim($item->seller_name),
                    'price' => $item->price ?? 0, 
                    'buyer_product_status' => $item->buyer_product_status,
                    'seller_product_status' => $item->seller_product_status,
                    'unlimited_stock' => $item->unlimited_stock,
                    'stock' => $item->stock,
                    'multi' => $item->multi,
                    'start_cut_off' => $item->start_cut_off,
                    'end_cut_off' => $item->end_cut_off,
                    'desc' => trim($item->desc) ?? '',
                    'updated_at' => now(),
                ]
            );
        }

        return redirect()->route('products.index')->with('success', 'Barang berhasil disinkronisasi.');
    }

}