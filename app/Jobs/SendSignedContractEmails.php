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
use Illuminate\Support\Facades\Storage;

class SendSignedContractEmails implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public Contract $contract) {}

    public function handle(): void
    {
        // Skip if email sending is disabled
        if (!MailSettings::isEnabled()) {
            return;
        }

        $this->contract->refresh();
        $contract = $this->contract;

        // Try to obtain PDF path with a short refresh loop before releasing
        $pdfPath = null;
        $pdfFullPath = null;
        for ($i = 0; $i < 5; $i++) {
            $pdfPath = $contract->getSignedPdfPathAttribute();
            // Use Storage::disk('local')->path() to get the correct absolute path
            $pdfFullPath = $pdfPath ? Storage::disk('local')->path($pdfPath) : null;

            if ($pdfFullPath && file_exists($pdfFullPath)) {
                break;
            }

            // refresh and wait briefly before next attempt
            $contract->refresh();
            sleep(1);
        }

        if (!$pdfFullPath || !file_exists($pdfFullPath)) {
            // Wait for PDF to be generated
            $this->release(10); // Retry after 10 seconds
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

        $pdfContent = file_get_contents($pdfFullPath);

        // Send to client
        $clientBody = __('email.signed_contract_client_body', ['name' => $this->contract->client_name]);
        $clientSubject = __('email.signed_contract_client_subject') . ' - Plutz';

        Mail::raw($clientBody, function ($message) use ($pdfContent, $clientSubject) {
            $message->to($this->contract->client_email)
                ->subject($clientSubject)
                ->attachData($pdfContent, 'signed-contract.pdf', ['mime' => 'application/pdf'])
                ->withSymfonyMessage(function ($symfonyMessage) {
                    $symfonyMessage->getHeaders()->addTextHeader('X-Email-Type', 'contract_signed');
                });

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

        // Send to admin (use configured admin recipient)
        $adminBody = __('email.signed_contract_admin_body', ['name' => $this->contract->signer_name]);

        Mail::raw($adminBody, function ($message) use ($pdfContent) {
            $message->to(MailSettings::getAdminRecipient())
                ->subject('Contract Signed - ' . $this->contract->client_name)
                ->attachData($pdfContent, 'signed-contract.pdf', ['mime' => 'application/pdf'])
                ->withSymfonyMessage(function ($symfonyMessage) {
                    $symfonyMessage->getHeaders()->addTextHeader('X-Email-Type', 'contract_signed');
                });

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
