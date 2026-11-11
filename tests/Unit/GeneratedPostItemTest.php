<?php

namespace Tests\Unit;

use App\Features\Ai\DTO\GeneratedPostItem;
use App\Features\Post\Enums\PostCategory;
use PHPUnit\Framework\TestCase;

class GeneratedPostItemTest extends TestCase
{
    public function test_it_builds_from_array_and_serializes_back(): void
    {
        $item = GeneratedPostItem::fromArray([
            'title' => '  Belajar Laravel  ',
            'category' => 'teknologi',
            'excerpt' => ' Ringkas. ',
            'content' => "## Isi\n",
        ]);

        $this->assertSame('Belajar Laravel', $item->title);
        $this->assertSame(PostCategory::Teknologi, $item->category);
        $this->assertSame([
            'title' => 'Belajar Laravel',
            'category' => 'Teknologi',
            'excerpt' => 'Ringkas.',
            'content' => '## Isi',
        ], $item->toArray());
    }

    public function test_missing_fields_fall_back_to_defaults(): void
    {
        $item = GeneratedPostItem::fromArray([]);

        $this->assertSame('', $item->title);
        $this->assertSame(PostCategory::Umum, $item->category);
        $this->assertSame('', $item->excerpt);
        $this->assertSame('', $item->content);
    }
}
