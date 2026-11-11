<?php

namespace App\Features\Post\Enums;

enum PostCategory: string
{
    case Teknologi = 'Teknologi';
    case Pendidikan = 'Pendidikan';
    case GayaHidup = 'Gaya Hidup';
    case Bisnis = 'Bisnis';
    case Opini = 'Opini';
    case Umum = 'Umum';

    public function label(): string
    {
        return match ($this) {
            self::Teknologi => 'Teknologi & Koding',
            self::Pendidikan => 'Pendidikan & Tutorial',
            self::GayaHidup => 'Gaya Hidup & Produktivitas',
            self::Bisnis => 'Bisnis & Karir',
            self::Opini => 'Opini & Pemikiran',
            self::Umum => 'Umum',
        };
    }

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $category) => ['value' => $category->value, 'label' => $category->label()],
            self::cases(),
        );
    }

    /**
     * Resolve a category from a loose value (value or label, case-insensitive),
     * falling back to Umum when nothing matches.
     */
    public static function fromLoose(?string $value): self
    {
        $needle = mb_strtolower(trim((string) $value));

        foreach (self::cases() as $category) {
            if ($needle === mb_strtolower($category->value) || $needle === mb_strtolower($category->label())) {
                return $category;
            }
        }

        return self::Umum;
    }
}
