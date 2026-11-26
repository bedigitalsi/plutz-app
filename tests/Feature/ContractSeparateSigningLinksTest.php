<?php

namespace Tests\Feature;

use App\Jobs\GenerateSignedContractPdf;
use App\Jobs\SendContractInvitation;
use App\Jobs\SendSignedContractEmails;
use App\Models\Contract;
use App\Models\ContractSignToken;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class ContractSeparateSigningLinksTest extends TestCase
{
    use RefreshDatabase;

    private const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake();
        Storage::fake('local');
        Bus::fake();

        Permission::create(['name' => 'contracts.manage', 'guard_name' => 'web']);
        Permission::create(['name' => 'contracts.send', 'guard_name' => 'web']);
        $this->admin = User::factory()->create();
        $this->admin->givePermissionTo(['contracts.manage', 'contracts.send']);
    }

    /** Contract with Barbara (primary) + Pavel; returns [contract, barbaraToken, pavelToken]. */
    private function twoSignerContract(bool $requireAll = true): array
    {
        $contract = Contract::create([
            'client_name' => 'Barbara Perko Brvar',
            'client_email' => 'barbara@example.com',
            'performance_date' => '2026-12-10',
            'total_price' => 3000,
            'currency' => 'EUR',
            'status' => 'sent',
            'require_all_signatures' => $requireAll,
            'markdown_snapshot' => '# Pogodba',
            'created_by' => $this->admin->id,
        ]);

        $tokens = [];
        foreach ([['Barbara Perko Brvar', 'barbara@example.com'], ['Pavel Perhavc', 'pavel@example.com']] as [$name, $email]) {
            $plain = 'tok-' . md5($email . uniqid());
            ContractSignToken::create([
                'contract_id' => $contract->id,
                'recipient_name' => $name,
                'recipient_email' => $email,
                'token_hash' => hash('sha256', $plain),
                'expires_at' => now()->addDays(30),
                'created_by' => $this->admin->id,
            ]);
            $tokens[] = $plain;
        }

        return [$contract, $tokens[0], $tokens[1]];
    }

    private function sign(string $token, string $name, string $email, array $extra = [])
    {
        return $this->post(route('contracts.sign.submit', $token), [
            'signer_name' => $name,
            'signer_email' => $email,
            'signature_data' => self::PNG,
            'consented' => true,
        ] + $extra);
    }

    /** @test */
    public function first_signature_makes_contract_partially_signed_without_pdf()
    {
        [$contract, $barbara] = $this->twoSignerContract();

        $this->sign($barbara, 'Barbara Perko Brvar', 'barbara@example.com')->assertOk();

        $contract->refresh();
        $this->assertSame('partially_signed', $contract->status);
        $this->assertNull($contract->signed_at);
        Bus::assertNotDispatched(GenerateSignedContractPdf::class);
        Bus::assertNotDispatched(SendSignedContractEmails::class);

        $token = $contract->signTokens()->where('recipient_email', 'barbara@example.com')->first();
        $this->assertNotNull($token->used_at);
        $this->assertSame('Barbara Perko Brvar', $token->signer_name);
        Storage::assertExists($token->signature_path);
    }

    /** @test */
    public function last_signature_completes_contract_and_dispatches_pdf_and_emails()
    {
        [$contract, $barbara, $pavel] = $this->twoSignerContract();

        $this->sign($barbara, 'Barbara Perko Brvar', 'barbara@example.com')->assertOk();
        $this->sign($pavel, 'Pavel Perhavc', 'pavel@example.com')->assertOk();

        $contract->refresh();
        $this->assertSame('signed', $contract->status);
        $this->assertNotNull($contract->signed_at);
        $this->assertSame('Barbara Perko Brvar', $contract->signer_name, 'contract-level signer = first signer');
        Bus::assertDispatched(GenerateSignedContractPdf::class);
        Bus::assertDispatched(SendSignedContractEmails::class);
    }

    /** @test */
    public function a_used_link_cannot_sign_again()
    {
        [$contract, $barbara] = $this->twoSignerContract();

        $this->sign($barbara, 'Barbara Perko Brvar', 'barbara@example.com')->assertOk();
        $this->sign($barbara, 'Somebody Else', 'x@example.com')->assertStatus(403);
        $this->get(route('contracts.sign', $barbara))->assertOk()->assertInertia(fn ($page) => $page->component('Contracts/SigningExpired'));

        $this->assertSame('Barbara Perko Brvar', $contract->signTokens()->whereNotNull('used_at')->first()->signer_name);
    }

    /** @test */
    public function partially_signed_contract_is_locked_for_edits_and_recipient_changes()
    {
        [$contract, $barbara] = $this->twoSignerContract();
        $this->sign($barbara, 'Barbara Perko Brvar', 'barbara@example.com');

        $this->actingAs($this->admin);
        $this->put(route('contracts.update', $contract), [
            'client_name' => 'X', 'client_email' => 'x@example.com', 'performance_date' => '2026-12-10',
            'total_price' => 1, 'markdown_snapshot' => 'changed',
        ])->assertSessionHas('error');
        $this->post(route('contracts.add-recipient', $contract), ['recipient_name' => 'Z', 'recipient_email' => 'z@example.com'])
            ->assertSessionHas('error');
        $this->patch(route('contracts.signing-mode', $contract), ['require_all_signatures' => false])
            ->assertSessionHas('error');

        $contract->refresh();
        $this->assertSame('# Pogodba', $contract->markdown_snapshot);
        $this->assertTrue($contract->require_all_signatures);
        $this->assertSame(2, $contract->signTokens()->count());
    }

    /** @test */
    public function resend_on_partially_signed_contract_goes_only_to_those_who_have_not_signed()
    {
        [$contract, $barbara] = $this->twoSignerContract();
        $this->sign($barbara, 'Barbara Perko Brvar', 'barbara@example.com');

        $this->actingAs($this->admin)->post(route('contracts.send', $contract))->assertRedirect();

        Bus::assertDispatchedTimes(SendContractInvitation::class, 1);
        Bus::assertDispatched(SendContractInvitation::class, fn ($job) => $this->jobRecipient($job) === 'pavel@example.com');
        $this->assertSame('partially_signed', $contract->refresh()->status);
        // Barbara's used token is kept (her signature lives on it)
        $this->assertNotNull($contract->signTokens()->where('recipient_email', 'barbara@example.com')->whereNotNull('used_at')->first());
    }

    /** @test */
    public function default_mode_is_unchanged_first_signature_completes_and_other_links_stop_working()
    {
        [$contract, $barbara, $pavel] = $this->twoSignerContract(requireAll: false);

        $this->sign($barbara, 'Barbara Perko Brvar', 'barbara@example.com')->assertOk();
        $this->assertSame('signed', $contract->refresh()->status);
        Bus::assertDispatched(GenerateSignedContractPdf::class);

        $this->sign($pavel, 'Pavel Perhavc', 'pavel@example.com')->assertStatus(403);
        $this->assertSame('Barbara Perko Brvar', $contract->refresh()->signer_name);
    }

    /** @test */
    public function second_signer_on_same_page_is_rejected_in_separate_links_mode()
    {
        [$contract, $barbara] = $this->twoSignerContract();

        $this->sign($barbara, 'Barbara Perko Brvar', 'barbara@example.com', [
            'signer2_name' => 'Pavel Perhavc',
            'signature2_data' => self::PNG,
        ])->assertSessionHasErrors(['signer2_name', 'signature2_data']);

        $this->assertSame('sent', $contract->refresh()->status);
    }

    /** @test */
    public function signing_mode_can_be_toggled_before_anyone_signs()
    {
        [$contract] = $this->twoSignerContract(requireAll: false);

        $this->actingAs($this->admin)
            ->patch(route('contracts.signing-mode', $contract), ['require_all_signatures' => true])
            ->assertSessionHas('success');

        $this->assertTrue($contract->refresh()->require_all_signatures);
    }

    /** @test */
    public function sign_page_lists_signers_and_prefills_the_link_owner()
    {
        [$contract, $barbara, $pavel] = $this->twoSignerContract();
        $this->sign($barbara, 'Barbara Perko Brvar', 'barbara@example.com');

        $this->get(route('contracts.sign', $pavel))->assertOk()->assertInertia(fn ($page) => $page
            ->component('Contracts/Sign')
            ->where('recipient.email', 'pavel@example.com')
            ->where('signers.0.signed', true)
            ->where('signers.1.signed', false)
            ->missing('contract.markdown_snapshot'));
    }

    /** @test */
    public function signed_pdf_contains_every_signer_with_audit_lines()
    {
        [$contract, $barbara, $pavel] = $this->twoSignerContract();
        $this->sign($barbara, 'Barbara Perko Brvar', 'barbara@example.com');
        $this->sign($pavel, 'Pavel Perhavc', 'pavel@example.com');
        $contract->refresh();

        $first = $contract->signTokens()->orderBy('used_at')->first();
        $job = new GenerateSignedContractPdf($contract, $first->signature_path);
        $html = (new \ReflectionMethod($job, 'generateHtml'))->invoke($job);

        $this->assertStringContainsString('Barbara Perko Brvar', $html);
        $this->assertStringContainsString('Pavel Perhavc', $html);
        $this->assertStringContainsString('Podpisnik 1', $html);
        $this->assertStringContainsString('Podpisnik 2', $html);
        $this->assertSame(2, substr_count($html, 'data:image/png;base64,'));
    }

    private function jobRecipient(SendContractInvitation $job): ?string
    {
        foreach ((new \ReflectionClass($job))->getProperties() as $prop) {
            $prop->setAccessible(true);
            $v = $prop->getValue($job);
            if (is_string($v) && str_contains($v, '@')) {
                return $v;
            }
        }
        return null;
    }
}
