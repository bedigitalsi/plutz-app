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
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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

        // Write HTML to temp file (use same disk root as attachment disk)
        $disk = \Storage::disk('local');
        $tempDir = $disk->path('temp');
        if (!file_exists($tempDir)) {
            mkdir($tempDir, 0755, true);
        }
        $htmlPath = $disk->path('temp/contract-' . $this->contract->id . '.html');
        file_put_contents($htmlPath, $html);

        // PDF output path
        $pdfPath = 'contracts/' . $this->contract->id . '/signed.pdf';
        $pdfFullPath = $disk->path($pdfPath);

        // Ensure directory exists
        $pdfDir = dirname($pdfFullPath);
        if (!file_exists($pdfDir)) {
            mkdir($pdfDir, 0755, true);
        }

        // Call Node script for PDF generation
        $scriptPath = base_path('tools/render-contract-pdf.cjs');
        
        $result = Process::run([
            'node',
            $scriptPath,
            '--input',
            $htmlPath,
            '--output',
            $pdfFullPath,
        ]);

        if (!$result->successful()) {
            throw new \Exception('PDF generation failed: ' . $result->errorOutput());
        }

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

        // Cleanup temp files
        @unlink($htmlPath);
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
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        h1 { color: #333; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
        h2 { color: #1e40af; margin-top: 30px; }
        .signature { margin-top: 50px; }
        .signature img { max-width: 300px; border: 1px solid #ccc; padding: 10px; }
        .audit { margin-top: 20px; font-size: 0.9em; color: #666; }
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
