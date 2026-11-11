<?php

namespace Tests\Feature\Post;

use App\Features\Ai\Contracts\AiClientInterface;
use App\Features\Ai\DTO\GeneratedPostItem;
use App\Features\Post\Enums\PostCategory;
use App\Features\Post\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Testing\TestResponse;
use Inertia\Testing\AssertableInertia as Assert;
use Mockery;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use RuntimeException;
use Tests\TestCase;

class PostExcelAndAiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create(['username' => 'penulis']);
    }

    /**
     * @param  list<list<string|null>>  $rows
     */
    private function xlsxUpload(array $rows, string $name = 'artikel.xlsx'): UploadedFile
    {
        $spreadsheet = new Spreadsheet;
        $spreadsheet->getActiveSheet()->fromArray($rows);
        $path = tempnam(sys_get_temp_dir(), 'import-test-');
        (new Xlsx($spreadsheet))->save($path);

        return new UploadedFile($path, $name, null, null, true);
    }

    /**
     * @return list<list<mixed>>
     */
    private function readDownload(TestResponse $response): array
    {
        $spreadsheet = IOFactory::load($response->baseResponse->getFile()->getPathname());

        return $spreadsheet->getActiveSheet()->toArray();
    }

    public function test_member_can_export_only_their_posts(): void
    {
        Post::factory()->published()->for($this->user)->create(['title' => 'Milik Saya']);
        Post::factory()->draft()->for($this->user)->create(['title' => 'Draf Saya']);
        Post::factory()->create(['title' => 'Milik Orang']);

        $response = $this->actingAs($this->user)->get('/dashboard/posts/export')->assertOk();

        $this->assertStringContainsString('artikel-penulis-', $response->headers->get('content-disposition'));
        $rows = $this->readDownload($response);
        $this->assertSame(['No', 'Judul', 'Slug', 'Kategori', 'Ringkasan', 'Konten', 'Status', 'Dipublikasikan', 'Penulis', 'Email Penulis', 'Dibuat'], $rows[0]);
        $this->assertCount(3, $rows);
        $this->assertSame(['Milik Saya', 'Published'], [$rows[1][1], $rows[1][6]]);
        $this->assertSame(['Draf Saya', 'Draft', '-'], [$rows[2][1], $rows[2][6], $rows[2][7]]);
    }

    public function test_member_can_import_posts_from_excel(): void
    {
        $file = $this->xlsxUpload([
            ['Judul', 'Kategori', 'Ringkasan', 'Konten', 'Status', 'Kolom Lain'],
            ['Artikel Impor', 'Pendidikan & Tutorial', 'Ringkas', '## Isi', 'Published', 'x'],
            ['Draf Impor', 'tidak dikenal', '', 'Isi draf', 'Draft', 'y'],
            ['', 'Teknologi', '', 'Tanpa judul', 'Draft', 'z'],
        ]);

        $this->actingAs($this->user)
            ->post('/dashboard/posts/import', ['file' => $file])
            ->assertSessionHas('success', 'Impor selesai: 2 artikel ditambahkan, 1 baris dilewati.');

        $imported = Post::query()->where('title', 'Artikel Impor')->firstOrFail();
        $this->assertSame($this->user->id, $imported->user_id);
        $this->assertSame(PostCategory::Pendidikan, $imported->category);
        $this->assertTrue($imported->is_published);

        $draft = Post::query()->where('title', 'Draf Impor')->firstOrFail();
        $this->assertSame(PostCategory::Umum, $draft->category);
        $this->assertNull($draft->excerpt);
        $this->assertFalse($draft->is_published);
    }

    public function test_import_accepts_csv_files(): void
    {
        $csv = UploadedFile::fake()->createWithContent('artikel.csv', "Judul,Konten\nDari CSV,Isi CSV\n");

        $this->actingAs($this->user)
            ->post('/dashboard/posts/import', ['file' => $csv])
            ->assertSessionHas('success');

        $this->assertDatabaseHas('posts', ['title' => 'Dari CSV', 'category' => 'Umum', 'is_published' => false]);
    }

    public function test_import_rejects_files_without_required_headers(): void
    {
        $file = $this->xlsxUpload([['Judul', 'Kategori'], ['Tanpa konten', 'Umum']]);

        $this->actingAs($this->user)
            ->post('/dashboard/posts/import', ['file' => $file])
            ->assertSessionHas('error', fn (string $message) => str_contains($message, 'Kolom wajib'));

        $this->assertDatabaseCount('posts', 0);
    }

    public function test_import_reports_unreadable_files(): void
    {
        $file = UploadedFile::fake()->createWithContent('rusak.xlsx', random_bytes(64)."\x00\x01\x02");

        $this->actingAs($this->user)
            ->post('/dashboard/posts/import', ['file' => $file])
            ->assertSessionHas('error', fn (string $message) => str_starts_with($message, 'Impor gagal:'));
    }

    public function test_import_validates_file_type(): void
    {
        $this->actingAs($this->user)
            ->post('/dashboard/posts/import', ['file' => UploadedFile::fake()->create('foto.png', 5)])
            ->assertSessionHasErrors('file');
    }

    public function test_ai_generate_flashes_drafts_for_review(): void
    {
        $ai = Mockery::mock(AiClientInterface::class);
        $ai->shouldReceive('generatePosts')
            ->once()
            ->with('Produktivitas', 2, PostCategory::GayaHidup)
            ->andReturn([
                new GeneratedPostItem('Draf A', PostCategory::GayaHidup, 'Ringkas A', '## A'),
                new GeneratedPostItem('Draf B', PostCategory::GayaHidup, 'Ringkas B', '## B'),
            ]);
        $this->app->instance(AiClientInterface::class, $ai);

        $this->actingAs($this->user)
            ->from('/dashboard/posts')
            ->post('/dashboard/posts/ai-generate', ['topic' => 'Produktivitas', 'count' => 2, 'category' => 'Gaya Hidup'])
            ->assertRedirect('/dashboard/posts')
            ->assertSessionHas('success');

        $this->get('/dashboard/posts')
            ->assertInertia(fn (Assert $page) => $page
                ->has('aiDrafts', 2)
                ->where('aiDrafts.0.title', 'Draf A')
                ->where('aiDrafts.1.category', 'Gaya Hidup'));

        $this->assertDatabaseCount('posts', 0);
    }

    public function test_ai_generate_without_category_and_error_handling(): void
    {
        $ai = Mockery::mock(AiClientInterface::class);
        $ai->shouldReceive('generatePosts')
            ->once()
            ->with('Laravel', 1, null)
            ->andThrow(new RuntimeException('Kunci API OpenAI belum dikonfigurasi.'));
        $this->app->instance(AiClientInterface::class, $ai);

        $this->actingAs($this->user)
            ->post('/dashboard/posts/ai-generate', ['topic' => 'Laravel', 'count' => 1])
            ->assertSessionHas('error', 'Kunci API OpenAI belum dikonfigurasi.');
    }

    public function test_ai_generate_validates_quantity_limits(): void
    {
        $this->actingAs($this->user)
            ->post('/dashboard/posts/ai-generate', ['topic' => 'Laravel', 'count' => 6])
            ->assertSessionHasErrors('count');

        $this->post('/dashboard/posts/ai-generate', ['topic' => 'Laravel', 'count' => 0])
            ->assertSessionHasErrors('count');
    }

    public function test_ai_drafts_can_be_saved_in_batch(): void
    {
        $this->actingAs($this->user)
            ->post('/dashboard/posts/ai-save', [
                'items' => [
                    ['title' => 'AI Satu', 'category' => 'Teknologi', 'excerpt' => 'R1', 'content' => '## Satu'],
                    ['title' => 'AI Dua', 'category' => 'Opini', 'excerpt' => null, 'content' => '## Dua'],
                ],
                'publish' => true,
            ])
            ->assertRedirect('/dashboard/posts')
            ->assertSessionHas('success', '2 artikel hasil AI berhasil disimpan.');

        $this->assertSame(2, $this->user->posts()->where('is_published', true)->count());
        $this->assertDatabaseHas('posts', ['title' => 'AI Dua', 'category' => 'Opini', 'slug' => 'ai-dua']);
    }

    public function test_ai_save_validates_items(): void
    {
        $this->actingAs($this->user)
            ->post('/dashboard/posts/ai-save', ['items' => [['title' => '', 'category' => 'X', 'content' => '']]])
            ->assertSessionHasErrors(['items.0.title', 'items.0.category', 'items.0.content']);
    }
}
