<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $tanggal_lahir
 * @property list<string>|null $prestasi
 * @property list<string>|null $organisasi
 * @property list<string>|null $jenjang_tujuan
 * @property list<string>|null $lokasi_tujuan
 * @property string|null $cv_path
 * @property string|null $transkrip_path
 * @property Carbon|null $onboarded_at
 */
#[Fillable([
    'name', 'email', 'password', 'domisili', 'kampus', 'jurusan', 'pendidikan_terakhir',
    'tanggal_lahir', 'jenis_kelamin', 'no_whatsapp', 'semester', 'ipk', 'prestasi', 'organisasi',
    'sertifikat_bahasa', 'skor_bahasa', 'jenjang_tujuan', 'lokasi_tujuan', 'jenis_pendanaan',
    'penghasilan_ortu', 'cv_path', 'cv_name', 'transkrip_path', 'onboarding_method', 'onboarded_at',
])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token', 'cv_path', 'transkrip_path'])]
class User extends Authenticatable implements MustVerifyEmail, PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /**
     * Get the user's profile interests.
     *
     * @return BelongsToMany<Interest, $this>
     */
    public function interests(): BelongsToMany
    {
        return $this->belongsToMany(Interest::class)->withTimestamps();
    }

    /**
     * Get the scholarships this user has favorited.
     *
     * @return BelongsToMany<Scholarship, $this>
     */
    public function favoriteScholarships(): BelongsToMany
    {
        return $this->belongsToMany(Scholarship::class, 'fav_user', 'user_id', 'scholarships_id');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'tanggal_lahir' => 'date',
            'ipk' => 'decimal:2',
            'prestasi' => 'array',
            'organisasi' => 'array',
            'jenjang_tujuan' => 'array',
            'lokasi_tujuan' => 'array',
            'onboarded_at' => 'datetime',
        ];
    }

    /**
     * Whether the user has finished the onboarding profile.
     */
    public function hasCompletedOnboarding(): bool
    {
        return $this->onboarded_at !== null;
    }
}
