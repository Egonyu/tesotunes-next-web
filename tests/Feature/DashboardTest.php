<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_regular_user_dashboard_loads_successfully()
    {
        $user = User::factory()->create([
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($user)->get('/timeline');

        $response->assertStatus(200);
        $response->assertViewIs('frontend.dashboard-hybrid');
    }

    public function test_artist_dashboard_loads_successfully()
    {
        $user = User::factory()->create([
            'status' => 'active',
            'email_verified_at' => now(),
            'phone_verified_at' => now(),
        ]);

        // Create an Artist model for the user
        \App\Models\Artist::factory()->create([
            'user_id' => $user->id,
        ]);

        $response = $this->actingAs($user)->get('/artist/dashboard');

        $response->assertStatus(200);
        $response->assertViewIs('frontend.artist.dashboard');
    }

    public function test_guest_cannot_access_regular_dashboard()
    {
        $response = $this->get('/dashboard');

        $response->assertRedirect('/login');
    }

    public function test_guest_cannot_access_artist_dashboard()
    {
        $response = $this->get('/artist/dashboard');

        $response->assertRedirect('/login');
    }

    public function test_regular_user_cannot_access_artist_dashboard()
    {
        $user = User::factory()->create([
            'status' => 'active',
        ]);

        $response = $this->actingAs($user)->get('/artist/dashboard');

        $response->assertStatus(403);
    }
}
