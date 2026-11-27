<?php

namespace App\Services\Scholarships;

use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * Turns one raw source item into the column set Scholarship expects.
 *
 * The source is free to name its fields however it likes: every key is read
 * through a list of candidate names, so a rename at the source does not break
 * the import. Anything we cannot derive becomes null rather than a guess.
 */
final class ScholarshipNormalizer
{
    /** Funding words the matcher compares against verbatim. */
    private const FUNDING_FULL = 'Penuh';

    private const FUNDING_PARTIAL = 'Sebagian';

    /** Degree programmes the UI shows as chips. */
    private const LEVELS = ['S1', 'S2', 'S3', 'D3', 'D4'];

    /**
     * Source spellings that mean a level Peluangku does not list separately.
     * A short course is not a degree, so it maps to the app's non-degree option
     * instead of being silently reported as an S1 scholarship.
     *
     * @var list<array{0: string, 1: string}>
     */
    private const LEVEL_ALIASES = [
        ['Shortcourse', 'Non-gelar'],
        ['Short Course', 'Non-gelar'],
        ['Non-gelar', 'Non-gelar'],
    ];

    /**
     * @param  array<string, mixed>  $item
     * @return array<string, mixed>|null null when the item is unusable
     */
    public function normalize(array $item): ?array
    {
        $name = $this->string($item, ['scholarship_name', 'title', 'name', 'judul', 'nama']);
        $link = $this->string($item, ['link', 'url', 'sourceUrl', 'detailUrl', 'href']);

        if ($name === null || $link === null) {
            return null;
        }

        $deadline = $this->deadline($this->string($item, ['deadline', 'batas', 'batas_pendaftaran', 'closeDate', 'endDate']));

        return [
            'scholarship_name' => Str::limit($name, 255, ''),
            'provider' => $this->string($item, ['provider', 'penyelenggara', 'organizer', 'institution']),
            'levels' => $this->levels($item),
            'major' => $this->majors($item),
            'location' => $this->string($item, ['location', 'lokasi']) ?? 'Dalam negeri',
            'region' => $this->region($item),
            'funding' => $this->funding($item),
            'min_gpa' => $this->gpa($item),
            'language_requirement' => $this->string($item, ['language_requirement', 'bahasa', 'language']),
            'deadline' => $deadline,
            'link' => Str::limit($link, 2048, ''),
            'description' => $this->description($item),
            'image' => $this->string($item, ['image', 'logo', 'imageUrl', 'thumbnail']),
        ];
    }

    /**
     * First non-empty value among the candidate keys.
     *
     * @param  array<string, mixed>  $item
     * @param  list<string>  $keys
     */
    private function string(array $item, array $keys): ?string
    {
        foreach ($keys as $key) {
            $value = $item[$key] ?? null;

            if (is_string($value) && trim($value) !== '') {
                return trim($value);
            }

            if (is_int($value) || is_float($value)) {
                return (string) $value;
            }
        }

        return null;
    }

    /**
     * The item value as a flat list of strings, whatever shape it arrived in.
     *
     * @param  array<string, mixed>  $item
     * @param  list<string>  $keys
     * @return list<string>
     */
    private function list(array $item, array $keys): array
    {
        foreach ($keys as $key) {
            $value = $item[$key] ?? null;

            if (is_string($value)) {
                $parts = preg_split('/[,;|•\n]+/u', $value) ?: [];
            } elseif (is_array($value)) {
                $parts = $value;
            } else {
                continue;
            }

            $clean = [];

            foreach ($parts as $part) {
                if (! is_string($part) || trim($part) === '') {
                    continue;
                }

                $clean[] = trim($part);
            }

            if ($clean !== []) {
                return array_values(array_unique($clean));
            }
        }

        return [];
    }

    /**
     * @param  array<string, mixed>  $item
     * @return list<string>
     */
    private function levels(array $item): array
    {
        $raw = $this->list($item, ['levels', 'level', 'jenjang', 'degree']);

        // Degree levels first, so a bundled short course is appended after them
        // instead of jumping to the front of the chip row.
        $levels = [];

        foreach ($raw as $value) {
            $upper = strtoupper($value);

            foreach (self::LEVELS as $level) {
                if (str_contains($upper, $level) && ! in_array($level, $levels, true)) {
                    $levels[] = $level;
                }
            }
        }

        foreach ($raw as $value) {
            $upper = strtoupper($value);

            foreach (self::LEVEL_ALIASES as [$needle, $mapped]) {
                if (str_contains($upper, strtoupper($needle)) && ! in_array($mapped, $levels, true)) {
                    $levels[] = $mapped;
                }
            }
        }

        // A non-degree programme is its own level, not a default S1.
        if ($levels !== [] && array_diff($levels, ['Non-gelar']) === []) {
            return ['Non-gelar'];
        }

        return $levels === [] ? ['S1'] : $levels;
    }

    /**
     * @param  array<string, mixed>  $item
     */
    private function majors(array $item): ?string
    {
        $majors = $this->list($item, ['major', 'majors', 'jurusan', 'program_studi', 'study_program']);

        // "Semua jurusan" is encoded as null, which the matcher reads as open to all.
        if ($majors === []) {
            return null;
        }

        foreach ($majors as $major) {
            if (preg_match('/semua\s+jurusan|all\s+majors/i', $major) === 1) {
                return null;
            }
        }

        return implode(', ', $majors);
    }

    /**
     * @param  array<string, mixed>  $item
     */
    private function region(array $item): ?string
    {
        $region = $this->string($item, ['region', 'wilayah', 'provinsi', 'province']);

        if ($region === null) {
            return null;
        }

        // Nationwide scholarships must stay null: the matcher scores them for everyone.
        if (preg_match('/nasional|semua\s+wilayah|national/i', $region) === 1) {
            return null;
        }

        return Str::limit($region, 255, '');
    }

    /**
     * @param  array<string, mixed>  $item
     */
    private function funding(array $item): string
    {
        $raw = $this->string($item, ['funding', 'pendanaan', 'jenis_pendanaan', 'coverage']) ?? '';

        if (preg_match('/sebagian|partial|biaya\s+pendidikan\s+saja|ukt/i', $raw) === 1) {
            return self::FUNDING_PARTIAL;
        }

        return self::FUNDING_FULL;
    }

    /**
     * @param  array<string, mixed>  $item
     */
    private function gpa(array $item): ?string
    {
        $raw = $this->string($item, ['min_gpa', 'minGpa', 'ipk', 'minimum_ipk', 'gpa']);

        if ($raw === null) {
            return null;
        }

        if (preg_match('/(\d(?:[.,]\d{1,2})?)/', $raw, $matches) !== 1) {
            return null;
        }

        $value = (float) str_replace(',', '.', $matches[1]);

        if ($value <= 0 || $value > 4) {
            return null;
        }

        return number_format($value, 2, '.', '');
    }

    /**
     * @param  array<string, mixed>  $item
     */
    private function description(array $item): ?string
    {
        $raw = $this->string($item, ['description', 'deskripsi', 'summary', 'syarat', 'requirements']);

        if ($raw === null) {
            return null;
        }

        return Str::limit(preg_replace('/\s+/u', ' ', $raw) ?? $raw, 1000, '');
    }

    /**
     * Indonesian dates arrive as "31 Desember 2026", "31-12-2026" or ISO.
     */
    private function deadline(?string $raw): ?string
    {
        if ($raw === null) {
            return null;
        }

        $normalized = str_ireplace(
            ['januari', 'februari', 'maret', 'april', 'mei', 'juni', 'juli', 'agustus', 'september', 'oktober', 'november', 'desember'],
            ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'],
            $raw,
        );

        try {
            return Carbon::parse($normalized)->toDateString();
        } catch (\Throwable) {
            return null;
        }
    }
}
