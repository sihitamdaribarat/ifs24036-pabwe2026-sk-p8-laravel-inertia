<?php

namespace App\Http\Middleware;

use App\Features\Post\Models\Post;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePostOwnership
{
    /**
     * Ensure the {post} route parameter belongs to the authenticated user.
     *
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $post = $request->route('post');

        if ($post instanceof Post) {
            abort_unless($post->user_id === $request->user()?->id, 403, 'Artikel ini bukan milik Anda.');
        }

        return $next($request);
    }
}
