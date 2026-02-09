<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;

class LogoutTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function authenticated_user_can_logout()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('logout'));

        $this->assertGuest();
        // After logout, user is redirected to login page
        $response->assertRedirect(route('login'));
    }

    /** @test */
    public function unauthenticated_user_cannot_logout()
    {
        $response = $this->post(route('logout'));

        $response->assertRedirect(route('login'));
    }

    /** @test */
    public function session_is_invalidated_after_logout()
    {
        $user = User::factory()->create();

        $this->actingAs($user);
        $oldSessionId = session()->getId();

        $this->post(route('logout'));

        $newSessionId = session()->getId();

        $this->assertNotEquals($oldSessionId, $newSessionId);
    }

    /** @test */
    public function csrf_token_is_regenerated_after_logout()
    {
        $user = User::factory()->create();

        $this->actingAs($user);
        $oldToken = csrf_token();

        $this->post(route('logout'));

        $newToken = csrf_token();

        $this->assertNotEquals($oldToken, $newToken);
    }
}
