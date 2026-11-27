<?php

namespace App\Services\Scholarships;

/**
 * Where raw scholarship items come from.
 *
 * An implementation returns a list of arrays, one per scholarship, using the
 * field names ScholarshipNormalizer already understands. Keeping this behind an
 * interface means the sync pipeline has no idea whether the data was fetched
 * from an HTTP endpoint, read from disk, or produced by a scraper service.
 */
interface ScholarshipSource
{
    /**
     * @param  array<string, mixed>  $options  source-specific tuning, e.g. maxPages
     * @return list<array<string, mixed>>
     */
    public function items(array $options = []): array;
}
