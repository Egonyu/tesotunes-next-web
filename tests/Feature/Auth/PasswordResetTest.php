<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function user_can_view_password_reset_request_page()
    {
        $response = $this->get(route('password.request'));

        $response->assertStatus(200);
        $response->assertViewIs('frontend.auth.forgot-password');
    }

    /** @test */
    public function user_can_request_password_reset_link()
    {
        $user = User::factory()->create(['email' => 'test@tesotunes.com']);

        $response = $this->post(route('password.email'), [
            'email' => 'test@tesotunes.com',
        ]);

        $response->assertSessionHas('status');
    }

    /** @test */
    public function password_reset_request_requires_email()
    {
        $response = $this->post(route('password.email'), []);

        $response->assertSessionHasErrors('email');
    }

    /** @test */
    public function email_must_exist_in_database()
    {
        $response = $this->post(route('password.email'), [
            'email' => 'nonexistent@tesotunes.com',
        ]);

        $response->assertSessionHasErrors('email');
    }

    /** @test */
    public function user_can_view_password_reset_form_with_valid_token()
    {
        $user = User::factory()->create();
        $token = Password::createToken($user);

        $response = $this->get(route('password.reset', ['token' => $token]));

        $response->assertStatus(200);
        $response->assertViewIs('frontend.auth.reset-password');
    }

    /** @test */
    public function user_can_reset_password_with_valid_token()
    {
        $user = User::factory()->create(['email' => 'test@tesotunes.com']);
        $token = Password::createToken($user);

        $response = $this->post(route('password.update'), [
            'token' => $token,
            'email' => 'test@tesotunes.com',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);

        $user->refresh();

        $this->assertTrue(Hash::check('NewPassword123!', $user->password));
        $response->assertRedirect(route('login'));
    }

    /** @test */
    public function password_reset_requires_valid_token()
    {
        $user = User::factory()->create(['email' => 'test@tesotunes.com']);

        $response = $this->post(route('password.update'), [
            'token' => 'invalid-token',
            'email' => 'test@tesotunes.com',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);

        $response->assertSessionHasErrors('email');
    }

    /** @test */
    public function password_reset_requires_matching_email()
    {
        $user = User::factory()->create(['email' => 'test@tesotunes.com']);
        $token = Password::createToken($user);

        $response = $this->post(route('password.update'), [
            'token' => $token,
            'email' => 'wrong@tesotunes.com',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);

        $response->assertSessionHasErrors('email');
    }

    /** @test */
    public function password_reset_requires_password_confirmation()
    {
        $user = User::factory()->create(['email' => 'test@tesotunes.com']);
        $token = Password::createToken($user);

        $response = $this->post(route('password.update'), [
            'token' => $token,
            'email' => 'test@tesotunes.com',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'DifferentPassword!',
        ]);

        $response->assertSessionHasErrors('password');
    }

    /** @test */
    public function password_reset_token_expires()
    {
        $user = User::factory()->create(['email' => 'test@tesotunes.com']);
        
        // Create token and manually expire it
        $token = Str::random(60);
        \DB::table('password_reset_tokens')->insert([
            'email' => 'test@tesotunes.com',
            'token' => Hash::make($token),
            'created_at' => now()->subHours(2), // Expired
        ]);

        $response = $this->post(route('password.update'), [
            'token' => $token,
            'email' => 'test@tesotunes.com',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);

        $response->assertSessionHasErrors('email');
    }

    /** @test */
    public function new_password_must_meet_requirements()
    {
        $user = User::factory()->create(['email' => 'test@tesotunes.com']);
        $token = Password::createToken($user);

        $response = $this->post(route('password.update'), [
            'token' => $token,
            'email' => 'test@tesotunes.com',
            'password' => 'short',
            'password_confirmation' => 'short',
        ]);

        $response->assertSessionHasErrors('password');
    }
}
