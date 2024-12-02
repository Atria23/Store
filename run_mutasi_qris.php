<?php

require __DIR__ . '/vendor/autoload.php'; // Autoload composer
$app = require_once __DIR__ . '/bootstrap/app.php'; // Bootstrap Laravel

$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Services\MutasiQrisService;

// Jalankan service
$service = new MutasiQrisService();
$result = $service->syncData();
echo $result;
