<?php

// use App\Http\Controllers\Apps\DashboardController;
// use App\Http\Controllers\Apps\PermissionController;
// use App\Http\Controllers\Apps\RoleController;
// use App\Http\Controllers\Apps\UserController;
// use App\Http\Controllers\ProfileController;
// use App\Http\Controllers\User\UserDashboardController;
// use App\Http\Controllers\Auth\AuthenticatedSessionController; 
// use Illuminate\Foundation\Application;
// use Illuminate\Support\Facades\Route;
// use Inertia\Inertia;
// use Illuminate\Support\Facades\Auth;
// use App\Http\Controllers\DepositController;
// use App\Http\Controllers\AdminDepositController;
// use App\Http\Controllers\PriceListController;
// use App\Http\Controllers\CartController;
// use App\Http\Controllers\TransactionController;
// use App\Http\Controllers\HistoryController;
// use App\Http\Controllers\Admin\AdminDashboardController;
// use App\Http\Controllers\MutasiQrisController;

// use App\Http\Controllers\WalletController;
// use App\Http\Controllers\AdminController;

// Route::get('/history/{ref_id}', function ($ref_id) {
//     $transactions = \App\Models\TransactionsHistory::all(); // Atau query untuk mengambil data transaksi
//     return Inertia::render('HistoryDetail', [
//         'transactions' => $transactions,
//         'params' => ['ref_id' => $ref_id], // Mengirimkan ref_id ke halaman React
//     ]);
// });


// Route::middleware(['admin-or-super-admin'])->group(function () {
//     Route::get('/admin/deposits', [AdminDepositController::class, 'index'])->name('admin.deposits');
//     Route::post('/admin/deposit/confirm/{id}', [AdminDepositController::class, 'confirm'])->name('admin.deposit.confirm');
//     Route::post('/admin/deposit/cancel-confirm/{id}', [AdminDepositController::class, 'cancelConfirm']);
//     Route::get('/mutasi-qris', [MutasiQrisController::class, 'index'])->name('mutasi-qris.index');

//     Route::get('/admin', [AdminController::class, 'edit'])->name('admin.edit');
//     Route::post('/admin', [AdminController::class, 'update'])->name('admin.update');
// });

// Route::middleware(['super-admin'])->group(function () {
//     // Halaman edit QRIS
//     Route::get('/admin/qris', [AdminController::class, 'editQris'])->name('admin.editQris');
//     // Update data QRIS (untuk super admin)
//     Route::post('/admin/qris', [AdminController::class, 'updateQris'])->name('admin.updateQris');
// });

// Route::middleware(['auth'])->group(function () {
//     Route::get('/deposit', [DepositController::class, 'index'])->name('deposit-history');
//     Route::get('/deposit/create', [DepositController::class, 'create'])->name('deposit-create');
//     Route::post('/deposit', [DepositController::class, 'store'])->name('deposit-store');
//     Route::post('/deposit/confirm/{id}', [DepositController::class, 'confirm'])->name('deposit-confirm');
//     Route::post('/deposit/upload-proof/{id}', [DepositController::class, 'uploadProof'])->name('deposit.uploadProof');
//     Route::get('/proof-of-payment/{id}', [DepositController::class, 'getProofOfPayment'])->name('proof.get');
    
//     Route::get('/products/free-fire', [PriceListController::class, 'showFreeFireProducts'])->name('products.freefire');
    
//     Route::post('/transactions', [TransactionController::class, 'makeTransaction']);
//     Route::get('/balance', [TransactionController::class, 'getBalance']);
//     Route::get('/transactions/completed', [TransactionController::class, 'getCompletedTransactions'])
//     ->name('transactions.completed');

//     Route::get('/history', [TransactionController::class, 'historyPage']);
//     Route::post('/transactions/update-status', [TransactionController::class, 'updateTransactionStatus']);

// });

// Route::get('/', function () {
//     // Cek apakah pengguna sudah login
//     if (Auth::check()) {
//         $user = Auth::user(); // Ambil data pengguna yang sedang login

//         // Cek apakah pengguna memiliki role dengan role_id 4
//         if ($user->roles()->where('role_id', 4)->exists()) {
//             // Jika ada role dengan role_id 4, arahkan ke /apps/dashboard
//             return redirect()->route('apps.dashboard');
//         }

//         // Cek apakah pengguna memiliki role dengan role_id 6
//         if ($user->roles()->where('role_id', 6)->exists()) {
//             // Jika ada role dengan role_id 6, arahkan ke /admin/dashboard
//             return redirect()->route('admin.dashboard');
//         }

//         // Jika tidak memiliki role_id 4 atau 6, arahkan ke /user/dashboard
//         return redirect()->route('user.dashboard');
//     }

//     // Jika belum login, tampilkan halaman welcome
//     return Inertia::render('Welcome', [
//         'canLogin' => Route::has('login'),
//         'canRegister' => Route::has('register'),
//         'laravelVersion' => Application::VERSION,
//         'phpVersion' => PHP_VERSION,
//     ]);
// });


// // Rute untuk pengguna terautentikasi
// Route::middleware(['auth'])->group(function () {
//     Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
//     Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
//     Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
// });

// Route::middleware(['auth'])->group(function () {
//     Route::get('/user/dashboard', [UserDashboardController::class, 'index'])->name('user.dashboard');
// });

// Route::middleware(['auth', 'admin'])->group(function () {
//     Route::get('/admin/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
// });


// // Rute untuk aplikasi admin
// Route::group(['prefix' => 'apps', 'as' => 'apps.' , 'middleware' => ['auth']], function(){
//     // dashboard route
//     Route::get('/dashboard', DashboardController::class)->name('dashboard');
//     // permissions route
//     Route::get('/permissions', PermissionController::class)->name('permissions.index');
//     // roles route
//     Route::resource('/roles', RoleController::class)->except(['create', 'edit', 'show']);
//     // users route
//     Route::resource('/users', UserController::class)->except('show');
// });

// require __DIR__.'/auth.php';





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
use App\Http\Controllers\PriceListController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\MutasiQrisController;

use App\Http\Controllers\WalletController;
use App\Http\Controllers\AdminController;

use App\Http\Controllers\StoreController;


Route::middleware(['auth', 'admin-or-super-admin'])->group(function () {
    Route::get('/history/{ref_id}', function ($ref_id) {
        $transactions = \App\Models\TransactionsHistory::all(); // Atau query untuk mengambil data transaksi
        $store = App\Models\Store::first();
        return Inertia::render('HistoryDetail', [
            'transactions' => $transactions,
            'params' => ['ref_id' => $ref_id],
            'store' => $store ? [
                'name' => $store->name,
                'address' => $store->address,
                'phone_number' => $store->phone_number,
                'image' => $store->image ? asset('storage/' . $store->image) : null,
            ] : null, // Mengirimkan null jika tidak ada data toko
        ]);
    });
});



Route::middleware(['admin-or-super-admin'])->group(function () {
    Route::get('/admin/deposits', [AdminDepositController::class, 'index'])->name('admin.deposits');
    Route::post('/admin/deposit/confirm/{id}', [AdminDepositController::class, 'confirm'])->name('admin.deposit.confirm');
    Route::post('/admin/deposit/cancel-confirm/{id}', [AdminDepositController::class, 'cancelConfirm']);
    Route::get('/mutasi-qris', [MutasiQrisController::class, 'index'])->name('mutasi-qris.index');

    Route::get('/admin', [AdminController::class, 'edit'])->name('admin.edit');
    Route::post('/admin', [AdminController::class, 'update'])->name('admin.update');
});

Route::middleware(['super-admin'])->group(function () {
    // Halaman edit QRIS
    Route::get('/admin/qris', [AdminController::class, 'editQris'])->name('admin.editQris');
    // Update data QRIS (untuk super admin)
    Route::post('/admin/qris', [AdminController::class, 'updateQris'])->name('admin.updateQris');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/deposit', [DepositController::class, 'index'])->name('deposit-history');
    Route::get('/deposit/create', [DepositController::class, 'create'])->name('deposit-create');
    Route::post('/deposit', [DepositController::class, 'store'])->name('deposit-store');
    Route::post('/deposit/confirm/{id}', [DepositController::class, 'confirm'])->name('deposit-confirm');
    Route::post('/deposit/upload-proof/{id}', [DepositController::class, 'uploadProof'])->name('deposit.uploadProof');
    Route::get('/proof-of-payment/{id}', [DepositController::class, 'getProofOfPayment'])->name('proof.get');
    
    Route::get('/products/free-fire', [PriceListController::class, 'showFreeFireProducts'])->name('products.freefire');
    
    Route::post('/transactions', [TransactionController::class, 'makeTransaction']);
    Route::get('/balance', [TransactionController::class, 'getBalance']);
    Route::get('/transactions/completed', [TransactionController::class, 'getCompletedTransactions'])
    ->name('transactions.completed');

    Route::get('/history', [TransactionController::class, 'historyPage']);
    Route::post('/transactions/update-status', [TransactionController::class, 'updateTransactionStatus']);

    Route::get('/store/edit', [StoreController::class, 'edit'])->name('store.edit');
    Route::post('/store/update', [StoreController::class, 'update'])->name('store.update');
});

Route::get('/', function () {
    // Cek apakah pengguna sudah login
    if (Auth::check()) {
        $user = Auth::user(); // Ambil data pengguna yang sedang login

        // Cek apakah pengguna memiliki role dengan role_id 4
        if ($user->roles()->where('role_id', 4)->exists()) {
            // Jika ada role dengan role_id 4, arahkan ke /apps/dashboard
            return redirect()->route('apps.dashboard');
        }

        // Cek apakah pengguna memiliki role dengan role_id 6
        if ($user->roles()->where('role_id', 6)->exists()) {
            // Jika ada role dengan role_id 6, arahkan ke /admin/dashboard
            return redirect()->route('admin.dashboard');
        }

        // Jika tidak memiliki role_id 4 atau 6, arahkan ke /user/dashboard
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

Route::middleware(['auth'])->group(function () {
    Route::get('/user/dashboard', [UserDashboardController::class, 'index'])->name('user.dashboard');
});

Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/admin/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
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