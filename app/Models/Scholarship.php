<?php

namespace App\Models;

use Database\Factories\ScholarshipFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'name', 'provider', 'jenjang', 'bidang', 'lokasi', 'wilayah', 'pendanaan',
    'ipk_min', 'syarat_bahasa', 'deadline', 'link', 'deskripsi',
])]
class Scholarship extends Model
{
    /** @use HasFactory<ScholarshipFactory> */
    use HasFactory;

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
            'jenjang' => 'array',
            'bidang' => 'array',
            'ipk_min' => 'decimal:2',
            'deadline' => 'date',
        ];
    }
}
