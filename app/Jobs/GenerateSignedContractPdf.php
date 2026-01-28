<?php

namespace App\Jobs;

use App\Models\Attachment;
use App\Models\Contract;
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

        // Signature - use absolute path based on the storage disk actually used
        $signatureFullPath = \Storage::disk('local')->path($this->signaturePath);
        $signatureDataUri = null;
        if (file_exists($signatureFullPath)) {
            $signatureDataUri = 'data:image/png;base64,' . base64_encode(file_get_contents($signatureFullPath));
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
        .signature {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #1e40af;
        }
        .signature h3 {
            color: #1e40af;
            font-size: 12pt;
            margin-bottom: 10px;
        }
        .signature img {
            max-width: 250px;
            border: 1px solid #d1d5db;
            padding: 8px;
            background: #fafafa;
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

    <div class="signature">
        <h3>Podpis naročnika</h3>
        <img src="{$signatureDataUri}" alt="Signature" />
        <div class="audit">
            <p><strong>Podpisnik:</strong> {$this->contract->signer_name}</p>
            <p><strong>Email:</strong> {$this->contract->signer_email}</p>
            <p><strong>Datum podpisa:</strong> {$this->contract->signed_at->format('d.m.Y H:i:s')}</p>
            <p><strong>IP naslov:</strong> {$this->contract->signer_ip}</p>
        </div>
    </div>
</body>
</html>
HTML;

        return $html;
    }
}
