import { cn } from '@/lib/utils';

/**
 * Single or multiple choice shown as buttons.
 *
 * `segmented` fills the row with equal-width options; `pill` wraps.
 */
export default function ChoiceChips({
    label,
    options,
    selected,
    onToggle,
    multiple = false,
    variant = 'pill',
    invalid = false,
}: {
    label: string;
    options: string[];
    selected: string[];
    onToggle: (value: string) => void;
    multiple?: boolean;
    variant?: 'pill' | 'segmented';
    invalid?: boolean;
}) {
    return (
        <div
            role="group"
            aria-label={label}
            aria-invalid={invalid || undefined}
            tabIndex={invalid ? -1 : undefined}
            className={cn(
                'outline-none',
                variant === 'segmented' ? 'grid gap-2' : 'flex flex-wrap gap-2',
            )}
            style={
                variant === 'segmented'
                    ? {
                          gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
                      }
                    : undefined
            }
        >
            {options.map((option) => {
                const on = selected.includes(option);

                return (
                    <button
                        key={option}
                        type="button"
                        role={multiple ? 'checkbox' : 'radio'}
                        aria-checked={on}
                        onClick={() => onToggle(option)}
                        className={cn(
                            'cursor-pointer border-[1.5px] text-[13px] font-semibold transition-colors hover:border-primary focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:outline-none',
                            variant === 'segmented'
                                ? 'h-12 rounded-control px-2'
                                : 'h-10 rounded-full px-4',
                            on
                                ? 'border-primary bg-primary/15 text-foreground'
                                : 'border-border/70 bg-background/60 text-muted-foreground',
                            invalid && !on && 'border-destructive/60',
                        )}
                    >
                        {option}
                    </button>
                );
            })}
        </div>
    );
}
