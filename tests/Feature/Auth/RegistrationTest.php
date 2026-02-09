<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function user_can_view_registration_page()
    {
        $response = $this->get(route('register'));
        
        $response->assertStatus(200);
        $response->assertViewIs('frontend.auth.register');
    }

    /** @test */
    public function user_can_register_with_valid_data()
    {
        $response = $this->post(route('register'), [
            'name' => 'Test User',
            'email' => 'newuser@tesotunes.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'phone_number' => '+256700000000',
            'terms' => true,
        ]);

        // Check for validation errors
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('users', [
            'email' => 'newuser@tesotunes.com',
            'display_name' => 'Test User',
        ]);

        $user = User::where('email', 'newuser@tesotunes.com')->first();
        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('frontend.dashboard'));
    }

    /** @test */
    public function registration_requires_name()
    {
        $response = $this->post(route('register'), [
            'email' => 'test@tesotunes.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $response->assertSessionHasErrors('name');
        $this->assertGuest();
    }

    /** @test */
    public function registration_requires_email()
    {
        $response = $this->post(route('register'), [
            'name' => 'Test User',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    /** @test */
    public function email_must_be_unique()
    {
        User::factory()->create(['email' => 'existing@tesotunes.com']);

        $response = $this->post(route('register'), [
            'name' => 'Test User',
            'email' => 'existing@tesotunes.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    /** @test */
    public function email_must_be_valid_format()
    {
        $response = $this->post(route('register'), [
            'name' => 'Test User',
            'email' => 'invalid-email',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    /** @test */
    public function registration_requires_password()
    {
        $response = $this->post(route('register'), [
            'name' => 'Test User',
            'email' => 'test@tesotunes.com',
        ]);

        $response->assertSessionHasErrors('password');
        $this->assertGuest();
    }

    /** @test */
    public function password_must_be_confirmed()
    {
        $response = $this->post(route('register'), [
            'name' => 'Test User',
            'email' => 'test@tesotunes.com',
            'password' => 'Password123!',
            'password_confirmation' => 'DifferentPassword!',
        ]);

        $response->assertSessionHasErrors('password');
        $this->assertGuest();
    }

    /** @test */
    public function password_must_meet_minimum_length()
    {
        $response = $this->post(route('register'), [
            'name' => 'Test User',
            'email' => 'test@tesotunes.com',
            'password' => 'Short1!',
            'password_confirmation' => 'Short1!',
        ]);

        $response->assertSessionHasErrors('password');
        $this->assertGuest();
    }

    /** @test */
    public function password_is_hashed_in_database()
    {
        $password = 'Password123!';

        $this->post(route('register'), [
            'name' => 'Test User',
            'email' => 'test@tesotunes.com',
            'password' => $password,
            'password_confirmation' => $password,
            'phone_number' => '+256700000000',
            'terms' => true,
        ]);

        $user = User::where('email', 'test@tesotunes.com')->first();

        $this->assertNotEquals($password, $user->password);
        $this->assertTrue(Hash::check($password, $user->password));
    }

    /** @test */
    public function new_user_has_default_status()
    {
        $this->post(route('register'), [
            'name' => 'Test User',
            'email' => 'test@tesotunes.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'phone_number' => '+256700000000',
            'terms' => true,
        ]);

        $user = User::where('email', 'test@tesotunes.com')->first();

        // New users get 'active' status by default
        $this->assertEquals('active', $user->status);
    }

    /** @test */
    public function new_user_is_active_after_registration()
    {
        $this->post(route('register'), [
            'name' => 'Test User',
            'email' => 'test2@tesotunes.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'phone_number' => '+256700000001',
            'terms' => true,
        ]);

        $user = User::where('email', 'test2@tesotunes.com')->first();

        $this->assertTrue($user->is_active);
    }

    /** @test */
    public function user_is_logged_in_after_registration()
    {
        $this->post(route('register'), [
            'name' => 'Test User',
            'email' => 'test3@tesotunes.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'phone_number' => '+256700000002',
            'terms' => true,
        ]);

        $user = User::where('email', 'test3@tesotunes.com')->first();

        $this->assertAuthenticatedAs($user);
    }

    /** @test */
    public function phone_number_can_be_provided()
    {
        $this->post(route('register'), [
            'name' => 'Test User',
            'email' => 'test4@tesotunes.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'phone_number' => '+256700000003',
            'terms' => true,
        ]);

        $this->assertDatabaseHas('users', [
            'email' => 'test4@tesotunes.com',
            'phone' => '+256700000003',
        ]);
    }

    /** @test */
    public function phone_number_must_be_unique_if_provided()
    {
        User::factory()->create(['phone' => '+256700000000']);

        $response = $this->post(route('register'), [
            'name' => 'Test User',
            'email' => 'test5@tesotunes.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'phone_number' => '+256700000000',
            'terms' => true,
        ]);

        $response->assertSessionHasErrors('phone_number');
        $this->assertGuest();
    }
}
