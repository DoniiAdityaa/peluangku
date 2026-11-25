<?php

namespace App\Services\Scholarships;

use App\Models\Scholarship;
use App\Models\User;

/**
 * Scores how well a scholarship fits a user's profile, from 0 to 100.
 *
 * Peluangku only covers scholarships in Indonesia, so there is no
 * domestic/abroad factor. Weights: level 30, major 25, GPA 20, funding 15,
 * region 10. A field the user has not filled in yet gets about half its
 * weight, so an incomplete profile neither hides nor inflates a scholarship.
 *
 * Level, region and minimum GPA are hard requirements: when the user clearly
 * misses one, the score is capped below the recommendation threshold.
 */
final class ScholarshipMatcher
{
    /** Lowest score that is still shown as a recommendation. */
    public const RECOMMEND_MIN = 50;

    /** Lowest score counted as "cocok" in the dashboard stats. */
    public const STRONG_MIN = 60;

    /** Highest score for a scholarship the user is not eligible for. */
    public const INELIGIBLE_MAX = 40;

    /**
     * Whether the profile has enough to match on at all.
     */
    public function canMatch(User $user): bool
    {
        return filled($user->jenjang_tujuan)
            || $user->interests->isNotEmpty()
            || $user->ipk !== null;
    }

    /**
     * @return array{score: int, reasons: list<string>}
     */
    public function match(User $user, Scholarship $scholarship): array
    {
        $score = 0;
        $reasons = [];
        $eligible = true;

        // Level (30)
        $levels = array_values(array_intersect($user->jenjang_tujuan ?? [], $scholarship->levels ?? []));
        if (blank($user->jenjang_tujuan)) {
            $score += 15;
        } elseif ($levels !== []) {
            $score += 30;
            $reasons[] = $levels[0];
        } else {
            $eligible = false;
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

        // GPA (20)
        if ($scholarship->min_gpa === null) {
            $score += 20;
        } elseif ($user->ipk === null) {
            $score += 10;
        } elseif ((float) $user->ipk >= (float) $scholarship->min_gpa) {
            $score += 20;
            $reasons[] = 'IPK cukup';
        } else {
            $eligible = false;
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

        // Region (10): national scholarships fit everyone, regional ones only
        // people who live in that region.
        if ($scholarship->region === null) {
            $score += 10;
        } elseif (blank($user->domisili)) {
            $score += 5;
        } elseif (str_contains(strtolower($user->domisili), strtolower($scholarship->region))) {
            $score += 10;
            $reasons[] = $scholarship->region;
        } else {
            $eligible = false;
        }

        return [
            'score' => $eligible ? min($score, 100) : min($score, self::INELIGIBLE_MAX),
            'reasons' => $reasons,
        ];
    }
}
