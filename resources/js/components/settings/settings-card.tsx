import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import IconBadge from '@/components/kit/icon-badge';
import type { Tone } from '@/components/kit/icon-badge';
import { cardClass } from '@/lib/ui';
import { cn } from '@/lib/utils';

/** One block on a settings page: icon, title, short description, content. */
export default function SettingsCard({
    icon,
    tone = 'blue',
    title,
    description,
    danger = false,
    children,
}: {
    icon: LucideIcon;
    tone?: Tone;
    title: string;
    description?: string;
    danger?: boolean;
    children: ReactNode;
}) {
    return (
        <section
            className={cn(
                cardClass,
                'p-5 sm:p-6',
                danger && 'border-destructive/30',
            )}
        >
            <div className="flex items-start gap-3.5">
                {danger ? (
                    <span
                        aria-hidden="true"
                        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive"
                    >
                        <IconOnly icon={icon} />
                    </span>
                ) : (
                    <IconBadge icon={icon} tone={tone} />
                )}
                <div className="min-w-0">
                    <h2 className="font-semibold">{title}</h2>
                    {description && (
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
            </div>
            <div className="mt-5">{children}</div>
        </section>
    );
}

function IconOnly({ icon: Icon }: { icon: LucideIcon }) {
    return <Icon className="size-[18px]" strokeWidth={1.9} />;
}

/** Accessible on/off switch. */
export function Switch({
    checked,
    onChange,
    label,
    disabled = false,
}: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={cn(
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:ring-4 focus-visible:ring-primary/25 focus-visible:outline-none disabled:opacity-60',
                checked ? 'bg-primary' : 'bg-muted-foreground/30',
            )}
        >
            <span
                aria-hidden="true"
                className={cn(
                    'inline-block size-5 rounded-full bg-white shadow transition-transform',
                    checked ? 'translate-x-[22px]' : 'translate-x-0.5',
                )}
            />
        </button>
    );
}
