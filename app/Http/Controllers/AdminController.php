<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Admin;
use Illuminate\Support\Facades\Storage;

class AdminController extends Controller
{
    public function edit()
    {
        $admin = Admin::where('user_id', auth()->id())->first();
        return inertia('Admin', ['admin' => $admin]);
    }
    
    // public function update(Request $request)
    // {
    //     $request->validate([
    //         'shopeepay' => 'nullable|string|max:255',
    //         'shopeepay_status' => 'nullable|boolean',
    //         'dana' => 'nullable|string|max:255',
    //         'dana_status' => 'nullable|boolean',
    //         'gopay' => 'nullable|string|max:255',
    //         'gopay_status' => 'nullable|boolean',
    //         'ovo' => 'nullable|string|max:255',
    //         'ovo_status' => 'nullable|boolean',
    //         'linkaja' => 'nullable|string|max:255',
    //         'linkaja_status' => 'nullable|boolean',
    //         'wallet_is_active' => 'nullable|boolean',

    //         // QRIS string fields
    //         'qris_otomatis_string' => 'nullable|string',
    //         'qris_dana_string' => 'nullable|string',
    //         'qris_shopeepay_string' => 'nullable|string',
    //         'qris_gopay_string' => 'nullable|string',
    //         'qris_ovo_string' => 'nullable|string',

    //         // QRIS image path and status
    //         'qris_otomatis' => 'nullable|string|max:255',
    //         'qris_otomatis_status' => 'nullable|boolean',
    //         'qris_dana' => 'nullable|string|max:255',
    //         'qris_dana_status' => 'nullable|boolean',
    //         'qris_shopeepay' => 'nullable|string|max:255',
    //         'qris_shopeepay_status' => 'nullable|boolean',
    //         'qris_gopay' => 'nullable|string|max:255',
    //         'qris_gopay_status' => 'nullable|boolean',
    //         'qris_ovo' => 'nullable|string|max:255',
    //         'qris_ovo_status' => 'nullable|boolean',

    //         'admin_status' => 'nullable|boolean',
    //     ]);

    //     $admin = Admin::where('user_id', auth()->id())->first();

    //     $fields = [
    //         'shopeepay', 'shopeepay_status',
    //         'dana', 'dana_status',
    //         'gopay', 'gopay_status',
    //         'ovo', 'ovo_status',
    //         'linkaja', 'linkaja_status',
    //         'wallet_is_active',

    //         // Tambahkan string QRIS agar bisa update
    //         'qris_otomatis_string',
    //         'qris_dana_string',
    //         'qris_shopeepay_string',
    //         'qris_gopay_string',
    //         'qris_ovo_string',

    //         // Tetap sertakan kolom gambar dan status
    //         'qris_otomatis', 'qris_otomatis_status',
    //         'qris_dana', 'qris_dana_status',
    //         'qris_shopeepay', 'qris_shopeepay_status',
    //         'qris_gopay', 'qris_gopay_status',
    //         'qris_ovo', 'qris_ovo_status',

    //         'admin_status'
    //     ];

    //     if (!$admin) {
    //         $admin = Admin::create(array_merge(
    //             $request->only($fields),
    //             ['user_id' => auth()->id()]
    //         ));
    //     } else {
    //         $admin->update($request->only($fields));
    //     }

    //     return redirect()->route('admin.edit')->with('success', 'Admin data updated successfully.');
    // }
    public function update(Request $request)
{
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

        'qris_otomatis_string' => 'nullable|string',
        'qris_dana_string' => 'nullable|string',
        'qris_shopeepay_string' => 'nullable|string',
        'qris_gopay_string' => 'nullable|string',
        'qris_ovo_string' => 'nullable|string',

        'qris_otomatis' => 'nullable|string|max:255',
        'qris_otomatis_status' => 'nullable|boolean',
        'qris_dana' => 'nullable|string|max:255',
        'qris_dana_status' => 'nullable|boolean',
        'qris_shopeepay' => 'nullable|string|max:255',
        'qris_shopeepay_status' => 'nullable|boolean',
        'qris_gopay' => 'nullable|string|max:255',
        'qris_gopay_status' => 'nullable|boolean',
        'qris_ovo' => 'nullable|string|max:255',
        'qris_ovo_status' => 'nullable|boolean',

        'admin_status' => 'nullable|boolean',
    ]);

    $admin = Admin::firstOrCreate(
        ['user_id' => auth()->id()],
        [] // default value kosong jika belum ada
    );

    $fields = [
        'shopeepay', 'shopeepay_status',
        'dana', 'dana_status',
        'gopay', 'gopay_status',
        'ovo', 'ovo_status',
        'linkaja', 'linkaja_status',
        'wallet_is_active',

        'qris_otomatis_string', 'qris_dana_string',
        'qris_shopeepay_string', 'qris_gopay_string', 'qris_ovo_string',

        'qris_otomatis', 'qris_otomatis_status',
        'qris_dana', 'qris_dana_status',
        'qris_shopeepay', 'qris_shopeepay_status',
        'qris_gopay', 'qris_gopay_status',
        'qris_ovo', 'qris_ovo_status',

        'admin_status'
    ];

    // Force field boolean yang tidak ada di request agar bernilai false
    $booleanFields = array_filter($fields, fn($f) => str_ends_with($f, '_status') || $f === 'wallet_is_active' || $f === 'admin_status');

    $data = $request->only($fields);

    foreach ($booleanFields as $boolField) {
        $data[$boolField] = $request->boolean($boolField);
    }

    $admin->update($data);

    return redirect()->route('admin.edit')->with('success', 'Admin data updated successfully.');
}



    public function editQris()
    {
        $admin = Admin::where('user_id', auth()->id())->first();
        return inertia('QrisAdmin', ['admin' => $admin]);
    }
    
    public function updateQris(Request $request)
    {
        $request->validate([
            'qris_otomatis' => 'nullable|image|max:2048',
            'qris_otomatis_status' => 'nullable|boolean',
            'qris_otomatis_string' => 'nullable|string|max:255',
        
            'qris_dana' => 'nullable|image|max:2048',
            'qris_dana_status' => 'nullable|boolean',
            'qris_dana_string' => 'nullable|string|max:255',
        
            'qris_shopeepay' => 'nullable|image|max:2048',
            'qris_shopeepay_status' => 'nullable|boolean',
            'qris_shopeepay_string' => 'nullable|string|max:255',
        
            'qris_gopay' => 'nullable|image|max:2048',
            'qris_gopay_status' => 'nullable|boolean',
            'qris_gopay_string' => 'nullable|string|max:255',
        
            'qris_ovo' => 'nullable|image|max:2048',
            'qris_ovo_status' => 'nullable|boolean',
            'qris_ovo_string' => 'nullable|string|max:255',
        ]);
        

        $data = $request->only([
            'qris_otomatis_status', 'qris_dana_status',
            'qris_shopeepay_status', 'qris_gopay_status', 'qris_ovo_status',
            'qris_otomatis_string', 'qris_dana_string',
            'qris_shopeepay_string', 'qris_gopay_string', 'qris_ovo_string',
        ]);
        

        $admin = Admin::first();

        if (!$admin) {
            return redirect()->back()->with('error', 'Data admin tidak ditemukan. Harap buat data admin terlebih dahulu.');
        }

        // Handle upload untuk masing-masing QRIS
        $files = [
            'qris_otomatis' => 'qris_otomatis',
            'qris_dana' => 'qris_dana',
            'qris_shopeepay' => 'qris_shopeepay',
            'qris_gopay' => 'qris_gopay',
            'qris_ovo' => 'qris_ovo',
        ];

        foreach ($files as $field => $dbColumn) {
            if ($request->hasFile($field)) {
                if ($admin->$dbColumn && Storage::disk('public')->exists($admin->$dbColumn)) {
                    Storage::disk('public')->delete($admin->$dbColumn);
                }

                $path = $request->file($field)->store('qris_files', 'public');
                $data[$dbColumn] = $path;
            }
        }

        Admin::query()->update($data);

        return redirect()->route('admin.editQris')->with('success', 'QRIS updated successfully for all admins.');
    }
}
