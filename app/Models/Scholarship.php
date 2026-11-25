<?php

namespace App\Models;

use Database\Factories\ScholarshipFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string|null $scholarship_name
 * @property string $link
 * @property string|null $percentage
 * @property Carbon|null $deadline
 * @property string|null $major
 * @property string|null $provider
 * @property list<string>|null $levels
 * @property string|null $location
 * @property string|null $region
 * @property string|null $funding
 * @property string|null $min_gpa
 * @property string|null $language_requirement
 * @property string|null $description
 * @property string|null $image
 */
#[Fillable([
    'scholarship_name', 'link', 'percentage', 'deadline', 'major',
    'provider', 'levels', 'location', 'region', 'funding', 'min_gpa',
    'language_requirement', 'description', 'image',
])]
class Scholarship extends Model
{
    /** @use HasFactory<ScholarshipFactory> */
    use HasFactory;

    /**
     * Get the users who favorited this scholarship.
     *
     * @return BelongsToMany<User, $this>
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'fav_user', 'scholarships_id', 'user_id');
    }

    /**
     * Only scholarships that are still open for applications.
     *
     * @param  Builder<self>  $query
     */
    public function scopeOpen(Builder $query): void
    {
        $query->whereDate('deadline', '>=', today());
    }

    /**
     * Whole days until the deadline; 0 means it closes today.
     */
    public function daysLeft(): int
    {
        return (int) today()->diffInDays($this->deadline, false);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'percentage' => 'decimal:2',
            'deadline' => 'date',
            'levels' => 'array',
            'min_gpa' => 'decimal:2',
        ];
    }
}
