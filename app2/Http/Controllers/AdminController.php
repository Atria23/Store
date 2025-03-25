<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Admin;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class AdminController extends Controller
{
    // Tampilkan halaman edit admin untuk user yang sedang login
    public function edit()
    {
        // Ambil data admin berdasarkan user_id yang sedang login
        $admin = Admin::where('user_id', auth()->id())->first();

        // Pastikan data admin dikirim ke frontend menggunakan inertia
        return inertia('Admin', ['admin' => $admin]);
    }

    // Update data wallet dan status admin untuk user login
    public function update(Request $request)
    {
        // Validasi input
        $request->validate([
            'shopeepay' => 'nullable|string|max:255',
            'shopeepay_status' => 'nullable|boolean',
            'dana' => 'nullable|string|max:255',
            'dana_status' => 'nullable|boolean',
            'gopay' => 'nullable|string|max:255',
            'gopay_status' => 'nullable|boolean',
            'ovo' => 'nullable|string|max:255',
            'ovo_status' => 'nullable|boolean',
            'linkaja' => 'nullable|string|max:255',
            'linkaja_status' => 'nullable|boolean',
            'wallet_is_active' => 'nullable|boolean',
            'qris' => 'nullable|string|max:255',
            'qris_status' => 'nullable|boolean',
            'qris_manual' => 'nullable|string|max:255',
            'qris_manual_status' => 'nullable|boolean',
            'admin_status' => 'nullable|boolean',
        ]);

        // Ambil data admin berdasarkan user_id yang sedang login
        $admin = Admin::where('user_id', auth()->id())->first();

        if (!$admin) {
            // Jika admin belum ada, buat data baru
            $admin = Admin::create(array_merge(
                $request->only([
                    'shopeepay', 'shopeepay_status',
                    'dana', 'dana_status',
                    'gopay', 'gopay_status',
                    'ovo', 'ovo_status',
                    'linkaja', 'linkaja_status',
                    'wallet_is_active', 'qris',
                    'qris_status', 'qris_manual',
                    'qris_manual_status', 'admin_status'
                ]), 
                ['user_id' => auth()->id()]
            ));
        } else {
            // Update data yang sudah ada
            $admin->update($request->only([
                'shopeepay', 'shopeepay_status',
                'dana', 'dana_status',
                'gopay', 'gopay_status',
                'ovo', 'ovo_status',
                'linkaja', 'linkaja_status',
                'wallet_is_active', 'qris',
                'qris_status', 'qris_manual',
                'qris_manual_status', 'admin_status',
            ]));
        }

        // Kembali ke halaman edit dengan pesan sukses
        return redirect()->route('admin.edit')->with('success', 'Admin data updated successfully.');
    }

    // Tampilkan halaman edit QRIS untuk admin
    public function editQris()
    {
        $admin = Admin::where('user_id', auth()->id())->first();

        return inertia('QrisAdmin', ['admin' => $admin]);
    }

    public function updateQris(Request $request)
    {
        $request->validate([
            'qris' => 'nullable|image|max:2048', // Validasi file gambar untuk kolom qris
            'qris_status' => 'nullable|boolean',
            'qris_manual' => 'nullable|image|max:2048', // Validasi file gambar untuk kolom qris_manual
            'qris_manual_status' => 'nullable|boolean',
        ]);
    
        $data = $request->only(['qris_status', 'qris_manual_status']);
    
        // Ambil data admin untuk mendapatkan path gambar lama
        $admin = Admin::first();
    
        // Proses upload file untuk kolom qris
        if ($request->hasFile('qris')) {
            // Hapus file gambar lama jika ada
            if ($admin->qris && Storage::disk('public')->exists($admin->qris)) {
                Storage::disk('public')->delete($admin->qris);
            }
    
            // Simpan file baru ke storage
            $path = $request->file('qris')->store('qris_files', 'public');
    
            // Tambahkan path file ke data yang akan diperbarui
            $data['qris'] = $path;
        }
    
        // Proses upload file untuk kolom qris_manual
        if ($request->hasFile('qris_manual')) {
            // Hapus file gambar lama jika ada
            if ($admin->qris_manual && Storage::disk('public')->exists($admin->qris_manual)) {
                Storage::disk('public')->delete($admin->qris_manual);
            }
    
            // Simpan file baru ke storage
            $pathManual = $request->file('qris_manual')->store('qris_files', 'public');
    
            // Tambahkan path file ke data yang akan diperbarui
            $data['qris_manual'] = $pathManual;
        }
    
        // Perbarui QRIS untuk semua admin
        Admin::query()->update($data);
    
        return redirect()->route('admin.editQris')->with('success', 'QRIS updated successfully for all admins.');
    }
    

}