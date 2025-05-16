<?php

namespace App\Http\Controllers;

use App\Models\PriceList;
use App\Models\Brand;
use App\Models\Category;
use App\Models\InputType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class BrandController extends Controller
{
    /**
     * Sinkronisasi brand dari price_list ke tabel brands.
     */
    public function syncBrands()
    {
        $priceListBrands = PriceList::select('category', 'brand', 'id')
            ->whereNotNull('category')
            ->whereNotNull('brand')
            ->distinct()
            ->get();

        foreach ($priceListBrands as $item) {
            $category = Category::where('name', trim($item->category))->first();
            if (!$category) continue; // Lewati jika kategori tidak ditemukan

            $brandName = trim($item->brand) . ' - ' . trim($category->name);

            Brand::updateOrCreate(
                [
                    'name' => $brandName,
                    'category_id' => $category->id,
                ]
            );
        }

        return redirect()->route('brands.index')->with('success', 'Brand berhasil disinkronisasi.');
    }

    public function index()
    {
        $brands = Brand::with(['category', 'inputType'])->get();

        return Inertia::render('ManageBrands', [
            'brands' => $brands->map(function ($brand) {
                $brandNameOnly = explode(' - ', $brand->name)[0];
                $isUsed = PriceList::where('brand', $brandNameOnly)->exists();

                return [
                    'id' => $brand->id,
                    'name' => $brand->name,
                    'image' => $brand->image ? url('storage/' . $brand->image) : null,
                    'category_id' => $brand->category_id,
                    'input_type_id' => $brand->input_type_id,
                    'profit_persen' => number_format($brand->profit_persen, ($brand->profit_persen == floor($brand->profit_persen) ? 0 : 2), ',', '.'),
                    'profit_tetap' => number_format($brand->profit_tetap, ($brand->profit_tetap == floor($brand->profit_tetap) ? 0 : 2), ',', '.'),
                    'example_id_product' => $brand->example_id_product,
                    'example_image' => $brand->example_image ? url('storage/' . $brand->example_image) : null,
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
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'input_type_id' => 'nullable|exists:input_types,id',
            'profit_persen' => 'nullable|numeric|min:0',
            'profit_tetap' => 'nullable|numeric|min:0',
            'example_id_product' => 'nullable|string|max:255',
            'example_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $category = Category::find($request->category_id);
        if (!$category) return redirect()->route('brands.index')->with('error', 'Kategori tidak ditemukan.');

        $brandName = trim($request->name) . ' - ' . trim($category->name);

        $exists = Brand::where('name', $brandName)->exists();
        if ($exists) return redirect()->route('brands.index')->with('error', 'Brand dengan kategori ini sudah ada.');

        $imagePath = $request->hasFile('image') ? $request->file('image')->store('brands', 'public') : null;
        $exampleImagePath = $request->hasFile('example_image') ? $request->file('example_image')->store('brands/examples', 'public') : null;

        Brand::create([
            'name' => $brandName,
            'image' => $imagePath,
            'category_id' => $request->category_id,
            'input_type_id' => $request->input_type_id,
            'profit_persen' => $request->profit_persen,
            'profit_tetap' => $request->profit_tetap,
            'example_id_product' => $request->example_id_product,
            'example_image' => $exampleImagePath,
        ]);

        return redirect()->route('brands.index')->with('success', 'Brand berhasil ditambahkan.');
    }

    public function update(Request $request, Brand $brand)
    {
        $request->validate([
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'input_type_id' => 'nullable|exists:input_types,id',
            'profit_persen' => 'nullable|numeric|min:0',
            'profit_tetap' => 'nullable|numeric|min:0',
            'example_id_product' => 'nullable|string|max:255',
            'example_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $category = Category::find($request->category_id);
        if (!$category) return redirect()->route('brands.index')->with('error', 'Kategori tidak ditemukan.');

        $brandName = trim($request->name) . ' - ' . trim($category->name);

        $exists = Brand::where('name', $brandName)
            ->where('id', '!=', $brand->id)
            ->exists();
        if ($exists) return redirect()->route('brands.index')->with('error', 'Brand dengan kategori ini sudah ada.');

        if ($request->hasFile('image')) {
            if ($brand->image) Storage::disk('public')->delete($brand->image);
            $imagePath = $request->file('image')->store('brands', 'public');
        } else {
            $imagePath = $brand->image;
        }

        if ($request->hasFile('example_image')) {
            if ($brand->example_image) Storage::disk('public')->delete($brand->example_image);
            $exampleImagePath = $request->file('example_image')->store('brands/examples', 'public');
        } else {
            $exampleImagePath = $brand->example_image;
        }

        $brand->update([
            'name' => $brandName,
            'image' => $imagePath,
            'category_id' => $request->category_id,
            'input_type_id' => $request->input_type_id,
            'profit_persen' => $request->profit_persen,
            'profit_tetap' => $request->profit_tetap,
            'example_id_product' => $request->example_id_product,
            'example_image' => $exampleImagePath,
        ]);

        return redirect()->route('brands.index')->with('success', 'Brand berhasil diperbarui.');
    }

    public function bulkUpdate(Request $request)
    {
        // Validasi data yang diterima
        $validated = $request->validate([
            'brands' => 'required|array',
            'brands.*.id' => 'required|integer|exists:brands,id',
            'brands.*.category_id' => 'nullable|exists:categories,id',
            'brands.*.input_type_id' => 'nullable|exists:input_types,id',
            'brands.*.profit_persen' => 'nullable|numeric',
            'brands.*.profit_tetap' => 'nullable|numeric',
        ]);

        // Update setiap brand
        foreach ($validated['brands'] as $brandData) {
            $brand = Brand::find($brandData['id']);
            
            if ($brand) {
                // Hanya simpan data yang tersedia dalam brandData
                $updateData = [];

                if (array_key_exists('category_id', $brandData) && $brandData['category_id'] !== null) {
                    $updateData['category_id'] = $brandData['category_id'];
                }
                if (array_key_exists('input_type_id', $brandData) && $brandData['input_type_id'] !== null) {
                    $updateData['input_type_id'] = $brandData['input_type_id'];
                }
                if (array_key_exists('profit_persen', $brandData) && $brandData['profit_persen'] !== null) {
                    $updateData['profit_persen'] = $brandData['profit_persen'];
                }
                if (array_key_exists('profit_tetap', $brandData) && $brandData['profit_tetap'] !== null) {
                    $updateData['profit_tetap'] = $brandData['profit_tetap'];
                }

                // Hanya update jika ada data yang perlu diubah
                if (!empty($updateData)) {
                    $brand->update($updateData);
                }
            }
        }

        // Redirect kembali ke halaman index dengan pesan sukses
        return redirect()->route('brands.index')->with('success', 'Brand berhasil diperbarui.');
    }

    public function destroy(Brand $brand)
    {
        // Ambil hanya bagian pertama dari nama brand sebelum " - "
        $brandNameOnly = explode(' - ', $brand->name)[0];

        // Periksa apakah brand masih digunakan dalam PriceList
        $isUsed = PriceList::where('brand', $brandNameOnly)->exists();

        if ($isUsed) {
            session()->flash('warning', 'Brand masih digunakan dalam PriceList, tetapi telah dihapus.');
        }

        // Hapus gambar jika ada
        if ($brand->image) {
            Storage::disk('public')->delete($brand->image);
        }

        // Hapus brand
        $brand->delete();

        return redirect()->route('brands.index')->with('success', 'Brand berhasil dihapus.');
    }
}
