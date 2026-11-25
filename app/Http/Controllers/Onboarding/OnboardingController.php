<?php

namespace App\Http\Controllers\Onboarding;

use App\Actions\SaveProfile;
use App\Http\Controllers\Controller;
use App\Http\Requests\Onboarding\StoreOnboardingProfileRequest;
use App\Services\Cv\CvParser;
use App\Support\Campuses;
use App\Support\Cities;
use App\Support\ProfileFormData;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    private const DRAFT = 'onboarding.draft';

    private const FLAGGED = 'onboarding.flagged';

    private const PARSED = 'onboarding.parsed';

    private const WELCOME = 'onboarding.welcome';

    /**
     * Step 1: choose between filling the profile manually or with AI.
     */
    public function index(): Response
    {
        return Inertia::render('onboarding/index');
    }

    /**
     * Step 2 (AI): upload a CV for the AI to read.
     */
    public function ai(Request $request): Response
    {
        return Inertia::render('onboarding/ai', [
            'result' => $request->session()->pull(self::PARSED),
        ]);
    }

    /**
     * Store the CV, let the parser read it and keep the result as a draft.
     */
    public function parseCv(Request $request, CvParser $parser, SaveProfile $save): RedirectResponse
    {
        $request->validate(
            ['cv' => ['required', 'file', 'mimes:pdf,docx', 'max:5120']],
            ['cv.required' => 'Pilih file CV dulu.'],
            ['cv' => 'CV'],
        );

        $user = $request->user();
        $file = $request->file('cv');
        $save->replaceCv($user, $file);

        $result = $parser->parse($user->cv_path, $user);

        // Match what the CV says to the dropdown lists ("UDINUS" → "Universitas
        // Dian Nuswantoro"). Anything not listed stays as typed and shows as "Lainnya".
        $result['fields']['domisili'] = Cities::normalize($result['fields']['domisili'] ?? null);
        $result['fields']['kampus'] = Campuses::normalize($result['fields']['kampus'] ?? null);

        $request->session()->put(self::DRAFT, $result['fields']);
        $request->session()->put(self::FLAGGED, $result['flagged']);
        $request->session()->flash(self::PARSED, [
            'filled' => count(array_filter($result['fields'], fn ($value) => filled($value))),
            'flagged' => count($result['flagged']),
        ]);

        return to_route('onboarding.ai');
    }

    /**
     * Step 3: the profile form, empty for manual or pre-filled after AI.
     */
    public function profile(Request $request): Response
    {
        $user = $request->user();
        $draft = $request->session()->get(self::DRAFT);
        $fromAi = $request->query('sumber') === 'ai' && is_array($draft);

        return Inertia::render('onboarding/profile', [
            ...ProfileFormData::for($user, $fromAi ? $draft : []),
            'method' => $fromAi ? 'ai' : 'manual',
            'aiFields' => $fromAi ? array_keys(array_filter($draft, fn ($value) => filled($value))) : [],
            'flaggedFields' => $fromAi ? $request->session()->get(self::FLAGGED, []) : [],
        ]);
    }

    /**
     * Save the profile and finish onboarding.
     */
    public function store(StoreOnboardingProfileRequest $request, SaveProfile $save): RedirectResponse
    {
        $save->handle(
            $request->user(),
            $request->validated(),
            $request->file('cv'),
            $request->file('transkrip'),
            [
                'onboarding_method' => $request->session()->has(self::DRAFT) ? 'ai' : 'manual',
                'onboarded_at' => now(),
            ],
        );

        $request->session()->forget([self::DRAFT, self::FLAGGED]);

        // Onboarding pages stay in browser history; clear it so Back cannot show them again.
        Inertia::clearHistory();

        $request->session()->flash(self::WELCOME, true);

        return to_route('onboarding.done');
    }

    /**
     * Let the user skip onboarding and go straight to the dashboard.
     *
     * The profile can still be completed later; onboarding is not shown again.
     */
    public function skip(Request $request): RedirectResponse
    {
        $request->user()->fill([
            'onboarding_method' => 'skipped',
            'onboarded_at' => now(),
        ])->save();

        $request->session()->forget([self::DRAFT, self::FLAGGED, self::PARSED, self::WELCOME]);

        Inertia::clearHistory();

        return to_route('dashboard');
    }

    /**
     * Step 4: a short welcome right after onboarding, then on to the dashboard.
     *
     * Shown only once; visiting it again goes straight to the dashboard.
     */
    public function done(Request $request): Response|RedirectResponse
    {
        if (! $request->session()->get(self::WELCOME)) {
            return to_route('dashboard');
        }

        return Inertia::render('onboarding/done', [
            'firstName' => str($request->user()->name)->before(' ')->toString(),
        ]);
    }
}
