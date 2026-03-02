<?php

namespace App\Support;

use App\Models\Contract;
use App\Models\Setting;

class ContractPlaceholders
{
    /**
     * Get the placeholder replacements for a contract.
     */
    public static function replacementsForContract(Contract $contract): array
    {
        $plutzAddress = Setting::getString('plutz_address', '') ?? '';

        return [
            '[NAROČNIK]' => $contract->client_name,
            '[EMAIL]' => $contract->client_email,
            '[PODJETJE]' => $contract->client_company ?? '-',
            '[NASLOV]' => $contract->client_address ?? '-',
            '[TELEFON]' => $contract->client_phone ?? '-',
            '[ŠT_POGODBE]' => $contract->contract_number ?? 'P-' . str_pad($contract->id, 4, '0', STR_PAD_LEFT),
            '[DATUM_POGODBE]' => $contract->created_at->format('d.m.Y'),
            '[DATUM_NASTOPA]' => $contract->performance_date->format('d.m.Y'),
            '[URA_NASTOPA]' => $contract->performance_time ?? '-',
            '[TRAJANJE]' => $contract->duration_minutes ? (string) $contract->duration_minutes : '-',
            '[LOKACIJA]' => $contract->location_name ?? '-',
            '[NASLOV_LOKACIJE]' => $contract->location_address ?? '-',
            '[DATUM_PODPISA]' => $contract->signed_at ? $contract->signed_at->format('d.m.Y') : date('d.m.Y'),
            '[SKUPNI_ZNESEK]' => number_format($contract->total_price, 2, ',', '.'),
            '[AVANS]' => number_format($contract->deposit_amount ?? 0, 2, ',', '.'),
            '[PLUTZ_ADDRESS]' => $plutzAddress,
        ];
    }

    /**
     * Replace placeholders in markdown with contract values.
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
     * Replace only non-editable placeholders.
     * Keeps signer placeholders ([NAROČNIK], [EMAIL], [PODJETJE], [NASLOV]) for frontend live substitution.
     */
    public static function substituteNonEditable(string $markdown, Contract $contract): string
    {
        $plutzAddress = Setting::getString('plutz_address', '') ?? '';

        $replacements = [
            '[ŠT_POGODBE]' => $contract->contract_number ?? 'P-' . str_pad($contract->id, 4, '0', STR_PAD_LEFT),
            '[DATUM_POGODBE]' => $contract->created_at->format('d.m.Y'),
            '[DATUM_NASTOPA]' => $contract->performance_date->format('d.m.Y'),
            '[URA_NASTOPA]' => $contract->performance_time ?? '-',
            '[TRAJANJE]' => $contract->duration_minutes ? (string) $contract->duration_minutes : '-',
            '[LOKACIJA]' => $contract->location_name ?? '-',
            '[NASLOV_LOKACIJE]' => $contract->location_address ?? '-',
            '[DATUM_PODPISA]' => date('d.m.Y'),
            '[SKUPNI_ZNESEK]' => number_format($contract->total_price, 2, ',', '.'),
            '[AVANS]' => number_format($contract->deposit_amount ?? 0, 2, ',', '.'),
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
     */
    public static function availablePlaceholders(): array
    {
        return [
            '[NAROČNIK]' => 'Client name',
            '[EMAIL]' => 'Client email',
            '[PODJETJE]' => 'Client company',
            '[NASLOV]' => 'Client address',
            '[TELEFON]' => 'Client phone',
            '[ŠT_POGODBE]' => 'Contract number',
            '[DATUM_POGODBE]' => 'Contract date',
            '[DATUM_NASTOPA]' => 'Performance date',
            '[URA_NASTOPA]' => 'Performance time',
            '[TRAJANJE]' => 'Duration in minutes',
            '[LOKACIJA]' => 'Location name',
            '[NASLOV_LOKACIJE]' => 'Location address',
            '[DATUM_PODPISA]' => 'Signing date',
            '[SKUPNI_ZNESEK]' => 'Total price',
            '[AVANS]' => 'Deposit amount',
            '[PLUTZ_ADDRESS]' => 'Plutz address',
        ];
    }
}
