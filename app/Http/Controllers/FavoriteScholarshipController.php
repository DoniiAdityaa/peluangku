<?php

namespace App\Http\Controllers;

use App\Models\Scholarship;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class FavoriteScholarshipController extends Controller
{
    /**
     * Save a scholarship to "Tersimpan".
     */
    public function store(Request $request, Scholarship $scholarship): RedirectResponse
    {
        $request->user()->favoriteScholarships()->syncWithoutDetaching([$scholarship->id]);

        return back();
    }

    /**
     * Remove a scholarship from "Tersimpan".
     */
    public function destroy(Request $request, Scholarship $scholarship): RedirectResponse
    {
        $request->user()->favoriteScholarships()->detach($scholarship->id);

        return back();
    }
}
