<?php

namespace App\Actions;

use App\Models\Certificate;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * Saves the profile form: fields, interests, certificates, and replaced CV /
 * transcript files.
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
            ...collect($data)->except(['cv', 'transkrip', 'interests', 'certificates'])->all(),
            'prestasi' => array_values($data['prestasi'] ?? []),
            'organisasi' => array_values($data['organisasi'] ?? []),
            ...$extra,
        ])->save();

        $user->interests()->sync($data['interests']);

        $this->syncCertificates($user, $data['certificates'] ?? []);
    }

    /**
     * Make the stored certificates match the form: drop removed ones, rename
     * kept ones and store new files.
     *
     * @param  list<array{id?: int|string|null, name: string, file?: UploadedFile|null}>  $items
     */
    private function syncCertificates(User $user, array $items): void
    {
        $kept = collect($items)->pluck('id')->filter()->map(fn ($id) => (int) $id)->all();

        $user->certificates()->whereNotIn('id', $kept)->get()
            ->each(function (Certificate $certificate): void {
                Storage::delete($certificate->path);
                $certificate->delete();
            });

        foreach ($items as $item) {
            if (! empty($item['id'])) {
                $user->certificates()->whereKey($item['id'])->update(['name' => $item['name']]);

                continue;
            }

            $file = $item['file'];

            $user->certificates()->create([
                'name' => $item['name'],
                'path' => $file->store("certificates/{$user->id}"),
                'original_name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'mime' => $file->getMimeType() ?? $file->getClientMimeType(),
            ]);
        }
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
