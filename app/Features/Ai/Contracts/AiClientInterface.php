<?php

namespace App\Features\Ai\Contracts;

use App\Features\Ai\DTO\GeneratedPostItem;
use App\Features\Post\Enums\PostCategory;

interface AiClientInterface
{
    /**
     * Generate draft blog posts for the given topic.
     *
     * @return list<GeneratedPostItem>
     *
     * @throws \RuntimeException when the AI provider is unavailable or returns an invalid payload
     */
    public function generatePosts(string $topic, int $count, ?PostCategory $category = null): array;
}
