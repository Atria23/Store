<?php

// require __DIR__ . '/vendor/autoload.php'; // Autoload composer
// $app = require_once __DIR__ . '/bootstrap/app.php'; // Bootstrap Laravel

// $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// // Import semua service yang dibutuhkan
// use App\Services\MutasiQrisService;
// use App\Services\PriceListService;

// // Fungsi untuk menjalankan service
// function runMutasiQrisService()
// {
//     try {
//         $service = new MutasiQrisService();
//         $result = $service->syncData();
//         echo "Mutasi QRIS Service: " . $result . PHP_EOL;
//     } catch (\Exception $e) {
//         echo "Error Mutasi QRIS Service: " . $e->getMessage() . PHP_EOL;
//     }
// }

// function runPriceListService()
// {
//     try {
//         $service = new PriceListService();
//         $result = $service->fetchAndUpdatePriceList();

//         if ($result) {
//             echo "Price List Service: Data berhasil diperbarui." . PHP_EOL;
//         } else {
//             echo "Price List Service: Tidak perlu diperbarui atau terjadi kesalahan." . PHP_EOL;
//         }
//     } catch (\Exception $e) {
//         echo "Error Price List Service: " . $e->getMessage() . PHP_EOL;
//     }
// }

// // Panggil semua service
// runMutasiQrisService();
// runPriceListService();





require __DIR__ . '/vendor/autoload.php'; // Autoload composer
$app = require_once __DIR__ . '/bootstrap/app.php'; // Bootstrap Laravel

$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Import semua service yang dibutuhkan
use App\Services\MutasiQrisService;
use App\Services\PriceListService;
use App\Services\TransactionUpdateService;

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
        $service = new TransactionUpdateService();
        $result = $service->updatePendingTransactions();
        echo "Transaction Update Service: " . $result . PHP_EOL;
    } catch (\Exception $e) {
        echo "Error Transaction Update Service: " . $e->getMessage() . PHP_EOL;
    }
}

// Panggil semua service
runMutasiQrisService();
runPriceListService();
runTransactionUpdateService();
