<?php

namespace App\Jobs;

use App\Models\Inquiry;
use App\Models\Setting;
use App\Support\MailSettings;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendInquiryConfirmedNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public Inquiry $inquiry
    ) {}

    public function handle(): void
    {
        if (!MailSettings::isEnabled()) {
            return;
        }

        if ($this->inquiry->fresh()->status !== 'confirmed') {
            return;
        }

        MailSettings::apply();

        $this->inquiry->load(['performanceType', 'bandMembers']);

        // Only notify assigned band members (not all)
        $bandMembers = $this->inquiry->bandMembers;

        if ($bandMembers->isEmpty()) {
            return;
        }

        $defaultLocale = Setting::getString('default_locale', 'en');

        $time = $this->inquiry->performance_time_mode === 'exact_time'
            ? $this->inquiry->performance_time_exact
            : $this->inquiry->performance_time_text;

        $memberNames = $bandMembers->pluck('name')->join(', ');

        foreach ($bandMembers as $user) {
            $locale = $user->locale ?: $defaultLocale;
            if (!in_array($locale, ['en', 'sl'])) {
                $locale = 'en';
            }
            app()->setLocale($locale);

            $body = __('email.inquiry_confirmed_body', [
                'date' => $this->inquiry->performance_date?->format('d.m.Y') ?? '—',
                'time' => $time ?: '—',
                'duration' => $this->inquiry->duration_minutes ? $this->inquiry->duration_minutes . ' min' : '—',
                'location' => $this->inquiry->location_name ?: '—',
                'address' => $this->inquiry->location_address ?: '—',
                'performance_type' => $this->inquiry->performanceType?->name ?? '—',
                'band_members' => $memberNames,
                'contact_person' => $this->inquiry->contact_person ?: '—',
                'contact_email' => $this->inquiry->contact_email ?: '—',
                'contact_phone' => $this->inquiry->contact_phone ?: '—',
                'notes' => $this->inquiry->notes ?: '—',
            ]);

            $subject = __('email.inquiry_confirmed_subject') . ' - Plutz';

            Mail::raw($body, function ($message) use ($user, $subject) {
                $message->to($user->email)
                    ->subject($subject)
                    ->withSymfonyMessage(function ($symfonyMessage) {
                        $symfonyMessage->getHeaders()->addTextHeader('X-Email-Type', 'inquiry_confirmed');
                    });

                if (MailSettings::shouldForceFrom() || MailSettings::shouldForceFromName()) {
                    $message->from(
                        MailSettings::getFromAddress(),
                        MailSettings::getFromName()
                    );
                }

                if (MailSettings::shouldSetReturnPath()) {
                    $message->returnPath(MailSettings::getFromAddress());
                }
            });
        }
    }
}
