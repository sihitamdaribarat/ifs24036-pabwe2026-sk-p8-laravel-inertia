<?php

namespace App\Features\Post\Controllers;

use App\Features\Post\Contracts\PostRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PublicPostController
{
    public function __construct(private readonly PostRepositoryInterface $repository) {}

    public function home(Request $request): Response
    {
        return $this->renderIndex($request, true);
    }

    public function index(Request $request): Response
    {
        return $this->renderIndex($request, false);
    }

    public function show(string $slug): Response
    {
        $post = $this->repository->findPublishedBySlug($slug);

        abort_if($post === null, 404, 'Artikel tidak ditemukan.');

        return Inertia::render('Public/PostShow', [
            'post' => $post,
            'related' => $this->repository->relatedPublished($post),
        ]);
    }

    /**
     * Serve uploaded cover images from the public disk without requiring storage:link.
     */
    public function media(string $path): StreamedResponse
    {
        $disk = Storage::disk('public');

        abort_unless($disk->exists($path), 404);

        return $disk->response($path, null, ['Cache-Control' => 'public, max-age=604800']);
    }

    private function renderIndex(Request $request, bool $isHome): Response
    {
        $filters = $request->only(['search', 'category']);

        return Inertia::render('Public/PostIndex', [
            'posts' => $this->repository->paginatePublished($filters),
            'filters' => $filters,
            'isHome' => $isHome,
        ]);
    }
}
