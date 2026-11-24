<?php

namespace App\Services\Cv;

use App\Models\User;

interface CvParser
{
    /**
     * Read a stored CV and return the profile fields it could fill.
     *
     * `fields` holds values for the onboarding form. `flagged` lists field
     * names the user should double-check before saving.
     *
     * @return array{fields: array<string, mixed>, flagged: list<string>}
     */
    public function parse(string $path, User $user): array;
}
