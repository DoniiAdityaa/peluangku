<?php

namespace App\Http\Controllers;

use App\Models\Scholarship;
use App\Services\Scholarships\ScholarshipMatcher;
use App\Support\ProfileCompleteness;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Beranda: what fits me, what is urgent, and what I should do next.
     */
    public function __invoke(Request $request, ScholarshipMatcher $matcher): Response
    {
        $user = $request->user()->loadMissing('interests');
        $saved = $user->favoriteScholarships()->orderBy('deadline')->get();
        $savedIds = $saved->pluck('id')->all();
        $canMatch = $matcher->canMatch($user);

        $matches = $canMatch
            ? Scholarship::query()->open()->get()
                ->map(fn (Scholarship $scholarship) => [
                    'scholarship' => $scholarship,
                    ...$matcher->match($user, $scholarship),
                ])
                ->filter(fn (array $match) => $match['score'] >= ScholarshipMatcher::RECOMMEND_MIN)
                ->sortBy([['score', 'desc'], fn (array $a, array $b) => $a['scholarship']->deadline <=> $b['scholarship']->deadline])
                ->values()
            : collect();

        $present = fn (array $match) => [
            'id' => $match['scholarship']->id,
            'name' => $match['scholarship']->scholarship_name,
            'provider' => $match['scholarship']->provider,
            'levels' => $match['scholarship']->levels ?? [],
            'location' => $match['scholarship']->location,
            'funding' => $match['scholarship']->funding,
            'deadline' => $match['scholarship']->deadline->toDateString(),
            'daysLeft' => $match['scholarship']->daysLeft(),
            'link' => $match['scholarship']->link,
            'description' => $match['scholarship']->description,
            'image' => $match['scholarship']->image,
            'score' => $match['score'],
            'reasons' => $match['reasons'],
            'saved' => in_array($match['scholarship']->id, $savedIds, true),
        ];

        return Inertia::render('dashboard', [
            'canMatch' => $canMatch,
            'totalOpen' => Scholarship::query()->open()->count(),
            'stats' => [
                'matches' => $matches->where('score', '>=', ScholarshipMatcher::STRONG_MIN)->count(),
                'urgent' => $matches->filter(fn (array $match) => $match['scholarship']->daysLeft() < 7)->count(),
                'saved' => $saved->count(),
            ],
            'recommendations' => $matches->map($present)->values(),
            'deadlines' => $matches
                ->sortBy(fn (array $match) => $match['scholarship']->deadline)
                ->take(5)
                ->map($present)
                ->values(),
            'saved' => $saved->take(4)->map(fn (Scholarship $scholarship) => [
                'id' => $scholarship->id,
                'scholarshipId' => $scholarship->id,
                'name' => $scholarship->scholarship_name ?? 'Beasiswa',
                'provider' => $scholarship->provider,
                'daysLeft' => $scholarship->deadline ? $scholarship->daysLeft() : null,
                'score' => $canMatch ? $matcher->match($user, $scholarship)['score'] : null,
                'link' => $scholarship->link,
                'image' => $scholarship->image,
            ])->values(),
            'profile' => [
                ...ProfileCompleteness::for($user),
                'skipped' => $user->skippedOnboarding(),
            ],
        ]);
    }
}
