<?php

namespace App\Http\Controllers\Onboarding;

use App\Http\Controllers\Controller;
use App\Http\Requests\Onboarding\StoreOnboardingProfileRequest;
use App\Models\Interest;
use App\Models\User;
use App\Services\Cv\CvParser;
use App\Support\OnboardingOptions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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
    public function parseCv(Request $request, CvParser $parser): RedirectResponse
    {
        $request->validate(
            ['cv' => ['required', 'file', 'mimes:pdf,docx', 'max:5120']],
            ['cv.required' => 'Pilih file CV dulu.'],
            ['cv' => 'CV'],
        );

        $user = $request->user();
        $file = $request->file('cv');
        $this->replaceCv($user, $file);

        $result = $parser->parse($user->cv_path, $user);

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

        $values = [
            'name' => $user->name,
            'tanggal_lahir' => $user->tanggal_lahir?->format('Y-m-d'),
            'jenis_kelamin' => $user->jenis_kelamin,
            'no_whatsapp' => $user->no_whatsapp,
            'domisili' => $user->domisili,
            'pendidikan_terakhir' => $user->pendidikan_terakhir,
            'kampus' => $user->kampus,
            'jurusan' => $user->jurusan,
            'semester' => $user->semester,
            'ipk' => $user->ipk,
            'prestasi' => $user->prestasi ?? [],
            'organisasi' => $user->organisasi ?? [],
            'sertifikat_bahasa' => $user->sertifikat_bahasa,
            'skor_bahasa' => $user->skor_bahasa,
            'jenjang_tujuan' => $user->jenjang_tujuan ?? [],
            'jenis_pendanaan' => $user->jenis_pendanaan,
            'penghasilan_ortu' => $user->penghasilan_ortu,
            'interests' => $user->interests()->pluck('interests.id'),
        ];

        if ($fromAi) {
            $values = array_merge($values, $draft);
        }

        return Inertia::render('onboarding/profile', [
            'method' => $fromAi ? 'ai' : 'manual',
            'values' => $values,
            'aiFields' => $fromAi ? array_keys(array_filter($draft, fn ($value) => filled($value))) : [],
            'flaggedFields' => $fromAi ? $request->session()->get(self::FLAGGED, []) : [],
            'cvName' => $user->cv_path ? ($user->cv_name ?? 'CV') : null,
            'options' => OnboardingOptions::all(),
            'interests' => Interest::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Save the profile and finish onboarding.
     *
     * People who already finished onboarding are only updating their profile,
     * so they go back to the dashboard instead of the welcome screen.
     */
    public function store(StoreOnboardingProfileRequest $request): RedirectResponse
    {
        $user = $request->user();
        $data = $request->validated();
        $updating = $user->hasCompletedOnboarding() && ! $user->skippedOnboarding();

        if ($request->hasFile('cv')) {
            $this->replaceCv($user, $request->file('cv'));
        }

        if ($request->hasFile('transkrip')) {
            if ($user->transkrip_path) {
                Storage::delete($user->transkrip_path);
            }

            $user->transkrip_path = $request->file('transkrip')->store("transkrip/{$user->id}");
        }

        $fromAi = $request->session()->has(self::DRAFT);

        $user->fill([
            ...collect($data)->except(['cv', 'transkrip', 'interests'])->all(),
            'prestasi' => array_values($data['prestasi'] ?? []),
            'organisasi' => array_values($data['organisasi'] ?? []),
            ...$updating ? [] : [
                'onboarding_method' => $fromAi ? 'ai' : 'manual',
                'onboarded_at' => now(),
            ],
        ])->save();

        $user->interests()->sync($data['interests']);

        $request->session()->forget([self::DRAFT, self::FLAGGED]);

        // Onboarding pages stay in browser history; clear it so Back cannot show them again.
        Inertia::clearHistory();

        if ($updating) {
            Inertia::flash('toast', ['type' => 'success', 'message' => 'Profil diperbarui.']);

            return to_route('dashboard');
        }

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

    /**
     * Store a new CV for the user and remove the previous file.
     */
    private function replaceCv(User $user, UploadedFile $file): void
    {
        if ($user->cv_path) {
            Storage::delete($user->cv_path);
        }

        $user->forceFill([
            'cv_path' => $file->store("cv/{$user->id}"),
            'cv_name' => $file->getClientOriginalName(),
        ])->save();
    }
}
