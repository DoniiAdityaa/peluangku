<?php

namespace App\Services\SatuBeasiswa;

use App\Services\Scholarships\ScholarshipSource;

/**
 * Turns SatuBeasiswa listing rows into the neutral shape the normalizer reads.
 *
 * The site speaks its own vocabulary: "level" instead of "levels", "bidang_ilmu"
 * instead of "major", "coverage" instead of "funding", and relative image paths.
 * Everything is translated here once, so ScholarshipNormalizer stays a generic
 * mapper and this is the only place that knows about the site's field names.
 */
final class SatuBeasiswaScholarshipSource implements ScholarshipSource
{
    /** One-time funding is a partial award, not a full ride. */
    private const FUNDING_ONE_TIME = 'Pendanaan Satu Waktu';

    public function __construct(
        private readonly ScholarshipListing $listing,
        private readonly BidangIlmu $bidangIlmu,
    ) {}

    /**
     * @param  array<string, mixed>  $options  maxPages (int|null), domesticOnly (bool)
     * @return list<array<string, mixed>>
     */
    public function items(array $options = []): array
    {
        $maxPages = isset($options['maxPages']) ? (int) $options['maxPages'] : null;
        $domesticOnly = (bool) ($options['domesticOnly'] ?? config('services.satubeasiswa.domestic_only', true));

        $rows = $this->listing->scholarships($maxPages > 0 ? $maxPages : null);

        $items = [];

        foreach ($rows as $row) {
            $item = $this->map($row);

            if ($item === null) {
                continue;
            }

            if ($domesticOnly && ! $this->isDomestic($row)) {
                continue;
            }

            $items[] = $item;
        }

        return $items;
    }

    /**
     * @param  array<string, mixed>  $row
     * @return array<string, mixed>|null null when the row has no usable identity
     */
    private function map(array $row): ?array
    {
        $name = $this->text($row['name'] ?? null);
        $uid = $this->text($row['uid'] ?? null);

        if ($name === null || $uid === null) {
            return null;
        }

        return [
            'title' => $name,
            'link' => $this->baseUrl().'/beasiswa/'.$uid,
            'provider' => $this->text($row['provider'] ?? null),

            // The site only models domestic/abroad, not a province, so region
            // stays null: the matcher reads null as "open to everyone" instead
            // of inventing a region requirement that is not in the data.
            'levels' => $this->strings($row['level'] ?? null),
            'majors' => $this->bidangIlmu->translate($this->strings($row['bidang_ilmu'] ?? null)),
            'location' => $this->location($row),
            'region' => null,
            'funding' => $this->funding($row['coverage'] ?? null),
            'deadline' => $this->text($row['deadline'] ?? null),
            'description' => $this->text($row['description'] ?? null),
            'image' => $this->image($row),

            // Kept for the dry run and for logging; the normalizer ignores it.
            'status' => $this->text($row['status'] ?? null),
        ];
    }

    /**
     * Funding words the normalizer already understands. "Pendanaan Satu Waktu"
     * would otherwise fall through to the "full" default and overstate the award.
     *
     * @param  mixed  $coverage
     */
    private function funding($coverage): ?string
    {
        $raw = $this->text($coverage);

        if ($raw === null) {
            return null;
        }

        if (strcasecmp($raw, self::FUNDING_ONE_TIME) === 0) {
            return 'Sebagian';
        }

        return $raw;
    }

    /**
     * @param  array<string, mixed>  $row
     */
    private function location(array $row): ?string
    {
        return $this->text($row['location'] ?? null)
            ?? $this->text(implode(', ', $this->strings($row['regions'] ?? null)));
    }

    /**
     * Whether the scholarship is open to study inside Indonesia. Rows with no
     * region data are kept: an unknown region should not hide a scholarship.
     *
     * @param  array<string, mixed>  $row
     */
    private function isDomestic(array $row): bool
    {
        $regions = $this->strings($row['regions'] ?? null);

        if ($regions === []) {
            return true;
        }

        foreach ($regions as $region) {
            if (stripos($region, 'dalam negeri') !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param  array<string, mixed>  $row
     */
    private function image(array $row): ?string
    {
        $direct = $this->text($row['imageUrl'] ?? null);

        if ($direct !== null) {
            return $this->absolute($direct);
        }

        $logos = $row['providerLogos'] ?? null;

        if (is_array($logos)) {
            foreach ($logos as $logo) {
                $url = is_array($logo) ? $this->text($logo['url'] ?? null) : null;

                if ($url !== null) {
                    return $this->absolute($url);
                }
            }
        }

        return null;
    }

    /**
     * The site serves images from its own host, sometimes as a relative path.
     */
    private function absolute(string $path): string
    {
        return str_starts_with($path, 'http') ? $path : $this->baseUrl().'/'.ltrim($path, '/');
    }

    private function baseUrl(): string
    {
        return rtrim((string) config('services.satubeasiswa.base_url'), '/');
    }

    /**
     * @param  mixed  $value
     */
    private function text($value): ?string
    {
        if (! is_string($value) && ! is_int($value) && ! is_float($value)) {
            return null;
        }

        $text = trim(str_replace("\u{00A0}", ' ', (string) $value));

        return $text === '' ? null : $text;
    }

    /**
     * @param  mixed  $value
     * @return list<string>
     */
    private function strings($value): array
    {
        if (is_string($value)) {
            $value = [$value];
        }

        if (! is_array($value)) {
            return [];
        }

        $clean = [];

        foreach ($value as $entry) {
            $text = $this->text($entry);

            if ($text !== null) {
                $clean[] = $text;
            }
        }

        return array_values(array_unique($clean));
    }
}
