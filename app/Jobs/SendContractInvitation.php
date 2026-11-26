<?php

namespace App\Jobs;

use App\Models\Contract;
use App\Models\Setting;
use App\Support\ContractEmail;
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
        public string $token,
        public ?string $recipientEmail = null,
        public ?string $recipientName = null,
    ) {}

    public function handle(): void
    {
        // Skip if email sending is disabled
        if (!MailSettings::isEnabled()) {
            return;
        }

        // Set locale to app default for emails
        $locale = Setting::getString('default_locale', 'en');
        if (!in_array($locale, ['en', 'sl'])) {
            $locale = 'en';
        }
        app()->setLocale($locale);

        // Apply mail settings from database
        MailSettings::apply();

        $recipientName = $this->recipientName ?? $this->contract->client_name;
        $recipientEmail = $this->recipientEmail ?? $this->contract->client_email;

        $data = ContractEmail::invitationData($this->contract, $this->token, $recipientEmail, $recipientName);
        $subject = ContractEmail::invitationSubject($this->contract);

        Mail::send(['html' => 'emails.contract-invitation', 'text' => 'emails.contract-invitation-text'], $data, function ($message) use ($subject, $recipientEmail) {
            $message->to($recipientEmail)
                ->subject($subject)
                ;
            $message->getSymfonyMessage()->getHeaders()->addTextHeader('X-Email-Type', 'contract_invitation');

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
