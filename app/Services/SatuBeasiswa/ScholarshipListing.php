<?php

namespace App\Services\SatuBeasiswa;

/**
 * The listing as the source sees it: rows in the site's own vocabulary.
 *
 * Kept as a contract so the mapper can be unit-tested without a network call,
 * and so a cached or fixture-backed listing can stand in during development.
 */
interface ScholarshipListing
{
    /**
     * Every scholarship row on the listing.
     *
     * @param  int|null  $maxPages  hard cap on pages walked, or null for all
     * @return list<array<string, mixed>>
     */
    public function scholarships(?int $maxPages = null): array;
}
