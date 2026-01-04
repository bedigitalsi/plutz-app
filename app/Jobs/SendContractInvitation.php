<?php

namespace App\Jobs;

use App\Models\Contract;
use App\Support\MailSettings;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendContractInvitation implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public Contract $contract,
        public string $token
    ) {}

    public function handle(): void
    {
        // Apply mail settings from database
        MailSettings::apply();
        
        $signingUrl = route('contracts.sign', $this->token);

        Mail::raw("Dear {$this->contract->client_name},\n\nPlease sign the contract by visiting:\n{$signingUrl}\n\nThank you,\nPlutz", function ($message) {
            $message->to($this->contract->client_email)
                ->subject('Contract Signing Request - Plutz');
            
            // Apply from overrides if enabled
            if (MailSettings::shouldForceFrom() || MailSettings::shouldForceFromName()) {
                $message->from(
                    MailSettings::getFromAddress(),
                    MailSettings::getFromName()
                );
            }
            
            // Apply return path if enabled
            if (MailSettings::shouldSetReturnPath()) {
                $message->returnPath(MailSettings::getFromAddress());
            }
        });
    }
}
