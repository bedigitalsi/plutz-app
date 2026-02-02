<?php

namespace App\Http\Controllers;

use App\Jobs\GenerateSignedContractPdf;
use App\Jobs\SendContractInvitation;
use App\Models\Contract;
use App\Models\ContractSignToken;
use App\Models\ContractTemplate;
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
            'client_address' => 'nullable|string',
            'performance_date' => 'required|date',
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
        // Delete attachment files from storage
        foreach ($contract->attachments as $attachment) {
            Storage::disk($attachment->disk)->delete($attachment->path);
            $attachment->delete();
        }

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
