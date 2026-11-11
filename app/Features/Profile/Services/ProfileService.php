<?php

namespace App\Features\Profile\Services;

use App\Models\User;

class ProfileService
{
    /**
     * @param  array{name: string, username: string, email: string, bio?: string|null, password?: string|null}  $data
     */
    public function update(User $user, array $data): User
    {
        $attributes = [
            'name' => $data['name'],
            'username' => $data['username'],
            'email' => $data['email'],
            'bio' => $data['bio'] ?? null,
        ];

        if (! empty($data['password'])) {
            $attributes['password'] = $data['password'];
        }

        $user->update($attributes);

        return $user;
    }
}
