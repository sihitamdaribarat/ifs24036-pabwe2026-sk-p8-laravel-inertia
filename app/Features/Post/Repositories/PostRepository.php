<?php

namespace App\Features\Post\Repositories;

use App\Features\Post\Contracts\PostRepositoryInterface;
use App\Features\Post\Models\Post;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class PostRepository implements PostRepositoryInterface
{
    public function paginateForUser(User $user, array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = Post::query()->where('user_id', $user->id);

        return $this->applyFilters($query, $filters)
            ->latest('updated_at')
            ->latest('id')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function statsForUser(User $user): array
    {
        $total = Post::query()->where('user_id', $user->id)->count();
        $published = Post::query()->where('user_id', $user->id)->published()->count();

        return [
            'total' => $total,
            'published' => $published,
            'draft' => $total - $published,
        ];
    }

    public function paginatePublished(array $filters = [], int $perPage = 9): LengthAwarePaginator
    {
        $query = Post::query()->published()->with('user:id,name,username');

        return $this->applyFilters($query, $filters)
            ->latest('published_at')
            ->latest('id')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function findPublishedBySlug(string $slug): ?Post
    {
        return Post::query()
            ->published()
            ->with('user:id,name,username,bio')
            ->where('slug', $slug)
            ->first();
    }

    public function relatedPublished(Post $post, int $limit = 3): Collection
    {
        return Post::query()
            ->published()
            ->with('user:id,name,username')
            ->whereKeyNot($post->id)
            ->where('category', $post->category)
            ->latest('published_at')
            ->limit($limit)
            ->get();
    }

    public function paginateAll(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Post::query()->with('user:id,name,username,email');

        return $this->applyFilters($query, $filters)
            ->latest('created_at')
            ->latest('id')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function allForExport(?User $user = null): Collection
    {
        return Post::query()
            ->with('user:id,name,username,email')
            ->when($user, fn (Builder $query, User $user) => $query->where('user_id', $user->id))
            ->orderBy('id')
            ->get();
    }

    public function create(array $attributes): Post
    {
        return Post::query()->create($attributes);
    }

    public function update(Post $post, array $attributes): Post
    {
        $post->update($attributes);

        return $post->refresh();
    }

    public function delete(Post $post): void
    {
        $post->delete();
    }

    public function slugExists(string $slug, ?int $ignoreId = null): bool
    {
        return Post::query()
            ->where('slug', $slug)
            ->when($ignoreId, fn (Builder $query, int $id) => $query->whereKeyNot($id))
            ->exists();
    }

    /**
     * @param  Builder<Post>  $query
     * @param  array{search?: string|null, category?: string|null, status?: string|null}  $filters
     * @return Builder<Post>
     */
    private function applyFilters(Builder $query, array $filters): Builder
    {
        $search = trim((string) ($filters['search'] ?? ''));
        $category = $filters['category'] ?? null;
        $status = $filters['status'] ?? null;

        if ($search !== '') {
            $term = '%'.mb_strtolower($search).'%';
            $query->where(function (Builder $inner) use ($term) {
                $inner->whereRaw('LOWER(title) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(excerpt) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(content) LIKE ?', [$term]);
            });
        }

        if ($category) {
            $query->where('category', $category);
        }

        if ($status === 'published') {
            $query->where('is_published', true);
        } elseif ($status === 'draft') {
            $query->where('is_published', false);
        }

        return $query;
    }
}
