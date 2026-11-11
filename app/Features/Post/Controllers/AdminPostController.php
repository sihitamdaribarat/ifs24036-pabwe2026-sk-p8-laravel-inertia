<?php

namespace App\Features\Post\Controllers;

use App\Features\Post\Contracts\PostRepositoryInterface;
use App\Features\Post\Services\PostExcelService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class AdminPostController
{
    public function __construct(private readonly PostRepositoryInterface $repository) {}

    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'category', 'status']);

        return Inertia::render('Admin/PostList', [
            'posts' => $this->repository->paginateAll($filters),
            'filters' => $filters,
        ]);
    }

    public function export(PostExcelService $excel): BinaryFileResponse
    {
        return $excel->export(
            $this->repository->allForExport(),
            'semua-artikel-'.now()->format('Ymd-His').'.xlsx',
        );
    }
}
