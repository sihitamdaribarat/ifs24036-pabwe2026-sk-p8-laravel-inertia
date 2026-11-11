<?php

namespace Tests\Feature\Admin;

use App\Features\Post\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminPanelTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->admin()->create(['name' => 'Admin Utama', 'username' => 'admin']);
    }

    public function test_members_cannot_access_admin_pages(): void
    {
        $member = User::factory()->create();

        foreach (['/admin/users', '/admin/posts', '/admin/posts/export', "/admin/users/{$member->id}/posts"] as $url) {
            $this->actingAs($member)->get($url)->assertForbidden();
        }
    }

    public function test_admin_can_list_and_search_users_with_post_counts(): void
    {
        $writer = User::factory()->create(['name' => 'Siti Penulis', 'username' => 'siti', 'email' => 'siti@blog.test']);
        Post::factory()->published()->for($writer)->create();
        Post::factory()->draft()->for($writer)->create();

        $this->actingAs($this->admin)
            ->get('/admin/users')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/UserList')
                ->has('users.data', 2)
                ->where('summary', ['users' => 2, 'admins' => 1, 'posts' => 2, 'published' => 1]));

        $this->get('/admin/users?search=SITI')
            ->assertInertia(fn (Assert $page) => $page
                ->has('users.data', 1)
                ->where('users.data.0.posts_count', 2)
                ->where('users.data.0.published_posts_count', 1)
                ->where('filters.search', 'SITI'));
    }

    public function test_admin_can_monitor_a_users_posts_read_only(): void
    {
        $writer = User::factory()->create();
        Post::factory()->count(2)->published()->for($writer)->create();
        Post::factory()->draft()->for($writer)->create();

        $this->actingAs($this->admin)
            ->get("/admin/users/{$writer->id}/posts?status=draft")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/UserPostList')
                ->where('owner.id', $writer->id)
                ->where('stats', ['total' => 3, 'published' => 2, 'draft' => 1])
                ->has('posts.data', 1));
    }

    public function test_admin_can_export_a_users_posts_and_all_posts(): void
    {
        $writer = User::factory()->create(['username' => 'siti']);
        Post::factory()->count(2)->for($writer)->create();
        Post::factory()->create();

        $response = $this->actingAs($this->admin)->get("/admin/users/{$writer->id}/posts/export")->assertOk();
        $this->assertStringContainsString('artikel-siti-', $response->headers->get('content-disposition'));

        $response = $this->get('/admin/posts/export')->assertOk();
        $this->assertStringContainsString('semua-artikel-', $response->headers->get('content-disposition'));
    }

    public function test_admin_can_monitor_all_posts_with_filters(): void
    {
        Post::factory()->published()->create(['title' => 'Terbit']);
        Post::factory()->draft()->create(['title' => 'Draf']);

        $this->actingAs($this->admin)
            ->get('/admin/posts')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Admin/PostList')->has('posts.data', 2));

        $this->get('/admin/posts?status=published')
            ->assertInertia(fn (Assert $page) => $page->has('posts.data', 1)->where('posts.data.0.title', 'Terbit'));
    }

    public function test_admin_can_toggle_roles_but_not_their_own(): void
    {
        $member = User::factory()->create();

        $this->actingAs($this->admin)->patch("/admin/users/{$member->id}/role")->assertSessionHas('success');
        $this->assertTrue($member->refresh()->isAdmin());

        $this->patch("/admin/users/{$member->id}/role");
        $this->assertFalse($member->refresh()->isAdmin());

        $this->patch("/admin/users/{$this->admin->id}/role")->assertSessionHas('error');
        $this->assertTrue($this->admin->refresh()->isAdmin());
    }

    public function test_admin_can_delete_users_with_their_posts_but_not_themselves(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('covers/a.jpg', 'img');
        $member = User::factory()->create();
        Post::factory()->for($member)->create(['cover_image_path' => 'covers/a.jpg']);
        Post::factory()->for($member)->create();

        $this->actingAs($this->admin)->delete("/admin/users/{$member->id}")->assertSessionHas('success');

        $this->assertModelMissing($member);
        $this->assertDatabaseCount('posts', 0);
        Storage::disk('public')->assertMissing('covers/a.jpg');

        $this->delete("/admin/users/{$this->admin->id}")->assertSessionHas('error');
        $this->assertModelExists($this->admin);
    }
}
