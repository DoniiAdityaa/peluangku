<?php

namespace App\Http\Controllers;

use App\Models\FavoriteScholarship;
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
        $savedIds = $user->favoriteScholarships()->whereNotNull('scholarship_id')->pluck('scholarship_id')->all();
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
            'name' => $match['scholarship']->name,
            'provider' => $match['scholarship']->provider,
            'jenjang' => $match['scholarship']->jenjang,
            'lokasi' => $match['scholarship']->lokasi,
            'pendanaan' => $match['scholarship']->pendanaan,
            'deadline' => $match['scholarship']->deadline->toDateString(),
            'daysLeft' => $match['scholarship']->daysLeft(),
            'link' => $match['scholarship']->link,
            'score' => $match['score'],
            'reasons' => $match['reasons'],
            'saved' => in_array($match['scholarship']->id, $savedIds, true),
        ];

        $saved = $user->favoriteScholarships()->with('scholarship')->latest()->get();

        return Inertia::render('dashboard', [
            'firstName' => str($user->name)->before(' ')->toString(),
            'canMatch' => $canMatch,
            'stats' => [
                'matches' => $matches->where('score', '>=', ScholarshipMatcher::STRONG_MIN)->count(),
                'urgent' => $matches->filter(fn (array $match) => $match['scholarship']->daysLeft() < 7)->count(),
                'saved' => $saved->count(),
            ],
            'recommendations' => $matches->take(12)->map($present)->values(),
            'deadlines' => $matches
                ->sortBy(fn (array $match) => $match['scholarship']->deadline)
                ->take(5)
                ->map($present)
                ->values(),
            'saved' => $saved->take(4)->map(fn (FavoriteScholarship $favorite) => [
                'id' => $favorite->id,
                'scholarshipId' => $favorite->scholarship_id,
                'name' => $favorite->scholarship?->name ?? $favorite->scholarship_name ?? 'Beasiswa',
                'provider' => $favorite->scholarship?->provider,
                'daysLeft' => ($favorite->scholarship?->deadline ?? $favorite->deadline)
                    ? (int) today()->diffInDays($favorite->scholarship?->deadline ?? $favorite->deadline, false)
                    : null,
                'score' => $favorite->percentage !== null ? (int) round((float) $favorite->percentage) : null,
                'link' => $favorite->scholarship?->link ?? $favorite->link,
            ])->values(),
            'profile' => [
                ...ProfileCompleteness::for($user),
                'skipped' => $user->skippedOnboarding(),
            ],
        ]);
    }
}
