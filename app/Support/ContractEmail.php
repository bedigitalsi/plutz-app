<?php

namespace App\Support;

use App\Models\Contract;
use App\Models\ContractSignToken;
use App\Models\Setting;

/**
 * Data for the branded contract emails (invitation to sign + signed copy).
 */
class ContractEmail
{
    public static function invitationData(Contract $contract, string $plainToken, string $recipientEmail, string $recipientName): array
    {
        $token = ContractSignToken::where('token_hash', hash('sha256', $plainToken))->first();

        // Separate-links mode: name the other people who sign this contract
        $coSigners = [];
        if ($contract->require_all_signatures) {
            $coSigners = $contract->signTokens()
                ->whereNotNull('recipient_email')
                ->where('recipient_email', '!=', $recipientEmail)
                ->orderBy('id')
                ->get()
                ->map(fn ($t) => $t->recipient_name ?: $t->recipient_email)
                ->filter()
                ->values()
                ->all();
        }

        return self::common($contract) + [
            'recipientName' => $recipientName,
            'signingUrl' => route('contracts.sign', $plainToken),
            'expiresAt' => $token?->expires_at?->timezone('Europe/Ljubljana')->format('j. n. Y'),
            'coSigners' => $coSigners,
        ];
    }

    public static function signedData(Contract $contract): array
    {
        return self::common($contract);
    }

    public static function invitationSubject(Contract $contract): string
    {
        return __('email.contract_invitation_subject_full', self::subjectParts($contract));
    }

    public static function signedSubject(Contract $contract): string
    {
        return __('email.signed_contract_subject_full', self::subjectParts($contract));
    }

    private static function subjectParts(Contract $contract): array
    {
        $date = $contract->performance_date?->format('j. n. Y') ?? '';
        $place = $contract->location_name ? ', ' . $contract->location_name : '';

        return ['when' => trim($date . $place, ', ')];
    }

    private static function common(Contract $contract): array
    {
        return [
            'contractNumber' => $contract->contract_number ?? 'P-' . str_pad((string) $contract->id, 4, '0', STR_PAD_LEFT),
            'performanceDate' => $contract->performance_date?->format('j. n. Y'),
            'performanceTime' => $contract->performance_time,
            'location' => $contract->location_name,
            'price' => number_format((float) $contract->total_price, 2, ',', '.') . ' ' . ($contract->currency ?: 'EUR'),
            'contactName' => Setting::getString('contract_contact_name', 'Simona Plut') ?: 'Simona Plut',
            'contactPhone' => Setting::getString('contract_contact_phone', '031 219 844') ?: '031 219 844',
            'contactEmail' => Setting::getString('mail_from_address', 'info@plutzband.com') ?: 'info@plutzband.com',
            'website' => 'plutzband.com',
        ];
    }
}
