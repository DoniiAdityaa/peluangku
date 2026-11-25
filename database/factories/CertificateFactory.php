<?php

namespace Database\Factories;

use App\Models\Certificate;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Certificate>
 */
class CertificateFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => 'Juara 1 '.fake()->words(2, true),
            'path' => 'certificates/sample.jpg',
            'original_name' => 'sertifikat.jpg',
            'size' => 240_000,
            'mime' => 'image/jpeg',
        ];
    }
}
