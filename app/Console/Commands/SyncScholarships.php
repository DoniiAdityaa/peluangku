<?php

namespace App\Console\Commands;

use App\Exceptions\ScholarshipSourceException;
use App\Services\Scholarships\ScholarshipSource;
use App\Services\Scholarships\ScholarshipSync;
use Illuminate\Console\Command;
use Throwable;

/**
 * php artisan scholarships:sync
 *
 * Reads the national portal and stores what it finds. Each page is one HTTP
 * request against the public listing, so the command is fast enough to run
 * before every deploy and cheap enough for the nightly schedule.
 */
class SyncScholarships extends Command
{
    protected $signature = 'scholarships:sync
                            {--dry-run : Ambil data dan tampilkan hasilnya tanpa menyimpan ke database}
                            {--max-pages= : Batasi jumlah halaman yang dibaca pada run ini}';

    protected $description = 'Sinkronkan beasiswa dari satubeasiswa.kemdiktisaintek.go.id';

    public function handle(ScholarshipSync $sync): int
    {
        $options = $this->sourceOptions();

        if ($this->option('dry-run')) {
            return $this->dryRun($options);
        }

        try {
            $result = $sync->run($options);
        } catch (ScholarshipSourceException $e) {
            $this->error($e->getMessage());

            return self::FAILURE;
        } catch (Throwable $e) {
            report($e);
            $this->error('Sync gagal: '.$e->getMessage());

            return self::FAILURE;
        }

        $this->info('Sync selesai — '.$result->summary());

        return self::SUCCESS;
    }

    /**
     * Shows what the source returned so field mapping can be checked before
     * anything is written.
     *
     * @param  array<string, mixed>  $options
     */
    private function dryRun(array $options): int
    {
        $this->warn('Dry run: tidak ada yang disimpan ke database.');

        try {
            $items = app(ScholarshipSource::class)->items($options);
        } catch (ScholarshipSourceException $e) {
            $this->error($e->getMessage());

            return self::FAILURE;
        }

        if ($items === []) {
            $this->warn('Sumber tidak mengembalikan item. Cek SATUBEASISWA_START_URL dan struktur situs.');

            return self::SUCCESS;
        }

        $this->info(count($items).' item diterima. Contoh item pertama:');

        $this->newLine();
        $this->line(json_encode($items[0], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '');

        $this->newLine();
        $this->info('Ringkasan field yang terisi:');

        $this->table(
            ['Field', 'Terisi', 'Kosong'],
            collect(array_keys($items[0]))
                ->reject(fn (string $key) => $key === 'status')
                ->map(function (string $key) use ($items): array {
                    $filled = count(array_filter(
                        $items,
                        fn (array $item) => filled($item[$key] ?? null),
                    ));

                    return [$key, $filled, count($items) - $filled];
                })
                ->all(),
        );

        return self::SUCCESS;
    }

    /**
     * @return array<string, mixed>
     */
    private function sourceOptions(): array
    {
        $options = [];

        $maxPages = $this->option('max-pages');

        if ($maxPages !== null && $maxPages !== '') {
            $options['maxPages'] = (int) $maxPages;
        } elseif (($configured = (int) config('services.satubeasiswa.max_pages', 0)) > 0) {
            $options['maxPages'] = $configured;
        }

        return $options;
    }
}
