<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function user_can_view_login_page()
    {
        $response = $this->get(route('login'));
        
        $response->assertStatus(200);
        $response->assertViewIs('frontend.auth.login-choice');
    }

    /** @test */
    public function authenticated_user_is_redirected_from_login_page()
    {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user)->get(route('login'));
        
        $response->assertRedirect(route('frontend.dashboard'));
    }

    /** @test */
    public function user_can_login_with_valid_credentials()
    {
        $user = User::factory()->create([
            'email' => 'test@tesotunes.com',
            'password' => Hash::make('password123'),
            'status' => 'active',
        ]);

        $response = $this->post('/user/login', [
            'email' => 'test@tesotunes.com',
            'password' => 'password123',
        ]);

        $this->assertAuthenticatedAs($user);
    }

    /** @test */
    public function user_cannot_login_with_invalid_password()
    {
        $user = User::factory()->create([
            'email' => 'test@tesotunes.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->post('/user/login', [
            'email' => 'test@tesotunes.com',
            'password' => 'wrongpassword',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('email');
    }

    /** @test */
    public function user_cannot_login_with_invalid_email()
    {
        $response = $this->post('/user/login', [
            'email' => 'nonexistent@tesotunes.com',
            'password' => 'password123',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('email');
    }

    /** @test */
    public function login_requires_email()
    {
        $response = $this->post('/user/login', [
            'password' => 'password123',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    /** @test */
    public function login_requires_password()
    {
        $response = $this->post('/user/login', [
            'email' => 'test@tesotunes.com',
        ]);

        $response->assertSessionHasErrors('password');
        $this->assertGuest();
    }

    /** @test */
    public function email_must_be_valid_format()
    {
        $response = $this->post('/user/login', [
            'email' => 'invalid-email',
            'password' => 'password123',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    /** @test */
    public function session_is_regenerated_after_login()
    {
        $user = User::factory()->create([
            'email' => 'test@tesotunes.com',
            'password' => Hash::make('password123'),
        ]);

        $oldSessionId = session()->getId();

        $this->post('/user/login', [
            'email' => 'test@tesotunes.com',
            'password' => 'password123',
        ]);

        $newSessionId = session()->getId();

        $this->assertNotEquals($oldSessionId, $newSessionId);
    }

    /** @test */
    public function last_login_is_updated_after_successful_login()
    {
        $user = User::factory()->create([
            'email' => 'test@tesotunes.com',
            'password' => Hash::make('password123'),
            'last_login_at' => null,
        ]);

        $this->post('/user/login', [
            'email' => 'test@tesotunes.com',
            'password' => 'password123',
        ]);

        $user->refresh();
        $this->assertNotNull($user->last_login_at);
    }

    /** @test */
    public function artist_is_redirected_to_artist_dashboard_after_login()
    {
        // Create artist role
        $artistRole = Role::factory()->create([
            'name' => 'artist',
            'display_name' => 'Artist',
        ]);

        $artist = User::factory()->create([
            'email' => 'artist@tesotunes.com',
            'password' => Hash::make('password123'),
            'is_artist' => true,
            'is_verified' => true,
            'status' => 'verified', // Must be 'verified' for isVerified() check
            'phone_verified_at' => now(), // Phone must be verified for artist dashboard redirect
        ]);
        
        // Assign artist role
        $artist->roles()->attach($artistRole->id, ['assigned_at' => now()]);

        $response = $this->post('/artist/login', [
            'email' => 'artist@tesotunes.com',
            'password' => 'password123',
        ]);

        $this->assertAuthenticatedAs($artist);
        $response->assertRedirect(route('frontend.artist.dashboard'));
    }

    /** @test */
    public function admin_is_redirected_to_backend_after_login()
    {
        // Create admin role
        $adminRole = Role::factory()->create([
            'name' => 'admin',
            'display_name' => 'Admin',
        ]);

        $admin = User::factory()->create([
            'email' => 'admin@tesotunes.com',
            'password' => Hash::make('password123'),
            'status' => 'active',
        ]);

        // Assign admin role
        $admin->roles()->attach($adminRole->id, ['assigned_at' => now()]);

        $response = $this->post('/user/login', [
            'email' => 'admin@tesotunes.com',
            'password' => 'password123',
        ]);

        $this->assertAuthenticatedAs($admin);
        $response->assertRedirect(route('admin.dashboard'));
    }

    /** @test */
    public function remember_me_functionality_works()
    {
        $user = User::factory()->create([
            'email' => 'test@tesotunes.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->post('/user/login', [
            'email' => 'test@tesotunes.com',
            'password' => 'password123',
            'remember' => true,
        ]);

        $this->assertAuthenticatedAs($user);
        // Verify user has remember token set
        $user->refresh();
        $this->assertNotNull($user->remember_token);
    }
}
