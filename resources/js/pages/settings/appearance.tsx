import { Head } from '@inertiajs/react';
import { Check, Monitor, Moon, Palette, Sun } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import SettingsCard from '@/components/settings/settings-card';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

const options: {
    value: Appearance;
    label: string;
    hint: string;
    icon: LucideIcon;
}[] = [
    { value: 'light', label: 'Terang', hint: 'Latar putih', icon: Sun },
    { value: 'dark', label: 'Gelap', hint: 'Latar navy', icon: Moon },
    {
        value: 'system',
        label: 'Ikut sistem',
        hint: 'Sesuai perangkat',
        icon: Monitor,
    },
];

/** Settings › Tampilan: pick a theme from three preview tiles. */
export default function AppearanceSettings() {
    const { appearance, updateAppearance } = useAppearance();

    return (
        <>
            <Head title="Pengaturan tampilan" />

            <SettingsCard
                icon={Palette}
                tone="amber"
                title="Tema"
                description="Berlaku di perangkat ini dan langsung diterapkan."
            >
                <div
                    role="radiogroup"
                    aria-label="Tema"
                    className="grid gap-3 sm:grid-cols-3"
                >
                    {options.map((option) => {
                        const active = appearance === option.value;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                role="radio"
                                aria-checked={active}
                                onClick={() => updateAppearance(option.value)}
                                className={cn(
                                    'group cursor-pointer rounded-card border-[1.5px] p-2.5 text-left transition-colors focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:outline-none',
                                    active
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border/70 hover:border-primary/50',
                                )}
                            >
                                <Preview value={option.value} />
                                <span className="mt-3 flex items-center gap-2 px-1 pb-1">
                                    <option.icon
                                        className="size-4 text-muted-foreground"
                                        aria-hidden="true"
                                    />
                                    <span className="flex-1">
                                        <span className="block text-sm font-semibold">
                                            {option.label}
                                        </span>
                                        <span className="block text-xs text-muted-foreground">
                                            {option.hint}
                                        </span>
                                    </span>
                                    <span
                                        aria-hidden="true"
                                        className={cn(
                                            'flex size-5 items-center justify-center rounded-full border-[1.5px]',
                                            active
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'border-border',
                                        )}
                                    >
                                        {active && (
                                            <Check
                                                className="size-3"
                                                strokeWidth={3}
                                            />
                                        )}
                                    </span>
                                </span>
                            </button>
                        );
                    })}
                </div>
            </SettingsCard>
        </>
    );
}

/** A tiny mock of the app in the given theme. */
function Preview({ value }: { value: Appearance }) {
    if (value === 'system') {
        return (
            <span className="relative flex h-24 overflow-hidden rounded-control border border-border/60">
                <span className="w-1/2">
                    <Mock theme="light" />
                </span>
                <span className="w-1/2">
                    <Mock theme="dark" />
                </span>
            </span>
        );
    }

    return (
        <span className="flex h-24 overflow-hidden rounded-control border border-border/60">
            <Mock theme={value} />
        </span>
    );
}

function Mock({ theme }: { theme: 'light' | 'dark' }) {
    const dark = theme === 'dark';

    return (
        <span
            aria-hidden="true"
            className={cn(
                'flex size-full gap-1.5 p-2',
                dark ? 'bg-[#0b1220]' : 'bg-[#f7f9fc]',
            )}
        >
            <span
                className={cn(
                    'flex w-1/4 flex-col gap-1 rounded-md p-1',
                    dark ? 'bg-[#111a2d]' : 'bg-white',
                )}
            >
                <span
                    className={cn(
                        'h-1.5 rounded-full',
                        dark ? 'bg-[#6b9bd1]' : 'bg-[#163a5f]',
                    )}
                />
                <span
                    className={cn(
                        'h-1 rounded-full',
                        dark ? 'bg-white/15' : 'bg-slate-200',
                    )}
                />
                <span
                    className={cn(
                        'h-1 rounded-full',
                        dark ? 'bg-white/15' : 'bg-slate-200',
                    )}
                />
            </span>
            <span className="flex flex-1 flex-col gap-1.5">
                <span
                    className={cn(
                        'h-5 rounded-md',
                        dark ? 'bg-[#111a2d]' : 'bg-white',
                    )}
                />
                <span className="grid flex-1 grid-cols-2 gap-1.5">
                    <span
                        className={cn(
                            'rounded-md',
                            dark ? 'bg-[#111a2d]' : 'bg-white',
                        )}
                    />
                    <span
                        className={cn(
                            'rounded-md',
                            dark ? 'bg-[#111a2d]' : 'bg-white',
                        )}
                    />
                </span>
            </span>
        </span>
    );
}
