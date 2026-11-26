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

    private function generateHtml(): string
    {
        $markdown = $this->contract->markdown_snapshot;
        
        // Substitute variables using the centralized helper
        $markdown = ContractPlaceholders::substitute($markdown, $this->contract);

        // Convert markdown to HTML
        $converter = new \League\CommonMark\CommonMarkConverter();
        $htmlContent = $converter->convert($markdown);

        // Client signatures: one entry per person who signed
        $clientSigners = $this->clientSigners();

        $clientSigHtml = '';
        foreach ($clientSigners as $i => $signer) {
            $style = $i > 0 ? ' style="margin-top: 14px;"' : '';
            $clientSigHtml .= '<img src="' . $signer['image'] . '" alt="Signature"' . $style . ' />'
                . '<p class="sig-name">' . e($signer['name']) . '</p>';
        }

        $auditHtml = '';
        foreach ($clientSigners as $i => $signer) {
            $label = count($clientSigners) > 1 ? 'Podpisnik ' . ($i + 1) : 'Podpisnik';
            $auditHtml .= '<p><strong>' . $label . ':</strong> ' . e($signer['name'])
                . ($signer['email'] ? ' (' . e($signer['email']) . ')' : '') . '</p>';
            if ($signer['signed_at']) {
                $auditHtml .= '<p><strong>Datum podpisa:</strong> ' . $signer['signed_at']
                    . ($signer['ip'] ? ' &middot; <strong>IP naslov:</strong> ' . e($signer['ip']) : '') . '</p>';
            }
        }

        // Company signature from settings
        $companySignaturePath = Setting::getString('company_signature', '');
        $companySignatureDataUri = '';
        if ($companySignaturePath) {
            $companySignatureFullPath = Storage::disk('local')->path($companySignaturePath);
            if (file_exists($companySignatureFullPath)) {
                $companySignatureDataUri = 'data:image/png;base64,' . base64_encode(file_get_contents($companySignatureFullPath));
            }
        }

        // Company signature HTML block
        $companySignatureHtml = '';
        if ($companySignatureDataUri) {
            $companySignatureHtml = <<<BLOCK
            <div class="sig-col">
                <h3>Podpis izvajalca</h3>
                <img src="{$companySignatureDataUri}" alt="Company Signature" />
                <p class="sig-name">KUD Tempo Bela krajina</p>
                <p class="sig-name">Zastopa: Simona Plut</p>
            </div>
BLOCK;
        }
        
        $html = <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            margin: 0;
            padding: 50px 60px;
            line-height: 1.7;
            font-size: 11pt;
            color: #1a1a1a;
        }
        h1 {
            font-size: 16pt;
            color: #1a1a1a;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 5px;
            padding-bottom: 15px;
            border-bottom: 2px solid #1e40af;
        }
        h2 {
            font-size: 13pt;
            color: #1e40af;
            margin-top: 25px;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #e5e7eb;
        }
        h3 {
            font-size: 11pt;
            color: #333;
            margin-top: 20px;
            margin-bottom: 8px;
        }
        p {
            margin: 4px 0;
            text-align: justify;
        }
        ul, ol {
            margin: 8px 0;
            padding-left: 25px;
        }
        li {
            margin-bottom: 4px;
        }
        strong {
            color: #1a1a1a;
        }
        hr {
            border: none;
            border-top: 1px solid #d1d5db;
            margin: 20px 0;
        }
        .signatures {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #1e40af;
            width: 100%;
        }
        .signatures table {
            width: 100%;
            border-collapse: collapse;
        }
        .signatures td {
            width: 50%;
            vertical-align: top;
            padding: 0 10px;
        }
        .sig-col h3 {
            color: #1e40af;
            font-size: 12pt;
            margin-bottom: 10px;
        }
        .sig-col img {
            max-width: 220px;
            border: 1px solid #d1d5db;
            padding: 8px;
            background: #fafafa;
        }
        .sig-col .sig-name {
            font-size: 9pt;
            color: #374151;
            margin: 4px 0 0 0;
            text-align: left;
        }
        .audit {
            margin-top: 15px;
            padding: 12px 15px;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            font-size: 9pt;
            color: #6b7280;
        }
        .audit p {
            margin: 2px 0;
            text-align: left;
        }
    </style>
</head>
<body>
    {$htmlContent}

    <div class="signatures">
        <table>
            <tr>
                <td>
                    <div class="sig-col">
                        <h3>Podpis naročnika</h3>
                        {$clientSigHtml}
                    </div>
                </td>
                <td>
                    {$companySignatureHtml}
                </td>
            </tr>
        </table>
    </div>

    <div class="audit">
        {$auditHtml}
    </div>
</body>
</html>
HTML;

        return $html;
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
                    'signed_at' => $t->used_at->format('d.m.Y H:i:s'),
                    'ip' => $t->signer_ip,
                ])->all();
        }

        $signedAt = $this->contract->signed_at?->format('d.m.Y H:i:s');
        $signers = [[
            'name' => $this->contract->signer_name,
            'email' => $this->contract->signer_email,
            'image' => $image($this->signaturePath),
            'signed_at' => $signedAt,
            'ip' => $this->contract->signer_ip,
        ]];

        if ($this->contract->signer2_name && $this->contract->signer2_signature_path) {
            $signers[] = [
                'name' => $this->contract->signer2_name,
                'email' => $this->contract->signer2_email,
                'image' => $image($this->contract->signer2_signature_path),
                'signed_at' => $signedAt,
                'ip' => $this->contract->signer_ip,
            ];
        }

        return $signers;
    }
}
