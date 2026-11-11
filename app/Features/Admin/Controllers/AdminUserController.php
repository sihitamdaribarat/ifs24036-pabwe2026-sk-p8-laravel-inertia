<?php

namespace App\Features\Admin\Controllers;

use App\Features\Admin\Services\AdminUserService;
use App\Features\Post\Contracts\PostRepositoryInterface;
use App\Features\Post\Services\PostExcelService;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class AdminUserController
{
    public function __construct(
        private readonly AdminUserService $service,
        private readonly PostRepositoryInterface $posts,
    ) {}

    public function index(Request $request): Response
    {
        $search = $request->string('search')->toString();

        return Inertia::render('Admin/UserList', [
            'users' => $this->service->paginateUsers($search),
            'summary' => $this->service->summary(),
            'filters' => ['search' => $search],
        ]);
    }

    public function posts(Request $request, User $user): Response
    {
        $filters = $request->only(['search', 'category', 'status']);

        return Inertia::render('Admin/UserPostList', [
            'owner' => $user->only(['id', 'name', 'username', 'email', 'role', 'created_at']),
            'posts' => $this->posts->paginateForUser($user, $filters, 15),
            'stats' => $this->posts->statsForUser($user),
            'filters' => $filters,
        ]);
    }

    public function exportPosts(User $user, PostExcelService $excel): BinaryFileResponse
    {
        return $excel->export(
            $this->posts->allForExport($user),
            'artikel-'.$user->username.'-'.now()->format('Ymd-His').'.xlsx',
        );
    }

    public function toggleRole(Request $request, User $user): RedirectResponse
    {
        if ($request->user()->is($user)) {
            return back()->with('error', 'Anda tidak dapat mengubah peran akun sendiri.');
        }

        $this->service->toggleRole($user);

        return back()->with('success', "Peran {$user->name} diubah menjadi {$user->role}.");
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($request->user()->is($user)) {
            return back()->with('error', 'Anda tidak dapat menghapus akun sendiri.');
        }

        $this->service->delete($user);

        return back()->with('success', 'Pengguna beserta artikelnya berhasil dihapus.');
    }
}
