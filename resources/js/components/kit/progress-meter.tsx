import { cn } from '@/lib/utils';

/** Labelled progress bar, e.g. "Profil 60% lengkap". */
export default function ProgressMeter({
    value,
    label,
    className,
}: {
    value: number;
    label: string;
    className?: string;
}) {
    const percent = Math.max(0, Math.min(100, Math.round(value)));

    return (
        <div className={cn('flex items-center gap-3', className)}>
            <span className="shrink-0 rounded-md bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground tabular-nums">
                {percent}%
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="truncate text-xs font-medium text-muted-foreground">
                    {label}
                </span>
                <div
                    role="progressbar"
                    aria-valuenow={percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={label}
                    className="h-1.5 overflow-hidden rounded-full bg-muted"
                >
                    <div
                        className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
                        style={{ width: `${percent}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
