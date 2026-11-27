<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | SatuBeasiswa
    |--------------------------------------------------------------------------
    |
    | The national scholarship portal is the only source Peluangku reads from.
    | Its listing pages are fetched directly and parsed from the server-rendered
    | state they already embed, so there is no scraper service and no headless
    | browser in the pipeline. See App\Services\SatuBeasiswa\SatuBeasiswaClient.
    |
    */

    'satubeasiswa' => [
        'base_url' => env('SATUBEASISWA_BASE_URL', 'https://satubeasiswa.kemdiktisaintek.go.id'),

        // Listing page that carries the scholarship payload.
        'start_url' => env(
            'SATUBEASISWA_START_URL',
            'https://satubeasiswa.kemdiktisaintek.go.id/beasiswa',
        ),

        // Peluangku only recommends study in Indonesia.
        'domestic_only' => (bool) env('SATUBEASISWA_DOMESTIC_ONLY', true),

        // Seconds before one page request is considered dead.
        'timeout' => (int) env('SATUBEASISWA_TIMEOUT', 30),

        // Hard cap on pages per run; 0 means "walk every page the site reports".
        'max_pages' => (int) env('SATUBEASISWA_MAX_PAGES', 0),

        // Identifies the app politely to the source.
        'user_agent' => env(
            'SATUBEASISWA_USER_AGENT',
            'Peluangku/1.0 (+https://github.com/DoniiAdityaa/peluangku)',
        ),
    ],

];
