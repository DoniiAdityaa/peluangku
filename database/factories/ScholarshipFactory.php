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
            'scholarship_name' => 'Beasiswa '.implode(' ', (array) fake()->unique()->words(2)),
            'provider' => fake()->company(),
            'levels' => ['S1'],
            'major' => null,
            'location' => 'Dalam negeri',
            'region' => null,
            'funding' => 'Penuh',
            'min_gpa' => null,
            'language_requirement' => null,
            'deadline' => today()->addDays(fake()->numberBetween(10, 60)),
            'link' => fake()->url(),
            'description' => fake()->sentence(),
        ];
    }

    public function closed(): static
    {
        return $this->state(fn () => ['deadline' => today()->subDay()]);
    }
}
