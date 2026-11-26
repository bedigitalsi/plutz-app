<?php

namespace App\Http\Controllers;

use App\Jobs\GenerateSignedContractPdf;
use App\Jobs\SendSignedContractEmails;
use App\Models\Contract;
use App\Models\ContractSignToken;
use App\Support\ContractPlaceholders;
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

        // Substitute only non-editable placeholders (date, price, etc.)
        // Keep signer placeholders so the frontend can do live substitution
        $markdown = ContractPlaceholders::substituteNonEditable($contract->markdown_snapshot, $contract);

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
            // Optional second signer (companies that require two signatures)
            'signer2_name' => 'nullable|required_with:signature2_data|string|max:255',
            'signer2_email' => 'nullable|email',
            'signature2_data' => 'nullable|required_with:signer2_name|string',
        ]);

        $contract = $signToken->contract;

        // Save signature as attachment
        $signatureData = $validated['signature_data'];
        $signatureImage = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $signatureData));
        $signaturePath = 'signatures/contract-' . $contract->id . '-' . time() . '.png';
        \Storage::put($signaturePath, $signatureImage);

        $signature2Path = null;
        if (!empty($validated['signer2_name']) && !empty($validated['signature2_data'])) {
            $signature2Image = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $validated['signature2_data']));
            $signature2Path = 'signatures/contract-' . $contract->id . '-' . time() . '-2.png';
            \Storage::put($signature2Path, $signature2Image);
        }

        // Update contract
        $contract->update([
            'status' => 'signed',
            'signed_at' => now(),
            'signer_name' => $validated['signer_name'],
            'signer_email' => $validated['signer_email'],
            'signer_company' => $validated['signer_company'] ?? null,
            'signer_address' => $validated['signer_address'] ?? null,
            'signer2_name' => $signature2Path ? $validated['signer2_name'] : null,
            'signer2_email' => $signature2Path ? ($validated['signer2_email'] ?? null) : null,
            'signer2_signature_path' => $signature2Path,
            'signer_ip' => $request->ip(),
            'signer_user_agent' => $request->userAgent(),
            'consented_at' => now(),
        ]);

        // Mark token as used
        $signToken->update(['used_at' => now()]);

        // Dispatch PDF generation and email jobs
        GenerateSignedContractPdf::dispatch($contract, $signaturePath);
        SendSignedContractEmails::dispatch($contract);

        // Return success view
        return Inertia::render('Contracts/SigningSuccess', [
            'contract' => $contract,
        ]);
    }
}
