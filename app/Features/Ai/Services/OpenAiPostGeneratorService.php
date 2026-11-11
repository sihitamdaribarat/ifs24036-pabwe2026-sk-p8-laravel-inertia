<?php

namespace App\Features\Ai\Services;

use App\Features\Ai\Contracts\AiClientInterface;
use App\Features\Ai\DTO\GeneratedPostItem;
use App\Features\Post\Enums\PostCategory;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class OpenAiPostGeneratorService implements AiClientInterface
{
    public function __construct(
        private readonly ?string $apiKey,
        private readonly string $model,
        private readonly string $baseUrl,
        private readonly int $timeout = 60,
    ) {}

    public function generatePosts(string $topic, int $count, ?PostCategory $category = null): array
    {
        if (blank($this->apiKey)) {
            throw new RuntimeException('Kunci API OpenAI belum dikonfigurasi (OPENAI_API_KEY).');
        }

        try {
            $response = Http::withToken((string) $this->apiKey)
                ->acceptJson()
                ->timeout($this->timeout)
                ->post(rtrim($this->baseUrl, '/').'/chat/completions', [
                    'model' => $this->model,
                    'response_format' => ['type' => 'json_object'],
                    'temperature' => 0.8,
                    'messages' => [
                        ['role' => 'system', 'content' => $this->systemPrompt()],
                        ['role' => 'user', 'content' => $this->userPrompt($topic, $count, $category)],
                    ],
                ]);
        } catch (ConnectionException $exception) {
            throw new RuntimeException('Tidak dapat terhubung ke layanan OpenAI.', previous: $exception);
        }

        if ($response->failed()) {
            $message = (string) $response->json('error.message', 'Permintaan ke OpenAI gagal.');

            throw new RuntimeException('OpenAI: '.$message);
        }

        $payload = json_decode((string) $response->json('choices.0.message.content', ''), true);

        if (! is_array($payload) || ! isset($payload['posts']) || ! is_array($payload['posts'])) {
            throw new RuntimeException('Format respons OpenAI tidak valid.');
        }

        $items = [];
        foreach ($payload['posts'] as $raw) {
            if (! is_array($raw)) {
                continue;
            }

            $item = GeneratedPostItem::fromArray($raw);
            if ($item->title === '' || $item->content === '') {
                continue;
            }

            if ($category !== null) {
                $item = new GeneratedPostItem($item->title, $category, $item->excerpt, $item->content);
            }

            $items[] = $item;
        }

        if ($items === []) {
            throw new RuntimeException('OpenAI tidak menghasilkan artikel yang valid.');
        }

        return array_slice($items, 0, $count);
    }

    private function systemPrompt(): string
    {
        $categories = implode(', ', PostCategory::values());

        return <<<PROMPT
        Kamu adalah penulis blog profesional berbahasa Indonesia.
        Selalu balas dengan JSON valid berbentuk:
        {"posts":[{"title":"...","category":"...","excerpt":"...","content":"..."}]}
        - "category" wajib salah satu dari: {$categories}.
        - "excerpt" berisi 1-2 kalimat ringkasan pemikat pembaca.
        - "content" berisi artikel lengkap dalam format Markdown (gunakan subjudul ##, daftar, dan paragraf).
        PROMPT;
    }

    private function userPrompt(string $topic, int $count, ?PostCategory $category): string
    {
        $prompt = "Buatkan {$count} artikel blog yang berbeda tentang topik: \"{$topic}\".";

        if ($category !== null) {
            $prompt .= " Semua artikel berkategori \"{$category->value}\".";
        }

        return $prompt;
    }
}
