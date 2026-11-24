<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
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
 */
#[Fillable(['scholarship_name', 'link', 'percentage', 'deadline', 'major'])]
class Scholarship extends Model
{
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
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'percentage' => 'decimal:2',
            'deadline' => 'date',
        ];
    }
}
