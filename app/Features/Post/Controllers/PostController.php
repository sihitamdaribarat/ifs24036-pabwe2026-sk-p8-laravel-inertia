<?php

namespace App\Features\Post\Controllers;

use App\Features\Ai\Contracts\AiClientInterface;
use App\Features\Ai\DTO\GeneratedPostItem;
use App\Features\Post\Contracts\PostRepositoryInterface;
use App\Features\Post\Enums\PostCategory;
use App\Features\Post\Models\Post;
use App\Features\Post\Services\PostExcelService;
use App\Features\Post\Services\PostService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use InvalidArgumentException;
use PhpOffice\PhpSpreadsheet\Exception as SpreadsheetException;
use RuntimeException;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class PostController
{
    public const AI_MAX_ITEMS = 5;

    public function __construct(
        private readonly PostRepositoryInterface $repository,
        private readonly PostService $service,
    ) {}

    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'category', 'status']);

        return Inertia::render('Post/Index', [
            'posts' => $this->repository->paginateForUser($request->user(), $filters),
            'stats' => $this->repository->statsForUser($request->user()),
            'filters' => $filters,
            'aiDrafts' => $request->session()->get('ai_drafts', []),
            'aiMaxItems' => self::AI_MAX_ITEMS,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $post = $this->service->create($request->user(), $this->validatePost($request));

        return back()->with('success', "Artikel \"{$post->title}\" berhasil disimpan.");
    }

    public function show(Post $post): Response
    {
        Gate::authorize('view', $post);

        return Inertia::render('Post/Show', [
            'post' => $post,
        ]);
    }

    public function update(Request $request, Post $post): RedirectResponse
    {
        Gate::authorize('update', $post);

        $this->service->update($post, $this->validatePost($request));

        return back()->with('success', 'Artikel berhasil diperbarui.');
    }

    public function destroy(Post $post): RedirectResponse
    {
        Gate::authorize('delete', $post);

        $this->service->delete($post);

        return redirect()->route('dashboard.posts.index')->with('success', 'Artikel berhasil dihapus.');
    }

    public function togglePublish(Post $post): RedirectResponse
    {
        Gate::authorize('update', $post);

        $post = $this->service->togglePublish($post);

        return back()->with('success', $post->is_published ? 'Artikel dipublikasikan.' : 'Artikel dijadikan draf.');
    }

    public function uploadCover(Request $request, Post $post): RedirectResponse
    {
        Gate::authorize('update', $post);

        $request->validate([
            'cover' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $this->service->uploadCover($post, $request->file('cover'));

        return back()->with('success', 'Foto sampul berhasil diunggah.');
    }

    public function destroyCover(Post $post): RedirectResponse
    {
        Gate::authorize('update', $post);

        $this->service->removeCover($post);

        return back()->with('success', 'Foto sampul dihapus.');
    }

    public function export(Request $request, PostExcelService $excel): BinaryFileResponse
    {
        $user = $request->user();

        return $excel->export(
            $this->repository->allForExport($user),
            'artikel-'.$user->username.'-'.now()->format('Ymd-His').'.xlsx',
        );
    }

    public function import(Request $request, PostExcelService $excel): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'extensions:xlsx,xls,csv', 'max:5120'],
        ]);

        try {
            $result = $excel->import($request->user(), $request->file('file'));
        } catch (InvalidArgumentException|SpreadsheetException $exception) {
            return back()->with('error', 'Impor gagal: '.$exception->getMessage());
        }

        return back()->with(
            'success',
            "Impor selesai: {$result['imported']} artikel ditambahkan, {$result['skipped']} baris dilewati.",
        );
    }

    public function aiGenerate(Request $request, AiClientInterface $ai): RedirectResponse
    {
        $data = $request->validate([
            'topic' => ['required', 'string', 'min:3', 'max:200'],
            'count' => ['required', 'integer', 'min:1', 'max:'.self::AI_MAX_ITEMS],
            'category' => ['nullable', Rule::enum(PostCategory::class)],
        ]);

        try {
            $items = $ai->generatePosts(
                $data['topic'],
                (int) $data['count'],
                isset($data['category']) ? PostCategory::from($data['category']) : null,
            );
        } catch (RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return back()
            ->with('ai_drafts', array_map(fn (GeneratedPostItem $item) => $item->toArray(), $items))
            ->with('success', count($items).' draf artikel berhasil dihasilkan AI. Tinjau lalu simpan.');
    }

    public function aiSave(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'min:1', 'max:'.self::AI_MAX_ITEMS],
            'items.*.title' => ['required', 'string', 'max:255'],
            'items.*.category' => ['required', Rule::enum(PostCategory::class)],
            'items.*.excerpt' => ['nullable', 'string', 'max:500'],
            'items.*.content' => ['required', 'string'],
            'publish' => ['nullable', 'boolean'],
        ]);

        $created = $this->service->createMany(
            $request->user(),
            array_map(fn (array $item) => GeneratedPostItem::fromArray($item), $data['items']),
            $request->boolean('publish'),
        );

        return redirect()->route('dashboard.posts.index')
            ->with('success', count($created).' artikel hasil AI berhasil disimpan.');
    }

    /**
     * @return array{title: string, category: string, excerpt: string|null, content: string, is_published: bool}
     */
    private function validatePost(Request $request): array
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', Rule::enum(PostCategory::class)],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'content' => ['required', 'string'],
            'is_published' => ['nullable', 'boolean'],
        ]);

        $data['is_published'] = $request->boolean('is_published');

        return $data;
    }
}
