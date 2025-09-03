<?php

require __DIR__ . '/vendor/autoload.php'; // Autoload composer
$app = require_once __DIR__ . '/bootstrap/app.php'; // Bootstrap Laravel

$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Import semua service yang dibutuhkan
use App\Services\MutasiQrisService;
use App\Services\PriceListService;
use App\Services\TransactionUpdateService;
use App\Services\PostpaidProductService;
use App\Services\PostpaidTransactionUpdateService; // <-- 1. IMPORT SERVICE BARU

// Fungsi untuk menjalankan service
function runMutasiQrisService()
{
    try {
        $service = new MutasiQrisService();
        $result = $service->syncData();
        echo "Mutasi QRIS Service: " . $result . PHP_EOL;
    } catch (\Exception $e) {
        echo "Error Mutasi QRIS Service: " . $e->getMessage() . PHP_EOL;
    }
}

function runPriceListService()
{
    try {
        $service = new PriceListService();
        $result = $service->fetchAndUpdatePriceList();

        if ($result) {
            echo "Price List Service: Data berhasil diperbarui." . PHP_EOL;
        } else {
            echo "Price List Service: Tidak perlu diperbarui atau terjadi kesalahan." . PHP_EOL;
        }
    } catch (\Exception $e) {
        echo "Error Price List Service: " . $e->getMessage() . PHP_EOL;
    }
}

function runTransactionUpdateService()
{
    try {
        $service = new \App\Services\TransactionUpdateService();
        
        // Update transaksi pending (PREPAID)
        $resultTransactions = $service->updatePendingTransactions();
        echo "Prepaid Transaction Update Service: " . $resultTransactions . PHP_EOL;

        // Update affiliate history setelah update transaksi
        $service->updateAffiliateHistoryStatus();
        echo "Affiliate History status update completed." . PHP_EOL;

    } catch (\Exception $e) {
        echo "Error Prepaid Transaction Update Service: " . $e->getMessage() . PHP_EOL;
    }
}

function runPostpaidFetchService()
{
    try {
        $service = new PostpaidProductService();
        $success = $service->fetchAndUpdateProducts();
        
        if ($success) {
            echo "Postpaid Product Service: Produk berhasil diperbarui." . PHP_EOL;
        } else {
            echo "Postpaid Product Service: Gagal memperbarui produk." . PHP_EOL;
        }
    } catch (\Exception $e) {
        echo "Error Postpaid Product Service: " . $e->getMessage() . PHP_EOL;
    }
}

// 2. BUAT FUNGSI BARU UNTUK MENJALANKAN SERVICE POSTPAID
function runPostpaidTransactionUpdateService()
{
    try {
        $service = new PostpaidTransactionUpdateService();
        $result = $service->updatePendingTransactions();
        echo "Postpaid Transaction Update Service: " . $result . PHP_EOL;
    } catch (\Exception $e) {
        echo "Error Postpaid Transaction Update Service: " . $e->getMessage() . PHP_EOL;
    }
}

runMutasiQrisService();
runPriceListService();
runTransactionUpdateService();
runPostpaidFetchService();
runPostpaidTransactionUpdateService();