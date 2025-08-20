<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class QrisConverterController extends Controller
{
    public function index()
    {
        return Inertia::render('QrisConverter');
    }

    public function convert(Request $request)
    {
        $request->validate([
            'qris' => 'required|string',
            'amount' => 'required|numeric|min:1',
            'fee_type' => 'nullable|in:r,p',
            'fee_value' => 'nullable|numeric|min:0',
        ]);

        $qris = substr($request->qris, 0, -4);
        $step1 = str_replace("010211", "010212", $qris);
        $step2 = explode("5802ID", $step1);
        $amount = $request->amount;

        $uang = "54" . sprintf("%02d", strlen($amount)) . $amount;

        if ($request->fee_type && $request->fee_value) {
            if ($request->fee_type === 'r') {
                $uang .= "55020256" . sprintf("%02d", strlen($request->fee_value)) . $request->fee_value;
            } elseif ($request->fee_type === 'p') {
                $uang .= "55020357" . sprintf("%02d", strlen($request->fee_value)) . $request->fee_value;
            }
        }

        $uang .= "5802ID";
        $fix = trim($step2[0]) . $uang . trim($step2[1]);
        $fix .= $this->convertCRC16($fix);

        return response()->json([
            'result' => $fix,
        ]);
    }

    private function convertCRC16($str)
    {
        $crc = 0xFFFF;
        for ($c = 0; $c < strlen($str); $c++) {
            $crc ^= ord($str[$c]) << 8;
            for ($i = 0; $i < 8; $i++) {
                if ($crc & 0x8000) {
                    $crc = ($crc << 1) ^ 0x1021;
                } else {
                    $crc <<= 1;
                }
            }
        }
        $hex = strtoupper(dechex($crc & 0xFFFF));
        return str_pad($hex, 4, '0', STR_PAD_LEFT);
    }
}