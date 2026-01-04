<?php

namespace Tests\Feature;

use App\Models\ContractTemplate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ContractTemplatesTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        // Create permissions
        Permission::create(['name' => 'settings.manage', 'guard_name' => 'web']);

        // Create admin role with permission
        $adminRole = Role::create(['name' => 'Admin', 'guard_name' => 'web']);
        $adminRole->givePermissionTo('settings.manage');

        // Create admin user
        $this->admin = User::factory()->create();
        $this->admin->assignRole('Admin');
    }

    /** @test */
    public function it_can_list_templates_with_proper_permissions()
    {
        $template = ContractTemplate::create([
            'name' => 'Default Template',
            'markdown' => '# Test',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)->get(route('contract-templates.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('ContractTemplates/Index')
            ->has('templates', 1)
        );
    }

    /** @test */
    public function it_prevents_access_without_permission()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('contract-templates.index'));

        $response->assertStatus(403);
    }

    /** @test */
    public function it_can_create_a_template()
    {
        $response = $this->actingAs($this->admin)->post(route('contract-templates.store'), [
            'name' => 'New Template',
            'markdown' => '# New Contract Template',
            'is_active' => false,
        ]);

        $response->assertRedirect(route('contract-templates.index'));
        $this->assertDatabaseHas('contract_templates', [
            'name' => 'New Template',
            'is_active' => false,
        ]);
    }

    /** @test */
    public function it_can_update_a_template()
    {
        $template = ContractTemplate::create([
            'name' => 'Original',
            'markdown' => '# Original',
            'is_active' => false,
        ]);

        $response = $this->actingAs($this->admin)->patch(
            route('contract-templates.update', $template),
            [
                'name' => 'Updated',
                'markdown' => '# Updated Content',
            ]
        );

        $response->assertRedirect(route('contract-templates.index'));
        $this->assertDatabaseHas('contract_templates', [
            'id' => $template->id,
            'name' => 'Updated',
            'markdown' => '# Updated Content',
        ]);
    }

    /** @test */
    public function it_activates_one_template_and_deactivates_others()
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

        $response = $this->actingAs($this->admin)->patch(
            route('contract-templates.activate', $template2)
        );

        $response->assertRedirect();

        // Check that only template2 is active
        $this->assertDatabaseHas('contract_templates', [
            'id' => $template1->id,
            'is_active' => false,
        ]);

        $this->assertDatabaseHas('contract_templates', [
            'id' => $template2->id,
            'is_active' => true,
        ]);
    }

    /** @test */
    public function it_prevents_deleting_the_last_template()
    {
        $template = ContractTemplate::create([
            'name' => 'Only Template',
            'markdown' => '# Only',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)->delete(
            route('contract-templates.destroy', $template)
        );

        $response->assertRedirect();
        $response->assertSessionHas('error');

        // Template should still exist
        $this->assertDatabaseHas('contract_templates', [
            'id' => $template->id,
        ]);
    }

    /** @test */
    public function it_auto_activates_another_template_when_deleting_active_one()
    {
        $activeTemplate = ContractTemplate::create([
            'name' => 'Active Template',
            'markdown' => '# Active',
            'is_active' => true,
        ]);

        // Create another template (older updated_at)
        $otherTemplate = ContractTemplate::create([
            'name' => 'Other Template',
            'markdown' => '# Other',
            'is_active' => false,
        ]);

        // Update the other template to be more recent
        $otherTemplate->touch();

        $response = $this->actingAs($this->admin)->delete(
            route('contract-templates.destroy', $activeTemplate)
        );

        $response->assertRedirect(route('contract-templates.index'));

        // Active template should be deleted
        $this->assertDatabaseMissing('contract_templates', [
            'id' => $activeTemplate->id,
        ]);

        // Other template should now be active
        $this->assertDatabaseHas('contract_templates', [
            'id' => $otherTemplate->id,
            'is_active' => true,
        ]);
    }

    /** @test */
    public function it_can_delete_non_active_template_without_auto_activation()
    {
        $activeTemplate = ContractTemplate::create([
            'name' => 'Active',
            'markdown' => '# Active',
            'is_active' => true,
        ]);

        $inactiveTemplate = ContractTemplate::create([
            'name' => 'Inactive',
            'markdown' => '# Inactive',
            'is_active' => false,
        ]);

        $response = $this->actingAs($this->admin)->delete(
            route('contract-templates.destroy', $inactiveTemplate)
        );

        $response->assertRedirect(route('contract-templates.index'));

        // Inactive template should be deleted
        $this->assertDatabaseMissing('contract_templates', [
            'id' => $inactiveTemplate->id,
        ]);

        // Active template should remain active
        $this->assertDatabaseHas('contract_templates', [
            'id' => $activeTemplate->id,
            'is_active' => true,
        ]);
    }
}
