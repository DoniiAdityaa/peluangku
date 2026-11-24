<?php

namespace Database\Factories;

use App\Models\Scholarship;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Scholarship>
 */
class ScholarshipFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => 'Beasiswa '.fake()->unique()->words(2, true),
            'provider' => fake()->company(),
            'jenjang' => ['S1'],
            'bidang' => [],
            'lokasi' => 'Dalam negeri',
            'wilayah' => null,
            'pendanaan' => 'Penuh',
            'ipk_min' => null,
            'syarat_bahasa' => null,
            'deadline' => today()->addDays(fake()->numberBetween(10, 60)),
            'link' => fake()->url(),
            'deskripsi' => fake()->sentence(),
        ];
    }

    public function closed(): static
    {
        return $this->state(fn () => ['deadline' => today()->subDay()]);
    }
}
