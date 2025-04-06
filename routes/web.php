<?php

use App\Http\Controllers\Apps\DashboardController;
use App\Http\Controllers\Apps\PermissionController;
use App\Http\Controllers\Apps\RoleController;
use App\Http\Controllers\Apps\UserController;
use App\Http\Controllers\User\UserDashboardController;
use App\Http\Controllers\Auth\AuthenticatedSessionController; 
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\DepositController;
use App\Http\Controllers\KelolaDepositController;
use App\Http\Controllers\PriceListController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\MutasiQrisController;
use App\Http\Controllers\WalletController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\AccountSettingsController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\InputTypeController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\BrandCategoryController;
use App\Http\Controllers\TypeController;
use App\Http\Controllers\BarangController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\User\AffiliatorController;
use App\Http\Controllers\AffiliateProductController;
use App\Http\Controllers\User\AffiliateHistoryController;
use App\Http\Controllers\User\AffiliateDashboardController;
use App\Http\Controllers\User\PoinmuHistoryController;
use App\Http\Controllers\User\PoinmuController;
use App\Http\Controllers\User\BalanceMutationController;
use App\Http\Controllers\User\UserProductController;
use App\Http\Controllers\PrivacyPolicyController;
use App\Http\Controllers\WelcomeController;

Route::get('/reset-password-success', function () {
    return Inertia::render('Auth/ResetPasswordSuccess');
})->name('reset.password.success');

Route::get('/', [WelcomeController::class, 'index']);

Route::get('/privacy-policy', [PrivacyPolicyController::class, 'index'])->name('privacy');

Route::post('/auth/verify-password', [TransactionController ::class, 'verifyPassword'])->middleware('auth');

Route::get('/checkout', [UserProductController::class, 'checkout'])->name('checkout');

Route::post('/c={category}/detect-operator', [UserProductController::class, 'detectOperator'])
    ->name('category.detect.operator');

Route::get('/c={category}', [UserProductController::class, 'showBrand'])
    ->name('category.show.brand');
    
Route::get('/c={categoryName}/b={brandName}', [UserProductController::class, 'showTypeOrProducts'])
    ->name('user.showType');

Route::get('/c={categoryName}/b={brandName}/t={typeName}', [UserProductController::class, 'showTypeOrProducts'])
    ->name('category.brand.type.products');


Route::middleware(['auth'])->group(function () {
    Route::get('balance-mutation', [BalanceMutationController::class, 'index'])->name('user.balance-mutation.index');
    Route::get('balance-mutation/{id}', [BalanceMutationController::class, 'show'])->name('user.balance-mutation.show');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/poinmu', [PoinmuController::class, 'index'])->name('poinmu.dashboard');
    Route::post('/poinmu/redeem', [PoinmuController::class, 'redeem'])->name('poinmu.redeem');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/poinmu-history', [PoinmuHistoryController::class, 'index'])->name('poinmu.history');
    Route::get('/poinmu-history/{id}', [PoinmuHistoryController::class, 'show'])->name('poinmu.history.detail');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/affiliate-dashboard', [AffiliateDashboardController::class, 'index'])
        ->name('affiliate.dashboard');
});

Route::middleware(['auth'])->group(function () {
    // Untuk user biasa, hanya berdasarkan user yang login
    Route::get('/affiliate-history', [AffiliateHistoryController::class, 'show'])
        ->name('affiliate.history');

    // Untuk admin & super-admin, bisa akses dengan affiliator_id
    Route::middleware(['super-admin'])->group(function () {
        Route::get('/affiliate-history/{affiliator_id}', [AffiliateHistoryController::class, 'showForAdmin'])
            ->name('affiliate.history.admin');
    });
});

Route::get('/affiliate-products', [AffiliateProductController::class, 'index'])->name('affiliate.products.index');
Route::get('/affiliate-products/{id}', [AffiliateProductController::class, 'show'])->name('affiliate.products.show');


Route::middleware(['auth'])->group(function () {
    Route::get('/affiliator', [AffiliatorController::class, 'index'])->name('affiliator.index');
    Route::post('/affiliator/save', [AffiliatorController::class, 'save'])->name('affiliator.save');
});

Route::middleware(['auth'])->group(function () {
    // Menampilkan halaman verifikasi email
    Route::get('/email/verify', [EmailVerificationController::class, 'show'])
        ->name('verification.email');
    // Mengirim ulang link verifikasi
    Route::post('/email/verification-notification', [EmailVerificationController::class, 'send'])
        ->name('verification.send');

    Route::get('/account', [AccountSettingsController::class, 'index'])->name('account.settings');
    Route::post('/account', [AccountSettingsController::class, 'update'])->name('account.settings.update');
    
    Route::get('/deposit', [DepositController::class, 'index'])->name('deposit-history');
    Route::get('/deposit/create', [DepositController::class, 'create'])->name('deposit-create');
    Route::post('/deposit', [DepositController::class, 'store'])->name('deposit-store');
    Route::post('/deposit/confirm/{id}', [DepositController::class, 'confirm'])->name('deposit-confirm');
    Route::post('/deposit/upload-proof/{id}', [DepositController::class, 'uploadProof'])->name('deposit.uploadProof');
    Route::get('/proof-of-payment/{id}', [DepositController::class, 'getProofOfPayment'])->name('proof.get');
    
    Route::get('/products/free-fire', [PriceListController::class, 'showFreeFireProducts'])->name('products.freefire');

    Route::post('/transactions', [TransactionController::class, 'makeTransaction']);
    Route::get('/balance', [TransactionController::class, 'getBalance']);
    Route::post('/transactions/completed', [TransactionController::class, 'getCompletedTransactions'])
        ->name('transactions.completed');

    Route::get('/history', [TransactionController::class, 'historyPage']);
    Route::post('/transactions/update-status', [TransactionController::class, 'updateTransactionStatus']);

    Route::get('/store/edit', [StoreController::class, 'edit'])->name('store.edit');
    Route::post('/store/update', [StoreController::class, 'update'])->name('store.update');

    Route::get('/user/dashboard', [UserDashboardController::class, 'index'])->name('user.dashboard');

    Route::get('/profile', [ProfileController::class, 'index'])->name('profile');
});

Route::post('/webhook', [TransactionController::class, 'webhookHandler']);

Route::get('/products', [PriceListController::class, 'showAllProducts']);

Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/admin/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/history/{ref_id}', function ($ref_id) {
        $user = auth()->user();

        // Cek apakah user adalah admin atau super admin
        $isAdmin = $user->hasRole('admin') || $user->hasRole('super-admin');

        // Jika admin, ambil semua transaksi, jika bukan, hanya ambil transaksi miliknya
        $transactions = $isAdmin
            ? \App\Models\TransactionsHistory::all()
            : \App\Models\TransactionsHistory::where('user_id', $user->id)->get();

        // Ambil informasi toko
        $store = \App\Models\Store::first();

        return Inertia::render('HistoryDetail', [
            'transactions' => $transactions,
            'params' => ['ref_id' => $ref_id],
            'store' => $store ? [
                'name' => $store->name,
                'address' => $store->address,
                'phone_number' => $store->phone_number,
                'image' => $store->image ? asset('storage/' . $store->image) : null,
            ] : null,
        ]);
    });
});


Route::middleware(['admin-or-super-admin'])->group(function () {
    Route::get('/admin/deposits', [KelolaDepositController::class, 'index'])->name('admin.deposit');
    Route::post('/admin/deposit/confirm/{id}', [KelolaDepositController::class, 'confirm'])->name('admin.deposit.confirm');
    Route::post('/admin/deposit/cancel-confirm/{id}', [KelolaDepositController::class, 'cancelConfirm']);
    Route::get('/mutasi-qris', [MutasiQrisController::class, 'index'])->name('mutasi-qris.index');
    Route::get('/deposit-account', [AdminController::class, 'edit'])->name('admin.edit');
    Route::post('/deposit-account', [AdminController::class, 'update'])->name('admin.update');
});

Route::middleware(['super-admin'])->group(function () {
    // Halaman edit QRIS
    Route::get('/qris', [AdminController::class, 'editQris'])->name('admin.editQris');
    // Update data QRIS (untuk super admin)
    Route::post('/qris', [AdminController::class, 'updateQris'])->name('admin.updateQris');
    Route::get('/manage-categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::post('/manage-categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::post('/manage-categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::delete('/manage-categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');
    Route::get('/manage-categories/sync', [CategoryController::class, 'syncCategories'])->name('categories.sync');
    Route::get('/manage-input-types', [InputTypeController::class, 'index'])->name('input-types.index');
    Route::post('/manage-input-types', [InputTypeController::class, 'store'])->name('input-types.store');
    Route::post('/manage-input-types/{inputType}', [InputTypeController::class, 'update'])->name('input-types.update');
    Route::delete('/manage-input-types/{inputType}', [InputTypeController::class, 'destroy'])->name('input-types.destroy');
    Route::get('/manage-brands/sync', [BrandController::class, 'syncBrands'])->name('brands.sync');
    Route::get('/manage-brands', [BrandController::class, 'index'])->name('brands.index');
    Route::post('/manage-brands', [BrandController::class, 'store'])->name('brands.store');
    Route::post('/manage-brands/{brand}', [BrandController::class, 'update'])->name('brands.update');
    Route::delete('/manage-brands/{brand}', [BrandController::class, 'destroy'])->name('brands.destroy');
    Route::get('/manage-types', [TypeController::class, 'index'])->name('types.index');
    Route::post('/manage-types', [TypeController::class, 'store'])->name('types.store');
    Route::post('/manage-types/{type}', [TypeController::class, 'update'])->name('types.update');
    Route::delete('/manage-types/{type}', [TypeController::class, 'destroy'])->name('types.destroy');
    Route::get('/manage-types/sync', [TypeController::class, 'syncTypes'])->name('types.sync');
    Route::get('/manage-products/sync', [BarangController::class, 'syncBarangs'])->name('products.sync');
    Route::get('/manage-products', [BarangController::class, 'index'])->name('products.index');
    Route::post('/manage-product-detail', [ProductController::class, 'store'])->name('product.store');
    Route::post('/manage-product-detail/{id}', [ProductController::class, 'update'])->name('product.update');
    Route::get('/manage-product-detail/{id?}', [ProductController::class, 'index'])->name('product.index');
    Route::delete('/manage-product-detail/{id}', [ProductController::class, 'destroy'])->name('product.destroy');;

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