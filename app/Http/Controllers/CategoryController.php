<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request; 
use App\Models\PriceList;
use App\Models\Category;
use App\Models\Brand;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class CategoryController extends Controller
{
    /**
     * Sinkronisasi kategori dari price_list ke tabel categories.
     */
    
    public function syncCategories()
    {
        $priceListCategories = PriceList::select('category')
            ->whereNotNull('category')
            ->distinct()
            ->get();

        foreach ($priceListCategories as $item) {
            Category::updateOrCreate(
                ['name' => trim($item->category)],
                ['updated_at' => now()]
            );
        }

        return redirect()->route('categories.index')->with('success', 'Kategori berhasil disinkronisasi.');
    }

    /**
     * Menampilkan daftar kategori di Inertia.js.
     */
    public function index()
    {
        $categories = Category::orderBy('name', 'asc')->get()->map(function ($category) {
            $isUsed = PriceList::where('category', $category->name)->exists();
            
            return [
                'id' => $category->id,
                'name' => $category->name,
                'image' => $category->image ? url('storage/' . $category->image) : null,
                'is_used' => $isUsed,
                'created_at' => $category->created_at,
                'updated_at' => $category->updated_at
            ];
        });

        return Inertia::render('ManageCategories', [
            'categories' => $categories
        ]);
    }

    /**
     * Menambah kategori baru.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:categories,name',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048'
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('categories', 'public');
        }

        Category::create([
            'name' => $request->name,
            'image' => $imagePath,
            'is_manual' => true
        ]);

        return redirect()->route('categories.index')->with('success', 'Kategori berhasil ditambahkan.');
    }

    /**
     * Mengupdate kategori.
     */
    public function update(Request $request, Category $category)
    {
        $request->validate([
            'name' => 'required|string|unique:categories,name,' . $category->id,
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048'
        ]);

        if ($request->hasFile('image')) {
            // Hapus gambar lama jika ada
            if ($category->image) {
                Storage::disk('public')->delete($category->image);
            }

            // Simpan gambar baru
            $imagePath = $request->file('image')->store('categories', 'public');
        } else {
            $imagePath = $category->image;
        }

        $category->update([
            'name' => $request->name,
            'image' => $imagePath
        ]);

        return redirect()->route('categories.index')->with('success', 'Kategori berhasil diperbarui.');
    }

    /**
     * Menghapus kategori.
     */
    public function destroy(Category $category)
    {
        // Periksa apakah kategori masih digunakan di tabel price_list
        $isUsed = PriceList::where('category', $category->name)->exists();

        if ($isUsed) {
            session()->flash('warning', 'Kategori masih digunakan dalam PriceList, tetapi telah dihapus.');
        }

        // Hapus gambar jika ada
        if ($category->image) {
            Storage::disk('public')->delete($category->image);
        }

        $category->delete();

        return redirect()->route('categories.index')->with('success', 'Kategori berhasil dihapus.');
    }


}
