import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Tone = 'blue' | 'teal' | 'amber' | 'green' | 'navy';

const tones: Record<Tone, string> = {
    blue: 'bg-primary/15 text-primary',
    teal: 'bg-teal-400/15 text-teal-ink',
    amber: 'bg-amber-400/15 text-amber-ink',
    green: 'bg-success/15 text-success',
    navy: 'bg-navy-300/15 text-navy-ink',
};

/** Round tinted icon used in card and section headers. */
export default function IconBadge({
    icon: Icon,
    tone = 'blue',
    size = 'md',
    className,
}: {
    icon: LucideIcon;
    tone?: Tone;
    size?: 'md' | 'lg';
    className?: string;
}) {
    return (
        <span
            aria-hidden="true"
            className={cn(
                'flex shrink-0 items-center justify-center rounded-full',
                size === 'md' ? 'size-10' : 'size-12',
                tones[tone],
                className,
            )}
        >
            <Icon
                className={size === 'md' ? 'size-[18px]' : 'size-[22px]'}
                strokeWidth={1.9}
            />
        </span>
    );
}
