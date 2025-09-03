<?php

namespace App\Http\Controllers;

use App\Models\PostpaidProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str; // <-- Jangan lupa import class Str
use App\Services\PostpaidProductService; // <-- Jangan lupa import service baru

use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class PostpaidController extends Controller
{
    public function index()
    {
        $products = PostpaidProduct::all();

        return Inertia::render('PostpaidProducts/Index', [
            'postpaidProducts' => $products,
        ]);
    }
    
public function fetchProducts(Request $request, PostpaidProductService $service)
    {
        $success = $service->fetchAndUpdateProducts();

        if ($success) {
            return redirect()->route('postpaid.index')->with('message', 'Produk berhasil diambil dan diperbarui.');
        }

        return redirect()->back()->with('error', 'Terjadi kesalahan saat mengambil produk. Periksa log untuk detail.');
    }

   public function bulkEditPage(Request $request)
    {
        // Hapus blok if ($request->isMethod('post'))
        
        // 1. Validasi bahwa 'ids' ada di URL dan merupakan sebuah array
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:postpaid_products,id',
        ]);

        // 2. Ambil ID dari request (dari query string URL)
        $selectedIds = $request->input('ids');

        // 3. Ambil HANYA produk yang ID-nya dipilih
        $products = PostpaidProduct::find($selectedIds);

        // 4. Render halaman BulkEdit dengan data produk yang sudah difilter
        return Inertia::render('PostpaidProducts/BulkEdit', [
            'postpaidProducts' => $products,
        ]);
    }
    
    public function bulkUpdate(Request $request)
    {
        $validatedData = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:postpaid_products,id',
            'individual_updates' => 'required|array',
            'individual_updates.*.id' => 'required|exists:postpaid_products,id',
            'individual_updates.*.updates' => 'required|array',
            'individual_updates.*.updates.desc' => 'nullable|string|max:255',
            'individual_updates.*.updates.seller_product_status' => 'nullable|boolean',
            'individual_updates.*.updates.buyer_product_status' => 'nullable|boolean',
            'individual_updates.*.updates.commission_sell_percentage' => 'nullable|numeric|min:0|max:99',
            'individual_updates.*.updates.commission_sell_fixed' => 'nullable|integer|min:0',
            // Aturan validasi ini sangat penting, karena ini yang memastikan $updateData['image'] adalah file
            'individual_updates.*.updates.image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $individualUpdates = $validatedData['individual_updates'];
        $productsToUpdate = PostpaidProduct::whereIn('id', $validatedData['ids'])->get()->keyBy('id');

        DB::transaction(function () use ($individualUpdates, $productsToUpdate) {
            foreach ($individualUpdates as $update) {
                $productId = $update['id'];
                $updateData = $update['updates'];

                if (isset($productsToUpdate[$productId])) {
                    $product = $productsToUpdate[$productId];

                    // *** PERUBAHAN DI SINI ***
                    // Kondisi disederhanakan, hanya mengecek apakah ada data 'image' yang dikirim untuk produk ini
                    if (isset($updateData['image'])) {
                        
                        // Hapus gambar lama jika ada
                        if ($product->image && Storage::disk('public')->exists($product->image)) {
                            Storage::disk('public')->delete($product->image);
                        }
                        
                        // $updateData['image'] sudah pasti objek file karena lolos validasi 'image'
                        $file = $updateData['image'];
                        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                        $sanitizedName = Str::slug($originalName); 
                        $newFilename = $sanitizedName . '-' . time() . '.' . $file->getClientOriginalExtension();
                        
                        // Simpan file baru ke lokasi yang diinginkan
                        $path = $file->storeAs('postpaid', $newFilename, 'public');
                        
                        // Simpan path baru ke array data yang akan di-update
                        $updateData['image'] = $path;
                    }

                    if (isset($updateData['commission_sell_fixed']) && $updateData['commission_sell_fixed'] !== null) {
                        $maxFixed = $product->commission;
                        $updateData['commission_sell_fixed'] = min((int)$updateData['commission_sell_fixed'], $maxFixed);
                    }
                    
                    if (isset($updateData['commission_sell_percentage']) && $updateData['commission_sell_percentage'] !== null) {
                        $updateData['commission_sell_percentage'] = min((float)$updateData['commission_sell_percentage'], 99.00);
                    }
                    
                    $product->update($updateData);
                }
            }
        });

        return redirect()->route('postpaid.index')->with('message', 'Produk berhasil diperbarui secara massal.');
    }
}