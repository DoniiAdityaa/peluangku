<?php

namespace Tests\Unit;

use App\Services\SatuBeasiswa\BidangIlmu;
use App\Services\SatuBeasiswa\SatuBeasiswaScholarshipSource;
use App\Services\SatuBeasiswa\ScholarshipListing;
use Tests\TestCase;

/**
 * The site's vocabulary and relative paths must not leak into the rest of the
 * app: everything is translated into the neutral shape here.
 *
 * The listing is faked, so these cases run without touching the network.
 */
class SatuBeasiswaSourceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.satubeasiswa.base_url' => 'https://satubeasiswa.kemdiktisaintek.go.id',
            'services.satubeasiswa.domestic_only' => true,
        ]);
    }

    /**
     * @param  list<array<string, mixed>>  $rows
     */
    private function source(array $rows): SatuBeasiswaScholarshipSource
    {
        $listing = new class($rows) implements ScholarshipListing
        {
            /**
             * @param  list<array<string, mixed>>  $rows
             */
            public function __construct(private readonly array $rows) {}

            public function scholarships(?int $maxPages = null): array
            {
                return $this->rows;
            }
        };

        return new SatuBeasiswaScholarshipSource($listing, new BidangIlmu);
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function row(array $overrides = []): array
    {
        return [
            'id' => 691,
            'uid' => '3fsb',
            'name' => 'Beasiswa Yayasan Runata',
            'provider' => 'Sekolah Tinggi Bisnis Runata',
            'providerLogos' => [['name' => 'Runata', 'url' => '/storage/providers/logos/a.png']],
            'level' => ['S1'],
            'regions' => ['Dalam Negeri'],
            'location' => 'Dalam Negeri',
            'description' => 'Potongan UKT untuk mahasiswa berprestasi.',
            'coverage' => 'Pendanaan Sebagian',
            'deadline' => '2027-11-30',
            'bidang_ilmu' => ['Ekonomi dan Bisnis'],
            'imageUrl' => null,
            'status' => 'Dibuka',
            ...$overrides,
        ];
    }

    public function test_maps_site_fields_to_the_neutral_shape(): void
    {
        $items = $this->source([$this->row()])->items();

        $this->assertCount(1, $items);
        $this->assertSame('Beasiswa Yayasan Runata', $items[0]['title']);
        $this->assertSame(
            'https://satubeasiswa.kemdiktisaintek.go.id/beasiswa/3fsb',
            $items[0]['link'],
        );
        $this->assertSame(['S1'], $items[0]['levels']);
        $this->assertSame(['Ekonomi dan Bisnis'], $items[0]['majors']);
        $this->assertSame('Pendanaan Sebagian', $items[0]['funding']);
        $this->assertSame('2027-11-30', $items[0]['deadline']);
        $this->assertSame('Dalam Negeri', $items[0]['location']);
    }

    public function test_relative_image_and_logo_paths_become_absolute(): void
    {
        $withImage = $this->source([$this->row(['imageUrl' => '/storage/scholarships/x.jpg'])])->items();

        $this->assertSame(
            'https://satubeasiswa.kemdiktisaintek.go.id/storage/scholarships/x.jpg',
            $withImage[0]['image'],
        );

        $withLogo = $this->source([$this->row()])->items();

        $this->assertSame(
            'https://satubeasiswa.kemdiktisaintek.go.id/storage/providers/logos/a.png',
            $withLogo[0]['image'],
            'Logo penyelenggara dipakai saat tidak ada gambar beasiswa.',
        );
    }

    public function test_one_time_funding_is_reported_as_partial(): void
    {
        $items = $this->source([$this->row(['coverage' => 'Pendanaan Satu Waktu'])])->items();

        $this->assertSame(
            'Sebagian',
            $items[0]['funding'],
            'Dana sekali cair bukan beasiswa penuh.',
        );
    }

    public function test_bidang_ilmu_is_translated_to_interest_names(): void
    {
        $items = $this->source([$this->row([
            'bidang_ilmu' => ['Sosial dan Humaniora', 'Rekayasa', 'Sains'],
        ])])->items();

        $this->assertSame(
            ['Sosial dan Pemberdayaan Masyarakat', 'Teknik dan Infrastruktur', 'Sains dan Riset'],
            $items[0]['majors'],
        );
    }

    public function test_unknown_bidang_ilmu_is_kept_verbatim(): void
    {
        $items = $this->source([$this->row(['bidang_ilmu' => ['Astronautika']])])->items();

        $this->assertSame(['Astronautika'], $items[0]['majors']);
    }

    public function test_abroad_only_scholarships_are_dropped(): void
    {
        $items = $this->source([
            $this->row(),
            $this->row([
                'uid' => 'g42w',
                'name' => 'Erasmus Mundus',
                'regions' => ['Luar Negeri'],
                'location' => 'Luar Negeri',
            ]),
        ])->items();

        $this->assertCount(1, $items);
        $this->assertStringContainsString('/beasiswa/3fsb', $items[0]['link']);
    }

    public function test_rows_offered_both_at_home_and_abroad_are_kept(): void
    {
        $items = $this->source([
            $this->row([
                'regions' => ['Dalam Negeri', 'Luar Negeri'],
                'location' => 'Dalam & Luar Negeri',
            ]),
        ])->items();

        $this->assertCount(1, $items);
    }

    public function test_abroad_rows_are_kept_when_the_filter_is_off(): void
    {
        config(['services.satubeasiswa.domestic_only' => false]);

        $items = $this->source([
            $this->row(['uid' => 'g42w', 'regions' => ['Luar Negeri'], 'location' => 'Luar Negeri']),
        ])->items();

        $this->assertCount(1, $items);
        $this->assertSame('Luar Negeri', $items[0]['location']);
    }

    public function test_rows_without_a_name_or_uid_are_skipped(): void
    {
        $items = $this->source([
            $this->row(['name' => '']),
            $this->row(['uid' => '']),
            $this->row(),
        ])->items();

        $this->assertCount(1, $items);
    }

    public function test_region_stays_null_because_the_site_has_no_province(): void
    {
        $items = $this->source([$this->row()])->items();

        $this->assertNull(
            $items[0]['region'],
            'Region harus tetap null: situs tidak menyimpan provinsi, dan null berarti terbuka untuk semua.',
        );
    }

    public function test_missing_deadline_and_funding_arrive_as_null(): void
    {
        $items = $this->source([$this->row(['deadline' => null, 'coverage' => ''])])->items();

        $this->assertNull($items[0]['deadline']);
        $this->assertNull($items[0]['funding']);
    }

    public function test_max_pages_is_forwarded_to_the_listing(): void
    {
        $listing = new class implements ScholarshipListing
        {
            public ?int $requested = null;

            public function scholarships(?int $maxPages = null): array
            {
                $this->requested = $maxPages;

                return [];
            }
        };

        (new SatuBeasiswaScholarshipSource($listing, new BidangIlmu))->items(['maxPages' => 2]);

        $this->assertSame(2, $listing->requested);
    }
}
