<?php

// namespace App\Http\Controllers;

// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Http;
// use Illuminate\Support\Facades\Auth; // Untuk autentikasi
// use App\Models\User; // Model User untuk memanipulasi data user
// use App\Models\Transaction; // Pastikan Model Transaction sudah ada
// use App\Models\Product; // Model untuk mengambil data produk

// class TransactionController extends Controller
// {
//     public function getBalance()
//     {
//         $user = Auth::user();
    
//         if (!$user) {
//             return response()->json(['message' => 'User not authenticated'], 401);
//         }
    
//         return response()->json(['balance' => $user->balance], 200);
//     }
    
//     public function makeTransaction(Request $request)
//     {
//         $user = Auth::user();

//         if (!$user) {
//             return response()->json(['message' => 'User not authenticated'], 401);
//         }

//         $username = env('P_U');
//         $apiKey = env('P_AK');
//         $ref_id = uniqid();
//         $buyer_sku_code = $request->input('buyer_sku_code');
//         $customer_no = $request->input('customer_no');
//         $price = $request->input('price');
//         $sign = md5($username . $apiKey . $ref_id);

//         // Ambil data produk dari tabel products berdasarkan buyer_sku_code
//         $product = Product::where('buyer_sku_code', $buyer_sku_code)->first();

//         if (!$product) {
//             return response()->json([
//                 'message' => 'Product not found',
//             ], 404);
//         }

//         // Ambil price_product dan product_name dari produk yang ditemukan
//         $price_product = $product->price;
//         $product_name = $product->product_name;

//         // Periksa apakah saldo cukup untuk melakukan transaksi berdasarkan price_product
//         if ($user->balance < $price_product) {
//             // Simpan transaksi gagal ke database
//             Transaction::create([
//                 'user_id' => $user->id, // Catat user_id
//                 'ref_id' => $ref_id,
//                 'buyer_sku_code' => $buyer_sku_code,
//                 'customer_no' => $customer_no,
//                 'status' => 'Failed',
//                 'price' => $price,
//                 'price_product' => $price_product, // Simpan price_product
//                 'product_name' => $product_name, // Simpan product_name
//                 'rc' => 'INSUFFICIENT_BALANCE',
//                 'sn' => null,
//                 'buyer_last_saldo' => $user->balance,
//                 'message' => 'Insufficient balance',
//             ]);

//             return response()->json([
//                 'message' => 'Insufficient balance',
//                 'balance' => $user->balance,
//             ], 400);
//         }

//         $data = [
//             'username' => $username,
//             'buyer_sku_code' => $buyer_sku_code,
//             'customer_no' => $customer_no,
//             'ref_id' => $ref_id,
//             'sign' => $sign,
//         ];

//         $response = Http::withHeaders([
//             'Content-Type' => 'application/json',
//         ])->post('https://api.digiflazz.com/v1/transaction', $data);

//         $responseData = $response->json();

//         // Simpan transaksi ke database, baik berhasil atau gagal
//         $transaction = Transaction::create([
//             'user_id' => $user->id, // Catat user_id
//             'ref_id' => $ref_id,
//             'buyer_sku_code' => $buyer_sku_code,
//             'customer_no' => $customer_no,
//             'status' => $responseData['data']['status'] ?? 'Failed',
//             'price' => $price,
//             'price_product' => $price_product, // Simpan price_product
//             'product_name' => $product_name, // Simpan product_name ke kolom transactions
//             'rc' => $responseData['data']['rc'] ?? 'UNKNOWN_ERROR',
//             'sn' => $responseData['data']['sn'] ?? null,
//             'buyer_last_saldo' => $response->successful() ? $user->balance - $price_product : $user->balance,
//             'message' => $responseData['data']['message'] ?? 'Transaction failed',
//         ]);

//         if ($response->successful()) {
//             // Kurangi saldo pengguna jika transaksi berhasil
//             $user->balance -= $price_product;
//             $user->save();

//             return response()->json([
//                 'message' => 'Transaction successful',
//                 'data' => $responseData['data'],
//                 'balance' => $user->balance,
//             ], 200);
//         } else {
//             return response()->json([
//                 'message' => 'Transaction failed',
//                 'data' => $responseData['data'] ?? null,
//                 'balance' => $user->balance,
//             ], $response->status());
//         }
//     }
// }





















namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // Untuk autentikasi
use GuzzleHttp\Client; // Import Guzzle Client
use App\Models\User; // Model User untuk memanipulasi data user
use App\Models\Transaction; // Pastikan Model Transaction sudah ada
use App\Models\Product; // Model untuk mengambil data produk

class TransactionController extends Controller
{
    public function getBalance()
    {
        $user = Auth::user();
    
        if (!$user) {
            return response()->json(['message' => 'User not authenticated'], 401);
        }
    
        return response()->json(['balance' => $user->balance], 200);
    }
    
    public function makeTransaction(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'User not authenticated'], 401);
        }

        $username = env('P_U');
        $apiKey = env('P_AK');
        $ref_id = uniqid();
        $buyer_sku_code = $request->input('buyer_sku_code');
        $customer_no = $request->input('customer_no');
        $price = $request->input('price');
        $sign = md5($username . $apiKey . $ref_id);

        // Ambil data produk dari tabel products berdasarkan buyer_sku_code
        $product = Product::where('buyer_sku_code', $buyer_sku_code)->first();

        if (!$product) {
            return response()->json([
                'message' => 'Product not found',
            ], 404);
        }

        // Ambil price_product dan product_name dari produk yang ditemukan
        $price_product = $product->price;
        $product_name = $product->product_name;

        // Periksa apakah saldo cukup untuk melakukan transaksi berdasarkan price_product
        if ($user->balance < $price_product) {
            // Simpan transaksi gagal ke database
            Transaction::create([
                'user_id' => $user->id, // Catat user_id
                'ref_id' => $ref_id,
                'buyer_sku_code' => $buyer_sku_code,
                'customer_no' => $customer_no,
                'status' => 'Failed',
                'price' => $price,
                'price_product' => $price_product, // Simpan price_product
                'product_name' => $product_name, // Simpan product_name
                'rc' => 'INSUFFICIENT_BALANCE',
                'sn' => null,
                'buyer_last_saldo' => $user->balance,
                'message' => 'Insufficient balance',
            ]);

            return response()->json([
                'message' => 'Insufficient balance',
                'balance' => $user->balance,
            ], 400);
        }

        $data = [
            'username' => $username,
            'buyer_sku_code' => $buyer_sku_code,
            'customer_no' => $customer_no,
            'ref_id' => $ref_id,
            'sign' => $sign,
        ];

        // Menggunakan Guzzle Client untuk melakukan POST request
        $client = new Client();

        try {
            $response = $client->post('https://api.digiflazz.com/v1/transaction', [
                'json' => $data,
                'headers' => [
                    'Content-Type' => 'application/json',
                ],
            ]);

            $responseData = json_decode($response->getBody(), true);

            // Simpan transaksi ke database, baik berhasil atau gagal
            $transaction = Transaction::create([
                'user_id' => $user->id, // Catat user_id
                'ref_id' => $ref_id,
                'buyer_sku_code' => $buyer_sku_code,
                'customer_no' => $customer_no,
                'status' => $responseData['data']['status'] ?? 'Failed',
                'price' => $price,
                'price_product' => $price_product, // Simpan price_product
                'product_name' => $product_name, // Simpan product_name ke kolom transactions
                'rc' => $responseData['data']['rc'] ?? 'UNKNOWN_ERROR',
                'sn' => $responseData['data']['sn'] ?? null,
                'buyer_last_saldo' => $response->getStatusCode() === 200 ? $user->balance - $price_product : $user->balance,
                'message' => $responseData['data']['message'] ?? 'Transaction failed',
            ]);

            if ($response->getStatusCode() === 200) {
                // Kurangi saldo pengguna jika transaksi berhasil
                $user->balance -= $price_product;
                $user->save();

                return response()->json([
                    'message' => 'Transaction successful',
                    'data' => $responseData['data'],
                    'balance' => $user->balance,
                ], 200);
            } else {
                return response()->json([
                    'message' => 'Transaction failed',
                    'data' => $responseData['data'] ?? null,
                    'balance' => $user->balance,
                ], $response->getStatusCode());
            }
        } catch (\Exception $e) {
            // Jika terjadi kesalahan pada saat request
            return response()->json([
                'message' => 'Transaction failed',
                'error' => $e->getMessage(),
                'balance' => $user->balance,
            ], 500);
        }
    }
}
