<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Email notification preferences. For now these are only stored; sending the
 * reminders and the weekly digest comes later.
 */
class NotificationController extends Controller
{
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/notifications', [
            'preferences' => [
                'deadline_reminders' => $request->user()->notify_deadline_reminders,
                'weekly_digest' => $request->user()->notify_weekly_digest,
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'deadline_reminders' => ['required', 'boolean'],
            'weekly_digest' => ['required', 'boolean'],
        ]);

        $request->user()->forceFill([
            'notify_deadline_reminders' => $validated['deadline_reminders'],
            'notify_weekly_digest' => $validated['weekly_digest'],
        ])->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Preferensi notifikasi disimpan.']);

        return to_route('notifications.edit');
    }
}
