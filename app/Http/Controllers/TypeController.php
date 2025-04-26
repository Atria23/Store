<?php

namespace App\Http\Controllers;

use App\Models\Type;
use App\Models\Brand;
use App\Models\Category;
use App\Models\InputType;
use App\Models\PriceList;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
            $category = Category::where('name', trim($item->category))->first();
            $brandNameOnly = explode(' - ', trim($item->brand))[0];
            $brand = Brand::whereRaw("LEFT(name, LENGTH(?)) = ?", [$brandNameOnly, $brandNameOnly])
                ->where('category_id', optional($category)->id)
                ->first();

            if (!$brand) {
                continue;
            }

            $typeName = trim($item->type) . ' - ' . $brand->name . ' - ' . ($category->name ?? '');

            Type::updateOrCreate(
                ['name' => $typeName],
                [
                    'brand_id' => $brand->id,
                    'category_id' => $category->id ?? null,
                    'example_id_product' => $item->example_id_product,
                    'example_image' => $item->example_image,
                ]
            );
        }

        return redirect()->route('types.index')->with('success', 'Type berhasil disinkronisasi.');
    }

    public function index()
    {
        $types = Type::with(['brand', 'category', 'inputType']) // Eager load relationships
            ->get()
            ->map(function ($type) {
                // Ambil bagian pertama dari nama type, brand, dan category
                $typeBaseName = explode(' - ', $type->name)[0];
                $brandBaseName = optional($type->brand)->name ? explode(' - ', $type->brand->name)[0] : null;
                $categoryBaseName = optional($type->category)->name ? explode(' - ', $type->category->name)[0] : null;

                // Cek apakah type digunakan di PriceList
                $isUsed = PriceList::where('category', $categoryBaseName)
                    ->where('brand', $brandBaseName)
                    ->where('type', $typeBaseName) // Bandingkan hanya bagian pertama dari type
                    ->exists();

                return [
                    'id' => $type->id,
                    'name' => $type->name,
                    'brand_id' => $type->brand_id,
                    'brand_name' => optional($type->brand)->name, // Nama brand lengkap
                    'brand_base_name' => $brandBaseName, // Bagian pertama dari nama brand
                    'category_id' => $type->category_id,
                    'category_name' => optional($type->category)->name, // Nama kategori lengkap
                    'category_base_name' => $categoryBaseName, // Bagian pertama dari nama kategori
                    'input_type_id' => $type->input_type_id,
                    'input_type_name' => optional($type->inputType)->name, // Nama input type
                    'created_at' => $type->created_at,
                    'updated_at' => $type->updated_at,
                    'is_used' => $isUsed, // Status apakah digunakan di PriceList
                    'example_id_product' => $type->example_id_product,
                    'example_image' => $type->example_image ? url('storage/' . $type->example_image) : null,
                ];
            });

        // Ambil semua kategori, brand, dan input type
        $categories = Category::all(['id', 'name', 'image'])->map(function ($category) {
            return [
                'id' => $category->id,
                'name' => $category->name,
                'base_name' => explode(' - ', $category->name)[0], // Ambil bagian utama dari kategori
                'image' => $category->image,
            ];
        });

        $brands = Brand::all(['id', 'name', 'category_id', 'image'])->map(function ($brand) {
            return [
                'id' => $brand->id,
                'name' => $brand->name,
                'base_name' => explode(' - ', $brand->name)[0], // Ambil bagian utama dari brand
                'category_id' => $brand->category_id,
                'image' => $brand->image,
            ];
        });

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
            'input_type_id' => 'nullable|exists:input_types,id',
            'example_id_product' => 'nullable|string|max:255',
            'example_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $brand = Brand::findOrFail($request->brand_id);
        $category = Category::find($request->category_id);
        $formattedName = trim($request->name) . ' - ' . $brand->name . ' - ' . optional($category)->name;

        $exists = Type::where('name', $formattedName)
            ->where('brand_id', $request->brand_id)
            ->where('category_id', $request->category_id)
            ->where('input_type_id', $request->input_type_id)
            ->exists();

        if ($exists) {
            return back()->withErrors(['name' => 'Tipe dengan kombinasi yang sama sudah ada.'])->withInput();
        }

        $exampleImagePath = $request->hasFile('example_image') 
            ? $request->file('example_image')->store('types/examples', 'public') 
            : null;

        Type::create([
            'name' => $formattedName,
            'brand_id' => $request->brand_id,
            'category_id' => $request->category_id,
            'input_type_id' => $request->input_type_id,
            'example_id_product' => $request->example_id_product,
            'example_image' => $exampleImagePath,
        ]);

        return redirect()->route('types.index')->with('success', 'Type berhasil ditambahkan.');
    }

    public function update(Request $request, Type $type)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'brand_id' => 'required|exists:brands,id',
            'category_id' => 'nullable|exists:categories,id',
            'input_type_id' => 'nullable|exists:input_types,id',
            'example_id_product' => 'nullable|string|max:255',
            'example_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $brand = Brand::findOrFail($request->brand_id);
        $category = Category::find($request->category_id);
        $formattedName = trim($request->name) . ' - ' . $brand->name . ' - ' . optional($category)->name;

        $exists = Type::where('name', $formattedName)
            ->where('brand_id', $request->brand_id)
            ->where('category_id', $request->category_id)
            ->where('input_type_id', $request->input_type_id)
            ->where('id', '!=', $type->id)
            ->exists();

        if ($exists) {
            return back()->withErrors(['name' => 'Tipe dengan kombinasi yang sama sudah ada.'])->withInput();
        }

        if ($request->hasFile('example_image')) {
            if ($type->example_image) Storage::disk('public')->delete($type->example_image);
            $exampleImagePath = $request->file('example_image')->store('types/examples', 'public');
        } else {
            $exampleImagePath = $type->example_image;
        }

        $type->update([
            'name' => $formattedName,
            'brand_id' => $request->brand_id,
            'category_id' => $request->category_id,
            'input_type_id' => $request->input_type_id,
            'example_id_product' => $request->example_id_product,
            'example_image' => $exampleImagePath,
        ]);

        return redirect()->route('types.index')->with('success', 'Type berhasil diperbarui.');
    }


    // ✅ 4. Menghapus Type
    public function destroy(Type $type)
    {
        $typeBaseName = explode(' - ', $type->name)[0];

        $isUsed = PriceList::where('type', $typeBaseName)->exists();

        if ($isUsed) {
            session()->flash('warning', 'Type masih digunakan dalam PriceList, tetapi telah dihapus.');
        }

        $type->delete();

        return redirect()->route('types.index')->with('success', 'Type berhasil dihapus.');
    }

}