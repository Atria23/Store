<?php

namespace App\Http\Controllers; 

use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StoreController extends Controller
{
    // Menampilkan halaman edit store
    public function edit()
    {
        $store = auth()->user()->store;

        return inertia('User/StoreEdit', [
            'store' => $store,
        ]);
    }

    // Memperbarui data store
    public function update(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'phone_number' => 'nullable|string',
            'image' => 'nullable|image|max:2048', // Maksimal 2MB
        ]);

        $store = auth()->user()->store;

        if (!$store) {
            // Jika store tidak ada, buat baru
            $store = Store::create([
                'user_id' => auth()->id(),
                'name' => $request->name,
                'address' => $request->address,
                'phone_number' => $request->phone_number,
            ]);
        } else {
            // Update data toko
            $store->update([
                'name' => $request->name,
                'address' => $request->address,
                'phone_number' => $request->phone_number,
            ]);
        }

        // Jika ada gambar yang diupload
        if ($request->hasFile('image')) {
            // Hapus gambar lama jika ada
            if ($store->image) {
                Storage::disk('public')->delete($store->image);
            }

            // Simpan gambar baru
            $path = $request->file('image')->store('store-images', 'public');
            $store->update(['image' => $path]);
        }
    }
}
