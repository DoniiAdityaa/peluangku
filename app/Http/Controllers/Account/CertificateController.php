<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Shows a stored certificate file. Files are private, so only the owner can open them.
 */
class CertificateController extends Controller
{
    public function show(Request $request, Certificate $certificate): StreamedResponse
    {
        abort_unless($certificate->user_id === $request->user()->id, 404);
        abort_unless(Storage::exists($certificate->path), 404);

        return Storage::response($certificate->path, $certificate->original_name, [
            'Content-Type' => $certificate->mime,
        ], 'inline');
    }
}
