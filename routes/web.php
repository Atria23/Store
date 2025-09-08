<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Apps\PermissionController;
use App\Http\Controllers\Apps\RoleController;
use App\Http\Controllers\UserController;
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
use App\Http\Controllers\ManageAffiliatorController;

use App\Http\Controllers\User\AffiliatorController;
use App\Http\Controllers\AffiliateProductController;
use App\Http\Controllers\User\AffiliateHistoryController;
use App\Http\Controllers\User\AffiliateDashboardController;
use App\Http\Controllers\User\PoinmuHistoryController;
use App\Http\Controllers\User\PoinmuController;
use App\Http\Controllers\User\BalanceMutationController;
use App\Http\Controllers\User\UserProductController;
use App\Http\Controllers\User\AffiliateFriendController;
use App\Http\Controllers\PrivacyPolicyController;
use App\Http\Controllers\WelcomeController;
use Illuminate\Http\Request;
use App\Http\Controllers\DepositAdminController;
use Illuminate\Support\Facades\Mail;
use App\Mail\AdminDepositNotification;
use App\Models\Deposit;

use App\Http\Controllers\Auth\OtpController;
use App\Http\Controllers\Guest\GuestDashboardController;
use App\Http\Controllers\QrisConverterController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PascaPlnController;
use App\Http\Controllers\PascaBpjsController;
use App\Http\Controllers\PostpaidController;
use App\Http\Controllers\PascaPdamController;
use App\Http\Controllers\PostpaidHistoryController;


Route::middleware(['auth'])->group(function () {
    Route::get('/postpaid-history', [PostpaidHistoryController::class, 'index'])->name('postpaid.history.index');
    Route::get('/postpaid-history/{ref_id}', [PostpaidHistoryController::class, 'show'])->name('postpaid.history.show');
});

Route::middleware(['auth', 'otp.not.expired'])->group(function () {
    Route::get('/pdam', [PascaPdamController::class, 'index'])->name('pdam.index');
    Route::post('/pdam/inquiry', [PascaPdamController::class, 'inquiry'])->name('pascapdam.inquiry');
    Route::post('/pdam/payment', [PascaPdamController::class, 'payment'])->name('pascapdam.payment');

    Route::get('/bpjs', function () {
        return Inertia::render('Pascabayar/Bpjs'); // Path view disesuaikan
    })->name('pascabpjs.index');

    Route::post('/bpjs/inquiry', [PascaBpjsController::class, 'inquiry'])->name('pascabpjs.inquiry');
    Route::post('/bpjs/payment', [PascaBpjsController::class, 'payment'])->name('pascabpjs.payment');
    
    Route::middleware(['auth', 'verified'])->prefix('user')->name('user.')->group(function () {
        Route::resource('redeem-accounts', \App\Http\Controllers\User\RedeemAccountController::class)
            ->only(['index', 'store', 'update', 'destroy']);
    });
    Route::get('/pln', function () {
        return Inertia::render('Pascabayar/Pln'); // Menggunakan folder agar rapi
    })->name('index');

    // Endpoint untuk proses Cek Tagihan (Inquiry)
    Route::post('/pln/inquiry', [PascaPlnController::class, 'inquiry'])->name('pln.pasca.inquiry');

    // Endpoint untuk proses Bayar Tagihan (Payment)
    Route::post('/pln/payment', [PascaPlnController::class, 'payment'])->name('pln.pasca.payment');

    // Menampilkan halaman verifikasi email
    Route::get('/email/verify', [EmailVerificationController::class, 'show'])
        ->name('verification.email');
    // Mengirim ulang link verifikasi
    Route::post('/email/verification-notification', [EmailVerificationController::class, 'send'])
        ->name('verification.send');

    Route::get('/account', [AccountSettingsController::class, 'index'])->name('account.settings');
    Route::post('/account', [AccountSettingsController::class, 'update'])->name('account.settings.update');
    
    Route::get('/deposit', [DepositController::class, 'index'])->name('deposit.history');
    Route::get('/deposit/create', [DepositController::class, 'create'])->name('deposit.create');
    Route::post('/deposit', [DepositController::class, 'store'])->name('deposit.store');
    Route::post('/deposit/confirm/{id}', [DepositController::class, 'confirm'])->name('deposit-confirm');
    Route::post('/deposit/upload-proof/{id}', [DepositController::class, 'uploadProof'])->name('deposit.uploadProof');
    Route::get('/proof-of-payment/{id}', [DepositController::class, 'getProofOfPayment'])->name('proof.get');
    Route::get('/deposit/{id}', [DepositController::class, 'show'])->name('deposit.show');

    Route::get('/products/free-fire', [PriceListController::class, 'showFreeFireProducts'])->name('products.freefire');

    Route::post('/transactions', [TransactionController::class, 'makeTransaction']);
    Route::get('/balance', [TransactionController::class, 'getBalance']);
    Route::post('/transactions/completed', [TransactionController::class, 'getCompletedTransactions'])
        ->name('transactions.completed');

    Route::get('/history', [TransactionController::class, 'historyPage'])->name('history');

    Route::get('/store/edit', [StoreController::class, 'edit'])->name('store.edit');
    Route::post('/store/update', [StoreController::class, 'update'])->name('store.update');

    Route::get('/dashboard', [UserDashboardController::class, 'index'])->name('user.dashboard');

    Route::get('/profile', [ProfileController::class, 'index'])->name('profile');
    Route::get('/affiliator', [AffiliatorController::class, 'index'])->name('affiliator.index');
    Route::post('/affiliator/save', [AffiliatorController::class, 'save'])->name('affiliator.save');
    
    Route::get('/affiliate-dashboard', [AffiliateDashboardController::class, 'index'])
        ->name('affiliate.dashboard');
    Route::get('/poinmu-history', [PoinmuHistoryController::class, 'index'])->name('poinmu.history');
    Route::get('/poinmu-history/{id}', [PoinmuHistoryController::class, 'show'])->name('poinmu.history.detail');
    Route::get('/poinmu', [PoinmuController::class, 'index'])->name('poinmu.dashboard');
    Route::post('/poinmu/redeem', [PoinmuController::class, 'redeem'])->name('poinmu.redeem');
    Route::get('balance-mutation', [BalanceMutationController::class, 'index'])->name('user.balance-mutation.index');
    Route::get('balance-mutation/{id}', [BalanceMutationController::class, 'show'])->name('user.balance-mutation.show');
    Route::get('/affiliate-history', [AffiliateHistoryController::class, 'show'])
        ->name('affiliate.history');
    Route::get('/affiliate-history/{id}', [AffiliateHistoryController::class, 'showDetail'])->name('affiliate.history.detail');
    Route::get('/affiliator/friends', [AffiliateFriendController::class, 'index'])->name('affiliate.friends');

    Route::get('/history/{ref_id}', function ($ref_id) {
        $user = auth()->user();
    
        // Cek apakah user adalah admin atau super admin
        $isAdmin = $user->hasRole('admin') || $user->hasRole('super-admin');
    
        // Jika admin, ambil semua transaksi, jika bukan, hanya ambil transaksi miliknya
        $transactions = $isAdmin
            ? \App\Models\TransactionsHistory::all()
            : \App\Models\TransactionsHistory::where('user_id', $user->id)->get();
    
        // Ambil store milik user (jika ada relasi)
        $store = $user->store;
    
        return Inertia::render('User/HistoryDetail', [
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

Route::get('/payment', [PaymentController::class, 'show'])->name('payment.show');
Route::post('/payment/process', [PaymentController::class, 'process'])->name('payment.process');
Route::get('/payment/success', [PaymentController::class, 'success'])->name('payment.success');

Route::get('/qris-converter', [QrisConverterController::class, 'index'])->name('qris.index');
Route::post('/qris-converter', [QrisConverterController::class, 'convert'])->name('qris.convert');

Route::get('/deposit/tutorial', [DepositController::class, 'tutorial'])->name('deposit.tutorial');


Route::middleware('guest')->group(function () {
    Route::get('/guest-dashboard', [GuestDashboardController::class, 'index'])->name('guest.dashboard');

// web.php
Route::get('/otp', [OtpController::class, 'showForm'])->name('otp.form');
    Route::post('/otp', [OtpController::class, 'verify'])->name('otp.verify');
    // routes/web.php
Route::post('/otp/resend', [OtpController::class, 'resend'])->name('otp.resend');

});

Route::middleware(['auth', 'admin'])->get('/admin/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
    
Route::post('/deposit/check-expired', [\App\Http\Controllers\DepositController::class, 'checkAndExpire']);

Route::post('/check-referral', function (Request $request) {
    $request->validate(['referral_code' => 'required|string']);

    $code = strtolower($request->referral_code);
    $exists = \App\Models\User\Affiliator::whereRaw('LOWER(referral_code) = ?', [$code])->exists();

    return response()->json(['valid' => $exists]);
});

Route::get('/reset-password-success', function () {
    return Inertia::render('Auth/ResetPasswordSuccess');
})->name('reset.password.success');

Route::get('/about', function () {
    return Inertia::render('About');
})->name('about');

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


// Route::get('/affiliate-products', [AffiliateProductController::class, 'index'])->name('affiliate.products.index');
Route::get('/affiliate-products/{id}', [AffiliateProductController::class, 'show'])->name('affiliate.products.show');

Route::post('/transactions/update-status', [TransactionController::class, 'updateTransactionStatus']);

Route::post('/webhook', [TransactionController::class, 'webhookHandler']);

Route::middleware(['admin-or-super-admin', 'otp.not.expired'])->group(function () {
    Route::get('/admin/deposits', [KelolaDepositController::class, 'index'])->name('admin.deposit');
    Route::post('/admin/deposit/confirm/{id}', [KelolaDepositController::class, 'confirm'])->name('admin.deposit.confirm');
    Route::post('/admin/deposit/cancel-confirm/{id}', [KelolaDepositController::class, 'cancelConfirm']);
    Route::get('/deposit-account', [AdminController::class, 'edit'])->name('admin.edit');
    Route::post('/deposit-account', [AdminController::class, 'update'])->name('admin.update');
});

Route::middleware(['super-admin', 'otp.not.expired'])->group(function () {
    Route::get('/postpaid-products', [PostpaidController::class, 'index'])->name('postpaid.index');
    Route::get('/postpaid-products/bulk-edit', [PostpaidController::class, 'bulkEditPage'])->name('postpaid.bulk-edit');
    Route::post('/postpaid-products/bulk-update', [PostpaidController::class, 'bulkUpdate'])->name('postpaid.bulk-update');
    Route::post('/postpaid-products/fetch', [PostpaidController::class, 'fetchProducts'])->name('postpaid.fetch');
    Route::post('/postpaid-products/{postpaidProduct}', [PostpaidController::class, 'update'])->name('postpaid.update');
    
    Route::get('/manage-poinmu-history', [PoinmuHistoryController::class, 'manage'])->name('poinmu.manage');
    Route::put('/poinmu-history/{id}/status', [PoinmuHistoryController::class, 'updateStatus'])->name('poinmu.updateStatus');

    Route::get('/mutasi-qris', [MutasiQrisController::class, 'index'])->name('mutasi-qris.index');
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
    Route::get('/manage-history', [HistoryController::class, 'getAllHistory'])->name('manage.history');
    Route::get('/deposit-admin', [DepositAdminController::class, 'create'])->name('deposit-admin.create');
    Route::post('/deposit-admin', [DepositAdminController::class, 'store'])->name('deposit-admin.store');
    Route::get('/manage-affiliators', [ManageAffiliatorController::class, 'index'])->name('manage-affiliators');
    Route::post('/barang/bulk-update', [BarangController::class, 'bulkUpdate'])->name('barang.bulk-update');
    Route::post('/brands/bulk-update', [BrandController::class, 'bulkUpdate'])->name('brands.bulk-update');
    Route::post('/types/bulk-update', [TypeController::class, 'bulkUpdate'])->name('types.bulk-update');
    Route::post('/transactions/update', [TransactionController::class, 'update']);
        Route::get('/mimin/dashboard', [DashboardController::class, 'index'])->name('mimin.dashboard');
    

    Route::get('/affiliate-history/user={affiliator_id}', [AffiliateHistoryController::class, 'showForAdmin'])
            ->name('affiliate.history.admin');

    Route::resource('/manage-users', UserController::class)
        ->parameters(['manage-users' => 'user']) // <- ubah parameter jadi 'user'
        ->except('show')
        ->names([
            'index'   => 'manage-users.index',
            'create'  => 'manage-users.create',
            'store'   => 'manage-users.store',
            'edit'    => 'manage-users.edit',
            'update'  => 'manage-users.update',
            'destroy' => 'manage-users.destroy',
        ]);

});

require __DIR__.'/auth.php';