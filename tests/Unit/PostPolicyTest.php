<?php

namespace Tests\Unit;

use App\Features\Post\Models\Post;
use App\Features\Post\Policies\PostPolicy;
use App\Models\User;
use PHPUnit\Framework\TestCase;

class PostPolicyTest extends TestCase
{
    public function test_only_the_owner_may_view_update_or_delete(): void
    {
        $owner = new User;
        $owner->id = 1;
        $stranger = new User;
        $stranger->id = 2;

        $post = new Post;
        $post->user_id = 1;

        $policy = new PostPolicy;

        $this->assertTrue($policy->view($owner, $post));
        $this->assertTrue($policy->update($owner, $post));
        $this->assertTrue($policy->delete($owner, $post));

        $this->assertFalse($policy->view($stranger, $post));
        $this->assertFalse($policy->update($stranger, $post));
        $this->assertFalse($policy->delete($stranger, $post));
    }
}
