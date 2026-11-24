<?php

namespace App\Services\Scholarships;

use App\Models\Scholarship;
use App\Models\User;

/**
 * Scores how well a scholarship fits a user's profile, from 0 to 100.
 *
 * Weights: level 30, major 25, location 15, GPA 15, funding 15.
 * A field the user has not filled in yet gets about half its weight, so an
 * incomplete profile neither hides nor inflates a scholarship.
 */
final class ScholarshipMatcher
{
    /** Lowest score that is still shown as a recommendation. */
    public const RECOMMEND_MIN = 50;

    /** Lowest score counted as "cocok" in the dashboard stats. */
    public const STRONG_MIN = 60;

    /**
     * Whether the profile has enough to match on at all.
     */
    public function canMatch(User $user): bool
    {
        return filled($user->jenjang_tujuan)
            || filled($user->lokasi_tujuan)
            || $user->interests->isNotEmpty();
    }

    /**
     * @return array{score: int, reasons: list<string>}
     */
    public function match(User $user, Scholarship $scholarship): array
    {
        $score = 0;
        $reasons = [];

        // Level (30)
        $levels = array_values(array_intersect($user->jenjang_tujuan ?? [], $scholarship->levels ?? []));
        if (blank($user->jenjang_tujuan)) {
            $score += 15;
        } elseif ($levels !== []) {
            $score += 30;
            $reasons[] = $levels[0];
        }

        // Major (25); a blank major means the scholarship is open to everyone.
        $interests = $user->interests->pluck('name')->all();
        $majors = filled($scholarship->major)
            ? array_values(array_filter(array_map('trim', explode(',', (string) $scholarship->major))))
            : [];
        $matchedMajors = array_values(array_intersect($interests, $majors));
        if ($majors === []) {
            $score += 18;
            $reasons[] = 'Semua jurusan';
        } elseif ($interests === []) {
            $score += 12;
        } elseif ($matchedMajors !== []) {
            $score += 25;
            $reasons[] = $matchedMajors[0];
        }

        // Location (15), limited to one region when the scholarship says so
        $outsideRegion = $scholarship->region !== null
            && ! str_contains(strtolower((string) $user->domisili), strtolower($scholarship->region));
        if ($outsideRegion) {
            // Regional scholarships only count for people living there.
        } elseif (blank($user->lokasi_tujuan)) {
            $score += 8;
        } elseif (in_array($scholarship->location, $user->lokasi_tujuan, true)) {
            $score += 15;
            $reasons[] = $scholarship->region ?? $scholarship->location;
        }

        // GPA (15)
        if ($scholarship->min_gpa === null) {
            $score += 15;
        } elseif ($user->ipk === null) {
            $score += 8;
        } elseif ((float) $user->ipk >= (float) $scholarship->min_gpa) {
            $score += 15;
            $reasons[] = 'IPK cukup';
        }

        // Funding (15)
        if (blank($user->jenis_pendanaan) || $user->jenis_pendanaan === 'Semua') {
            $score += 15;
        } elseif ($user->jenis_pendanaan === $scholarship->funding) {
            $score += 15;
            $reasons[] = 'Dana '.strtolower((string) $scholarship->funding);
        } else {
            $score += 5;
        }

        return ['score' => min($score, 100), 'reasons' => $reasons];
    }
}
