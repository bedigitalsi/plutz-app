<?php

namespace Tests\Feature;

use App\Models\Inquiry;
use App\Models\Income;
use App\Models\PerformanceType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PerformanceTypeTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->seed();
        
        $this->admin = User::where('email', 'admin@plutz.app')->first();
    }

    public function test_can_view_performance_types_index(): void
    {
        $response = $this->actingAs($this->admin)->get('/performance-types');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('PerformanceTypes/Index'));
    }

    public function test_can_view_create_page(): void
    {
        $response = $this->actingAs($this->admin)->get('/performance-types/create');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('PerformanceTypes/Create'));
    }

    public function test_can_create_performance_type(): void
    {
        $response = $this->actingAs($this->admin)->post('/performance-types', [
            'name' => 'Festival',
            'is_active' => true,
        ]);

        $response->assertRedirect('/performance-types');
        $this->assertDatabaseHas('performance_types', [
            'name' => 'Festival',
            'is_active' => true,
        ]);
    }

    public function test_cannot_create_duplicate_performance_type(): void
    {
        PerformanceType::create(['name' => 'Wedding', 'is_active' => true]);

        $response = $this->actingAs($this->admin)->post('/performance-types', [
            'name' => 'Wedding',
            'is_active' => true,
        ]);

        $response->assertSessionHasErrors('name');
    }

    public function test_can_view_edit_page(): void
    {
        $performanceType = PerformanceType::first();

        $response = $this->actingAs($this->admin)->get("/performance-types/{$performanceType->id}/edit");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('PerformanceTypes/Edit')
                ->has('performanceType')
                ->where('performanceType.id', $performanceType->id)
        );
    }

    public function test_can_update_performance_type(): void
    {
        $performanceType = PerformanceType::create([
            'name' => 'Original Name',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)->patch("/performance-types/{$performanceType->id}", [
            'name' => 'Updated Name',
            'is_active' => false,
        ]);

        $response->assertRedirect('/performance-types');
        
        $performanceType->refresh();
        $this->assertEquals('Updated Name', $performanceType->name);
        $this->assertFalse($performanceType->is_active);
    }

    public function test_can_toggle_active_status(): void
    {
        $performanceType = PerformanceType::create([
            'name' => 'Test Type',
            'is_active' => true,
        ]);

        $this->actingAs($this->admin)->patch("/performance-types/{$performanceType->id}", [
            'name' => $performanceType->name,
            'is_active' => false,
        ]);

        $performanceType->refresh();
        $this->assertFalse($performanceType->is_active);
    }

    public function test_can_delete_unused_performance_type(): void
    {
        $performanceType = PerformanceType::create([
            'name' => 'Unused Type',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)->delete("/performance-types/{$performanceType->id}");

        $response->assertRedirect('/performance-types');
        $this->assertDatabaseMissing('performance_types', ['id' => $performanceType->id]);
    }

    public function test_cannot_delete_performance_type_in_use(): void
    {
        $performanceType = PerformanceType::first();
        $bandSize = \App\Models\BandSize::first();
        
        // Create an inquiry using this performance type
        Inquiry::create([
            'received_at' => now(),
            'performance_date' => now()->addDays(30),
            'performance_time_mode' => 'text_time',
            'performance_time_text' => 'Evening',
            'location_name' => 'Test Location',
            'contact_person' => 'Test Contact',
            'performance_type_id' => $performanceType->id,
            'band_size_id' => $bandSize->id,
            'status' => 'pending',
            'created_by' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)->delete("/performance-types/{$performanceType->id}");

        $response->assertSessionHas('error');
        $this->assertDatabaseHas('performance_types', ['id' => $performanceType->id]);
    }

    public function test_requires_authentication(): void
    {
        $response = $this->get('/performance-types');
        $response->assertRedirect('/login');
    }

    public function test_requires_permission_to_manage(): void
    {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user)->get('/performance-types');
        $response->assertStatus(403);
    }

    public function test_shows_usage_count(): void
    {
        $performanceType = PerformanceType::first();
        $bandSize = \App\Models\BandSize::first();
        
        // Create an inquiry
        Inquiry::create([
            'received_at' => now(),
            'performance_date' => now()->addDays(30),
            'performance_time_mode' => 'text_time',
            'performance_time_text' => 'Evening',
            'location_name' => 'Test Location',
            'contact_person' => 'Test Contact',
            'performance_type_id' => $performanceType->id,
            'band_size_id' => $bandSize->id,
            'status' => 'pending',
            'created_by' => $this->admin->id,
        ]);

        // Create an income
        Income::create([
            'income_date' => now(),
            'performance_date' => now()->addDays(30),
            'performance_type_id' => $performanceType->id,
            'client_name' => 'Test Client',
            'amount' => 1000,
            'currency' => 'EUR',
            'created_by' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)->get('/performance-types');

        $response->assertStatus(200);
        
        // Verify the performance type has the correct usage count
        $performanceTypeWithCount = PerformanceType::withCount(['inquiries', 'incomes'])->find($performanceType->id);
        $this->assertEquals(1, $performanceTypeWithCount->inquiries_count);
        $this->assertEquals(1, $performanceTypeWithCount->incomes_count);
    }
}
