<?php

use App\Jobs\SyncScholarshipsJob;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Refresh the scholarship catalogue every night. Deadlines move slowly, so one
// run a day is plenty; the job is unique, so a slow run never stacks up.
Schedule::job(new SyncScholarshipsJob)
    ->dailyAt('02:00')
    ->withoutOverlapping()
    ->onOneServer()
    ->name('sync-scholarships');
