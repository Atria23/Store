<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Requests\UserRequest;
use Spatie\Permission\Models\Role;
use App\Http\Controllers\Controller;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller implements HasMiddleware
{
    /**
     * middleware
     */
    public static function middleware()
    {
        return [
            new Middleware('permission:users-data', only: ['index']),
            new Middleware('permission:users-create', only: ['create']),
            new Middleware('permission:users-update', only: ['update']),
            new Middleware('permission:users-destroy', only: ['destroy']),
        ];
    }

    /**
     * Display a listing of the resource.
     */

    // public function index()
    // {
    //     // Ambil semua data pengguna tanpa filter atau pengurutan
    //     $users = User::select('id', 'name', 'avatar', 'email', 'created_at', 'balance', 'username')
    //     ->with('roles')
    //     ->get(); // Bukan paginate

    // return inertia('ManageUsers', [
    //     'users' => $users
    // ]);

    // }
    public function index()
    {
        // Ambil semua data pengguna tanpa filter atau pengurutan
        $users = User::select('id', 'name', 'avatar', 'email', 'created_at', 'balance', 'username')
            ->with('roles')
            ->get(); // Bukan paginate
    
        return inertia('ManageUsers', [
            'users' => $users
        ]);
    }
    

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // get all role data
        $roles = Role::query()
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        // render view
        return inertia('Apps/Users/Create', [
            'roles' => $roles
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(UserRequest $request)
    {
        // create new user data
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
        ]);

        // assign role to user
        $user->assignRole($request->selectedRoles);

        // render view
        return to_route('manage-users.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        // get all role data
        $roles = Role::query()
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        // load relationship
        $user->load(['roles' => fn($query) => $query->select('id', 'name'), 'roles.permissions' => fn($query) => $query->select('id', 'name')]);

        // render view
        return inertia('ManageUserDetail', [
            'roles' => $roles,
            'user' => $user
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    
    public function update(UserRequest $request, User $user)
    {
        // update name & email
        $user->update([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'phone_number' => $request->phone_number,
            'points' => $request->points ?? 0, // <= kasih default 0 kalau null
        ]);

        // update password jika diisi
        if ($request->filled('password')) {
            $user->update([
                'password' => bcrypt($request->password),
            ]);
        }

        // update balance jika ada dan valid
        if ($request->has('balance')) {
            $user->update([
                'balance' => $request->balance,
            ]);
        }

        // assign role
        $user->syncRoles($request->selectedRoles);

        return to_route('manage-users.index');
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $ids = explode(',', $id);

        if(count($ids) > 0)
            User::whereIn('id', $ids)->delete();
        else
            User::findOrFail($id)->delete();

        // render view
        return back();
    }
}
