<?php

namespace App\Services\Scholarships;

use App\Models\Scholarship;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

/**
 * Writes scraped items into the scholarships table.
 *
 * Matching is on the official link, which is stable across runs. Existing rows
 * are updated but never deleted: a scholarship that disappears from the source
 * simply stops being refreshed and closes naturally through its deadline.
 */
final class ScholarshipImporter
{
    public function __construct(private readonly ScholarshipNormalizer $normalizer) {}

    /**
     * @param  array<int, mixed>  $items  raw actor output, one entry per scholarship
     */
    public function import(array $items): ImportResult
    {
        $result = new ImportResult;

        foreach ($items as $item) {
            if (! is_array($item)) {
                $result->skipped++;

                continue;
            }

            $attributes = $this->normalizer->normalize($item);

            if ($attributes === null) {
                $result->skipped++;
                Log::debug('Item beasiswa dilewati: tidak ada nama atau link.', ['keys' => array_keys($item)]);

                continue;
            }

            // A deadline in the past is almost always a parse failure, not news.
            if ($attributes['deadline'] === null) {
                $result->skipped++;

                continue;
            }

            if (Carbon::parse($attributes['deadline'])->isBefore(today())) {
                $result->expired++;

                continue;
            }

            $existing = Scholarship::query()->where('link', $attributes['link'])->first();

            // Provenance is stamped here, not by the scraper: it describes how
            // the row entered our database.
            $attributes['source'] = Scholarship::SOURCE_KEMDIKTISAIKTEK;
            $attributes['last_synced_at'] = now();

            if ($existing === null) {
                Scholarship::query()->create($attributes);
                $result->created++;

                continue;
            }

            $existing->fill($attributes);
            $changed = $existing->isDirty();
            $existing->save();

            $changed ? $result->updated++ : $result->unchanged++;
        }

        return $result;
    }
}
