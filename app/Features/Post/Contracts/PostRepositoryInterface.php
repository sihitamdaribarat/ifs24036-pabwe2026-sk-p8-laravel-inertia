<?php

namespace App\Features\Post\Contracts;

use App\Features\Post\Models\Post;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface PostRepositoryInterface
{
    /**
     * @param  array{search?: string|null, category?: string|null, status?: string|null}  $filters
     * @return LengthAwarePaginator<int, Post>
     */
    public function paginateForUser(User $user, array $filters = [], int $perPage = 10): LengthAwarePaginator;

    /**
     * @return array{total: int, published: int, draft: int}
     */
    public function statsForUser(User $user): array;

    /**
     * @param  array{search?: string|null, category?: string|null}  $filters
     * @return LengthAwarePaginator<int, Post>
     */
    public function paginatePublished(array $filters = [], int $perPage = 9): LengthAwarePaginator;

    public function findPublishedBySlug(string $slug): ?Post;

    /**
     * @return Collection<int, Post>
     */
    public function relatedPublished(Post $post, int $limit = 3): Collection;

    /**
     * @param  array{search?: string|null, category?: string|null, status?: string|null}  $filters
     * @return LengthAwarePaginator<int, Post>
     */
    public function paginateAll(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /**
     * @return Collection<int, Post>
     */
    public function allForExport(?User $user = null): Collection;

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function create(array $attributes): Post;

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function update(Post $post, array $attributes): Post;

    public function delete(Post $post): void;

    public function slugExists(string $slug, ?int $ignoreId = null): bool;
}
