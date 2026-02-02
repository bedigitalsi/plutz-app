<?php

namespace App\Support;

use App\Models\Contract;
use App\Models\Setting;

class ContractPlaceholders
{
    /**
     * Get the placeholder replacements for a contract.
     *
     * @param Contract $contract
     * @return array
     */
    public static function replacementsForContract(Contract $contract): array
    {
        // Get Plutz address from settings
        $plutzAddress = Setting::getString('plutz_address', '') ?? '';

        return [
            '[NAROČNIK]' => $contract->client_name,
            '[EMAIL]' => $contract->client_email,
            '[PODJETJE]' => $contract->client_company ?? '-',
            '[NASLOV]' => $contract->client_address ?? '-',
            '[DATUM_NASTOPA]' => $contract->performance_date->format('d.m.Y'),
            '[SKUPNI_ZNESEK]' => number_format($contract->total_price, 2),
            '[AVANS]' => number_format($contract->deposit_amount ?? 0, 2),
            '[PLUTZ_ADDRESS]' => $plutzAddress,
        ];
    }

    /**
     * Replace placeholders in markdown with contract values.
     *
     * @param string $markdown
     * @param Contract $contract
     * @return string
     */
    public static function substitute(string $markdown, Contract $contract): string
    {
        $replacements = self::replacementsForContract($contract);

        return str_replace(
            array_keys($replacements),
            array_values($replacements),
            $markdown
        );
    }

    /**
     * Replace only non-editable placeholders (date, price, deposit, plutz address).
     * Keeps signer placeholders ([NAROČNIK], [EMAIL], [PODJETJE], [NASLOV]) for frontend live substitution.
     */
    public static function substituteNonEditable(string $markdown, Contract $contract): string
    {
        $plutzAddress = Setting::getString('plutz_address', '') ?? '';

        $replacements = [
            '[DATUM_NASTOPA]' => $contract->performance_date->format('d.m.Y'),
            '[SKUPNI_ZNESEK]' => number_format($contract->total_price, 2),
            '[AVANS]' => number_format($contract->deposit_amount ?? 0, 2),
            '[PLUTZ_ADDRESS]' => $plutzAddress,
        ];

        return str_replace(
            array_keys($replacements),
            array_values($replacements),
            $markdown
        );
    }

    /**
     * Get a list of all supported placeholders with descriptions.
     *
     * @return array
     */
    public static function availablePlaceholders(): array
    {
        return [
            '[NAROČNIK]' => 'Client name',
            '[EMAIL]' => 'Client email',
            '[PODJETJE]' => 'Client company',
            '[NASLOV]' => 'Client address',
            '[DATUM_NASTOPA]' => 'Performance date',
            '[SKUPNI_ZNESEK]' => 'Total price',
            '[AVANS]' => 'Deposit amount',
            '[PLUTZ_ADDRESS]' => 'Plutz address',
        ];
    }
}
