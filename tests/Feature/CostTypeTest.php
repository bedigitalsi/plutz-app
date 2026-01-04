<?php

namespace Tests\Feature;

use App\Models\CostType;
use App\Models\GroupCost;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CostTypeTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->seed();
        
        $this->admin = User::where('email', 'admin@plutz.app')->first();
    }

    public function test_can_view_cost_types_index(): void
    {
        $response = $this->actingAs($this->admin)->get('/cost-types');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('CostTypes/Index'));
    }

    public function test_can_view_create_page(): void
    {
        $response = $this->actingAs($this->admin)->get('/cost-types/create');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('CostTypes/Create'));
    }

    public function test_can_create_cost_type(): void
    {
        $response = $this->actingAs($this->admin)->post('/cost-types', [
            'name' => 'Transportation',
            'is_active' => true,
        ]);

        $response->assertRedirect('/cost-types');
        $this->assertDatabaseHas('cost_types', [
            'name' => 'Transportation',
            'is_active' => true,
        ]);
    }

    public function test_cannot_create_duplicate_cost_type(): void
    {
        CostType::create(['name' => 'Fuel', 'is_active' => true]);

        $response = $this->actingAs($this->admin)->post('/cost-types', [
            'name' => 'Fuel',
            'is_active' => true,
        ]);

        $response->assertSessionHasErrors('name');
    }

    public function test_can_view_edit_page(): void
    {
        $costType = CostType::first();

        $response = $this->actingAs($this->admin)->get("/cost-types/{$costType->id}/edit");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('CostTypes/Edit')
                ->has('costType')
                ->where('costType.id', $costType->id)
        );
    }

    public function test_can_update_cost_type(): void
    {
        $costType = CostType::create([
            'name' => 'Original Name',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)->patch("/cost-types/{$costType->id}", [
            'name' => 'Updated Name',
            'is_active' => false,
        ]);

        $response->assertRedirect('/cost-types');
        
        $costType->refresh();
        $this->assertEquals('Updated Name', $costType->name);
        $this->assertFalse($costType->is_active);
    }

    public function test_can_toggle_active_status(): void
    {
        $costType = CostType::create([
            'name' => 'Test Type',
            'is_active' => true,
        ]);

        $this->actingAs($this->admin)->patch("/cost-types/{$costType->id}", [
            'name' => $costType->name,
            'is_active' => false,
        ]);

        $costType->refresh();
        $this->assertFalse($costType->is_active);
    }

    public function test_can_delete_unused_cost_type(): void
    {
        $costType = CostType::create([
            'name' => 'Unused Type',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)->delete("/cost-types/{$costType->id}");

        $response->assertRedirect('/cost-types');
        $this->assertDatabaseMissing('cost_types', ['id' => $costType->id]);
    }

    public function test_cannot_delete_cost_type_in_use(): void
    {
        $costType = CostType::first();
        
        // Create a group cost using this cost type
        GroupCost::create([
            'cost_date' => now(),
            'cost_type_id' => $costType->id,
            'amount' => 200,
            'currency' => 'EUR',
            'is_paid' => true,
            'created_by' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)->delete("/cost-types/{$costType->id}");

        $response->assertSessionHas('error');
        $this->assertDatabaseHas('cost_types', ['id' => $costType->id]);
    }

    public function test_requires_authentication(): void
    {
        $response = $this->get('/cost-types');
        $response->assertRedirect('/login');
    }

    public function test_requires_permission_to_manage(): void
    {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user)->get('/cost-types');
        $response->assertStatus(403);
    }

    public function test_shows_usage_count(): void
    {
        $costType = CostType::first();
        
        // Create some group costs
        GroupCost::create([
            'cost_date' => now(),
            'cost_type_id' => $costType->id,
            'amount' => 200,
            'currency' => 'EUR',
            'is_paid' => true,
            'created_by' => $this->admin->id,
        ]);

        GroupCost::create([
            'cost_date' => now(),
            'cost_type_id' => $costType->id,
            'amount' => 300,
            'currency' => 'EUR',
            'is_paid' => false,
            'created_by' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)->get('/cost-types');

        $response->assertStatus(200);
        
        // Verify the cost type has the correct usage count
        $costTypeWithCount = CostType::withCount('groupCosts')->find($costType->id);
        $this->assertEquals(2, $costTypeWithCount->group_costs_count);
    }
}
