<?php

namespace App\Models;

use Database\Factories\CertificateFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A certificate file (image or PDF) attached to a user's profile.
 */
#[Fillable(['name', 'path', 'original_name', 'size', 'mime'])]
class Certificate extends Model
{
    /** @use HasFactory<CertificateFactory> */
    use HasFactory;

    public const MAX_PER_USER = 3;

    /**
     * Get the user who uploaded this certificate.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
