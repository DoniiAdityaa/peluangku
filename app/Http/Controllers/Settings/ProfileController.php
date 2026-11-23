<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Models\Interest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'availableInterests' => Interest::query()->orderBy('name')->get(['id', 'name']),
            'userInterests' => $request->user()->interests()->orderBy('name')->get(['interests.id', 'interests.name']),
        ]);
    }

    /**
     * Add an interest to the user's profile.
     */
    public function storeInterest(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'interest_id' => ['required', 'integer', 'exists:interests,id'],
        ]);

        $request->user()->interests()->syncWithoutDetaching([$validated['interest_id']]);

        return to_route('profile.edit');
    }

    /**
     * Remove an interest from the user's profile.
     */
    public function destroyInterest(Request $request, Interest $interest): RedirectResponse
    {
        $request->user()->interests()->detach($interest->id);

        return to_route('profile.edit');
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Profile updated.')]);

        return to_route('profile.edit');
    }

    /**
     * Delete the user's profile.
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
