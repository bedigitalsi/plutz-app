<?php

namespace App\Jobs;

use App\Models\Attachment;
use App\Models\Contract;
use App\Models\Setting;
use App\Support\ContractPlaceholders;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Barryvdh\DomPDF\Facade\Pdf;

class GenerateSignedContractPdf implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public Contract $contract,
        public string $signaturePath
    ) {}

    public function handle(): void
    {
        // Prepare HTML from markdown
        $html = $this->generateHtml();

        // PDF output path
        $disk = Storage::disk('local');
        $pdfPath = 'contracts/' . $this->contract->id . '/signed.pdf';
        $pdfFullPath = $disk->path($pdfPath);

        // Ensure directory exists
        $pdfDir = dirname($pdfFullPath);
        if (!file_exists($pdfDir)) {
            mkdir($pdfDir, 0755, true);
        }

        // Generate PDF using DOMPDF
        $pdf = Pdf::loadHTML($html);
        $pdf->setPaper('a4', 'portrait');
        $pdf->setOption('isFontSubsettingEnabled', true);
        $this->addPageNumbers($pdf);
        file_put_contents($pdfFullPath, $pdf->output());

        // Store as attachment
        Attachment::create([
            'id' => (string) Str::uuid(),
            'attachable_type' => Contract::class,
            'attachable_id' => $this->contract->id,
            'disk' => 'local',
            'path' => $pdfPath,
            'original_name' => 'contract-' . $this->contract->id . '-signed.pdf',
            'mime' => 'application/pdf',
            'size' => filesize($pdfFullPath),
            'created_by' => $this->contract->created_by,
        ]);
    }

    /** Footer on every page: contract number on the left, "Stran X od Y" on the right. */
    private function addPageNumbers(\Barryvdh\DomPDF\PDF $pdf): void
    {
        $pdf->render();
        $dompdf = $pdf->getDomPDF();
        $canvas = $dompdf->getCanvas();
        $metrics = $dompdf->getFontMetrics();
        $font = $metrics->getFont('Instrument Sans') ?: $metrics->getFont('DejaVu Sans');
        $size = 7;
        $color = [0.55, 0.52, 0.48];
        $margin = 18 * 72 / 25.4;
        $y = $canvas->get_height() - 11 * 72 / 25.4;

        $number = $this->contract->contract_number ?? 'P-' . str_pad($this->contract->id, 4, '0', STR_PAD_LEFT);
        $canvas->page_text($margin, $y, 'Pogodba ' . $number, $font, $size, $color);

        // Right-aligned for a typical "Stran 1 od 3" (page_text has no alignment of its own)
        $width = $metrics->getTextWidth('Stran 1 od 3', $font, $size);
        $canvas->page_text($canvas->get_width() - $margin - $width, $y, 'Stran {PAGE_NUM} od {PAGE_COUNT}', $font, $size, $color);
    }

    private function generateHtml(): string
    {
        $markdown = $this->contract->markdown_snapshot;

        // Substitute variables using the centralized helper
        $markdown = ContractPlaceholders::substitute($markdown, $this->contract);

        // Convert markdown to HTML
        $converter = new \League\CommonMark\CommonMarkConverter();
        $htmlContent = (string) $converter->convert($markdown);

        // Keep the closing section (e.g. "9. PODPIS") on the same page as the signatures, so the signatures never
        // end up alone on a page without contract text above them.
        [$bodyHtml, $closingHtml] = $this->splitClosingSection($htmlContent);

        // Client signatures: one entry per person who signed
        $clientSigners = $this->clientSigners();

        // Company signature from settings
        $companySignaturePath = Setting::getString('company_signature', '');
        $companySignatureDataUri = '';
        if ($companySignaturePath) {
            $companySignatureFullPath = Storage::disk('local')->path($companySignaturePath);
            if (file_exists($companySignatureFullPath)) {
                $companySignatureDataUri = 'data:image/png;base64,' . base64_encode(file_get_contents($companySignatureFullPath));
            }
        }

        // Signature section: client signers stacked on the left, the performer on the right (first row).
        $performerBlock = $companySignatureDataUri
            ? $this->signatureBlock('Podpis izvajalca', $companySignatureDataUri, 'KUD Tempo Bela krajina', ['Zastopa: Simona Plut'])
            : '';

        $company = trim((string) $this->contract->signer_company);
        $signatureRows = '';
        foreach ($clientSigners as $i => $signer) {
            $meta = [];
            if ($i === 0 && $company !== '' && $company !== '-') {
                $meta[] = e($company);
            }
            if ($signer['signed_on']) {
                $meta[] = 'Podpisano ' . $signer['signed_on'];
            }
            $label = $i === 0 ? (count($clientSigners) > 1 ? 'Podpis naročnikov' : 'Podpis naročnika') : '';
            $signatureRows .= '<tr><td class="sig-cell sig-left">'
                . $this->signatureBlock($label, $signer['image'], e($signer['name']), $meta)
                . '</td><td class="sig-gap"></td><td class="sig-cell sig-right">'
                . ($i === 0 ? $performerBlock : '')
                . '</td></tr>';
        }

        // Audit trail: kept complete, but visually quiet
        $auditHtml = '';
        foreach ($clientSigners as $i => $signer) {
            $label = count($clientSigners) > 1 ? 'Podpisnik ' . ($i + 1) : 'Podpisnik';
            $auditHtml .= '<p><strong>' . $label . ':</strong> ' . e($signer['name'])
                . ($signer['email'] ? ' (' . e($signer['email']) . ')' : '');
            if ($signer['signed_at']) {
                $auditHtml .= ' &nbsp;&middot;&nbsp; <strong>Datum podpisa:</strong> ' . $signer['signed_at']
                    . ($signer['ip'] ? ' &nbsp;&middot;&nbsp; <strong>IP naslov:</strong> ' . e($signer['ip']) : '');
            }
            $auditHtml .= '</p>';
        }

        $fontFaces = $this->fontFaces();
        $serif = $fontFaces ? "'Cormorant Garamond', 'DejaVu Serif', serif" : "'DejaVu Serif', serif";
        $sans = $fontFaces ? "'Instrument Sans', 'DejaVu Sans', sans-serif" : "'DejaVu Sans', sans-serif";
        // DejaVu runs wider than the brand fonts: step the sizes down when falling back
        $k = $fontFaces ? 1 : 0.9;
        $size = fn (float $pt): string => round($pt * $k, 2) . 'pt';

        $html = <<<HTML
<!DOCTYPE html>
<html lang="sl">
<head>
    <meta charset="UTF-8">
    <style>
        {$fontFaces}
        @page { margin: 17mm 18mm 20mm 18mm; }
        body {
            font-family: {$sans};
            margin: 0;
            padding: 0;
            line-height: 1.32;
            font-size: {$size(9.5)};
            color: #171513;
        }
        .brand {
            text-align: center;
            font-family: {$serif};
            font-size: {$size(11)};
            letter-spacing: 5pt;
            color: #A3886E;
            margin: 0 0 12pt 0;
        }
        h1 {
            font-family: {$serif};
            font-weight: bold;
            font-size: {$size(21)};
            line-height: 1.15;
            color: #171513;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 1.2pt;
            margin: 0 0 14pt 0;
            padding-bottom: 12pt;
            border-bottom: 0.6pt solid #A3886E;
        }
        h2 {
            font-family: {$sans};
            font-weight: bold;
            font-size: {$size(9.2)};
            line-height: 1.25;
            text-transform: uppercase;
            letter-spacing: 1pt;
            color: #171513;
            margin: 14pt 0 5pt 0;
            padding-bottom: 3pt;
            border-bottom: 0.4pt solid #D9CDBF;
            page-break-after: avoid;
        }
        h3 {
            font-family: {$sans};
            font-weight: bold;
            font-size: {$size(9.6)};
            color: #171513;
            margin: 11pt 0 4pt 0;
            page-break-after: avoid;
        }
        p {
            margin: 0 0 4.5pt 0;
            text-align: justify;
        }
        ul, ol {
            margin: 3pt 0 6pt 0;
            padding-left: 16pt;
        }
        li {
            margin-bottom: 1.5pt;
        }
        strong {
            font-weight: bold;
            color: #171513;
        }
        a {
            color: #171513;
            text-decoration: none;
        }
        blockquote {
            margin: 6pt 0;
            padding-left: 10pt;
            border-left: 1.5pt solid #A3886E;
            color: #4A443E;
        }
        hr {
            border: none;
            border-top: 0.4pt solid #E4DCD0;
            margin: 12pt 0;
        }
        table {
            border-collapse: collapse;
        }
        th, td {
            padding: 3pt 5pt;
            border-bottom: 0.4pt solid #E4DCD0;
            text-align: left;
            vertical-align: top;
        }
        .closing {
            page-break-inside: avoid;
        }
        .signatures {
            margin-top: 18pt;
            padding-top: 12pt;
            border-top: 0.6pt solid #A3886E;
            page-break-inside: avoid;
        }
        .signatures table.sig-table {
            width: 100%;
        }
        td.sig-cell {
            width: 46%;
            vertical-align: top;
            padding: 0 0 9pt 0;
            border: none;
        }
        td.sig-gap {
            width: 8%;
            padding: 0;
            border: none;
        }
        .sig-label {
            font-size: {$size(7)};
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1.4pt;
            color: #A3886E;
            margin: 0;
            text-align: left;
            height: 11pt;
        }
        table.sig-ink {
            width: 100%;
        }
        table.sig-ink td {
            height: 50pt;
            vertical-align: bottom;
            padding: 0 0 2pt 6pt;
            border-bottom: 0.6pt solid #171513;
        }
        .sig-name {
            font-family: {$serif};
            font-weight: bold;
            font-size: {$size(12.5)};
            line-height: 1.2;
            color: #171513;
            margin: 4pt 0 1pt 0;
            text-align: left;
        }
        .sig-meta {
            font-size: {$size(7.6)};
            line-height: 1.35;
            color: #7A7168;
            margin: 0;
            text-align: left;
        }
        .audit {
            margin-top: 6pt;
            padding-top: 6pt;
            border-top: 0.4pt solid #E4DCD0;
            font-size: {$size(6.8)};
            line-height: 1.4;
            color: #8C847B;
            page-break-inside: avoid;
        }
        .audit .audit-title {
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1.2pt;
            color: #A3886E;
            margin: 0 0 2pt 0;
        }
        .audit p {
            margin: 0;
            text-align: left;
        }
        .audit strong {
            font-weight: normal;
            color: #6B635A;
        }
    </style>
</head>
<body>
    <div class="brand">PLUTZ</div>

    {$bodyHtml}

    <div class="closing">
    {$closingHtml}

    <div class="signatures">
        <table class="sig-table">
            {$signatureRows}
        </table>

        <div class="audit">
            <p class="audit-title">Elektronski podpis &ndash; revizijska sled</p>
            {$auditHtml}
        </div>
    </div>
    </div>
</body>
</html>
HTML;

        return $html;
    }

    /**
     * Split the contract HTML into [body, closing section]: the closing section is everything from the last <h2>
     * on, and is kept together with the signatures. Long last sections are not moved (they'd leave a big gap).
     */
    private function splitClosingSection(string $html): array
    {
        $pos = strripos($html, '<h2');
        if ($pos === false || $pos === 0) {
            return [$html, ''];
        }

        $closing = substr($html, $pos);
        if (mb_strlen(strip_tags($closing)) > 1200) {
            return [$html, ''];
        }

        return [substr($html, 0, $pos), $closing];
    }

    /**
     * One signature: ink on a thin line, the name and small details under it. No box around the image.
     * $name and $meta are already HTML-safe.
     */
    private function signatureBlock(string $label, string $imageDataUri, string $name, array $meta = []): string
    {
        $img = '';
        if ($imageDataUri !== '') {
            [$w, $h] = $this->fitImage($imageDataUri, 170, 46);
            $img = '<img src="' . $imageDataUri . '" alt="Podpis" style="width: ' . $w . 'pt; height: ' . $h . 'pt;" />';
        }

        $metaHtml = '';
        foreach ($meta as $line) {
            $metaHtml .= '<p class="sig-meta">' . $line . '</p>';
        }

        return '<p class="sig-label">' . ($label !== '' ? e($label) : '&nbsp;') . '</p>'
            . '<table class="sig-ink"><tr><td>' . $img . '</td></tr></table>'
            . '<p class="sig-name">' . $name . '</p>'
            . $metaHtml;
    }

    /** Scale an image (data URI) to fit a box in points, keeping its proportions. */
    private function fitImage(string $dataUri, float $maxW, float $maxH): array
    {
        $size = @getimagesizefromstring((string) base64_decode(substr($dataUri, strpos($dataUri, ',') + 1)));
        if (!$size || $size[0] < 1 || $size[1] < 1) {
            return [$maxW, $maxH];
        }

        $scale = min($maxW / $size[0], $maxH / $size[1]);

        return [round($size[0] * $scale, 1), round($size[1] * $scale, 1)];
    }

    /**
     * @font-face rules for the brand fonts (Cormorant Garamond + Instrument Sans, OFL, in resources/fonts).
     * Returns '' when they cannot be used (files missing, font cache not writable) - the PDF then uses DejaVu.
     */
    private function fontFaces(): string
    {
        $cacheDir = (string) config('dompdf.options.font_cache', storage_path('fonts'));
        if (!is_dir($cacheDir)) {
            @mkdir($cacheDir, 0755, true);
        }
        if (!is_dir($cacheDir) || !is_writable($cacheDir)) {
            return '';
        }

        $faces = [
            ['Cormorant Garamond', 'normal', 'normal', 'CormorantGaramond-Medium.ttf'],
            ['Cormorant Garamond', 'bold', 'normal', 'CormorantGaramond-SemiBold.ttf'],
            ['Cormorant Garamond', 'normal', 'italic', 'CormorantGaramond-MediumItalic.ttf'],
            ['Instrument Sans', 'normal', 'normal', 'InstrumentSans-Regular.ttf'],
            ['Instrument Sans', 'bold', 'normal', 'InstrumentSans-SemiBold.ttf'],
            ['Instrument Sans', 'normal', 'italic', 'InstrumentSans-Italic.ttf'],
        ];

        $css = '';
        foreach ($faces as [$family, $weight, $style, $file]) {
            $path = resource_path('fonts/' . $file);
            if (!is_file($path)) {
                return '';
            }
            $css .= "@font-face { font-family: '{$family}'; font-weight: {$weight}; font-style: {$style}; "
                . "src: url('file://{$path}') format('truetype'); }\n";
        }

        return $css;
    }

    /**
     * Everyone who signed for the client, in signing order.
     * Separate-links mode: one entry per used sign token. Otherwise: the contract signer (+ optional second signer
     * who signed on the same page).
     */
    private function clientSigners(): array
    {
        $disk = Storage::disk('local');
        $image = function (?string $path) use ($disk): string {
            if ($path && file_exists($disk->path($path))) {
                return 'data:image/png;base64,' . base64_encode(file_get_contents($disk->path($path)));
            }
            return '';
        };

        if ($this->contract->require_all_signatures) {
            return $this->contract->signTokens()
                ->whereNotNull('used_at')
                ->orderBy('used_at')->orderBy('id')
                ->get()
                ->map(fn ($t) => [
                    'name' => $t->signer_name,
                    'email' => $t->signer_email,
                    'image' => $image($t->signature_path),
                    'signed_at' => $this->auditTime($t->used_at),
                    'signed_on' => $this->signedOn($t->used_at),
                    'ip' => $t->signer_ip,
                ])->all();
        }

        $signedAt = $this->auditTime($this->contract->signed_at);
        $signedOn = $this->signedOn($this->contract->signed_at);
        $signers = [[
            'name' => $this->contract->signer_name,
            'email' => $this->contract->signer_email,
            'image' => $image($this->signaturePath),
            'signed_at' => $signedAt,
            'signed_on' => $signedOn,
            'ip' => $this->contract->signer_ip,
        ]];

        if ($this->contract->signer2_name && $this->contract->signer2_signature_path) {
            $signers[] = [
                'name' => $this->contract->signer2_name,
                'email' => $this->contract->signer2_email,
                'image' => $image($this->contract->signer2_signature_path),
                'signed_at' => $signedAt,
                'signed_on' => $signedOn,
            'signed_on' => $signedOn,
                'ip' => $this->contract->signer_ip,
            ];
        }

        return $signers;
    }

    /** Signing time for the audit trail, in Slovenian local time with the zone named. */
    private function auditTime(?\DateTimeInterface $at): ?string
    {
        return $at ? \Illuminate\Support\Carbon::instance($at)->setTimezone('Europe/Ljubljana')->format('d.m.Y H:i:s T') : null;
    }

    /** Signing date shown under a signature, e.g. "26. 11. 2026 ob 14:32". */
    private function signedOn(?\DateTimeInterface $at): ?string
    {
        return $at ? \Illuminate\Support\Carbon::instance($at)->setTimezone('Europe/Ljubljana')->format('j. n. Y \o\b H:i') : null;
    }
}
