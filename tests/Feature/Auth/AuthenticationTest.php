<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_and_register_pages_render_for_guests(): void
    {
        $this->get('/login')->assertOk()->assertInertia(fn (Assert $page) => $page->component('Auth/Login'));
        $this->get('/register')->assertOk()->assertInertia(fn (Assert $page) => $page->component('Auth/Register'));
    }

    public function test_member_can_login_with_username(): void
    {
        $user = User::factory()->create(['username' => 'penulis']);

        $this->post('/login', ['username' => 'penulis', 'password' => 'password'])
            ->assertRedirect('/dashboard/posts')
            ->assertSessionHas('success');

        $this->assertAuthenticatedAs($user);
    }

    public function test_admin_can_login_with_email_and_is_sent_to_the_admin_panel(): void
    {
        $admin = User::factory()->admin()->create(['email' => 'admin@blog.test']);

        $this->post('/login', ['username' => 'admin@blog.test', 'password' => 'password', 'remember' => true])
            ->assertRedirect('/admin/users');

        $this->assertAuthenticatedAs($admin);
    }

    public function test_login_fails_with_wrong_credentials(): void
    {
        User::factory()->create(['username' => 'penulis']);

        $this->from('/login')
            ->post('/login', ['username' => 'penulis', 'password' => 'salah'])
            ->assertRedirect('/login')
            ->assertSessionHasErrors('username');

        $this->assertGuest();
    }

    public function test_guest_can_register_as_member(): void
    {
        $this->post('/register', [
            'name' => 'Penulis Baru',
            'username' => 'penulis_baru',
            'email' => 'baru@blog.test',
            'password' => 'rahasia123',
            'password_confirmation' => 'rahasia123',
        ])->assertRedirect('/dashboard/posts');

        $user = User::query()->where('username', 'penulis_baru')->firstOrFail();
        $this->assertSame(User::ROLE_MEMBER, $user->role);
        $this->assertAuthenticatedAs($user);
    }

    public function test_registration_validates_input(): void
    {
        User::factory()->create(['username' => 'dipakai', 'email' => 'dipakai@blog.test']);

        $this->post('/register', [
            'name' => '',
            'username' => 'dipakai',
            'email' => 'dipakai@blog.test',
            'password' => 'pendek',
            'password_confirmation' => 'beda',
        ])->assertSessionHasErrors(['name', 'username', 'email', 'password']);

        $this->assertGuest();
    }

    public function test_user_can_logout(): void
    {
        $this->actingAs(User::factory()->create())
            ->post('/logout')
            ->assertRedirect('/');

        $this->assertGuest();
    }

    public function test_guests_are_redirected_to_login_and_users_away_from_guest_pages(): void
    {
        $this->get('/dashboard/posts')->assertRedirect('/login');

        $this->actingAs(User::factory()->create())->get('/login')->assertRedirect('/dashboard/posts');
        $this->actingAs(User::factory()->admin()->create())->get('/register')->assertRedirect('/admin/users');
    }

    public function test_shared_props_expose_the_authenticated_user(): void
    {
        $user = User::factory()->create(['name' => 'Budi Santoso']);

        $this->actingAs($user)
            ->get('/profile')
            ->assertInertia(fn (Assert $page) => $page
                ->where('auth.user.initials', 'BS')
                ->where('auth.user.is_admin', false)
                ->has('categories', 6)
                ->where('flash.success', null));
    }
}
