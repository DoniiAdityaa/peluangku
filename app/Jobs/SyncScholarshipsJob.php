<?php

namespace App\Jobs;

use App\Exceptions\ScholarshipSourceException;
use App\Services\Scholarships\ScholarshipSync;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Refreshes the scholarship catalogue in the background.
 *
 * A run walks every listing page, so it never belongs in a request cycle. The
 * job is unique: two overlapping syncs would fetch the same pages twice and
 * fight over the same rows.
 */
class SyncScholarshipsJob implements ShouldBeUnique, ShouldQueue
{
    use Queueable;

    /** A failure here is a broken source, not a transient network blip. */
    public int $tries = 1;

    /** Walking every page is well inside this, with room for a slow source. */
    public int $timeout = 300;

    /** Keep the unique lock a little longer than one full run. */
    public int $uniqueFor = 600;

    /**
     * @param  array<string, mixed>  $options  source options, e.g. maxPages
     */
    public function __construct(public array $options = []) {}

    public function handle(ScholarshipSync $sync): void
    {
        $result = $sync->run($this->options);

        Log::info('Sync beasiswa selesai.', $result->toArray());
    }

    public function failed(Throwable $e): void
    {
        $level = $e instanceof ScholarshipSourceException ? 'warning' : 'error';

        Log::$level('Sync beasiswa gagal.', [
            'message' => $e->getMessage(),
            'options' => $this->options,
        ]);
    }

    public function uniqueId(): string
    {
        return 'sync-scholarships';
    }
}
