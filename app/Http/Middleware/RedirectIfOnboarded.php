<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Keeps users who already finished onboarding out of the onboarding pages.
 */
class RedirectIfOnboarded
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // People who skipped may come back to fill in their profile.
        if ($user?->hasCompletedOnboarding() && ! $user->skippedOnboarding()) {
            // Editing a finished profile happens on "Profil & Dokumen" instead.
            return $request->routeIs('onboarding.profile')
                ? redirect()->route('account.profile')
                : redirect()->route('dashboard');
        }

        return $next($request);
    }
}
