<?php

namespace App\Services\Cv;

use App\Models\User;

/**
 * Stand-in for a real AI parser while no AI provider is configured.
 *
 * It returns example values so the AI review flow can be demoed end to end.
 * Swap the binding in AppServiceProvider for a real implementation later.
 */
class SimulatedCvParser implements CvParser
{
    public function parse(string $path, User $user): array
    {
        return [
            'fields' => [
                'name' => $user->name,
                'domisili' => 'Semarang, Jawa Tengah',
                'pendidikan_terakhir' => 'S1',
                'kampus' => 'Universitas Dian Nuswantoro',
                'jurusan' => 'Teknik Informatika',
                'semester' => 5,
                'ipk' => '3.50',
                'prestasi' => ['Finalis lomba hackathon tingkat nasional'],
                'organisasi' => ['Anggota himpunan mahasiswa'],
            ],
            'flagged' => ['ipk', 'skor_bahasa'],
        ];
    }
}
