<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AccountSettingsController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        return inertia('AccountSettings', [
            'user' => [
                'name' => $user->name,
                'username' => $user->username,
                'avatar' => $user->avatar ? '/storage/avatars/' . basename($user->avatar) : null,
                'email' => $user->email,
                'email_verified_at' => $user->email_verified_at,
            ],
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username,' . auth()->id(),
            'avatar' => 'nullable|image|max:2048',
        ]);

        $user = auth()->user();
        $user->name = $validated['name'];
        $user->username = $validated['username'];

        if ($request->hasFile('avatar')) {
            // Gunakan nama file lama jika ada, jika tidak buat nama baru
            $avatarFileName = ($user->avatar && basename($user->avatar) === 'avatar.png')
            ? Str::uuid() . '.' . $request->file('avatar')->getClientOriginalExtension()
            : ($user->avatar ? basename($user->avatar) : $request->file('avatar')->hashName());
        
            // Hapus avatar lama jika ada
            $this->deleteOldAvatar($user->avatar);

            // Simpan avatar baru dengan nama lama atau nama baru
            $avatarPath = $request->file('avatar')->storeAs('avatars', $avatarFileName, 'public');
            $user->avatar = $avatarPath;
        }

        $user->save();

        return redirect()->back()->with('status', 'Pengaturan akun berhasil diperbarui.');
    }

    private function deleteOldAvatar($avatarPath)
    {
        if ($avatarPath) {
            $fullPath = storage_path('app/public/' . $avatarPath);
            if (file_exists($fullPath)) {
                unlink($fullPath);
            }
        }
    }
}
