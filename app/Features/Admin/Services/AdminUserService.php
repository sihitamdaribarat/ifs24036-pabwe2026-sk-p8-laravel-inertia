<?php

namespace App\Features\Admin\Services;

use App\Features\Post\Models\Post;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Storage;

class AdminUserService
{
    /**
     * @return LengthAwarePaginator<int, User>
     */
    public function paginateUsers(?string $search = null, int $perPage = 15): LengthAwarePaginator
    {
        $term = mb_strtolower(trim((string) $search));

        return User::query()
            ->withCount([
                'posts',
                'posts as published_posts_count' => fn (Builder $query) => $query->where('is_published', true),
            ])
            ->when($term !== '', function (Builder $query) use ($term) {
                $like = '%'.$term.'%';
                $query->where(function (Builder $inner) use ($like) {
                    $inner->whereRaw('LOWER(name) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(username) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(email) LIKE ?', [$like]);
                });
            })
            ->orderByDesc('role')
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * @return array{users: int, admins: int, posts: int, published: int}
     */
    public function summary(): array
    {
        return [
            'users' => User::query()->count(),
            'admins' => User::query()->where('role', User::ROLE_ADMIN)->count(),
            'posts' => Post::query()->count(),
            'published' => Post::query()->published()->count(),
        ];
    }

    public function toggleRole(User $user): User
    {
        $user->update([
            'role' => $user->isAdmin() ? User::ROLE_MEMBER : User::ROLE_ADMIN,
        ]);

        return $user;
    }

    public function delete(User $user): void
    {
        $paths = $user->posts()->whereNotNull('cover_image_path')->pluck('cover_image_path')->all();

        Storage::disk('public')->delete($paths);

        $user->delete();
    }
}
