<?php

namespace Database\Seeders;

use App\Features\Post\Models\Post;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     *
     * Akun demo:
     *  - admin  / password  (role admin)
     *  - penulis / password (role member)
     */
    public function run(): void
    {
        User::factory()->admin()->create([
            'name' => 'Administrator',
            'username' => 'admin',
            'email' => 'admin@blogverse.test',
        ]);

        $writer = User::factory()->create([
            'name' => 'Penulis Demo',
            'username' => 'penulis',
            'email' => 'penulis@blogverse.test',
            'bio' => 'Penulis demo BlogVerse Pro yang gemar berbagi seputar teknologi dan produktivitas.',
        ]);

        Post::factory()->count(8)->published()->for($writer)->create();
        Post::factory()->count(3)->draft()->for($writer)->create();

        User::factory()->count(3)->create()->each(
            fn (User $user) => Post::factory()->count(3)->published()->for($user)->create(),
        );
    }
}
