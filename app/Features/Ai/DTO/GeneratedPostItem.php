<?php

namespace App\Features\Ai\DTO;

use App\Features\Post\Enums\PostCategory;

final readonly class GeneratedPostItem
{
    public function __construct(
        public string $title,
        public PostCategory $category,
        public string $excerpt,
        public string $content,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            title: trim((string) ($data['title'] ?? '')),
            category: PostCategory::fromLoose(isset($data['category']) ? (string) $data['category'] : null),
            excerpt: trim((string) ($data['excerpt'] ?? '')),
            content: trim((string) ($data['content'] ?? '')),
        );
    }

    /**
     * @return array{title: string, category: string, excerpt: string, content: string}
     */
    public function toArray(): array
    {
        return [
            'title' => $this->title,
            'category' => $this->category->value,
            'excerpt' => $this->excerpt,
            'content' => $this->content,
        ];
    }
}
