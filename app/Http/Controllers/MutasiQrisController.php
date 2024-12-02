<?php

namespace App\Http\Controllers;

use App\Models\MutasiQris;
use Inertia\Inertia;

class MutasiQrisController extends Controller
{
    public function index()
    {
        // Ambil data dari tabel `mutasi_qris`
        $mutasiQris = MutasiQris::orderBy('date', 'desc')->paginate(10); // Pagination 10 data per halaman

        // Kirim data ke frontend menggunakan Inertia
        return Inertia::render('MutasiQris/Index', [
            'mutasiQris' => $mutasiQris
        ]);
    }
}
