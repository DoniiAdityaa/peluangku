<?php

namespace App\Support;

use App\Models\Interest;
use App\Models\User;

/**
 * Props for the profile form, shared by onboarding and the "Profil & Dokumen" page.
 */
final class ProfileFormData
{
    /**
     * @param  array<string, mixed>  $overrides  values to show instead of the saved ones (an AI draft)
     * @return array<string, mixed>
     */
    public static function for(User $user, array $overrides = []): array
    {
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

        return [
            'values' => array_merge($values, $overrides),
            'cvName' => $user->cv_path ? ($user->cv_name ?? 'CV') : null,
            'hasTranskrip' => $user->transkrip_path !== null,
            'options' => OnboardingOptions::all(),
            'interests' => Interest::query()->orderBy('name')->get(['id', 'name']),
        ];
    }
}
