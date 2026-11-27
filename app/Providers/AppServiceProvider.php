<?php

namespace App\Providers;

use App\Services\Cv\CvParser;
use App\Services\Cv\SimulatedCvParser;
use App\Services\SatuBeasiswa\SatuBeasiswaClient;
use App\Services\SatuBeasiswa\SatuBeasiswaScholarshipSource;
use App\Services\SatuBeasiswa\ScholarshipListing;
use App\Services\Scholarships\ScholarshipSource;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Simulated until an AI provider is configured.
        $this->app->bind(CvParser::class, SimulatedCvParser::class);

        // The national portal is the only scholarship source, read directly.
        $this->app->bind(ScholarshipListing::class, SatuBeasiswaClient::class);
        $this->app->bind(ScholarshipSource::class, SatuBeasiswaScholarshipSource::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
