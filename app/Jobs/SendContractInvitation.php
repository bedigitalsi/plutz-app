<?php

namespace App\Jobs;

use App\Models\Contract;
use App\Models\Setting;
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

        $signingUrl = route('contracts.sign', $this->token);

        $body = __('email.contract_invitation_body', [
            'name' => $this->contract->client_name,
            'url' => $signingUrl,
        ]);
        $subject = __('email.contract_invitation_subject') . ' - Plutz';

        Mail::raw($body, function ($message) use ($subject) {
            $message->to($this->contract->client_email)
                ->subject($subject);

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
