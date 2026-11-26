<?php

namespace App\Http\Controllers;

use App\Jobs\GenerateSignedContractPdf;
use App\Jobs\SendSignedContractEmails;
use App\Models\Contract;
use App\Models\ContractSignToken;
use App\Support\ContractPlaceholders;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ContractSigningController extends Controller
{
    public function show($token)
    {
        $tokenHash = hash('sha256', $token);

        $signToken = ContractSignToken::with('contract')
            ->where('token_hash', $tokenHash)
            ->firstOrFail();

        $contract = $signToken->contract;

        // Expired, already used, or the contract is already fully signed via another link
        if (!$signToken->isValid() || $contract->status === 'signed') {
            return Inertia::render('Contracts/SigningExpired');
        }

        // Substitute only non-editable placeholders (date, price, etc.)
        // Keep signer placeholders so the frontend can do live substitution
        $markdown = ContractPlaceholders::substituteNonEditable($contract->markdown_snapshot, $contract);

        return Inertia::render('Contracts/Sign', [
            'contract' => $contract->only([
                'id', 'client_name', 'client_email', 'client_company', 'client_address',
                'performance_date', 'total_price', 'currency', 'require_all_signatures',
            ]),
            'markdown' => $markdown,
            'token' => $token,
            'recipient' => [
                'name' => $signToken->recipient_name,
                'email' => $signToken->recipient_email,
            ],
            'signers' => $contract->require_all_signatures ? $this->signerList($contract) : [],
        ]);
    }

    public function sign(Request $request, $token)
    {
        $tokenHash = hash('sha256', $token);

        $signToken = ContractSignToken::with('contract')
            ->where('token_hash', $tokenHash)
            ->firstOrFail();

        if (!$signToken->isValid() || $signToken->contract->status === 'signed') {
            return response()->json(['error' => 'Token is invalid or expired'], 403);
        }

        $requireAll = (bool) $signToken->contract->require_all_signatures;

        $validated = $request->validate([
            'signer_name' => 'required|string|max:255',
            'signer_email' => 'required|email',
            'signer_company' => 'nullable|string|max:255',
            'signer_address' => 'nullable|string',
            'signature_data' => 'required|string', // Base64 image
            'consented' => 'required|accepted',
            // Optional second signer on the same page (only when each recipient does NOT sign separately)
            'signer2_name' => $requireAll ? 'prohibited' : 'nullable|required_with:signature2_data|string|max:255',
            'signer2_email' => $requireAll ? 'prohibited' : 'nullable|email',
            'signature2_data' => $requireAll ? 'prohibited' : 'nullable|required_with:signer2_name|string',
        ]);

        $completed = DB::transaction(function () use ($signToken, $validated, $request, $requireAll) {
            // Lock the contract row so two recipients signing at the same moment are serialized
            $contract = Contract::whereKey($signToken->contract_id)->lockForUpdate()->first();
            $signToken = ContractSignToken::whereKey($signToken->id)->lockForUpdate()->first();

            if ($signToken->isUsed() || $contract->status === 'signed') {
                abort(403, 'Token is invalid or expired');
            }

            $signaturePath = $this->storeSignature($validated['signature_data'], $contract->id, (string) $signToken->id);

            $signToken->update([
                'used_at' => now(),
                'signer_name' => $validated['signer_name'],
                'signer_email' => $validated['signer_email'],
                'signer_company' => $validated['signer_company'] ?? null,
                'signer_address' => $validated['signer_address'] ?? null,
                'signature_path' => $signaturePath,
                'signer_ip' => $request->ip(),
                'signer_user_agent' => $request->userAgent(),
            ]);

            if ($requireAll) {
                $pending = $contract->signTokens()->whereNull('used_at')->count();
                if ($pending > 0) {
                    $contract->update(['status' => Contract::STATUS_PARTIALLY_SIGNED]);
                    return null;
                }

                // Last signature: the contract is complete. The contract-level signer fields hold the FIRST signer.
                $first = $contract->signTokens()->whereNotNull('used_at')->orderBy('used_at')->orderBy('id')->first();
                $contract->update([
                    'status' => 'signed',
                    'signed_at' => now(),
                    'signer_name' => $first->signer_name,
                    'signer_email' => $first->signer_email,
                    'signer_company' => $first->signer_company,
                    'signer_address' => $first->signer_address,
                    'signer_ip' => $first->signer_ip,
                    'signer_user_agent' => $first->signer_user_agent,
                    'consented_at' => now(),
                ]);

                return [$contract, $first->signature_path];
            }

            // Single-link mode (default): the first signature completes the contract
            $signature2Path = null;
            if (!empty($validated['signer2_name']) && !empty($validated['signature2_data'])) {
                $signature2Path = $this->storeSignature($validated['signature2_data'], $contract->id, $signToken->id . '-2');
            }

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

            return [$contract, $signaturePath];
        });

        if ($completed) {
            [$contract, $signaturePath] = $completed;
            GenerateSignedContractPdf::dispatch($contract, $signaturePath);
            SendSignedContractEmails::dispatch($contract);
        }

        return Inertia::render('Contracts/SigningSuccess', [
            'contract' => $signToken->contract->fresh()->only(['id', 'client_name', 'signer_name', 'signer_email']),
            'pending' => $completed === null,
        ]);
    }

    private function storeSignature(string $dataUri, int $contractId, string $suffix): string
    {
        $image = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $dataUri));
        $path = 'signatures/contract-' . $contractId . '-' . $suffix . '-' . time() . '.png';
        \Storage::put($path, $image);

        return $path;
    }

    /** Who has to sign and who already did (require-all mode). */
    private function signerList(Contract $contract): array
    {
        return $contract->signTokens()->orderBy('id')->get()
            // main client first, then the others in the order they were added
            ->sortBy(fn (ContractSignToken $t) => $t->recipient_email === $contract->client_email ? 0 : 1, SORT_REGULAR)
            ->values()
            ->map(fn (ContractSignToken $t) => [
                'name' => $t->used_at ? $t->signer_name : $t->recipient_name,
                'signed' => (bool) $t->used_at,
            ])->all();
    }
}
