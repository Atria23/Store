<?php

namespace App\Http\Controllers;

use App\Models\PriceList;
use App\Models\Brand;
use App\Models\Category;
use App\Models\InputType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log; // Tambahkan ini di atas

class BrandController extends Controller
{
        /**
     * Sinkronisasi brand dari price_list ke tabel brands.
     */

public function syncBrands()
{
    $brands = PriceList::select('brand', 'category')
        ->whereNotNull('brand')
        ->whereNotNull('category')
        ->distinct()
        ->get();

    $customBrands = PriceList::select('brand_custom as brand', 'category')
        ->whereNotNull('brand_custom')
        ->whereNotNull('category')
        ->distinct()
        ->get();

    // Gabungkan semua brand berdasarkan brand & category
    $allBrands = $brands->merge($customBrands)->unique(function ($item) {
        return strtolower(trim($item->brand)) . '|' . strtolower(trim($item->category));
    });

    foreach ($allBrands as $brandData) {
        $categoryName = trim($brandData->category ?? '');
        $brandName = trim($brandData->brand ?? '');

        // Jika kategori atau brand kosong, lewati iterasi ini
        if (empty($categoryName) || empty($brandName)) {
            continue;
        }

        // Format name: "brand-category"
        $formattedName = "{$brandName}-{$categoryName}";

        // Simpan brand hanya berdasarkan name tanpa category_id
        Brand::updateOrCreate(
            ['name' => $formattedName],
            ['profit_persen' => 0, 'profit_tetap' => 0]
        );
    }

    return redirect()->route('brands.index')->with('success', 'Brand berhasil disinkronisasi.');
}

    public function index()
    {
        $brands = Brand::with(['category', 'inputType'])->get();

        return Inertia::render('ManageBrands', [
            'brands' => $brands->map(function ($brand) {
                $isUsed = PriceList::where('brand', $brand->name)->exists();
                return [
                    'id' => $brand->id,
                    'name' => $brand->name,
                    'image' => $brand->image ? url('storage/' . $brand->image) : null,
                    'category_id' => $brand->category_id,
                    'input_type_id' => $brand->input_type_id,
                    'profit_persen' => number_format($brand->profit_persen, ($brand->profit_persen == floor($brand->profit_persen) ? 0 : 2), ',', '.'),
                    'profit_tetap' => number_format($brand->profit_tetap, ($brand->profit_tetap == floor($brand->profit_tetap) ? 0 : 2), ',', '.'),
                    'created_at' => $brand->created_at,
                    'updated_at' => $brand->updated_at,
                    'is_used' => $isUsed
                ];
            }),
            'categories' => Category::all(),
            'inputTypes' => InputType::all(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'name' => [
                'nullable',
                'string',
                'max:255',
                function ($attribute, $value, $fail) use ($request) {
                    $exists = Brand::where('name', $value)
                        ->where('category_id', $request->category_id)
                        ->where('input_type_id', $request->input_type_id)
                        ->exists();
                    if ($exists) {
                        $fail('Brand dengan kategori dan input type yang sama sudah ada.');
                    }
                },
            ],            
            'category_id' => 'nullable|exists:categories,id',
            'input_type_id' => 'nullable|exists:input_types,id',
            'profit_persen' => 'nullable|numeric|min:0',
            'profit_tetap' => 'nullable|numeric|min:0',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('brands', 'public');
        }

        Brand::create([
            'name' => $request->name,
            'image' => $imagePath,
            'category_id' => $request->category_id,
            'input_type_id' => $request->input_type_id,
            'profit_persen' => $request->profit_persen,
            'profit_tetap' => $request->profit_tetap,
        ]);

        return redirect()->route('brands.index')->with('success', 'Brand berhasil ditambahkan.');
    }

    public function update(Request $request, Brand $brand)
    {
        $request->validate([
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'name' => [
                'nullable',
                'string',
                'max:255',
                function ($attribute, $value, $fail) use ($request, $brand) {
                    $exists = Brand::where('name', $value)
                        ->where('category_id', $request->category_id)
                        ->where('input_type_id', $request->input_type_id)
                        ->where('id', '!=', $brand->id) // Mengecualikan ID yang sedang diedit
                        ->exists();
                    if ($exists) {
                        $fail('Brand dengan kategori dan input type yang sama sudah ada.');
                    }
                },
            ],
            'category_id' => 'nullable|exists:categories,id',
            'input_type_id' => 'nullable|exists:input_types,id',
            'profit_persen' => 'nullable|numeric|min:0',
            'profit_tetap' => 'nullable|numeric|min:0',
        ]);

        if ($request->hasFile('image')) {
            if ($brand->image) {
                Storage::disk('public')->delete($brand->image);
            }
            $imagePath = $request->file('image')->store('brands', 'public');
        } else {
            $imagePath = $brand->image;
        }

        $brand->update([
            'name' => $request->name,
            'image' => $imagePath,
            'category_id' => $request->category_id,
            'input_type_id' => $request->input_type_id,
            'profit_persen' => $request->profit_persen,
            'profit_tetap' => $request->profit_tetap,
        ]);

        return redirect()->route('brands.index')->with('success', 'Brand berhasil diperbarui.');
    }

    public function destroy(Brand $brand)
    {
        // Periksa apakah kategori masih digunakan di tabel price_list
        $isUsed = PriceList::where('brand', $brand->name)->exists();

        if ($isUsed) {
            return redirect()->route('brands.index')->with('error', 'brand masih digunakan dan tidak dapat dihapus.');
        }

        if ($brand->image) {
            Storage::disk('public')->delete($brand->image);
        }

        $brand->delete();

        return redirect()->route('brands.index')->with('success', 'Brand berhasil dihapus.');
    }
}
