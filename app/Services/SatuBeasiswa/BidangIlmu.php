<?php

namespace App\Services\SatuBeasiswa;

/**
 * Translates the site's "Bidang Ilmu" vocabulary into the interest names
 * Peluangku already uses, so the matcher compares like with like.
 *
 * The two vocabularies overlap but are not identical: the site says
 * "Sosial dan Humaniora" where Peluangku says "Sosial dan Pemberdayaan
 * Masyarakat". Anything unrecognised falls through verbatim rather than being
 * dropped, so a new category on the site still shows up in search results.
 */
final class BidangIlmu
{
    /**
     * Site term => interest name from the interests table.
     *
     * @var array<string, string>
     */
    private const MAP = [
        'ekonomi dan bisnis' => 'Ekonomi dan Bisnis',
        'kesehatan' => 'Kesehatan',
        'pertanian' => 'Pertanian dan Pangan',
        'rekayasa' => 'Teknik dan Infrastruktur',
        'sains' => 'Sains dan Riset',
        'seni dan desain' => 'Seni dan Budaya',
        'sosial dan humaniora' => 'Sosial dan Pemberdayaan Masyarakat',
    ];

    /**
     * @param  array<mixed>  $values
     * @return list<string>
     */
    public function translate(array $values): array
    {
        $translated = [];

        foreach ($values as $value) {
            if (! is_string($value) || trim($value) === '') {
                continue;
            }

            $term = mb_strtolower(trim($value));
            $translated[] = self::MAP[$term] ?? trim($value);
        }

        return array_values(array_unique($translated));
    }
}
