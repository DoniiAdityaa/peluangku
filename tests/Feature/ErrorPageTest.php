<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ErrorPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_missing_pages_show_the_friendly_error_screen(): void
    {
        $this->get('/halaman-yang-tidak-ada')
            ->assertNotFound()
            ->assertInertia(fn (Assert $page) => $page
                ->component('error-page')
                ->where('status', 404));
    }

    public function test_json_requests_keep_json_errors(): void
    {
        $this->getJson('/halaman-yang-tidak-ada')
            ->assertNotFound()
            ->assertJsonStructure(['message']);
    }

    public function test_server_errors_use_the_friendly_screen_when_debug_is_off(): void
    {
        config(['app.debug' => false]);

        Route::get('/rusak', fn () => abort(500));

        $this->get('/rusak')
            ->assertStatus(500)
            ->assertInertia(fn (Assert $page) => $page->component('error-page')->where('status', 500));
    }
}
