<?php

namespace App\Http\Controllers;

use App\Models\Scholarship;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Public landing page. The numbers on it come from the scholarships table;
 * provider names and logos are left out because scraped data may lack them.
 */
class WelcomeController extends Controller
{
    public function __invoke(): Response
    {
        $open = Scholarship::query()->open()->orderBy('deadline')->get();

        return Inertia::render('welcome', [
            'stats' => [
                'open' => $open->count(),
                'closingSoon' => $open->filter(fn (Scholarship $scholarship) => $scholarship->daysLeft() <= 14)->count(),
                'nearestDays' => $open->first()?->daysLeft(),
            ],
        ]);
    }
}
