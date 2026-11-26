<?php

namespace Tests\Feature;

use App\Jobs\GenerateSignedContractPdf;
use App\Jobs\SendSignedContractEmails;
use App\Models\Contract;
use App\Models\ContractSignToken;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ContractSecondSignerTest extends TestCase
{
    use RefreshDatabase;

    private const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

    private function makeContractWithToken(): array
    {
        $user = User::factory()->create();
        $contract = Contract::create([
            'client_name' => 'Tea',
            'client_email' => 'tea@example.com',
            'performance_date' => '2026-12-10',
            'total_price' => 3000,
            'currency' => 'EUR',
            'status' => 'sent',
            'markdown_snapshot' => '# Pogodba',
            'created_by' => $user->id,
        ]);
        $token = 'test-token-' . uniqid();
        ContractSignToken::create([
            'contract_id' => $contract->id,
            'recipient_name' => 'Tea',
            'recipient_email' => 'tea@example.com',
            'token_hash' => hash('sha256', $token),
            'expires_at' => now()->addDays(10),
            'created_by' => $user->id,
        ]);

        return [$contract, $token];
    }

    private function basePayload(): array
    {
        return [
            'signer_name' => 'Barbara Perko Brvar',
            'signer_email' => 'barbara@example.com',
            'signature_data' => self::PNG,
            'consented' => true,
        ];
    }

    /** @test */
    public function single_signer_still_works_and_leaves_second_signer_empty()
    {
        Storage::fake();
        Bus::fake();
        [$contract, $token] = $this->makeContractWithToken();

        $this->post(route('contracts.sign.submit', $token), $this->basePayload())->assertOk();

        $contract->refresh();
        $this->assertSame('signed', $contract->status);
        $this->assertNull($contract->signer2_name);
        $this->assertNull($contract->signer2_signature_path);
        Bus::assertDispatched(GenerateSignedContractPdf::class);
        Bus::assertDispatched(SendSignedContractEmails::class);
    }

    /** @test */
    public function two_signers_are_stored_with_both_signatures()
    {
        Storage::fake();
        Bus::fake();
        [$contract, $token] = $this->makeContractWithToken();

        $this->post(route('contracts.sign.submit', $token), $this->basePayload() + [
            'signer2_name' => 'Pavel Perhavc',
            'signer2_email' => 'pavel@example.com',
            'signature2_data' => self::PNG,
        ])->assertOk();

        $contract->refresh();
        $this->assertSame('signed', $contract->status);
        $this->assertSame('Pavel Perhavc', $contract->signer2_name);
        $this->assertSame('pavel@example.com', $contract->signer2_email);
        $this->assertNotNull($contract->signer2_signature_path);
        Storage::assertExists($contract->signer2_signature_path);
    }

    /** @test */
    public function second_signer_name_without_signature_is_rejected()
    {
        Storage::fake();
        Bus::fake();
        [$contract, $token] = $this->makeContractWithToken();

        $this->post(route('contracts.sign.submit', $token), $this->basePayload() + [
            'signer2_name' => 'Pavel Perhavc',
        ])->assertSessionHasErrors('signature2_data');

        $this->assertSame('sent', $contract->refresh()->status);
    }

    /** @test */
    public function signed_pdf_contains_both_signers()
    {
        Storage::fake('local');
        [$contract] = $this->makeContractWithToken();
        Storage::disk('local')->put('signatures/a.png', base64_decode(substr(self::PNG, 22)));
        Storage::disk('local')->put('signatures/b.png', base64_decode(substr(self::PNG, 22)));
        $contract->update([
            'status' => 'signed',
            'signed_at' => now(),
            'signer_name' => 'Barbara Perko Brvar',
            'signer_email' => 'barbara@example.com',
            'signer2_name' => 'Pavel Perhavc',
            'signer2_signature_path' => 'signatures/b.png',
        ]);

        $job = new GenerateSignedContractPdf($contract, 'signatures/a.png');
        $html = (new \ReflectionMethod($job, 'generateHtml'))->invoke($job);

        $this->assertStringContainsString('Barbara Perko Brvar', $html);
        $this->assertStringContainsString('Pavel Perhavc', $html);
        $this->assertStringContainsString('Podpisnik 2', $html);
        $this->assertSame(2, substr_count($html, 'data:image/png;base64,'));
    }
}
