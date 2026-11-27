<?php

namespace App\Services\SatuBeasiswa;

use App\Exceptions\ScholarshipSourceException;

/**
 * Decodes the server-rendered state stream that TanStack Router embeds in a
 * SatuBeasiswa HTML page.
 *
 * The site streams its page state as JavaScript assignments such as
 *
 *     scholarships:$R[17]={data:$R[18]=[{id:735,name:"Beasiswa KIP Kuliah"},...],total:103}
 *
 * which is valid JS but not valid JSON: object keys are bare identifiers and
 * every repeated value is replaced by a "$R[n]=" back-reference. This class
 * turns that slice into plain JSON so json_decode can read it, without pulling
 * in a JavaScript runtime.
 *
 * Everything here is pure string work, so it is unit-testable against a fixture
 * and touches the network only through SatuBeasiswaClient.
 */
final class SsrPayload
{
    /**
     * Extract and decode the value of `$name:$R[n]=` from an HTML page.
     *
     * @return array<mixed>
     */
    public function decode(string $html, string $name, string $url = ''): array
    {
        $raw = $this->slice($html, $name, $url);
        $json = $this->toJson($raw);

        try {
            $decoded = json_decode($json, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException $e) {
            throw ScholarshipSourceException::payloadInvalid($url, $e->getMessage());
        }

        if (! is_array($decoded)) {
            throw ScholarshipSourceException::payloadInvalid($url, 'payload bukan objek atau array');
        }

        return $decoded;
    }

    /**
     * The balanced {...} block that follows `$name:$R[n]=`.
     */
    private function slice(string $html, string $name, string $url): string
    {
        $pattern = '/'.preg_quote($name, '/').':\$R\[\d+\]=/';

        if (preg_match($pattern, $html, $match, PREG_OFFSET_CAPTURE) !== 1) {
            throw ScholarshipSourceException::payloadMissing($url);
        }

        $start = $match[0][1] + strlen($match[0][0]);

        return $this->balanced($html, $start, $url);
    }

    /**
     * Walk forward from $from, tracking brace depth, and return the block that
     * starts there. Quoted strings are skipped so a brace inside a description
     * never ends the block early.
     */
    private function balanced(string $html, int $from, string $url): string
    {
        $depth = 0;
        $inString = false;
        $length = strlen($html);

        for ($i = $from; $i < $length; $i++) {
            $char = $html[$i];

            if ($inString) {
                if ($char === '\\') {
                    $i++;
                } elseif ($char === '"') {
                    $inString = false;
                }

                continue;
            }

            if ($char === '"') {
                $inString = true;
            } elseif ($char === '{' || $char === '[') {
                $depth++;
            } elseif ($char === '}' || $char === ']') {
                $depth--;

                if ($depth === 0) {
                    return substr($html, $from, $i - $from + 1);
                }
            }
        }

        throw ScholarshipSourceException::payloadInvalid($url, 'blok payload tidak seimbang');
    }

    /**
     * Rewrite the JS object literal into JSON.
     *
     * Three rewrites are needed: drop the `$R[n]=` back-reference prefixes,
     * quote bare keys, and drop trailing commas — all legal in JavaScript, all
     * rejected by json_decode. String literals are copied verbatim so their
     * contents are never mistaken for any of them.
     */
    private function toJson(string $js): string
    {
        $json = '';
        $inString = false;
        $length = strlen($js);

        for ($i = 0; $i < $length; $i++) {
            $char = $js[$i];

            if ($inString) {
                $json .= $char;

                if ($char === '\\') {
                    $json .= $js[$i + 1] ?? '';
                    $i++;
                } elseif ($char === '"') {
                    $inString = false;
                }

                continue;
            }

            if ($char === '"') {
                $inString = true;
                $json .= $char;

                continue;
            }

            if ($char === ',' && $this->isTrailingComma($js, $i)) {
                continue;
            }

            if ($char === '$' && preg_match('/\G\$R\[\d+\]=/A', $js, $match, 0, $i) === 1) {
                $i += strlen($match[0]) - 1;

                continue;
            }

            if (preg_match('/\G[A-Za-z_$][A-Za-z0-9_$]*(?=\s*:)/A', $js, $match, 0, $i) === 1) {
                $json .= '"'.$match[0].'"';
                $i += strlen($match[0]) - 1;

                continue;
            }

            $json .= $char;
        }

        return $json;
    }

    /**
     * Whether the comma at $at is immediately followed by a closing brace, i.e.
     * a trailing comma that JSON does not allow.
     */
    private function isTrailingComma(string $js, int $at): bool
    {
        $length = strlen($js);

        for ($i = $at + 1; $i < $length; $i++) {
            $char = $js[$i];

            if ($char === ' ' || $char === "\n" || $char === "\r" || $char === "\t") {
                continue;
            }

            return $char === '}' || $char === ']';
        }

        return false;
    }
}
