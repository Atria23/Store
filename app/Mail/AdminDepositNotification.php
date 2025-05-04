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

    public function __construct(Deposit $deposit, $type)
    {
        $this->deposit = $deposit;
        $this->type = $type;
    }

    public function build()
    {
        return $this->subject('New Deposit Request')
                    ->view('emails.admin_deposit_notification');
    }
}
