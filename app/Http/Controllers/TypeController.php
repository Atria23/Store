<?php

namespace App\Http\Controllers;

use App\Models\Type;
use App\Models\Brand;
use App\Models\Category;
use App\Models\InputType;
use App\Models\PriceList;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TypeController extends Controller
{

    // ✅ 5. Sinkronisasi dari `price_list`
    public function syncTypes()
    {
        $priceListTypes = PriceList::select('category', 'brand', 'type')
            ->whereNotNull('category')
            ->whereNotNull('brand')
            ->whereNotNull('type')
            ->distinct()
            ->get();

        foreach ($priceListTypes as $item) {
            $brand = Brand::where('name', trim($item->brand))->first();
            $category = Category::where('name', trim($item->category))->first();

            if (!$brand) {
                continue; // Lewati jika brand tidak ada
            }

            Type::updateOrCreate(
                [
                    'name' => trim($item->type),
                    'brand_id' => $brand->id,
                    'category_id' => $category->id ?? null
                ]
            );
        }

        return redirect()->route('types.index')->with('success', 'Type berhasil disinkronisasi.');
    }

    public function index()
    {
        $types = Type::with(['brand.category', 'inputType']) // Eager load relationships
            ->get()
            ->map(function ($type) {
                $isUsed = PriceList::where('category', $type->category->name)
                    ->where('brand', $type->brand->name)
                    ->where('type', $type->name)
                    ->exists();

                return [
                    'id' => $type->id,
                    'name' => $type->name,
                    'brand_id' => $type->brand_id,
                    'brand_name' => $type->brand?->name, // Ambil nama brand
                    'category_id' => $type->category_id,
                    'category_name' => $type->category?->name, // Ambil nama kategori
                    'input_type_id' => $type->input_type_id,
                    'input_type_name' => $type->inputType?->name, // Ambil nama input type
                    'created_at' => $type->created_at,
                    'updated_at' => $type->updated_at,
                    'is_used' => $isUsed, // Status apakah digunakan di PriceList
                ];
            });

        // Ambil semua kategori, brand, dan input type
        $categories = Category::all(['id', 'name', 'image']);
        $brands = Brand::all(['id', 'name', 'category_id', 'image']);
        $inputTypes = InputType::all(['id', 'name']);

        return Inertia::render('ManageTypes', [
            'types' => $types,
            'categories' => $categories,
            'brands' => $brands,
            'inputTypes' => $inputTypes,
        ]);
    }

    // ✅ 2. Menambahkan Type baru
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'brand_id' => 'required|exists:brands,id',
            'category_id' => 'nullable|exists:categories,id',
            'input_type_id' => 'nullable|exists:input_types,id'
        ]);

        // Cek apakah kombinasi yang sama sudah ada di database
        $exists = Type::where('name', $request->name)
            ->where('brand_id', $request->brand_id)
            ->where('category_id', $request->category_id)
            ->where('input_type_id', $request->input_type_id)
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'name' => 'Tipe dengan kombinasi yang sama sudah ada.',
            ])->withInput();
        }

        Type::create($request->all());

        return redirect()->route('types.index')->with('success', 'Type berhasil ditambahkan.');
    }

    // ✅ 3. Memperbarui Type
    public function update(Request $request, Type $type)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'brand_id' => 'required|exists:brands,id',
            'category_id' => 'nullable|exists:categories,id',
            'input_type_id' => 'nullable|exists:input_types,id',
        ]);

        // Cek apakah ada type lain dengan kombinasi yang sama (selain dirinya sendiri)
        $exists = Type::where('name', $request->name)
            ->where('brand_id', $request->brand_id)
            ->where('category_id', $request->category_id)
            ->where('input_type_id', $request->input_type_id)
            ->where('id', '!=', $type->id) // Pastikan bukan dirinya sendiri
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'name' => 'Tipe dengan kombinasi yang sama sudah ada.',
            ])->withInput();
        }

        $type->update($request->all());

        return redirect()->route('types.index')->with('success', 'Type berhasil diperbarui.');
    }

    // ✅ 4. Menghapus Type
    public function destroy(Type $type)
    {
        $isUsed = PriceList::where('type', $type->name)->exists();

        if ($isUsed) {
            return redirect()->route('types.index')->with('error', 'Type masih digunakan dan tidak dapat dihapus.');
        }

        $type->delete();

        return redirect()->route('types.index')->with('success', 'Type berhasil dihapus.');
    }
}
