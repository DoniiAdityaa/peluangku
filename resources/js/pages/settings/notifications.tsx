import { Head, router } from '@inertiajs/react';
import { Bell, CalendarClock, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import SettingsCard, { Switch } from '@/components/settings/settings-card';
import { update } from '@/routes/notifications';

type Preferences = {
    deadline_reminders: boolean;
    weekly_digest: boolean;
};

const rows: {
    key: keyof Preferences;
    icon: LucideIcon;
    title: string;
    description: string;
}[] = [
    {
        key: 'deadline_reminders',
        icon: CalendarClock,
        title: 'Pengingat deadline',
        description:
            'Email 7 hari dan 1 hari sebelum beasiswa yang kamu simpan ditutup.',
    },
    {
        key: 'weekly_digest',
        icon: Sparkles,
        title: 'Rekomendasi mingguan',
        description:
            'Ringkasan beasiswa baru yang cocok dengan profilmu, tiap Senin pagi.',
    },
];

/** Settings › Notifikasi: email preferences, saved as soon as a switch flips. */
export default function NotificationSettings({
    preferences,
}: {
    preferences: Preferences;
}) {
    const [values, setValues] = useState(preferences);
    const [saving, setSaving] = useState(false);

    const toggle = (key: keyof Preferences, checked: boolean) => {
        const next = { ...values, [key]: checked };
        setValues(next);

        router.patch(update().url, next, {
            preserveScroll: true,
            preserveState: true,
            onStart: () => setSaving(true),
            onFinish: () => setSaving(false),
            onError: () => setValues(values),
        });
    };

    return (
        <>
            <Head title="Pengaturan notifikasi" />

            <SettingsCard
                icon={Bell}
                tone="green"
                title="Notifikasi email"
                description="Dikirim ke email akunmu. Bisa dimatikan kapan saja."
            >
                <ul className="divide-y divide-border/60 rounded-control border border-border/60">
                    {rows.map((row) => (
                        <li
                            key={row.key}
                            className="flex items-center gap-4 p-4"
                        >
                            <row.icon
                                className="size-5 shrink-0 text-muted-foreground"
                                aria-hidden="true"
                            />
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold">
                                    {row.title}
                                </p>
                                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                                    {row.description}
                                </p>
                            </div>
                            <Switch
                                checked={values[row.key]}
                                onChange={(checked) => toggle(row.key, checked)}
                                label={row.title}
                                disabled={saving}
                            />
                        </li>
                    ))}
                </ul>
            </SettingsCard>
        </>
    );
}
