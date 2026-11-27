<?php

namespace App\Services\Scholarships;

/**
 * What one import run did, in numbers the command can print.
 */
final class ImportResult
{
    public int $created = 0;

    public int $updated = 0;

    public int $unchanged = 0;

    public int $expired = 0;

    public int $skipped = 0;

    public function total(): int
    {
        return $this->created + $this->updated + $this->unchanged + $this->expired + $this->skipped;
    }

    /**
     * @return array<string, int>
     */
    public function toArray(): array
    {
        return [
            'created' => $this->created,
            'updated' => $this->updated,
            'unchanged' => $this->unchanged,
            'expired' => $this->expired,
            'skipped' => $this->skipped,
            'total' => $this->total(),
        ];
    }

    public function summary(): string
    {
        return sprintf(
            '%d baru, %d diperbarui, %d tidak berubah, %d kedaluwarsa, %d dilewati (total %d)',
            $this->created,
            $this->updated,
            $this->unchanged,
            $this->expired,
            $this->skipped,
            $this->total(),
        );
    }
}
