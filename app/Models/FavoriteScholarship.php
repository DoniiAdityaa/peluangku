<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A scholarship a user saved ("Tersimpan"). Stored in the team's fav_user table,
 * which keeps a snapshot of the name, deadline and match score at save time.
 */
#[Fillable(['user_id', 'scholarship_id', 'link', 'percentage', 'scholarship_name', 'deadline', 'major'])]
class FavoriteScholarship extends Model
{
    protected $table = 'fav_user';

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Scholarship, $this>
     */
    public function scholarship(): BelongsTo
    {
        return $this->belongsTo(Scholarship::class);
    }

    /**
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
