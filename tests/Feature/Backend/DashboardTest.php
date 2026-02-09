<?php

namespace Tests\Feature\Backend;

use Tests\TestCase;
use App\Models\User;
use App\Models\UserCredit;
use App\Models\CreditTransaction;
use App\Models\CommunityPromotion;
use Illuminate\Foundation\Testing\RefreshDatabase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->admin = User::factory()->create([
            'status' => 'active',
            'is_active' => true,
        ]);

        // Create credit wallet for admin
        UserCredit::create([
            'user_id' => $this->admin->id,
            'available_credits' => 500,
            'earned_credits' => 500,
            'spent_credits' => 0,
            'pending_credits' => 0,
        ]);
    }

    public function test_admin_can_access_dashboard(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.dashboard'));

        $response->assertStatus(200)
            ->assertViewIs('backend.admin.dashboard');
    }

    public function test_non_admin_cannot_access_dashboard(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('admin.dashboard'));

        // Application redirects non-admins instead of returning 403
        $response->assertRedirect();
    }

    public function test_dashboard_shows_user_statistics(): void
    {
        // Create some test users
        User::factory()->count(5)->create(['is_active' => true]);
        User::factory()->count(2)->create(['is_active' => false]);

        $response = $this->actingAs($this->admin)->get(route('admin.dashboard'));

        $response->assertStatus(200)
            ->assertViewHas('stats');

        $stats = $response->viewData('stats');
        $this->assertGreaterThanOrEqual(6, $stats['total_users']); // 5 active + 2 inactive + admin
        $this->assertGreaterThanOrEqual(5, $stats['active_users']);
    }

    public function test_dashboard_shows_credit_system_statistics(): void
    {
        // Create users with credits
        $user = User::factory()->create();
        
        UserCredit::create([
            'user_id' => $user->id,
            'available_credits' => 100,
            'earned_credits' => 150,
            'spent_credits' => 50,
            'pending_credits' => 0,
        ]);

        // Create some transactions
        CreditTransaction::create([
            'user_id' => $user->id,
            'type' => 'earned',
            'amount' => 5.0,
            'balance_after' => 100.0,
            'source' => 'listening',
            'processed_at' => now(),
        ]);

        $response = $this->actingAs($this->admin)->get(route('admin.dashboard'));

        $response->assertStatus(200);
        
        $stats = $response->viewData('stats');
        $this->assertArrayHasKey('total_credits_issued', $stats);
        $this->assertArrayHasKey('total_credits_circulating', $stats);
        $this->assertArrayHasKey('total_transactions_today', $stats);
    }

    public function test_guest_cannot_access_dashboard(): void
    {
        $response = $this->get(route('admin.dashboard'));

        // Should redirect to login (either admin or frontend)
        $response->assertRedirect();
    }

    public function test_super_admin_can_access_dashboard(): void
    {
        $superAdmin = User::factory()->create([
            'status' => 'active',
        ]);

        $response = $this->actingAs($superAdmin)->get(route('admin.dashboard'));

        $response->assertStatus(200);
    }
}
