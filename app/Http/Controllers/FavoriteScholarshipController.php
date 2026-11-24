<?php

namespace App\Http\Controllers;

use App\Models\Scholarship;
use App\Services\Scholarships\ScholarshipMatcher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class FavoriteScholarshipController extends Controller
{
    /**
     * Save a scholarship to "Tersimpan".
     */
    public function store(Request $request, Scholarship $scholarship, ScholarshipMatcher $matcher): RedirectResponse
    {
        $user = $request->user()->loadMissing('interests');

        $user->favoriteScholarships()->firstOrCreate(
            ['scholarship_id' => $scholarship->id],
            [
                'link' => $scholarship->link,
                'scholarship_name' => $scholarship->name,
                'deadline' => $scholarship->deadline,
                'percentage' => $matcher->match($user, $scholarship)['score'],
                'major' => blank($scholarship->bidang) ? 'Semua jurusan' : implode(', ', $scholarship->bidang),
            ],
        );

        return back();
    }

    /**
     * Remove a scholarship from "Tersimpan".
     */
    public function destroy(Request $request, Scholarship $scholarship): RedirectResponse
    {
        $request->user()->favoriteScholarships()->where('scholarship_id', $scholarship->id)->delete();

        return back();
    }
}
