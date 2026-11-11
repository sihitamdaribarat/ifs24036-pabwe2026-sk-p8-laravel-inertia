<?php

namespace Tests\Feature\Post;

use App\Features\Post\Enums\PostCategory;
use App\Features\Post\Models\Post;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicPostTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_shows_only_published_posts(): void
    {
        Post::factory()->count(2)->published()->create();
        Post::factory()->draft()->create();

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/PostIndex')
                ->where('isHome', true)
                ->has('posts.data', 2));
    }

    public function test_articles_can_be_searched_and_filtered_by_category(): void
    {
        Post::factory()->published()->create(['title' => 'Belajar Laravel Inertia', 'category' => PostCategory::Teknologi]);
        Post::factory()->published()->create(['title' => 'Strategi Bisnis', 'content' => 'Membahas laravel untuk startup', 'category' => PostCategory::Bisnis]);
        Post::factory()->published()->create(['title' => 'Resep Kopi', 'excerpt' => 'Seduhan pagi', 'content' => 'Kopi', 'category' => PostCategory::GayaHidup]);

        $this->get('/articles?search=LARAVEL')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/PostIndex')
                ->where('isHome', false)
                ->has('posts.data', 2));

        $this->get('/articles?search=seduhan')
            ->assertInertia(fn (Assert $page) => $page->has('posts.data', 1));

        $this->get('/articles?search=laravel&category=Bisnis')
            ->assertInertia(fn (Assert $page) => $page
                ->has('posts.data', 1)
                ->where('posts.data.0.title', 'Strategi Bisnis')
                ->where('filters.category', 'Bisnis'));
    }

    public function test_published_article_can_be_read_with_related_posts(): void
    {
        $post = Post::factory()->published()->create(['category' => PostCategory::Opini]);
        Post::factory()->published()->create(['category' => PostCategory::Opini]);
        Post::factory()->draft()->create(['category' => PostCategory::Opini]);
        Post::factory()->published()->create(['category' => PostCategory::Bisnis]);

        $this->get("/articles/{$post->slug}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/PostShow')
                ->where('post.id', $post->id)
                ->where('post.user.name', $post->user->name)
                ->missing('post.user.email')
                ->has('related', 1));
    }

    public function test_draft_or_unknown_articles_return_404(): void
    {
        $draft = Post::factory()->draft()->create();

        $this->get("/articles/{$draft->slug}")->assertNotFound();
        $this->get('/articles/tidak-ada')->assertNotFound();
    }

    public function test_cover_images_are_served_from_the_public_disk(): void
    {
        Storage::fake('public');
        $path = UploadedFile::fake()->image('cover.jpg')->store('covers', 'public');

        $this->get('/media/'.$path)->assertOk()->assertHeader('Cache-Control', 'max-age=604800, public');
        $this->get('/media/covers/hilang.jpg')->assertNotFound();
        $this->get('/media/../.env')->assertNotFound();
    }

    public function test_cover_url_is_exposed_on_the_post(): void
    {
        $post = Post::factory()->make(['cover_image_path' => 'covers/abc.jpg']);

        $this->assertSame(url('media/covers/abc.jpg'), $post->cover_image_url);
        $this->assertNull(Post::factory()->make()->cover_image_url);
    }
}
