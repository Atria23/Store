<?php

// namespace App\Http\Controllers;

// use Illuminate\Http\Request;
// use App\Models\Category;
// use App\Models\PriceList;
// use Inertia\Inertia;
// use Illuminate\Support\Facades\Log;

// class CategoryController extends Controller
// {
//     /**
//      * Sinkronisasi kategori dari price_list ke tabel categories.
//      */
//     public function syncCategories()
//     {
//         $categories = PriceList::select('category')
//             ->whereNotNull('category')
//             ->distinct()
//             ->pluck('category');

//         $customCategories = PriceList::select('category_custom')
//             ->whereNotNull('category_custom')
//             ->distinct()
//             ->pluck('category_custom');

//         $allCategories = $categories->merge($customCategories)->unique();

//         foreach ($allCategories as $category) {
//             Category::firstOrCreate(['name' => $category]);
//         }

//         Category::whereNotIn('name', $allCategories)
//             ->where('is_manual', false) // Jangan hapus kategori manual
//             ->delete();

//         return redirect()->route('categories.index')->with('success', 'Kategori berhasil disinkronisasi.');
//     }

//     /**
//      * Menampilkan daftar kategori di Inertia.js.
//      */
//     public function index()
//     {
//         $categories = Category::orderBy('name', 'asc')->get();

//         return Inertia::render('CategoryList', [
//             'categories' => $categories
//         ]);
//     }

//     /**
//      * Menambah kategori baru.
//      */
//     public function store(Request $request)
//     {
//         $request->validate([
//             'name' => 'required|string|unique:categories,name',
//             'image' => 'nullable|url'
//         ]);

//         Category::create([
//             'name' => $request->name,
//             'image' => $request->image,
//             'is_manual' => true
//         ]);

//         return redirect()->route('categories.index')->with('success', 'Kategori berhasil ditambahkan.');
//     }

//     /**
//      * Mengupdate kategori.
//      */
//     public function update(Request $request, Category $category)
//     {
//         $request->validate([
//             'name' => 'required|string|unique:categories,name,' . $category->id,
//             'image' => 'nullable|url'
//         ]);

//         $category->update([
//             'name' => $request->name,
//             'image' => $request->image
//         ]);

//         return redirect()->route('categories.index')->with('success', 'Kategori berhasil diperbarui.');
//     }

//     /**
//      * Menghapus kategori.
//      */
//     public function destroy(Category $category)
//     {
//         $category->delete();

//         return redirect()->route('categories.index')->with('success', 'Kategori berhasil dihapus.');
//     }
// }




































// namespace App\Http\Controllers;

// use Illuminate\Http\Request;
// use App\Models\Category;
// use App\Models\PriceList;
// use Inertia\Inertia;
// use Illuminate\Support\Facades\Log;
// use Illuminate\Support\Facades\Storage;

// class CategoryController extends Controller
// {
//     /**
//      * Sinkronisasi kategori dari price_list ke tabel categories.
//      */
//     public function syncCategories()
//     {
//         $categories = PriceList::select('category')
//             ->whereNotNull('category')
//             ->distinct()
//             ->pluck('category');

//         $customCategories = PriceList::select('category_custom')
//             ->whereNotNull('category_custom')
//             ->distinct()
//             ->pluck('category_custom');

//         $allCategories = $categories->merge($customCategories)->unique();

//         foreach ($allCategories as $category) {
//             Category::firstOrCreate(['name' => $category]);
//         }

//         Category::whereNotIn('name', $allCategories)
//             ->where('is_manual', false) // Jangan hapus kategori manual
//             ->delete();

//         return redirect()->route('categories.index')->with('success', 'Kategori berhasil disinkronisasi.');
//     }

//     /**
//      * Menampilkan daftar kategori di Inertia.js.
//      */
//     public function index()
// {
//     $categories = Category::orderBy('name', 'asc')->get()->map(function ($category) {
//         return [
//             'id' => $category->id,
//             'name' => $category->name,
//             'image' => $category->image ? url('storage/' . $category->image) : null,
//         ];
//     });

//     return Inertia::render('CategoryList', [
//         'categories' => $categories
//     ]);
// }


//     /**
//      * Menambah kategori baru.
//      */
//     public function store(Request $request)
//     {
//         $request->validate([
//             'name' => 'required|string|unique:categories,name',
//             'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048'
//         ]);

//         $imagePath = null;
//         if ($request->hasFile('image')) {
//             $imagePath = $request->file('image')->store('categories', 'public');
//         }

//         Category::create([
//             'name' => $request->name,
//             'image' => $imagePath,
//             'is_manual' => true
//         ]);

//         return redirect()->route('categories.index')->with('success', 'Kategori berhasil ditambahkan.');
//     }

//     /**
//      * Mengupdate kategori.
//      */
//     public function update(Request $request, Category $category)
//     {
//         $request->validate([
//             'name' => 'required|string|unique:categories,name,' . $category->id,
//             'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048'
//         ]);

//         if ($request->hasFile('image')) {
//             // Hapus gambar lama jika ada
//             if ($category->image) {
//                 Storage::disk('public')->delete($category->image);
//             }

//             // Simpan gambar baru
//             $imagePath = $request->file('image')->store('categories', 'public');
//         } else {
//             $imagePath = $category->image;
//         }

//         $category->update([
//             'name' => $request->name,
//             'image' => $imagePath
//         ]);

//         return redirect()->route('categories.index')->with('success', 'Kategori berhasil diperbarui.');
//     }

//     /**
//      * Menghapus kategori.
//      */
//     public function destroy(Category $category)
//     {
//         if ($category->image) {
//             Storage::disk('public')->delete($category->image);
//         }

//         $category->delete();

//         return redirect()->route('categories.index')->with('success', 'Kategori berhasil dihapus.');
//     }
// }

























namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category;
use App\Models\PriceList;
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
        $categories = PriceList::select('category')
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category');

        $customCategories = PriceList::select('category_custom')
            ->whereNotNull('category_custom')
            ->distinct()
            ->pluck('category_custom');

        $allCategories = $categories->merge($customCategories)->unique();

        foreach ($allCategories as $category) {
            Category::firstOrCreate(['name' => $category]);
        }

        Category::whereNotIn('name', $allCategories)
            ->where('is_manual', false) // Jangan hapus kategori manual
            ->delete();

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
            'is_used' => $isUsed
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
        return redirect()->route('categories.index')->with('error', 'Kategori masih digunakan dan tidak dapat dihapus.');
    }

    // Hapus gambar jika ada
    if ($category->image) {
        Storage::disk('public')->delete($category->image);
    }

    $category->delete();

    return redirect()->route('categories.index')->with('success', 'Kategori berhasil dihapus.');
}

}
