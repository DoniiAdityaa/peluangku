<?php

namespace App\Services\Scholarships;

use Illuminate\Support\Facades\Log;

/**
 * The whole outside world in one call: fetch the source, then store what it found.
 *
 * Kept out of the Job so the console command, a future admin button and tests
 * all share exactly the same path. The source is injected, so swapping where
 * the data comes from never touches this class.
 */
final class ScholarshipSync
{
    public function __construct(
        private readonly ScholarshipSource $source,
        private readonly ScholarshipImporter $importer,
    ) {}

    /**
     * @param  array<string, mixed>  $options  source-specific tuning, e.g. maxPages
     */
    public function run(array $options = []): ImportResult
    {
        $items = $this->source->items($options);

        Log::info('Sumber beasiswa mengembalikan item.', ['count' => count($items)]);

        $result = $this->importer->import($items);

        Log::info('Impor beasiswa selesai.', $result->toArray());

        return $result;
    }
}
