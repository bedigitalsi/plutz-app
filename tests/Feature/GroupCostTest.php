<?php

namespace Tests\Feature;

use App\Models\CostType;
use App\Models\GroupCost;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GroupCostTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected CostType $costType;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->seed();
        
        $this->admin = User::where('email', 'admin@plutz.app')->first();
        $this->costType = CostType::first();
    }

    public function test_can_view_group_costs_index(): void
    {
        $response = $this->actingAs($this->admin)->get('/group-costs');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('GroupCosts/Index'));
    }

    public function test_can_create_group_cost(): void
    {
        $response = $this->actingAs($this->admin)->post('/group-costs', [
            'cost_date' => '2025-12-28',
            'cost_type_id' => $this->costType->id,
            'amount' => 150.50,
            'currency' => 'EUR',
            'is_paid' => true,
            'notes' => 'Test group cost',
        ]);

        $response->assertRedirect('/group-costs');
        $this->assertDatabaseHas('group_costs', [
            'amount' => '150.50',
            'notes' => 'Test group cost',
            'is_paid' => true,
        ]);
    }

    public function test_can_view_edit_page(): void
    {
        $groupCost = GroupCost::create([
            'cost_date' => '2025-12-28',
            'cost_type_id' => $this->costType->id,
            'amount' => 200.00,
            'currency' => 'EUR',
            'is_paid' => false,
            'notes' => 'Original note',
            'created_by' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)->get("/group-costs/{$groupCost->id}/edit");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('GroupCosts/Edit')
                ->has('groupCost')
                ->where('groupCost.id', $groupCost->id)
        );
    }

    public function test_can_update_group_cost(): void
    {
        $groupCost = GroupCost::create([
            'cost_date' => '2025-12-28',
            'cost_type_id' => $this->costType->id,
            'amount' => 200.00,
            'currency' => 'EUR',
            'is_paid' => false,
            'notes' => 'Original note',
            'created_by' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)->patch("/group-costs/{$groupCost->id}", [
            'cost_date' => '2025-12-29',
            'cost_type_id' => $this->costType->id,
            'amount' => 250.75,
            'currency' => 'EUR',
            'is_paid' => true,
            'notes' => 'Updated note',
        ]);

        $response->assertRedirect('/group-costs');
        
        $groupCost->refresh();
        $this->assertEquals('250.75', $groupCost->amount);
        $this->assertEquals('Updated note', $groupCost->notes);
        $this->assertTrue($groupCost->is_paid);
    }

    public function test_can_toggle_paid_status(): void
    {
        $groupCost = GroupCost::create([
            'cost_date' => '2025-12-28',
            'cost_type_id' => $this->costType->id,
            'amount' => 200.00,
            'currency' => 'EUR',
            'is_paid' => false,
            'notes' => 'Test',
            'created_by' => $this->admin->id,
        ]);

        // Toggle to paid
        $this->actingAs($this->admin)->patch("/group-costs/{$groupCost->id}", [
            'cost_date' => $groupCost->cost_date,
            'cost_type_id' => $groupCost->cost_type_id,
            'amount' => $groupCost->amount,
            'currency' => $groupCost->currency,
            'is_paid' => true,
            'notes' => $groupCost->notes,
        ]);

        $groupCost->refresh();
        $this->assertTrue($groupCost->is_paid);

        // Toggle back to unpaid
        $this->actingAs($this->admin)->patch("/group-costs/{$groupCost->id}", [
            'cost_date' => $groupCost->cost_date,
            'cost_type_id' => $groupCost->cost_type_id,
            'amount' => $groupCost->amount,
            'currency' => $groupCost->currency,
            'is_paid' => false,
            'notes' => $groupCost->notes,
        ]);

        $groupCost->refresh();
        $this->assertFalse($groupCost->is_paid);
    }

    public function test_can_delete_group_cost(): void
    {
        $groupCost = GroupCost::create([
            'cost_date' => '2025-12-28',
            'cost_type_id' => $this->costType->id,
            'amount' => 200.00,
            'currency' => 'EUR',
            'is_paid' => false,
            'notes' => 'To be deleted',
            'created_by' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)->delete("/group-costs/{$groupCost->id}");

        $response->assertRedirect('/group-costs');
        $this->assertSoftDeleted('group_costs', ['id' => $groupCost->id]);
    }

    public function test_requires_authentication(): void
    {
        $response = $this->get('/group-costs');
        $response->assertRedirect('/login');
    }

    public function test_requires_permission_to_edit(): void
    {
        $user = User::factory()->create();
        
        $groupCost = GroupCost::create([
            'cost_date' => '2025-12-28',
            'cost_type_id' => $this->costType->id,
            'amount' => 200.00,
            'currency' => 'EUR',
            'is_paid' => false,
            'created_by' => $this->admin->id,
        ]);

        $response = $this->actingAs($user)->get("/group-costs/{$groupCost->id}/edit");
        $response->assertStatus(403);
    }
}
