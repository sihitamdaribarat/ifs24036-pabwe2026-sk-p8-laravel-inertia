<?php

namespace App\Features\Post\Services;

use App\Features\Ai\DTO\GeneratedPostItem;
use App\Features\Post\Contracts\PostRepositoryInterface;
use App\Features\Post\Enums\PostCategory;
use App\Features\Post\Models\Post;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PostService
{
    public const COVER_DIRECTORY = 'covers';

    public function __construct(private readonly PostRepositoryInterface $posts) {}

    /**
     * @param  array{title: string, category: string|PostCategory, excerpt?: string|null, content: string, is_published?: bool}  $data
     */
    public function create(User $user, array $data): Post
    {
        $isPublished = (bool) ($data['is_published'] ?? false);

        return $this->posts->create([
            'user_id' => $user->id,
            'title' => $data['title'],
            'slug' => $this->uniqueSlug($data['title']),
            'category' => $data['category'],
            'excerpt' => $data['excerpt'] ?? null,
            'content' => $data['content'],
            'is_published' => $isPublished,
            'published_at' => $isPublished ? now() : null,
        ]);
    }

    /**
     * @param  array{title: string, category: string|PostCategory, excerpt?: string|null, content: string, is_published?: bool}  $data
     */
    public function update(Post $post, array $data): Post
    {
        $isPublished = (bool) ($data['is_published'] ?? $post->is_published);

        $attributes = [
            'title' => $data['title'],
            'category' => $data['category'],
            'excerpt' => $data['excerpt'] ?? null,
            'content' => $data['content'],
            'is_published' => $isPublished,
            'published_at' => $this->resolvePublishedAt($post, $isPublished),
        ];

        if ($data['title'] !== $post->title) {
            $attributes['slug'] = $this->uniqueSlug($data['title'], $post->id);
        }

        return $this->posts->update($post, $attributes);
    }

    public function delete(Post $post): void
    {
        $this->deleteCoverFile($post);
        $this->posts->delete($post);
    }

    public function togglePublish(Post $post): Post
    {
        $isPublished = ! $post->is_published;

        return $this->posts->update($post, [
            'is_published' => $isPublished,
            'published_at' => $this->resolvePublishedAt($post, $isPublished),
        ]);
    }

    public function uploadCover(Post $post, UploadedFile $file): Post
    {
        $this->deleteCoverFile($post);

        $path = $file->store(self::COVER_DIRECTORY, 'public');

        return $this->posts->update($post, ['cover_image_path' => $path]);
    }

    public function removeCover(Post $post): Post
    {
        $this->deleteCoverFile($post);

        return $this->posts->update($post, ['cover_image_path' => null]);
    }

    /**
     * @param  list<GeneratedPostItem>  $items
     * @return list<Post>
     */
    public function createMany(User $user, array $items, bool $publish = false): array
    {
        return DB::transaction(function () use ($user, $items, $publish) {
            $created = [];
            foreach ($items as $item) {
                $created[] = $this->create($user, [
                    'title' => $item->title,
                    'category' => $item->category,
                    'excerpt' => $item->excerpt,
                    'content' => $item->content,
                    'is_published' => $publish,
                ]);
            }

            return $created;
        });
    }

    public function uniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title) ?: 'artikel';
        $slug = $base;
        $suffix = 2;

        while ($this->posts->slugExists($slug, $ignoreId)) {
            $slug = $base.'-'.$suffix++;
        }

        return $slug;
    }

    private function resolvePublishedAt(Post $post, bool $isPublished): mixed
    {
        if (! $isPublished) {
            return null;
        }

        return $post->published_at ?? now();
    }

    private function deleteCoverFile(Post $post): void
    {
        if ($post->cover_image_path) {
            Storage::disk('public')->delete($post->cover_image_path);
        }
    }
}
