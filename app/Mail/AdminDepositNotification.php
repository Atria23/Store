<?php

namespace App\Mail;

use App\Models\Deposit;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AdminDepositNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $deposit;
    public $type;

    public function __construct(Deposit $deposit, string $type = 'request')
    {
        $this->deposit = $deposit;
        $this->type = $type; // 'request' atau 'proof'
    }

    public function build()
    {
        $subject = $this->type === 'proof'
            ? 'Bukti Pembayaran Telah Diupload'
            : 'Permintaan Deposit Baru Masuk';

        return $this->subject($subject)
                    ->view('emails.admin_deposit_notification');
    }
}
