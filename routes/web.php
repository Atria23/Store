<?php

use App\Http\Controllers\Apps\DashboardController;
use App\Http\Controllers\Apps\PermissionController;
use App\Http\Controllers\Apps\RoleController;
use App\Http\Controllers\Apps\UserController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\User\UserDashboardController;
use App\Http\Controllers\Auth\AuthenticatedSessionController; 
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\DepositController;

use App\Http\Controllers\AdminDepositController;

Route::middleware(['super-admin'])->group(function () {
    Route::get('/admin/deposits', [AdminDepositController::class, 'index'])->name('admin.deposits');
    Route::post('/admin/deposit/confirm/{id}', [AdminDepositController::class, 'confirm'])->name('admin.deposit.confirm');
    Route::post('/admin/deposit/cancel-confirm/{id}', [AdminDepositController::class, 'cancelConfirm']);
});


Route::middleware(['auth'])->group(function () {
    Route::get('/deposit', [DepositController::class, 'index'])->name('deposit-history');
    Route::get('/deposit/create', [DepositController::class, 'create'])->name('deposit-create');
    Route::post('/deposit', [DepositController::class, 'store'])->name('deposit-store');
    Route::post('/deposit/confirm/{id}', [DepositController::class, 'confirm'])->name('deposit-confirm');
    Route::post('/deposit/upload-proof/{id}', [DepositController::class, 'uploadProof'])->name('deposit.uploadProof');
    Route::middleware(['auth'])->group(function () {
        Route::get('/proof-of-payment/{id}', [DepositController::class, 'getProofOfPayment'])->name('proof.get');
    });    
});

Route::get('/', function () {
    // Cek apakah pengguna sudah login
    if (Auth::check()) {
        $user = Auth::user(); // Ambil data pengguna yang sedang login

        // Cek apakah pengguna memiliki role dengan role_id 4
        $role = $user->roles()->where('role_id', 4)->first();

        if ($role) {
            // Jika ada role dengan role_id 4, arahkan ke /apps/dashboard
            return redirect()->route('apps.dashboard');
        }

        // Jika tidak memiliki role_id 4, arahkan ke /user/dashboard
        return redirect()->route('user.dashboard');
    }

    // Jika belum login, tampilkan halaman welcome
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});


// Rute untuk pengguna terautentikasi
Route::middleware(['auth'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'role:user'])->group(function () {
    Route::get('/user/dashboard', [UserDashboardController::class, 'index'])->name('user.dashboard');
});

// Rute untuk aplikasi admin
Route::group(['prefix' => 'apps', 'as' => 'apps.' , 'middleware' => ['auth']], function(){
    // dashboard route
    Route::get('/dashboard', DashboardController::class)->name('dashboard');
    // permissions route
    Route::get('/permissions', PermissionController::class)->name('permissions.index');
    // roles route
    Route::resource('/roles', RoleController::class)->except(['create', 'edit', 'show']);
    // users route
    Route::resource('/users', UserController::class)->except('show');
});

require __DIR__.'/auth.php';
