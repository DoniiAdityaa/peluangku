<?php

namespace Tests\Feature;

use App\Exceptions\ScholarshipSourceException;
use App\Jobs\SyncScholarshipsJob;
use App\Models\Scholarship;
use App\Services\SatuBeasiswa\ScholarshipListing;
use App\Services\Scholarships\ScholarshipSync;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * Exercises the real client against a faked HTTP layer, so page walking, payload
 * decoding and the import are covered together.
 *
 * The body served to the client is a slice of the real markup the site emits:
 * a JavaScript state stream with bare keys and $R[n] back-references.
 */
class ScholarshipImportTest extends TestCase
{
    use RefreshDatabase;

    /** @var list<array<string, mixed>> */
    private array $rows = [];

    /** Last page reported by the listing, so a test can fake a multi-page walk. */
    private int $lastPage = 1;

    /** Total reported by the listing. */
    private int $total = 0;

    /** Optional per-test override of the listing response. */
    private ?\Closure $responder = null;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.satubeasiswa.base_url' => 'https://satubeasiswa.test',
            'services.satubeasiswa.start_url' => 'https://satubeasiswa.test/beasiswa',
            'services.satubeasiswa.domestic_only' => true,
            'services.satubeasiswa.timeout' => 5,
        ]);

        // One fake for every request. It reads $this->rows on each call, so a
        // test can change what the next run returns without re-registering, and
        // $this->responder lets a test replace the response entirely.
        Http::fake(function (Request $request) {
            if ($this->responder !== null) {
                return ($this->responder)($request);
            }

            return Http::response($this->html($this->rows, $this->lastPage, $this->total), 200, [
                'Content-Type' => 'text/html; charset=utf-8',
            ]);
        });
    }

    /**
     * Set the rows the next run will "find" on a single page.
     *
     * @param  list<array<string, mixed>>  $rows
     */
    private function fakeListing(array $rows): void
    {
        $this->rows = $rows;
        $this->lastPage = 1;
        $this->total = count($rows);
        $this->responder = null;
    }

    /**
     * Serve a fixed response body instead of a generated listing.
     */
    private function respondWith(int $status, string $body = ''): void
    {
        $this->responder = fn () => Http::response($body, $status);
    }

    /**
     * @param  list<array<string, mixed>>  $rows
     */
    private function html(array $rows, int $lastPage, int $total = 0): string
    {
        $encoded = array_map(fn (array $row) => $this->jsObject($row), $rows);

        return '<!DOCTYPE html><html><head><script>self.$R=self.$R||{};'
            .'$_TSR={};l:$R[16]={scholarships:$R[17]={data:$R[18]=['
            .implode(',', $encoded)
            .'],lastPage:'.$lastPage.',total:'.($total ?: count($rows)).'}};'
            .'</script></head><body>halaman</body></html>';
    }

    /**
     * Encode one row the way the site does: bare keys, inline strings.
     *
     * @param  array<string, mixed>  $row
     */
    private function jsObject(array $row): string
    {
        $pairs = [];

        foreach ($row as $key => $value) {
            $encoded = match (true) {
                $value === null => 'null',
                is_bool($value) => $value ? '!0' : '!1',
                is_int($value), is_float($value) => (string) $value,
                is_array($value) => '['.implode(',', array_map(
                    fn ($entry) => is_array($entry) ? $this->jsObject($entry) : json_encode($entry, JSON_UNESCAPED_UNICODE),
                    $value,
                )).']',
                default => json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            };

            $pairs[] = $key.':'.$encoded;
        }

        return '{'.implode(',', $pairs).'}';
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function row(array $overrides = []): array
    {
        return [
            'uid' => 'unggulan',
            'name' => 'Beasiswa Unggulan 2027',
            'provider' => 'Kemendikbudristek',
            'providerLogos' => [],
            'level' => ['S1'],
            'regions' => ['Dalam Negeri'],
            'location' => 'Dalam Negeri',
            'description' => 'Beasiswa untuk mahasiswa berprestasi.',
            'coverage' => 'Pendanaan Penuh',
            'deadline' => now()->addMonth()->toDateString(),
            'bidang_ilmu' => ['Rekayasa'],
            'imageUrl' => null,
            'status' => 'Dibuka',
            ...$overrides,
        ];
    }

    public function test_import_creates_open_rows_and_skips_expired_ones(): void
    {
        $this->fakeListing([
            $this->row(),
            $this->row(['uid' => 'lama', 'name' => 'Beasiswa Kedaluwarsa', 'deadline' => now()->subMonth()->toDateString()]),
            $this->row(['uid' => 'tanpa-deadline', 'name' => 'Beasiswa Tanpa Tanggal', 'deadline' => null]),
        ]);

        $result = $this->app->make(ScholarshipSync::class)->run();

        $this->assertSame(1, $result->created);
        $this->assertSame(1, $result->expired);
        $this->assertSame(1, $result->skipped);
        $this->assertDatabaseCount('scholarships', 1);
        $this->assertDatabaseHas('scholarships', [
            'scholarship_name' => 'Beasiswa Unggulan 2027',
            'link' => 'https://satubeasiswa.test/beasiswa/unggulan',
            'provider' => 'Kemendikbudristek',
        ]);
    }

    public function test_listing_is_fetched_from_the_configured_url(): void
    {
        $this->fakeListing([]);

        $this->app->make(ScholarshipListing::class)->scholarships();

        Http::assertSent(fn (Request $request): bool => $request->url() === 'https://satubeasiswa.test/beasiswa'
            && $request->hasHeader('User-Agent', config('services.satubeasiswa.user_agent')));
    }

    public function test_every_page_is_walked_and_duplicates_are_dropped(): void
    {
        $this->responder = function (Request $request) {
            $pageTwo = str_contains($request->url(), 'page=2');

            return Http::response($this->html(
                $pageTwo
                    ? [$this->row(['uid' => 'a', 'name' => 'Beasiswa A']), $this->row(['uid' => 'b', 'name' => 'Beasiswa B'])]
                    : [$this->row(['uid' => 'a', 'name' => 'Beasiswa A'])],
                2,
                3,
            ), 200);
        };

        $rows = $this->app->make(ScholarshipListing::class)->scholarships();

        $this->assertSame(['a', 'b'], array_column($rows, 'uid'));
        Http::assertSent(fn (Request $request): bool => $request->url() === 'https://satubeasiswa.test/beasiswa?page=2');
    }

    public function test_max_pages_limits_the_walk(): void
    {
        $this->fakeListing([$this->row()]);
        $this->lastPage = 12;
        $this->total = 103;

        $rows = $this->app->make(ScholarshipListing::class)->scholarships(1);

        $this->assertCount(1, $rows);
        Http::assertSentCount(1);
    }

    public function test_importing_twice_updates_instead_of_duplicating(): void
    {
        $this->fakeListing([$this->row()]);
        $this->app->make(ScholarshipSync::class)->run();

        $this->fakeListing([$this->row([
            'name' => 'Beasiswa Unggulan 2027 (revisi)',
            'level' => ['S1', 'S2'],
            'deadline' => now()->addMonths(2)->toDateString(),
        ])]);

        $result = $this->app->make(ScholarshipSync::class)->run();

        $this->assertSame(0, $result->created);
        $this->assertSame(1, $result->updated);
        $this->assertDatabaseCount('scholarships', 1);
        $this->assertDatabaseHas('scholarships', [
            'scholarship_name' => 'Beasiswa Unggulan 2027 (revisi)',
        ]);
        $this->assertSame(['S1', 'S2'], Scholarship::query()->sole()->levels);
    }

    public function test_an_unreadable_page_surfaces_as_a_source_exception(): void
    {
        $this->respondWith(200, '<html>halaman berubah</html>');

        $this->expectException(ScholarshipSourceException::class);

        $this->app->make(ScholarshipListing::class)->scholarships();
    }

    public function test_an_error_status_surfaces_as_a_source_exception(): void
    {
        $this->respondWith(403, 'forbidden');

        $this->expectException(ScholarshipSourceException::class);

        $this->app->make(ScholarshipListing::class)->scholarships();
    }

    public function test_job_logs_instead_of_throwing_when_the_source_is_broken(): void
    {
        $this->respondWith(500, 'down');

        try {
            (new SyncScholarshipsJob)->handle($this->app->make(ScholarshipSync::class));
            $this->fail('ScholarshipSourceException seharusnya dilempar.');
        } catch (ScholarshipSourceException $e) {
            $this->assertStringContainsString('HTTP 500', $e->getMessage());
        }

        // The queue worker calls failed() after handle() throws.
        (new SyncScholarshipsJob)->failed(ScholarshipSourceException::payloadMissing('https://x'));

        $this->assertDatabaseCount('scholarships', 0);
    }

    public function test_job_is_unique_so_runs_do_not_overlap(): void
    {
        $this->assertSame('sync-scholarships', (new SyncScholarshipsJob)->uniqueId());
    }

    public function test_imported_rows_are_stamped_with_provenance(): void
    {
        $this->fakeListing([$this->row()]);

        $this->app->make(ScholarshipSync::class)->run();

        $row = Scholarship::query()->sole();

        $this->assertSame(Scholarship::SOURCE_KEMDIKTISAIKTEK, $row->source);
        $this->assertNotNull($row->last_synced_at);
    }

    public function test_command_reports_a_broken_source_cleanly(): void
    {
        $this->respondWith(500, 'down');

        $this->artisan('scholarships:sync')
            ->expectsOutputToContain('HTTP 500')
            ->assertFailed();
    }

    public function test_dry_run_prints_fields_and_writes_nothing(): void
    {
        $this->fakeListing([$this->row()]);

        $this->artisan('scholarships:sync', ['--dry-run' => true])
            ->expectsOutputToContain('tidak ada yang disimpan')
            ->assertSuccessful();

        $this->assertDatabaseCount('scholarships', 0);
    }

    public function test_dry_run_warns_when_the_source_is_empty(): void
    {
        $this->fakeListing([]);

        $this->artisan('scholarships:sync', ['--dry-run' => true])
            ->expectsOutputToContain('tidak mengembalikan item')
            ->assertSuccessful();
    }
}
