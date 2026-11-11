<?php

namespace App\Features\Post\Services;

use App\Features\Post\Enums\PostCategory;
use App\Features\Post\Models\Post;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class PostExcelService
{
    /** @var array<string, string> header label => attribute key */
    public const IMPORT_HEADERS = [
        'judul' => 'title',
        'kategori' => 'category',
        'ringkasan' => 'excerpt',
        'konten' => 'content',
        'status' => 'status',
    ];

    public function __construct(private readonly PostService $posts) {}

    /**
     * @param  Collection<int, Post>  $posts
     */
    public function export(Collection $posts, string $filename): BinaryFileResponse
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Artikel');

        $rows = [[
            'No', 'Judul', 'Slug', 'Kategori', 'Ringkasan', 'Konten', 'Status',
            'Dipublikasikan', 'Penulis', 'Email Penulis', 'Dibuat',
        ]];

        foreach ($posts->values() as $index => $post) {
            $rows[] = [
                $index + 1,
                $post->title,
                $post->slug,
                $post->category->value,
                (string) $post->excerpt,
                $post->content,
                $post->is_published ? 'Published' : 'Draft',
                $post->published_at?->format('Y-m-d H:i') ?? '-',
                $post->user->name,
                $post->user->email,
                $post->created_at?->format('Y-m-d H:i'),
            ];
        }

        $sheet->fromArray($rows, null, 'A1', true);
        $sheet->getStyle('A1:K1')->getFont()->setBold(true);
        foreach (range('A', 'K') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        $path = tempnam(sys_get_temp_dir(), 'posts-export-');
        (new Xlsx($spreadsheet))->save($path);
        $spreadsheet->disconnectWorksheets();

        return response()->download($path, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ])->deleteFileAfterSend();
    }

    /**
     * Import posts from an Excel/CSV file. The first row must contain the headers
     * Judul, Kategori, Ringkasan, Konten, Status (case-insensitive).
     *
     * @return array{imported: int, skipped: int}
     *
     * @throws InvalidArgumentException when the header row is missing required columns
     */
    public function import(User $user, UploadedFile $file): array
    {
        $spreadsheet = IOFactory::load($file->getRealPath(), 0, [
            IOFactory::READER_XLSX,
            IOFactory::READER_XLS,
            IOFactory::READER_CSV,
        ]);
        $rows = $spreadsheet->getActiveSheet()->toArray(null, true, false, false);
        $spreadsheet->disconnectWorksheets();

        $map = $this->mapHeaders(array_shift($rows) ?? []);

        foreach (['title', 'content'] as $required) {
            if (! in_array($required, $map, true)) {
                throw new InvalidArgumentException('Kolom wajib "Judul" dan "Konten" tidak ditemukan pada baris header.');
            }
        }

        $imported = 0;
        $skipped = 0;

        DB::transaction(function () use ($rows, $map, $user, &$imported, &$skipped) {
            foreach ($rows as $row) {
                $data = [];
                foreach ($map as $index => $key) {
                    $data[$key] = trim((string) ($row[$index] ?? ''));
                }

                if (($data['title'] ?? '') === '' || ($data['content'] ?? '') === '') {
                    $skipped++;

                    continue;
                }

                $this->posts->create($user, [
                    'title' => mb_substr($data['title'], 0, 255),
                    'category' => PostCategory::fromLoose($data['category'] ?? null),
                    'excerpt' => ($data['excerpt'] ?? '') !== '' ? $data['excerpt'] : null,
                    'content' => $data['content'],
                    'is_published' => $this->isPublishedStatus($data['status'] ?? ''),
                ]);
                $imported++;
            }
        });

        return ['imported' => $imported, 'skipped' => $skipped];
    }

    /**
     * @param  array<int, mixed>  $headerRow
     * @return array<int, string> column index => attribute key
     */
    private function mapHeaders(array $headerRow): array
    {
        $map = [];
        foreach ($headerRow as $index => $label) {
            $normalized = mb_strtolower(trim((string) $label));
            if (isset(self::IMPORT_HEADERS[$normalized])) {
                $map[$index] = self::IMPORT_HEADERS[$normalized];
            }
        }

        return $map;
    }

    private function isPublishedStatus(string $status): bool
    {
        return in_array(mb_strtolower($status), ['published', 'publish', 'terbit', 'dipublikasikan', 'ya', 'yes', '1', 'true'], true);
    }
}
