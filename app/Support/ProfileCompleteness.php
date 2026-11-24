<?php

namespace App\Support;

use App\Models\User;

/**
 * How complete a user's profile is, using the same fields as the onboarding form.
 */
final class ProfileCompleteness
{
    /**
     * Field => label, ordered by how much the field improves recommendations,
     * so the first missing ones are the most useful to fill in.
     */
    private const FIELDS = [
        'jenjang_tujuan' => 'Jenjang tujuan',
        'interests' => 'Bidang minat',
        'ipk' => 'IPK',
        'lokasi_tujuan' => 'Lokasi studi',
        'jenis_pendanaan' => 'Jenis pendanaan',
        'skor_bahasa' => 'Skor bahasa',
        'domisili' => 'Domisili',
        'pendidikan_terakhir' => 'Pendidikan terakhir',
        'jurusan' => 'Jurusan',
        'kampus' => 'Kampus',
        'semester' => 'Semester',
        'cv_path' => 'CV',
        'transkrip_path' => 'Transkrip nilai',
        'sertifikat_bahasa' => 'Sertifikat bahasa',
        'prestasi' => 'Prestasi',
        'organisasi' => 'Organisasi',
        'penghasilan_ortu' => 'Penghasilan orang tua',
        'name' => 'Nama',
        'tanggal_lahir' => 'Tanggal lahir',
        'jenis_kelamin' => 'Jenis kelamin',
        'no_whatsapp' => 'No. WhatsApp',
    ];

    /**
     * @return array{percent: int, filled: int, total: int, missing: list<string>}
     */
    public static function for(User $user): array
    {
        $missing = [];

        foreach (self::FIELDS as $field => $label) {
            if (! self::isFilled($user, $field)) {
                $missing[] = $label;
            }
        }

        $total = count(self::FIELDS);
        $filled = $total - count($missing);

        return [
            'percent' => (int) round($filled / $total * 100),
            'filled' => $filled,
            'total' => $total,
            'missing' => $missing,
        ];
    }

    private static function isFilled(User $user, string $field): bool
    {
        return match ($field) {
            'interests' => $user->interests->isNotEmpty(),
            // No certificate yet is a complete answer; there is no score to give.
            'skor_bahasa' => filled($user->skor_bahasa) || $user->sertifikat_bahasa === 'Belum punya',
            default => filled($user->{$field}),
        };
    }
}
