import type { ReactNode } from 'react';
import InputError from '@/components/input-error';
import { pillClass } from '@/lib/ui';
import { cn } from '@/lib/utils';

export type FieldTag = 'ai' | 'flag';

/**
 * Label + control + note/error for one form field.
 *
 * `tag` marks values filled by AI ("AI") or ones to double-check.
 */
export default function Field({
    id,
    label,
    hint,
    tag,
    flagLabel = 'Cek lagi',
    note,
    noteTone = 'warning',
    error,
    className,
    children,
}: {
    id?: string;
    label: string;
    hint?: string;
    tag?: FieldTag;
    flagLabel?: string;
    note?: string;
    noteTone?: 'warning' | 'muted';
    error?: string;
    className?: string;
    children: ReactNode;
}) {
    const LabelTag = id ? 'label' : 'span';

    return (
        <div className={cn('flex min-w-0 flex-col gap-2', className)}>
            <LabelTag
                {...(id ? { htmlFor: id } : {})}
                className="flex items-center gap-2 text-[13px] font-medium text-foreground/80"
            >
                {label}
                {hint && (
                    <span className="font-normal text-muted-foreground">
                        · {hint}
                    </span>
                )}
                {tag === 'ai' && (
                    <span
                        className={cn(pillClass, 'bg-teal-soft text-teal-ink')}
                    >
                        AI
                    </span>
                )}
                {tag === 'flag' && (
                    <span
                        className={cn(pillClass, 'bg-warning/15 text-warning')}
                    >
                        {flagLabel}
                    </span>
                )}
            </LabelTag>
            {children}
            {note && !error && (
                <p
                    className={cn(
                        'text-xs',
                        noteTone === 'warning'
                            ? 'text-warning'
                            : 'text-muted-foreground',
                    )}
                >
                    {note}
                </p>
            )}
            <InputError message={error} className="text-xs" />
        </div>
    );
}
