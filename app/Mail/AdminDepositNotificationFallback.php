<?php

// app/Mail/AdminDepositNotificationFallback.php

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

    public function __construct($amount, $notes, $accountNumber, $bank)
    {
        $this->amount = $amount;
        $this->notes = $notes;
        $this->accountNumber = $accountNumber;
        $this->bank = $bank;
    }

    public function build()
    {
        return $this->subject('PERINGATAN: Saldo Digiflazz Tidak Cukup')
                    ->view('emails.admin-deposit-fallback');
    }
}
