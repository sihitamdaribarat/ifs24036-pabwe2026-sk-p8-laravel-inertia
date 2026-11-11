<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsurePostOwnership;
use App\Http\Middleware\EnsureRole;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class MiddlewareTest extends TestCase
{
    public function test_ensure_role_rejects_guests(): void
    {
        $this->expectException(HttpException::class);

        (new EnsureRole)->handle(Request::create('/admin/users'), fn () => new Response('ok'), 'admin');
    }

    public function test_post_ownership_ignores_requests_without_a_bound_post(): void
    {
        $request = Request::create('/dashboard/posts');
        $request->setRouteResolver(fn () => null);

        $response = (new EnsurePostOwnership)->handle($request, fn () => new Response('ok'));

        $this->assertSame('ok', $response->getContent());
    }
}
