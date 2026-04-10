<?php

namespace App\Http\Controllers;

use App\Jobs\GenerateSignedContractPdf;
use App\Jobs\SendContractInvitation;
use App\Models\Contract;
use App\Models\ContractSignToken;
use App\Models\ContractTemplate;
use App\Support\ContractPlaceholders;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
        $templates = ContractTemplate::orderBy('name')->get();
        $activeTemplate = ContractTemplate::where('is_active', true)->first();

        return Inertia::render('Contracts/Create', [
            'templates' => $templates,
            'activeTemplate' => $activeTemplate,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_name' => 'required|string|max:255',
            'client_email' => 'required|email',
            'client_company' => 'nullable|string|max:255',
            'client_phone' => 'nullable|string|max:50',
            'client_address' => 'nullable|string',
            'performance_date' => 'required|date',
            'location_name' => 'nullable|string|max:255',
            'location_address' => 'nullable|string|max:500',
            'total_price' => 'required|numeric|min:0',
            'deposit_amount' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'markdown_snapshot' => 'required|string',
            'contract_template_id' => 'nullable|exists:contract_templates,id',
        ]);

        $validated['created_by'] = auth()->id();
        $validated['currency'] = $validated['currency'] ?? 'EUR';
        $validated['status'] = 'draft';

        $contract = Contract::create($validated);

        return redirect()->route('contracts.show', $contract)
            ->with('success', __('contracts.created_successfully'));
    }

    public function show(Contract $contract)
    {
        $contract->load(['creator', 'signTokens', 'attachments']);

        // Replace placeholders with real data for display
        $contract->markdown_snapshot = ContractPlaceholders::substitute(
            $contract->markdown_snapshot,
            $contract
        );

        return Inertia::render('Contracts/Show', [
            'contract' => $contract,
        ]);
    }

    public function edit(Contract $contract)
    {
        if ($contract->status === 'signed') {
            return back()->with('error', __('contracts.cannot_edit_signed'));
        }

        return Inertia::render('Contracts/Edit', [
            'contract' => $contract,
        ]);
    }

    public function update(Request $request, Contract $contract)
    {
        if ($contract->status === 'signed') {
            return back()->with('error', __('contracts.cannot_edit_signed'));
        }

        $validated = $request->validate([
            'client_name' => 'required|string|max:255',
            'client_email' => 'required|email',
            'client_company' => 'nullable|string|max:255',
            'client_phone' => 'nullable|string|max:50',
            'client_address' => 'nullable|string',
            'performance_date' => 'required|date',
            'location_name' => 'nullable|string|max:255',
            'location_address' => 'nullable|string|max:500',
            'total_price' => 'required|numeric|min:0',
            'deposit_amount' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'markdown_snapshot' => 'required|string',
        ]);

        $contract->update($validated);

        return redirect()->route('contracts.show', $contract)
            ->with('success', __('contracts.updated_successfully'));
    }

    public function destroy(Contract $contract)
    {
        // Delete attachment files from storage
        foreach ($contract->attachments as $attachment) {
            Storage::disk($attachment->disk)->delete($attachment->path);
            $attachment->delete();
        }

        // Clean up contract directory and signature files
        $disk = Storage::disk('local');
        $disk->deleteDirectory('contracts/' . $contract->id);
        foreach ($disk->files('signatures') as $file) {
            if (str_contains($file, 'contract-' . $contract->id . '-')) {
                $disk->delete($file);
            }
        }

        $contract->delete();

        return redirect()->route('contracts.index')
            ->with('success', __('contracts.deleted_successfully'));
    }

    public function sendInvitation(Contract $contract)
    {
        if ($contract->status === 'signed') {
            return back()->with('error', __('contracts.already_signed'));
        }

        $sentCount = 0;
        $primarySigningUrl = null;

        // Collect all recipients: primary + additional
        $recipients = collect();

        // Primary recipient
        $recipients->push([
            'name' => $contract->client_name,
            'email' => $contract->client_email,
            'is_primary' => true,
        ]);

        // Additional recipients (added via UI, stored as sign_tokens with recipient_email)
        $additionalTokens = $contract->signTokens()
            ->whereNotNull('recipient_email')
            ->where('recipient_email', '!=', $contract->client_email)
            ->whereNull('used_at')
            ->get();

        foreach ($additionalTokens as $t) {
            $recipients->push([
                'name' => $t->recipient_name,
                'email' => $t->recipient_email,
                'is_primary' => false,
                'existing_token' => $t,
            ]);
        }

        // Delete old unused primary tokens to avoid duplicates
        $contract->signTokens()
            ->where(function ($q) use ($contract) {
                $q->whereNull('recipient_email')
                   ->orWhere('recipient_email', $contract->client_email);
            })
            ->whereNull('used_at')
            ->delete();

        // Send to each recipient
        foreach ($recipients as $recipient) {
            $token = Str::random(64);

            if (!empty($recipient['existing_token'])) {
                // Update existing token
                $recipient['existing_token']->update([
                    'token_hash' => hash('sha256', $token),
                    'expires_at' => now()->addDays(30),
                ]);
            } else {
                // Create new token
                ContractSignToken::create([
                    'contract_id' => $contract->id,
                    'recipient_name' => $recipient['name'],
                    'recipient_email' => $recipient['email'],
                    'token_hash' => hash('sha256', $token),
                    'expires_at' => now()->addDays(30),
                    'created_by' => auth()->id(),
                ]);
            }

            SendContractInvitation::dispatch($contract, $token, $recipient['email'], $recipient['name']);
            $sentCount++;

            if ($recipient['is_primary']) {
                $primarySigningUrl = route('contracts.sign', $token);
            }
        }

        // Update contract status
        $contract->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        return back()->with([
            'success' => __('contracts.invitations_sent', ['count' => $sentCount]),
            'signing_url' => $primarySigningUrl,
        ]);
    }

    public function addRecipient(Request $request, Contract $contract)
    {
        $request->validate([
            'recipient_name' => 'required|string|max:255',
            'recipient_email' => 'required|email|max:255',
        ]);

        ContractSignToken::create([
            'contract_id' => $contract->id,
            'recipient_name' => $request->recipient_name,
            'recipient_email' => $request->recipient_email,
            'token_hash' => hash('sha256', Str::random(64)),
            'expires_at' => now()->addDays(30),
            'created_by' => auth()->id(),
        ]);

        return back()->with('success', __('contracts.recipient_added'));
    }

    public function removeRecipient(Contract $contract, ContractSignToken $token)
    {
        if ($token->contract_id !== $contract->id) {
            abort(403);
        }

        if ($token->used_at) {
            return back()->with('error', __('contracts.cannot_remove_signed_recipient'));
        }

        $token->delete();

        return back()->with('success', __('contracts.recipient_removed'));
    }

}
