<?php

namespace Tests\Feature\Profile;

use App\Features\Post\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_page_shows_user_data_and_stats(): void
    {
        $user = User::factory()->create(['bio' => 'Halo']);
        Post::factory()->published()->for($user)->create();
        Post::factory()->draft()->for($user)->create();

        $this->actingAs($user)
            ->get('/profile')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Profile/Edit')
                ->where('profile.bio', 'Halo')
                ->missing('profile.password')
                ->where('stats', ['posts' => 2, 'published' => 1]));
    }

    public function test_user_can_update_profile_without_changing_password(): void
    {
        $user = User::factory()->create();
        $originalHash = $user->password;

        $this->actingAs($user)
            ->put('/profile', [
                'name' => 'Nama Baru',
                'username' => 'nama_baru',
                'email' => 'baru@blog.test',
                'bio' => 'Penulis teknologi.',
            ])
            ->assertSessionHas('success');

        $user->refresh();
        $this->assertSame(['Nama Baru', 'nama_baru', 'baru@blog.test', 'Penulis teknologi.'], [$user->name, $user->username, $user->email, $user->bio]);
        $this->assertSame($originalHash, $user->password);
    }

    public function test_user_can_change_password_with_current_password(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->put('/profile', [
            'name' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
            'current_password' => 'password',
            'password' => 'rahasia-baru',
            'password_confirmation' => 'rahasia-baru',
        ])->assertSessionHasNoErrors();

        $this->assertTrue(Hash::check('rahasia-baru', $user->refresh()->password));
    }

    public function test_password_change_requires_the_correct_current_password(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        $this->actingAs($user)->put('/profile', [
            'name' => $user->name,
            'username' => $other->username,
            'email' => $user->email,
            'current_password' => 'salah',
            'password' => 'rahasia-baru',
            'password_confirmation' => 'rahasia-baru',
        ])->assertSessionHasErrors(['current_password', 'username']);

        $this->assertTrue(Hash::check('password', $user->refresh()->password));
    }
}
