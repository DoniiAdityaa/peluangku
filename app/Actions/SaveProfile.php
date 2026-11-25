<?php

namespace App\Actions;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * Saves the profile form: fields, interests, and replaced CV / transcript files.
 */
final class SaveProfile
{
    /**
     * @param  array<string, mixed>  $data  validated form data
     * @param  array<string, mixed>  $extra  more user attributes to save in the same write
     */
    public function handle(User $user, array $data, ?UploadedFile $cv, ?UploadedFile $transkrip, array $extra = []): void
    {
        if ($cv) {
            $this->replaceCv($user, $cv);
        }

        if ($transkrip) {
            if ($user->transkrip_path) {
                Storage::delete($user->transkrip_path);
            }

            $user->transkrip_path = $transkrip->store("transkrip/{$user->id}");
        }

        $user->fill([
            ...collect($data)->except(['cv', 'transkrip', 'interests'])->all(),
            'prestasi' => array_values($data['prestasi'] ?? []),
            'organisasi' => array_values($data['organisasi'] ?? []),
            ...$extra,
        ])->save();

        $user->interests()->sync($data['interests']);
    }

    /**
     * Store a new CV for the user and remove the previous file.
     */
    public function replaceCv(User $user, UploadedFile $file): void
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
