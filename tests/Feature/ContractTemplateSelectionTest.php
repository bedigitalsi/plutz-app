<?php

namespace Tests\Feature;

use App\Models\Contract;
use App\Models\ContractTemplate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ContractTemplateSelectionTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        // Create permissions
        Permission::create(['name' => 'contracts.manage', 'guard_name' => 'web']);

        // Create admin role with permission
        $adminRole = Role::create(['name' => 'Admin', 'guard_name' => 'web']);
        $adminRole->givePermissionTo('contracts.manage');

        // Create admin user
        $this->admin = User::factory()->create();
        $this->admin->assignRole('Admin');
    }

    /** @test */
    public function it_creates_contract_with_selected_template_id()
    {
        $template = ContractTemplate::create([
            'name' => 'Test Template',
            'markdown' => '# Contract for [NAROČNIK]',
            'is_active' => true,
        ]);

        $contractData = [
            'client_name' => 'John Doe',
            'client_email' => 'john@example.com',
            'client_company' => 'ACME Corp',
            'client_address' => '123 Main St',
            'performance_date' => '2026-06-01',
            'total_price' => 1500.00,
            'deposit_amount' => 500.00,
            'currency' => 'EUR',
            'markdown_snapshot' => $template->markdown,
            'contract_template_id' => $template->id,
        ];

        $response = $this->actingAs($this->admin)->post(route('contracts.store'), $contractData);

        $response->assertRedirect();

        $this->assertDatabaseHas('contracts', [
            'client_name' => 'John Doe',
            'client_email' => 'john@example.com',
            'contract_template_id' => $template->id,
            'markdown_snapshot' => $template->markdown,
        ]);
    }

    /** @test */
    public function it_creates_contract_without_template_id()
    {
        $contractData = [
            'client_name' => 'Jane Smith',
            'client_email' => 'jane@example.com',
            'performance_date' => '2026-07-01',
            'total_price' => 2000.00,
            'currency' => 'EUR',
            'markdown_snapshot' => '# Custom Contract Content',
        ];

        $response = $this->actingAs($this->admin)->post(route('contracts.store'), $contractData);

        $response->assertRedirect();

        $this->assertDatabaseHas('contracts', [
            'client_name' => 'Jane Smith',
            'contract_template_id' => null,
            'markdown_snapshot' => '# Custom Contract Content',
        ]);
    }

    /** @test */
    public function it_validates_template_id_exists()
    {
        $contractData = [
            'client_name' => 'Test Client',
            'client_email' => 'test@example.com',
            'performance_date' => '2026-08-01',
            'total_price' => 1000.00,
            'currency' => 'EUR',
            'markdown_snapshot' => '# Test',
            'contract_template_id' => 99999, // Non-existent template
        ];

        $response = $this->actingAs($this->admin)->post(route('contracts.store'), $contractData);

        $response->assertSessionHasErrors('contract_template_id');
    }

    /** @test */
    public function it_provides_all_templates_on_create_page()
    {
        $template1 = ContractTemplate::create([
            'name' => 'Template 1',
            'markdown' => '# T1',
            'is_active' => true,
        ]);

        $template2 = ContractTemplate::create([
            'name' => 'Template 2',
            'markdown' => '# T2',
            'is_active' => false,
        ]);

        $response = $this->actingAs($this->admin)->get(route('contracts.create'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Contracts/Create')
            ->has('templates', 2)
            ->where('activeTemplate.id', $template1->id)
        );
    }

    /** @test */
    public function contract_retains_template_relationship()
    {
        $template = ContractTemplate::create([
            'name' => 'Test Template',
            'markdown' => '# Test',
            'is_active' => true,
        ]);

        $contract = Contract::create([
            'public_id' => 'test-uuid',
            'client_name' => 'Client',
            'client_email' => 'client@test.com',
            'performance_date' => '2026-09-01',
            'total_price' => 1000,
            'currency' => 'EUR',
            'status' => 'draft',
            'markdown_snapshot' => '# Test',
            'created_by' => $this->admin->id,
            'contract_template_id' => $template->id,
        ]);

        // Test the relationship
        $this->assertInstanceOf(ContractTemplate::class, $contract->template);
        $this->assertEquals($template->id, $contract->template->id);
    }
}
