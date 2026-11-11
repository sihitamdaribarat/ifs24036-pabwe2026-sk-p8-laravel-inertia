<?php

namespace Tests\Unit;

use App\Features\Post\Enums\PostCategory;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class PostCategoryTest extends TestCase
{
    /**
     * @return array<string, array{PostCategory, string}>
     */
    public static function labelProvider(): array
    {
        return [
            'teknologi' => [PostCategory::Teknologi, 'Teknologi & Koding'],
            'pendidikan' => [PostCategory::Pendidikan, 'Pendidikan & Tutorial'],
            'gaya hidup' => [PostCategory::GayaHidup, 'Gaya Hidup & Produktivitas'],
            'bisnis' => [PostCategory::Bisnis, 'Bisnis & Karir'],
            'opini' => [PostCategory::Opini, 'Opini & Pemikiran'],
            'umum' => [PostCategory::Umum, 'Umum'],
        ];
    }

    #[DataProvider('labelProvider')]
    public function test_each_category_has_a_descriptive_label(PostCategory $category, string $label): void
    {
        $this->assertSame($label, $category->label());
    }

    public function test_values_and_options_list_every_category(): void
    {
        $this->assertSame(['Teknologi', 'Pendidikan', 'Gaya Hidup', 'Bisnis', 'Opini', 'Umum'], PostCategory::values());

        $options = PostCategory::options();
        $this->assertCount(6, $options);
        $this->assertSame(['value' => 'Gaya Hidup', 'label' => 'Gaya Hidup & Produktivitas'], $options[2]);
    }

    public function test_from_loose_matches_values_and_labels_case_insensitively(): void
    {
        $this->assertSame(PostCategory::GayaHidup, PostCategory::fromLoose('  gaya hidup '));
        $this->assertSame(PostCategory::Bisnis, PostCategory::fromLoose('BISNIS & KARIR'));
        $this->assertSame(PostCategory::Umum, PostCategory::fromLoose('Olahraga'));
        $this->assertSame(PostCategory::Umum, PostCategory::fromLoose(null));
    }
}
