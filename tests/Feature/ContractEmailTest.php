<?php

namespace Tests\Feature;

use App\Models\Contract;
use App\Models\ContractSignToken;
use App\Models\User;
use App\Support\ContractEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContractEmailTest extends TestCase
{
    use RefreshDatabase;

    private function contract(bool $requireAll): array
    {
        app()->setLocale('sl');
        $user = User::factory()->create();
        $contract = Contract::create([
            'client_name' => 'Barbara Perko Brvar',
            'client_email' => 'barbara@example.com',
            'performance_date' => '2026-12-10',
            'location_name' => 'Mestni salon Storžič, Kranj',
            'total_price' => 3000,
            'currency' => 'EUR',
            'status' => 'sent',
            'require_all_signatures' => $requireAll,
            'markdown_snapshot' => '# Pogodba',
            'created_by' => $user->id,
        ]);
        $tokens = [];
        foreach ([['Barbara Perko Brvar', 'barbara@example.com'], ['Pavel Prhavc', 'pavel@example.com']] as [$name, $email]) {
            $plain = 'tok-' . md5($email);
            ContractSignToken::create([
                'contract_id' => $contract->id, 'recipient_name' => $name, 'recipient_email' => $email,
                'token_hash' => hash('sha256', $plain), 'expires_at' => '2026-12-26 10:00:00', 'created_by' => $user->id,
            ]);
            $tokens[] = $plain;
        }

        return [$contract, $tokens];
    }

    /** @test */
    public function invitation_email_shows_summary_button_cosigner_and_validity()
    {
        [$contract, [$barbaraToken]] = $this->contract(requireAll: true);

        $data = ContractEmail::invitationData($contract, $barbaraToken, 'barbara@example.com', 'Barbara Perko Brvar');
        $html = view('emails.contract-invitation', $data)->render();
        $text = view('emails.contract-invitation-text', $data)->render();

        $this->assertSame(['Pavel Prhavc'], $data['coSigners']);
        foreach ([$html, $text] as $body) {
            $this->assertStringContainsString('10. 12. 2026', $body);
            $this->assertStringContainsString('Mestni salon Storžič, Kranj', $body);
            $this->assertStringContainsString('3.000,00 EUR', $body);
            $this->assertStringContainsString('Preglej in podpiši pogodbo', $body);
            $this->assertStringContainsString('Pogodbo podpiše tudi Pavel Prhavc', $body);
            $this->assertStringContainsString('velja do 26. 12. 2026', $body);
            $this->assertStringContainsString(route('contracts.sign', $barbaraToken), $body);
            $this->assertStringContainsString('Simona Plut', $body);
        }
        $this->assertSame('Pogodba za nastop skupine Plutz – 10. 12. 2026, Mestni salon Storžič, Kranj', ContractEmail::invitationSubject($contract));
    }

    /** @test */
    public function single_link_invitation_has_no_cosigner_line()
    {
        [$contract, [$barbaraToken]] = $this->contract(requireAll: false);

        $data = ContractEmail::invitationData($contract, $barbaraToken, 'barbara@example.com', 'Barbara Perko Brvar');
        $html = view('emails.contract-invitation', $data)->render();

        $this->assertSame([], $data['coSigners']);
        $this->assertStringNotContainsString('podpiše tudi', $html);
        $this->assertStringContainsString('Po podpisu boste podpisano pogodbo prejeli', $html);
    }

    /** @test */
    public function signed_email_has_summary_and_attachment_note()
    {
        [$contract] = $this->contract(requireAll: true);

        $data = ContractEmail::signedData($contract);
        $html = view('emails.contract-signed', $data)->render();
        $text = view('emails.contract-signed-text', $data)->render();

        foreach ([$html, $text] as $body) {
            $this->assertStringContainsString('podpisana s strani vseh podpisnikov', $body);
            $this->assertStringContainsString('v prilogi', $body);
            $this->assertStringContainsString('10. 12. 2026', $body);
        }
        $this->assertSame('Podpisana pogodba – Plutz, 10. 12. 2026, Mestni salon Storžič, Kranj', ContractEmail::signedSubject($contract));
    }
}
