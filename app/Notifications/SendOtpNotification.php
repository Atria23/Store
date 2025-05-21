<?php

// app/Notifications/SendOtpNotification.php
namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class SendOtpNotification extends Notification
{
    public $otp;

    public function __construct($otp)
    {
        $this->otp = $otp;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Kode OTP Login Anda')
            ->line("Gunakan kode berikut untuk melanjutkan login:")
            ->line("**{$this->otp}**")
            ->line('Kode berlaku selama 5 menit.');
    }
}
