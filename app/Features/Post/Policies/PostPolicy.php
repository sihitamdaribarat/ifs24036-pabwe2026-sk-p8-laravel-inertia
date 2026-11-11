<?php

namespace App\Features\Post\Policies;

use App\Features\Post\Models\Post;
use App\Models\User;

class PostPolicy
{
    public function view(User $user, Post $post): bool
    {
        return $this->owns($user, $post);
    }

    public function update(User $user, Post $post): bool
    {
        return $this->owns($user, $post);
    }

    public function delete(User $user, Post $post): bool
    {
        return $this->owns($user, $post);
    }

    private function owns(User $user, Post $post): bool
    {
        return $user->id === $post->user_id;
    }
}
