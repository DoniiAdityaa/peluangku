<?php

namespace App\Services\SatuBeasiswa;

use App\Exceptions\ScholarshipSourceException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;

/**
 * Reads the public scholarship listing on satubeasiswa.kemdiktisaintek.go.id.
 *
 * The list page is server-rendered: each HTML response already carries the
 * page of scholarships as structured state, so one request per page is enough.
 * No browser, no headless rendering, no third-party scraper service.
 *
 * Detail pages sit behind a login, so everything the app stores comes from the
 * listing payload — which is exactly why only its fields are mapped.
 */
final class SatuBeasiswaClient implements ScholarshipListing
{
    /** Marker the site uses for the scholarship list payload. */
    private const PAYLOAD_KEY = 'scholarships';

    public function __construct(private readonly SsrPayload $payload) {}

    /**
     * Every scholarship on the listing, walking pages until the site says stop.
     *
     * @param  int|null  $maxPages  hard cap, or null for "all pages"
     * @return list<array<string, mixed>>
     */
    public function scholarships(?int $maxPages = null): array
    {
        $url = $this->startUrl();
        $first = $this->page($url, 1);

        $lastPage = (int) ($first['lastPage'] ?? 1);
        $pages = $maxPages !== null && $maxPages > 0 ? min($lastPage, $maxPages) : $lastPage;

        $items = $this->rows($first, $url);

        for ($page = 2; $page <= $pages; $page++) {
            $items = [...$items, ...$this->rows($this->page($url, $page), $url)];
        }

        return $this->unique($items);
    }

    /**
     * One page of the listing, decoded.
     *
     * @return array<mixed>
     */
    public function page(string $url, int $page): array
    {
        $target = $page > 1 ? $url.'?page='.$page : $url;

        try {
            $response = $this->http()->get($target);
        } catch (ConnectionException $e) {
            throw ScholarshipSourceException::connectionFailed($target, $e->getMessage());
        }

        if ($response->failed()) {
            throw ScholarshipSourceException::unreachable(
                $target,
                $response->status(),
                $response->body(),
            );
        }

        return $this->payload->decode($response->body(), self::PAYLOAD_KEY, $target);
    }

    /**
     * @param  array<mixed>  $payload
     * @return list<array<string, mixed>>
     */
    private function rows(array $payload, string $url): array
    {
        $data = $payload['data'] ?? null;

        if (! is_array($data)) {
            throw ScholarshipSourceException::payloadInvalid($url, 'payload tidak punya daftar data');
        }

        return array_values(array_filter($data, is_array(...)));
    }

    /**
     * The same scholarship can appear on more than one page while the listing
     * shifts order, so de-duplicate on the stable public uid.
     *
     * @param  list<array<string, mixed>>  $items
     * @return list<array<string, mixed>>
     */
    private function unique(array $items): array
    {
        $seen = [];
        $unique = [];

        foreach ($items as $item) {
            $key = $item['uid'] ?? null;

            if (is_string($key) && $key !== '') {
                if (isset($seen[$key])) {
                    continue;
                }

                $seen[$key] = true;
            }

            $unique[] = $item;
        }

        return $unique;
    }

    private function http(): PendingRequest
    {
        return Http::withHeaders([
            'User-Agent' => (string) config('services.satubeasiswa.user_agent'),
            'Accept' => 'text/html,application/xhtml+xml',
        ])
            ->accept('text/html')
            ->timeout((int) config('services.satubeasiswa.timeout', 30))
            ->retry(2, 500, fn (\Throwable $e) => $e instanceof ConnectionException, throw: false);
    }

    private function startUrl(): string
    {
        return (string) config('services.satubeasiswa.start_url');
    }
}
