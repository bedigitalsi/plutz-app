<?php

namespace App\Listeners;

use App\Models\EmailLog;
use Illuminate\Mail\Events\MessageSent;
use Symfony\Component\Mime\Email;

class LogSentEmail
{
    /**
     * Handle the event.
     */
    public function handle(MessageSent $event): void
    {
        $message = $event->sent->getOriginalMessage();

        if (!$message instanceof Email) {
            return;
        }

        $to = collect($message->getTo())
            ->map(fn ($address) => $address->getAddress())
            ->implode(', ');

        $fromAddress = collect($message->getFrom())->first();

        $header = $message->getHeaders()->get('X-Email-Type');
        $type = $header ? strtolower(trim($header->getBodyAsString())) : 'other';

        $allowedTypes = ['contract_invitation', 'contract_signed', 'inquiry_confirmed', 'test', 'other'];
        if (!in_array($type, $allowedTypes, true)) {
            $type = 'other';
        }

        EmailLog::create([
            'to_email' => $to,
            'from_email' => $fromAddress?->getAddress() ?? '',
            'from_name' => $fromAddress?->getName() ?? '',
            'subject' => (string) ($message->getSubject() ?? ''),
            'body' => (string) ($message->getHtmlBody() ?? $message->getTextBody() ?? ''),
            'type' => $type,
            'status' => 'sent',
        ]);
    }
}
