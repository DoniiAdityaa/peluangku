import { Check, ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import IconBadge from '@/components/kit/icon-badge';
import type { Tone } from '@/components/kit/icon-badge';
import { cardClass } from '@/lib/ui';
import { cn } from '@/lib/utils';

/**
 * Collapsible card for one part of a long form.
 *
 * The header shows how many fields are filled ("2/5") so people can see
 * at a glance which parts still need work.
 */
export default function SectionCard({
    id,
    icon,
    tone,
    title,
    description,
    filled,
    total,
    hasError = false,
    badge,
    open,
    onOpenChange,
    children,
}: {
    id: string;
    icon: LucideIcon;
    tone: Tone;
    title: string;
    description?: string;
    filled: number;
    total: number;
    hasError?: boolean;
    badge?: ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: ReactNode;
}) {
    const complete = filled >= total;

    return (
        <Collapsible
            open={open}
            onOpenChange={onOpenChange}
            className={cn(
                cardClass,
                'transition-colors',
                open && 'border-border',
                hasError && 'border-destructive/50',
            )}
        >
            <CollapsibleTrigger
                id={`${id}-trigger`}
                className="group flex w-full cursor-pointer items-center gap-4 rounded-card px-5 py-4 text-left outline-none focus-visible:ring-4 focus-visible:ring-primary/15 sm:px-6 sm:py-5"
            >
                <IconBadge icon={icon} tone={tone} />
                <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-[15px] leading-snug font-semibold sm:text-base">
                            {title}
                        </span>
                        {badge}
                    </span>
                    {description && (
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                            {description}
                        </span>
                    )}
                </span>
                <span
                    className={cn(
                        'flex items-center gap-1 text-sm font-semibold tabular-nums',
                        hasError
                            ? 'text-destructive'
                            : complete
                              ? 'text-success'
                              : filled === 0
                                ? 'text-muted-foreground'
                                : 'text-warning',
                    )}
                >
                    {complete && !hasError && (
                        <Check
                            className="size-4"
                            strokeWidth={2.5}
                            aria-hidden="true"
                        />
                    )}
                    {filled}/{total}
                    <span className="sr-only"> kolom terisi</span>
                </span>
                <ChevronDown
                    className="size-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
                    aria-hidden="true"
                />
            </CollapsibleTrigger>
            <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                <div className="border-t border-border/60 px-5 pt-5 pb-6 sm:px-6">
                    {children}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}
