<?php

namespace Tests\Unit;

use App\Models\User;
use PHPUnit\Framework\TestCase;

class UserModelTest extends TestCase
{
    public function test_initials_use_the_first_two_words(): void
    {
        $this->assertSame('BS', (new User(['name' => 'budi  santoso wijaya']))->initials());
        $this->assertSame('A', (new User(['name' => 'Admin']))->initials());
    }

    public function test_is_admin_checks_the_role(): void
    {
        $this->assertTrue((new User(['role' => User::ROLE_ADMIN]))->isAdmin());
        $this->assertFalse((new User(['role' => User::ROLE_MEMBER]))->isAdmin());
    }
}
