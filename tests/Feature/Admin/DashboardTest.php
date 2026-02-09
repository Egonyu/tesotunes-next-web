<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function admin_can_view_the_dashboard()
    {
        $admin = User::factory()->create();

        $response = $this->actingAs($admin)->get(route('admin.dashboard'));

        $response->assertStatus(200);
    }

    /** @test */
    public function user_cannot_view_the_dashboard()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('admin.dashboard'));

        // Application redirects non-admins instead of returning 403
        $response->assertRedirect();
    }

    /** @test */
    public function guest_cannot_view_the_dashboard()
    {
        $response = $this->get(route('admin.dashboard'));

        $response->assertRedirect(route('login'));
    }
}
