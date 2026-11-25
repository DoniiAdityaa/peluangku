<?php

namespace App\Http\Controllers\Account;

use App\Actions\SaveProfile;
use App\Http\Controllers\Controller;
use App\Http\Requests\Onboarding\StoreOnboardingProfileRequest;
use App\Support\ProfileFormData;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * "Profil & Dokumen": edit a profile that was filled in during onboarding.
 */
class ProfileDocumentsController extends Controller
{
    public function edit(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        // Nothing filled in yet: let them pick AI or manual in onboarding first.
        if ($user->skippedOnboarding()) {
            return to_route('onboarding.index');
        }

        return Inertia::render('account/profile', ProfileFormData::for($user));
    }

    public function update(StoreOnboardingProfileRequest $request, SaveProfile $save): RedirectResponse
    {
        $save->handle(
            $request->user(),
            $request->validated(),
            $request->file('cv'),
            $request->file('transkrip'),
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Profil tersimpan.']);

        return to_route('account.profile');
    }
}
