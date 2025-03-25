<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User\BalanceMutation;
use Illuminate\Support\Facades\Auth;

class BalanceMutationController extends Controller
{
    public function index()
    {
        $mutations = BalanceMutation::where('user_id', Auth::id())->latest()->paginate(10);

        return Inertia::render('User/BalanceMutation/Index', [
            'mutations' => $mutations
        ]);
    }

    public function show($id)
    {
        $mutation = BalanceMutation::where('user_id', Auth::id())->findOrFail($id);

        return Inertia::render('User/BalanceMutation/Detail', [
            'mutation' => $mutation
        ]);
    }
}
