<?php

use App\Http\Controllers\Onboarding\OnboardingController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified', 'onboarded'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::get('onboarding/selesai', [OnboardingController::class, 'done'])->name('onboarding.done');
});

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
    });

require __DIR__.'/settings.php';
