<?php

namespace Tests\Feature\Ai;

use App\Features\Ai\Contracts\AiClientInterface;
use App\Features\Ai\Services\OpenAiPostGeneratorService;
use App\Features\Post\Enums\PostCategory;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Tests\TestCase;

class OpenAiPostGeneratorServiceTest extends TestCase
{
    private function service(?string $key = 'sk-test'): OpenAiPostGeneratorService
    {
        return new OpenAiPostGeneratorService($key, 'gpt-test', 'https://api.example.test/v1/', 30);
    }

    /**
     * @param  array<int, mixed>  $posts
     */
    private function fakeCompletion(array $posts): void
    {
        Http::fake([
            'api.example.test/*' => Http::response([
                'choices' => [['message' => ['content' => json_encode(['posts' => $posts])]]],
            ]),
        ]);
    }

    public function test_container_resolves_the_openai_implementation_from_config(): void
    {
        config(['services.openai.key' => 'sk-config']);

        $this->assertInstanceOf(OpenAiPostGeneratorService::class, $this->app->make(AiClientInterface::class));
    }

    public function test_it_requires_an_api_key(): void
    {
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('OPENAI_API_KEY');

        $this->service(null)->generatePosts('Laravel', 1);
    }

    public function test_it_generates_posts_and_sends_the_expected_request(): void
    {
        $this->fakeCompletion([
            ['title' => 'Satu', 'category' => 'Teknologi', 'excerpt' => 'Ringkas', 'content' => '## Satu'],
            'bukan-array',
            ['title' => '', 'content' => 'tanpa judul'],
            ['title' => 'Dua', 'category' => 'Bisnis', 'excerpt' => 'Ringkas', 'content' => '## Dua'],
            ['title' => 'Tiga', 'category' => 'Opini', 'excerpt' => 'Ringkas', 'content' => '## Tiga'],
        ]);

        $items = $this->service()->generatePosts('Karier developer', 2);

        $this->assertCount(2, $items);
        $this->assertSame('Satu', $items[0]->title);
        $this->assertSame(PostCategory::Bisnis, $items[1]->category);

        Http::assertSent(function (Request $request) {
            return $request->url() === 'https://api.example.test/v1/chat/completions'
                && $request->hasHeader('Authorization', 'Bearer sk-test')
                && $request['model'] === 'gpt-test'
                && str_contains($request['messages'][1]['content'], 'Karier developer')
                && ! str_contains($request['messages'][1]['content'], 'berkategori');
        });
    }

    public function test_it_forces_the_requested_category(): void
    {
        $this->fakeCompletion([
            ['title' => 'Satu', 'category' => 'Teknologi', 'excerpt' => '', 'content' => 'Isi'],
        ]);

        $items = $this->service()->generatePosts('Belajar', 3, PostCategory::Pendidikan);

        $this->assertCount(1, $items);
        $this->assertSame(PostCategory::Pendidikan, $items[0]->category);

        Http::assertSent(fn (Request $request) => str_contains($request['messages'][1]['content'], 'berkategori "Pendidikan"'));
    }

    public function test_it_wraps_connection_errors(): void
    {
        Http::fake(fn () => throw new ConnectionException('timeout'));

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Tidak dapat terhubung');

        $this->service()->generatePosts('Laravel', 1);
    }

    public function test_it_reports_api_errors(): void
    {
        Http::fake(['*' => Http::response(['error' => ['message' => 'Invalid API key']], 401)]);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('OpenAI: Invalid API key');

        $this->service()->generatePosts('Laravel', 1);
    }

    public function test_it_rejects_an_invalid_payload(): void
    {
        Http::fake(['*' => Http::response(['choices' => [['message' => ['content' => 'bukan json']]]])]);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Format respons OpenAI tidak valid.');

        $this->service()->generatePosts('Laravel', 1);
    }

    public function test_it_fails_when_no_valid_post_is_returned(): void
    {
        $this->fakeCompletion([['title' => 'Tanpa konten', 'content' => '']]);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('tidak menghasilkan artikel yang valid');

        $this->service()->generatePosts('Laravel', 1);
    }
}
