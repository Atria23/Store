<?php

// namespace App\Mail;

// use Illuminate\Bus\Queueable;
// use Illuminate\Mail\Mailable;
// use Illuminate\Queue\SerializesModels;

// class AdminDepositNotificationFallback extends Mailable
// {
//     use Queueable, SerializesModels;

//     public $amount;
//     public $notes;
//     public $accountNumber;
//     public $bank;
//     public $ownerName; // 🆕

//     public function __construct($amount, $notes, $accountNumber, $bank, $ownerName)
//     {
//         $this->amount = $amount;
//         $this->notes = $notes;
//         $this->accountNumber = $accountNumber;
//         $this->bank = $bank;
//         $this->ownerName = $ownerName; // 🆕
//     }

//     public function build()
//     {
//         return $this->subject('PERINGATAN: SEGERA TOP UP SALDO ADMIN')
//                     ->view('emails.admin-deposit-fallback');
//     }
// }



namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AdminDepositNotificationFallback extends Mailable
{
    use Queueable, SerializesModels;

    public $amount;
    public $notes;
    public $accountNumber;
    public $bank;
    public $ownerName;
    public $paymentMethod; // 🆕

    public function __construct($amount, $notes, $accountNumber, $bank, $ownerName, $paymentMethod)
    {
        $this->amount = $amount;
        $this->notes = $notes;
        $this->accountNumber = $accountNumber;
        $this->bank = $bank;
        $this->ownerName = $ownerName;
        $this->paymentMethod = $paymentMethod; // 🆕
    }

    public function build()
    {
        return $this->subject('PERINGATAN: SEGERA TOP UP SALDO ADMIN')
                    ->view('emails.admin-deposit-fallback');
    }
}
