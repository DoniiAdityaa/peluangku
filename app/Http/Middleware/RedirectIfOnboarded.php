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
            return redirect()->route('dashboard');
        }

        return $next($request);
    }
}
