<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\User\PoinmuHistory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PoinmuHistoryController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        // Ambil history poin pengguna yang sedang login
        $poinmuHistory = PoinmuHistory::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('User/PoinmuHistory', [
            'poinmuHistory' => $poinmuHistory,
        ]);
    }

    public function show($id)
    {
        $user = auth()->user();

        $history = PoinmuHistory::where('user_id', $user->id)
            ->where('id', $id)
            ->firstOrFail();

        return Inertia::render('User/PoinmuHistoryDetail', [
            'history' => $history,
        ]);
    }
}
