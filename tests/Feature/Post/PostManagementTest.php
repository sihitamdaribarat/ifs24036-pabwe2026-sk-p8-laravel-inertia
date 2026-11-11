<?php

namespace Tests\Feature\Post;

use App\Features\Post\Enums\PostCategory;
use App\Features\Post\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PostManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(array $overrides = []): array
    {
        return [
            'title' => 'Panduan Laravel 13',
            'category' => 'Teknologi',
            'excerpt' => 'Ringkasan singkat.',
            'content' => "## Pendahuluan\n\nIsi artikel.",
            'is_published' => false,
            ...$overrides,
        ];
    }

    public function test_index_lists_own_posts_with_statistics_and_filters(): void
    {
        Post::factory()->published()->for($this->user)->create(['title' => 'Alpha Laravel', 'category' => PostCategory::Teknologi]);
        Post::factory()->draft()->for($this->user)->create(['title' => 'Beta Bisnis', 'category' => PostCategory::Bisnis]);
        Post::factory()->draft()->for($this->user)->create(['title' => 'Gamma', 'category' => PostCategory::Bisnis]);
        Post::factory()->published()->create();

        $this->actingAs($this->user)
            ->get('/dashboard/posts')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Post/Index')
                ->has('posts.data', 3)
                ->where('stats', ['total' => 3, 'published' => 1, 'draft' => 2])
                ->where('aiDrafts', [])
                ->where('aiMaxItems', 5));

        $this->get('/dashboard/posts?status=published')
            ->assertInertia(fn (Assert $page) => $page->has('posts.data', 1)->where('posts.data.0.title', 'Alpha Laravel'));

        $this->get('/dashboard/posts?status=draft&category=Bisnis&search=beta')
            ->assertInertia(fn (Assert $page) => $page->has('posts.data', 1)->where('posts.data.0.title', 'Beta Bisnis'));
    }

    public function test_member_can_create_draft_and_published_posts_with_unique_slugs(): void
    {
        $this->actingAs($this->user)->post('/dashboard/posts', $this->payload())->assertSessionHas('success');
        $this->post('/dashboard/posts', $this->payload(['is_published' => true]))->assertSessionHas('success');
        $this->post('/dashboard/posts', $this->payload(['title' => '!!!']))->assertSessionHas('success');

        $posts = Post::query()->orderBy('id')->get();
        $this->assertSame(['panduan-laravel-13', 'panduan-laravel-13-2', 'artikel'], $posts->pluck('slug')->all());
        $this->assertFalse($posts[0]->is_published);
        $this->assertNull($posts[0]->published_at);
        $this->assertTrue($posts[1]->is_published);
        $this->assertNotNull($posts[1]->published_at);
    }

    public function test_store_validates_input(): void
    {
        $this->actingAs($this->user)
            ->post('/dashboard/posts', ['title' => '', 'category' => 'Olahraga', 'content' => ''])
            ->assertSessionHasErrors(['title', 'category', 'content']);
    }

    public function test_owner_can_view_post_detail(): void
    {
        $post = Post::factory()->for($this->user)->create();

        $this->actingAs($this->user)
            ->get("/dashboard/posts/{$post->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Post/Show')->where('post.id', $post->id));
    }

    public function test_other_users_cannot_access_someone_elses_post(): void
    {
        $post = Post::factory()->create();

        $this->actingAs($this->user)->get("/dashboard/posts/{$post->id}")->assertForbidden();
        $this->put("/dashboard/posts/{$post->id}", $this->payload())->assertForbidden();
        $this->delete("/dashboard/posts/{$post->id}")->assertForbidden();
        $this->patch("/dashboard/posts/{$post->id}/publish")->assertForbidden();

        $this->assertDatabaseHas('posts', ['id' => $post->id]);
    }

    public function test_owner_can_update_post_and_slug_follows_title(): void
    {
        $post = Post::factory()->published()->for($this->user)->create(['title' => 'Judul Lama', 'slug' => 'judul-lama']);
        $publishedAt = $post->published_at;

        $this->actingAs($this->user)
            ->put("/dashboard/posts/{$post->id}", $this->payload(['title' => 'Judul Baru', 'is_published' => true]))
            ->assertSessionHas('success');

        $post->refresh();
        $this->assertSame('judul-baru', $post->slug);
        $this->assertSame(PostCategory::Teknologi, $post->category);
        $this->assertTrue($post->is_published);
        $this->assertEquals($publishedAt->timestamp, $post->published_at->timestamp);

        $this->put("/dashboard/posts/{$post->id}", $this->payload(['title' => 'Judul Baru', 'is_published' => false]));

        $post->refresh();
        $this->assertSame('judul-baru', $post->slug);
        $this->assertFalse($post->is_published);
        $this->assertNull($post->published_at);
    }

    public function test_update_keeps_its_own_slug_when_title_is_renamed_back(): void
    {
        $post = Post::factory()->for($this->user)->create(['title' => 'Satu', 'slug' => 'dua']);

        $this->actingAs($this->user)->put("/dashboard/posts/{$post->id}", $this->payload(['title' => 'Dua']));

        $this->assertSame('dua', $post->refresh()->slug);
    }

    public function test_toggle_publish_switches_status(): void
    {
        $post = Post::factory()->draft()->for($this->user)->create();

        $this->actingAs($this->user)
            ->patch("/dashboard/posts/{$post->id}/publish")
            ->assertSessionHas('success', 'Artikel dipublikasikan.');
        $this->assertTrue($post->refresh()->is_published);
        $this->assertNotNull($post->published_at);

        $this->patch("/dashboard/posts/{$post->id}/publish")->assertSessionHas('success', 'Artikel dijadikan draf.');
        $this->assertFalse($post->refresh()->is_published);
        $this->assertNull($post->published_at);
    }

    public function test_owner_can_upload_replace_and_remove_cover(): void
    {
        Storage::fake('public');
        $post = Post::factory()->for($this->user)->create();

        $this->actingAs($this->user)
            ->post("/dashboard/posts/{$post->id}/cover", ['cover' => UploadedFile::fake()->image('satu.jpg')])
            ->assertSessionHas('success');
        $first = $post->refresh()->cover_image_path;
        Storage::disk('public')->assertExists($first);

        $this->post("/dashboard/posts/{$post->id}/cover", ['cover' => UploadedFile::fake()->image('dua.png')]);
        $second = $post->refresh()->cover_image_path;
        Storage::disk('public')->assertMissing($first);
        Storage::disk('public')->assertExists($second);

        $this->delete("/dashboard/posts/{$post->id}/cover")->assertSessionHas('success');
        Storage::disk('public')->assertMissing($second);
        $this->assertNull($post->refresh()->cover_image_path);
    }

    public function test_cover_upload_validates_image(): void
    {
        $post = Post::factory()->for($this->user)->create();

        $this->actingAs($this->user)
            ->post("/dashboard/posts/{$post->id}/cover", ['cover' => UploadedFile::fake()->create('doc.pdf', 10, 'application/pdf')])
            ->assertSessionHasErrors('cover');
    }

    public function test_owner_can_delete_post_with_its_cover(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('covers/x.jpg', 'img');
        $post = Post::factory()->for($this->user)->create(['cover_image_path' => 'covers/x.jpg']);

        $this->actingAs($this->user)
            ->delete("/dashboard/posts/{$post->id}")
            ->assertRedirect('/dashboard/posts');

        $this->assertDatabaseMissing('posts', ['id' => $post->id]);
        Storage::disk('public')->assertMissing('covers/x.jpg');
    }
}
