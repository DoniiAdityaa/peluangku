<?php

use App\Http\Controllers\Account\ProfileDocumentsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FavoriteScholarshipController;
use App\Http\Controllers\Onboarding\OnboardingController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified', 'onboarded'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::get('onboarding/selesai', [OnboardingController::class, 'done'])->name('onboarding.done');

    Route::post('beasiswa/{scholarship}/simpan', [FavoriteScholarshipController::class, 'store'])->name('scholarships.save');
    Route::delete('beasiswa/{scholarship}/simpan', [FavoriteScholarshipController::class, 'destroy'])->name('scholarships.unsave');

    Route::get('profil', [ProfileDocumentsController::class, 'edit'])->name('account.profile');
    Route::post('profil', [ProfileDocumentsController::class, 'update'])->name('account.profile.update');
});

// Skipped users may come back here to fill their profile in later.
Route::middleware(['auth', 'verified', 'not-onboarded'])
    ->prefix('onboarding')
    ->name('onboarding.')
    ->controller(OnboardingController::class)
    ->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('ai', 'ai')->name('ai');
        Route::post('ai', 'parseCv')->name('ai.parse');
        Route::get('profil', 'profile')->name('profile');
        Route::post('profil', 'store')->name('store');
        Route::post('lewati', 'skip')->name('skip');
    });

require __DIR__.'/settings.php';
