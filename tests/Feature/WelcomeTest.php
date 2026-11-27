<?php

namespace Tests\Feature;

use App\Models\Scholarship;
use Database\Seeders\ScholarshipSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class WelcomeTest extends TestCase
{
    use RefreshDatabase;

    public function test_landing_page_shows_real_scholarship_numbers(): void
    {
        $this->seed(ScholarshipSeeder::class);

        $open = Scholarship::query()->open()->count();

        $this->get(route('home'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('welcome')
                ->where('stats.open', $open)
                ->missing('providers'));
    }
}
