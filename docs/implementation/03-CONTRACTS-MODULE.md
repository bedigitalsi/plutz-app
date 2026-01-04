# Implementation Guide: Contract Management Module

## Overview
This module handles contract templates, creating contracts, sending signing links, client signing portal, PDF generation, and email workflow.

## Prerequisites
- Auth & permissions configured
- Queue worker running (for PDF generation)
- Node.js installed (for PDF rendering)

---

## PART 1: COMPLETE MODELS

### STEP 1: Contract Model

**File:** `app/Models/Contract.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Contract extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'public_id',
        'client_name',
        'client_email',
        'client_company',
        'client_address',
        'performance_date',
        'total_price',
        'deposit_amount',
        'currency',
        'status',
        'markdown_snapshot',
        'sent_at',
        'signed_at',
        'signer_name',
        'signer_email',
        'signer_company',
        'signer_address',
        'signer_ip',
        'signer_user_agent',
        'consented_at',
        'created_by',
    ];

    protected $casts = [
        'performance_date' => 'date',
        'total_price' => 'decimal:2',
        'deposit_amount' => 'decimal:2',
        'sent_at' => 'datetime',
        'signed_at' => 'datetime',
        'consented_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($contract) {
            if (empty($contract->public_id)) {
                $contract->public_id = (string) \Illuminate\Support\Str::uuid();
            }
        });
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function signTokens(): HasMany
    {
        return $this->hasMany(ContractSignToken::class);
    }

    public function attachments(): MorphMany
    {
        return $this->morphMany(Attachment::class, 'attachable');
    }

    public function getSignedPdfPathAttribute()
    {
        return $this->attachments()
            ->where('original_name', 'like', '%signed.pdf')
            ->first()?->path;
    }
}
```

### STEP 2: ContractTemplate Model

**File:** `app/Models/ContractTemplate.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContractTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'markdown',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
```

### STEP 3: ContractSignToken Model

**File:** `app/Models/ContractSignToken.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContractSignToken extends Model
{
    use HasFactory;

    protected $fillable = [
        'contract_id',
        'token_hash',
        'expires_at',
        'used_at',
        'created_by',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'used_at' => 'datetime',
    ];

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isUsed(): bool
    {
        return !is_null($this->used_at);
    }

    public function isValid(): bool
    {
        return !$this->isExpired() && !$this->isUsed();
    }
}
```

---

## PART 2: CONTROLLERS

### STEP 4: ContractController

**File:** `app/Http/Controllers/ContractController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Jobs\GenerateSignedContractPdf;
use App\Jobs\SendContractInvitation;
use App\Models\Contract;
use App\Models\ContractSignToken;
use App\Models\ContractTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ContractController extends Controller
{
    public function index(Request $request)
    {
        $query = Contract::with('creator')->orderBy('created_at', 'desc');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $query->where(function($q) use ($request) {
                $q->where('client_name', 'like', '%' . $request->search . '%')
                  ->orWhere('client_email', 'like', '%' . $request->search . '%')
                  ->orWhere('client_company', 'like', '%' . $request->search . '%');
            });
        }

        return Inertia::render('Contracts/Index', [
            'contracts' => $query->paginate(20)->withQueryString(),
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function create()
    {
        $template = ContractTemplate::where('is_active', true)->first();

        return Inertia::render('Contracts/Create', [
            'template' => $template,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_name' => 'required|string|max:255',
            'client_email' => 'required|email',
            'client_company' => 'nullable|string|max:255',
            'client_address' => 'nullable|string',
            'performance_date' => 'required|date',
            'total_price' => 'required|numeric|min:0',
            'deposit_amount' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'markdown_snapshot' => 'required|string',
        ]);

        $validated['created_by'] = auth()->id();
        $validated['currency'] = $validated['currency'] ?? 'EUR';
        $validated['status'] = 'draft';

        $contract = Contract::create($validated);

        return redirect()->route('contracts.show', $contract)
            ->with('success', 'Contract created successfully.');
    }

    public function show(Contract $contract)
    {
        $contract->load(['creator', 'signTokens', 'attachments']);

        return Inertia::render('Contracts/Show', [
            'contract' => $contract,
        ]);
    }

    public function edit(Contract $contract)
    {
        if ($contract->status !== 'draft') {
            return back()->with('error', 'Cannot edit contract that has been sent or signed.');
        }

        return Inertia::render('Contracts/Edit', [
            'contract' => $contract,
        ]);
    }

    public function update(Request $request, Contract $contract)
    {
        if ($contract->status !== 'draft') {
            return back()->with('error', 'Cannot edit contract that has been sent or signed.');
        }

        $validated = $request->validate([
            'client_name' => 'required|string|max:255',
            'client_email' => 'required|email',
            'client_company' => 'nullable|string|max:255',
            'client_address' => 'nullable|string',
            'performance_date' => 'required|date',
            'total_price' => 'required|numeric|min:0',
            'deposit_amount' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'markdown_snapshot' => 'required|string',
        ]);

        $contract->update($validated);

        return redirect()->route('contracts.show', $contract)
            ->with('success', 'Contract updated successfully.');
    }

    public function destroy(Contract $contract)
    {
        $this->authorize('delete', $contract);

        $contract->delete();

        return redirect()->route('contracts.index')
            ->with('success', 'Contract deleted successfully.');
    }

    public function sendInvitation(Contract $contract)
    {
        if ($contract->status === 'signed') {
            return back()->with('error', 'Contract is already signed.');
        }

        // Generate token
        $token = Str::random(64);
        
        ContractSignToken::create([
            'contract_id' => $contract->id,
            'token_hash' => hash('sha256', $token),
            'expires_at' => now()->addDays(30),
            'created_by' => auth()->id(),
        ]);

        // Update contract status
        $contract->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        // Dispatch email job
        SendContractInvitation::dispatch($contract, $token);

        return back()->with([
            'success' => 'Contract invitation sent successfully.',
            'signing_url' => route('contracts.sign', $token), // Show for testing
        ]);
    }
}
```

### STEP 5: ContractSigningController

**File:** `app/Http/Controllers/ContractSigningController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Jobs\GenerateSignedContractPdf;
use App\Jobs\SendSignedContractEmails;
use App\Models\Contract;
use App\Models\ContractSignToken;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContractSigningController extends Controller
{
    public function show($token)
    {
        $tokenHash = hash('sha256', $token);
        
        $signToken = ContractSignToken::with('contract')
            ->where('token_hash', $tokenHash)
            ->firstOrFail();

        if (!$signToken->isValid()) {
            return Inertia::render('Contracts/SigningExpired');
        }

        $contract = $signToken->contract;

        // Substitute variables in markdown
        $markdown = $this->substituteVariables($contract->markdown_snapshot, $contract);

        return Inertia::render('Contracts/Sign', [
            'contract' => $contract,
            'markdown' => $markdown,
            'token' => $token,
        ]);
    }

    public function sign(Request $request, $token)
    {
        $tokenHash = hash('sha256', $token);
        
        $signToken = ContractSignToken::with('contract')
            ->where('token_hash', $tokenHash)
            ->firstOrFail();

        if (!$signToken->isValid()) {
            return response()->json(['error' => 'Token is invalid or expired'], 403);
        }

        $validated = $request->validate([
            'signer_name' => 'required|string|max:255',
            'signer_email' => 'required|email',
            'signer_company' => 'nullable|string|max:255',
            'signer_address' => 'nullable|string',
            'signature_data' => 'required|string', // Base64 image
            'consented' => 'required|accepted',
        ]);

        $contract = $signToken->contract;

        // Save signature as attachment
        $signatureData = $validated['signature_data'];
        $signatureImage = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $signatureData));
        $signaturePath = 'signatures/contract-' . $contract->id . '-' . time() . '.png';
        \Storage::put($signaturePath, $signatureImage);

        // Update contract
        $contract->update([
            'status' => 'signed',
            'signed_at' => now(),
            'signer_name' => $validated['signer_name'],
            'signer_email' => $validated['signer_email'],
            'signer_company' => $validated['signer_company'],
            'signer_address' => $validated['signer_address'],
            'signer_ip' => $request->ip(),
            'signer_user_agent' => $request->userAgent(),
            'consented_at' => now(),
        ]);

        // Mark token as used
        $signToken->update(['used_at' => now()]);

        // Dispatch PDF generation and email jobs
        GenerateSignedContractPdf::dispatch($contract, $signaturePath);
        SendSignedContractEmails::dispatch($contract);

        return response()->json([
            'success' => true,
            'message' => 'Contract signed successfully. You will receive a copy via email.',
        ]);
    }

    private function substituteVariables($markdown, $contract)
    {
        $replacements = [
            '[NAROČNIK]' => $contract->client_name,
            '[EMAIL]' => $contract->client_email,
            '[PODJETJE]' => $contract->client_company ?? 'N/A',
            '[NASLOV]' => $contract->client_address ?? 'N/A',
            '[DATUM_NASTOPA]' => $contract->performance_date->format('d.m.Y'),
            '[SKUPNI_ZNESEK]' => number_format($contract->total_price, 2),
            '[AVANS]' => number_format($contract->deposit_amount ?? 0, 2),
        ];

        return str_replace(
            array_keys($replacements),
            array_values($replacements),
            $markdown
        );
    }
}
```

---

## PART 3: JOBS

### STEP 6: PDF Generation Job

**File:** `app/Jobs/GenerateSignedContractPdf.php`

```php
<?php

namespace App\Jobs;

use App\Models\Attachment;
use App\Models\Contract;
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

        // Write HTML to temp file
        $htmlPath = storage_path('app/temp/contract-' . $this->contract->id . '.html');
        Storage::put('temp/contract-' . $this->contract->id . '.html', $html);

        // PDF output path
        $pdfPath = 'contracts/' . $this->contract->id . '/signed.pdf';
        $pdfFullPath = storage_path('app/' . $pdfPath);

        // Ensure directory exists
        Storage::makeDirectory('contracts/' . $this->contract->id);

        // Call Node script for PDF generation
        $scriptPath = base_path('tools/render-contract-pdf.js');
        
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
            'size' => Storage::size($pdfPath),
            'created_by' => $this->contract->created_by,
        ]);

        // Cleanup temp files
        Storage::delete('temp/contract-' . $this->contract->id . '.html');
    }

    private function generateHtml(): string
    {
        $markdown = $this->contract->markdown_snapshot;
        
        // Substitute variables
        $replacements = [
            '[NAROČNIK]' => $this->contract->client_name,
            '[EMAIL]' => $this->contract->client_email,
            '[PODJETJE]' => $this->contract->client_company ?? 'N/A',
            '[NASLOV]' => $this->contract->client_address ?? 'N/A',
            '[DATUM_NASTOPA]' => $this->contract->performance_date->format('d.m.Y'),
            '[SKUPNI_ZNESEK]' => number_format($this->contract->total_price, 2),
            '[AVANS]' => number_format($this->contract->deposit_amount ?? 0, 2),
        ];

        $markdown = str_replace(array_keys($replacements), array_values($replacements), $markdown);

        // Convert markdown to HTML
        $converter = new \League\CommonMark\CommonMarkConverter();
        $htmlContent = $converter->convert($markdown);

        // Signature
        $signatureUrl = Storage::url($this->signaturePath);
        
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
        <img src="{$signatureUrl}" alt="Signature" />
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
```

### STEP 7: Email Jobs

**File:** `app/Jobs/SendContractInvitation.php`

```php
<?php

namespace App\Jobs;

use App\Models\Contract;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendContractInvitation implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public Contract $contract,
        public string $token
    ) {}

    public function handle(): void
    {
        $signingUrl = route('contracts.sign', $this->token);

        Mail::raw("Dear {$this->contract->client_name},\n\nPlease sign the contract by visiting:\n{$signingUrl}\n\nThank you,\nPlutz", function ($message) {
            $message->to($this->contract->client_email)
                ->subject('Contract Signing Request - Plutz');
        });
    }
}
```

**File:** `app/Jobs/SendSignedContractEmails.php`

```php
<?php

namespace App\Jobs;

use App\Models\Contract;
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
        $pdfPath = $this->contract->getSignedPdfPathAttribute();

        if (!$pdfPath || !Storage::exists($pdfPath)) {
            // Wait for PDF to be generated
            $this->release(10); // Retry after 10 seconds
            return;
        }

        $pdfContent = Storage::get($pdfPath);

        // Send to client
        Mail::raw("Dear {$this->contract->client_name},\n\nThank you for signing the contract. Please find the signed PDF attached.\n\nBest regards,\nPlutz", function ($message) use ($pdfContent) {
            $message->to($this->contract->client_email)
                ->subject('Signed Contract - Plutz')
                ->attachData($pdfContent, 'signed-contract.pdf', ['mime' => 'application/pdf']);
        });

        // Send to admin
        Mail::raw("Contract signed by {$this->contract->signer_name}. PDF attached.", function ($message) use ($pdfContent) {
            $message->to('admin@plutz.app')
                ->subject('Contract Signed - ' . $this->contract->client_name)
                ->attachData($pdfContent, 'signed-contract.pdf', ['mime' => 'application/pdf']);
        });
    }
}
```

---

## PART 4: NODE PDF RENDERER

### STEP 8: Create Node Script

**File:** `tools/render-contract-pdf.js`

```javascript
const puppeteer = require('puppeteer');
const fs = require('fs');

async function generatePDF(inputPath, outputPath) {
    let browser;
    
    try {
        // Try Puppeteer first
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        const htmlContent = fs.readFileSync(inputPath, 'utf8');
        
        await page.setContent(htmlContent, {
            waitUntil: 'networkidle0'
        });
        
        await page.pdf({
            path: outputPath,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '20mm',
                bottom: '20mm',
                left: '20mm'
            }
        });
        
        console.log('PDF generated successfully with Puppeteer');
    } catch (error) {
        console.error('Puppeteer failed, trying html-pdf-node...', error);
        
        // Fallback to html-pdf-node
        const htmlPdf = require('html-pdf-node');
        const htmlContent = fs.readFileSync(inputPath, 'utf8');
        
        const options = { format: 'A4', path: outputPath };
        const file = { content: htmlContent };
        
        await htmlPdf.generatePdf(file, options);
        console.log('PDF generated successfully with html-pdf-node');
    } finally {
        if (browser) await browser.close();
    }
}

// Parse command line arguments
const args = process.argv.slice(2);
const inputIndex = args.indexOf('--input');
const outputIndex = args.indexOf('--output');

if (inputIndex === -1 || outputIndex === -1) {
    console.error('Usage: node render-contract-pdf.js --input <html_file> --output <pdf_file>');
    process.exit(1);
}

const inputPath = args[inputIndex + 1];
const outputPath = args[outputIndex + 1];

generatePDF(inputPath, outputPath)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('PDF generation failed:', error);
        process.exit(1);
    });
```

Install dependencies:

```bash
npm install puppeteer html-pdf-node
```

---

## PART 5: ROUTES

**File:** `routes/web.php`

```php
// Contracts (admin)
Route::middleware(['auth', 'permission:contracts.manage'])->group(function () {
    Route::resource('contracts', \App\Http\Controllers\ContractController::class);
    Route::post('contracts/{contract}/send', [\App\Http\Controllers\ContractController::class, 'sendInvitation'])
        ->name('contracts.send')
        ->middleware('permission:contracts.send');
});

// Public contract signing
Route::get('/sign/{token}', [\App\Http\Controllers\ContractSigningController::class, 'show'])
    ->name('contracts.sign');
Route::post('/sign/{token}', [\App\Http\Controllers\ContractSigningController::class, 'sign'])
    ->name('contracts.sign.submit');
```

---

## PART 6: REACT PAGES

### STEP 9: Contracts Index

**File:** `resources/js/Pages/Contracts/Index.tsx`

Basic list with status filter, search, pagination, and actions (View, Edit, Send, Delete).

### STEP 10: Contract Create/Edit Forms

Form fields: client info, performance date, prices, markdown editor with preview.

### STEP 11: Contract Signing Page

**File:** `resources/js/Pages/Contracts/Sign.tsx`

Include:
- Contract preview (markdown rendered to HTML)
- Signature pad (use `react-signature-canvas` or similar)
- Signer info form
- Consent checkbox
- Submit button

```bash
npm install react-signature-canvas
```

Example:

```tsx
import SignatureCanvas from 'react-signature-canvas';
import { useRef, useState } from 'react';

const signaturePad = useRef<SignatureCanvas>(null);

const handleSubmit = () => {
    const signatureData = signaturePad.current?.toDataURL();
    
    // POST to /sign/{token}
    axios.post(route('contracts.sign.submit', token), {
        signer_name,
        signer_email,
        signer_company,
        signer_address,
        signature_data: signatureData,
        consented: true,
    });
};
```

---

## PART 7: CONFIGURE QUEUE

**File:** `.env`

```
QUEUE_CONNECTION=database
```

Run migrations (already done).

Start queue worker:

```bash
php artisan queue:work
```

For production, use Supervisor or similar.

---

## STEP 12: Test

1. Create contract template at `/admin/template`
2. Create a new contract
3. Send invitation (generates token + email)
4. Open signing URL `/sign/{token}`
5. Fill form and sign
6. Check PDF is generated
7. Check emails sent

---

## Next Steps

- Add contract templates management UI
- Implement contract preview before sending
- Add contract PDF download for admin
- Add contract search and filtering
- Implement contract expiration/reminder system

---

## Troubleshooting

**PDF generation fails?**
- Check Node.js is installed: `node --version`
- Verify Puppeteer/html-pdf-node are installed
- Check queue is running: `php artisan queue:work`
- Check logs: `storage/logs/laravel.log`

**Emails not sending?**
- Configure SMTP in settings
- Test: `php artisan tinker` then `Mail::raw('test', fn($m) => $m->to('test@example.com')->subject('test'));`
- Check `.env` mail settings

**Signature not saving?**
- Check storage is writable
- Verify base64 encoding is correct
- Check file size limits in `php.ini`

