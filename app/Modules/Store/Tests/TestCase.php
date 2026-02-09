<?php

namespace App\Modules\Store\Tests;

use Tests\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{

    protected function setUp(): void
    {
        parent::setUp();
        
        // Set testing hash driver to faster bcrypt with lower cost
        config(['hashing.driver' => 'bcrypt']);
        config(['hashing.bcrypt.rounds' => 4]); // Faster for tests
        
        // Disable seeding by default
        $this->seed = false;
    }
}
