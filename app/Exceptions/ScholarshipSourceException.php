<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * Thrown when satubeasiswa.kemdiktisaintek.go.id cannot be read: the page is
 * unreachable, or the server-rendered payload no longer has the shape we parse.
 *
 * Jobs catch this and log it instead of dying with a stack trace.
 */
class ScholarshipSourceException extends RuntimeException
{
    public static function unreachable(string $url, int $status, string $body): self
    {
        $snippet = trim(mb_substr($body, 0, 300));

        return new self("Gagal mengambil {$url} (HTTP {$status}): {$snippet}");
    }

    public static function connectionFailed(string $url, string $reason): self
    {
        return new self("Tidak bisa menghubungi {$url}: {$reason}");
    }

    public static function payloadMissing(string $url): self
    {
        return new self(
            "Payload beasiswa tidak ditemukan di {$url}. Struktur situs mungkin berubah — cek App\\Services\\SatuBeasiswa\\SsrPayload.",
        );
    }

    public static function payloadInvalid(string $url, string $reason): self
    {
        return new self("Payload beasiswa di {$url} tidak bisa dibaca: {$reason}");
    }
}
