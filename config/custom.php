<?php

return [
    'admin_deposit_emails' => explode(',', env('ADMIN_DEPOSIT_EMAILS')),
    'manual_trancastions_emails' => explode(',', env('MANUAL_TRANSACTIONS_EMAILS')),
];
