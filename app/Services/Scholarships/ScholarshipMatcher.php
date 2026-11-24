<?php

namespace App\Services\Scholarships;

use App\Models\Scholarship;
use App\Models\User;

/**
 * Scores how well a scholarship fits a user's profile, from 0 to 100.
 *
 * Weights: jenjang 30, bidang 25, lokasi 15, IPK 15, pendanaan 15.
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

        // Jenjang (30)
        $jenjang = array_values(array_intersect($user->jenjang_tujuan ?? [], $scholarship->jenjang));
        if (blank($user->jenjang_tujuan)) {
            $score += 15;
        } elseif ($jenjang !== []) {
            $score += 30;
            $reasons[] = $jenjang[0];
        }

        // Bidang (25)
        $interests = $user->interests->pluck('name')->all();
        $bidang = array_values(array_intersect($interests, $scholarship->bidang ?? []));
        if (blank($scholarship->bidang)) {
            $score += 18;
            $reasons[] = 'Semua jurusan';
        } elseif ($interests === []) {
            $score += 12;
        } elseif ($bidang !== []) {
            $score += 25;
            $reasons[] = $bidang[0];
        }

        // Lokasi (15), limited to one region when the scholarship says so
        $outsideRegion = $scholarship->wilayah !== null
            && ! str_contains(strtolower((string) $user->domisili), strtolower($scholarship->wilayah));
        if ($outsideRegion) {
            // Regional scholarships only count for people living there.
        } elseif (blank($user->lokasi_tujuan)) {
            $score += 8;
        } elseif (in_array($scholarship->lokasi, $user->lokasi_tujuan, true)) {
            $score += 15;
            $reasons[] = $scholarship->wilayah ?? $scholarship->lokasi;
        }

        // IPK (15)
        if ($scholarship->ipk_min === null) {
            $score += 15;
        } elseif ($user->ipk === null) {
            $score += 8;
        } elseif ((float) $user->ipk >= (float) $scholarship->ipk_min) {
            $score += 15;
            $reasons[] = 'IPK cukup';
        }

        // Pendanaan (15)
        if (blank($user->jenis_pendanaan) || $user->jenis_pendanaan === 'Semua') {
            $score += 15;
        } elseif ($user->jenis_pendanaan === $scholarship->pendanaan) {
            $score += 15;
            $reasons[] = 'Dana '.strtolower($scholarship->pendanaan);
        } else {
            $score += 5;
        }

        return ['score' => min($score, 100), 'reasons' => $reasons];
    }
}
