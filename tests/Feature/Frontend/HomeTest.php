<?php

namespace Tests\Feature\Frontend;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HomeTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function can_view_the_home_page()
    {
        $response = $this->get(route('frontend.home'));

        $response->assertStatus(200);
    }
}
