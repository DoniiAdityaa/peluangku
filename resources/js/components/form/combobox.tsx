import { Check, ChevronDown, PenLine, Search } from 'lucide-react';
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { Input } from '@/components/ui/input';
import { fieldClass } from '@/lib/ui';
import { cn } from '@/lib/utils';

export type ComboboxOption = {
    value: string;
    label: string;
    /** Muted text after the label, e.g. the province of a city. */
    hint?: string;
    /** Extra words that should match a search, e.g. "UDINUS". */
    keywords?: string;
};

type Position = {
    left: number;
    width: number;
    top?: number;
    bottom?: number;
    maxHeight: number;
};

const OTHER = '__other__';

/**
 * Dropdown used for every choice list in the app.
 *
 * It is drawn by us (not the browser's <select>), so it looks the same on
 * macOS, Windows and phones, in light and dark mode. Long lists get a search
 * box, and `allowOther` adds "Lainnya" with a text field for values that are
 * not in the list. The value is always plain text.
 */
export default function Combobox({
    id,
    value,
    onChange,
    options,
    placeholder,
    searchable,
    searchPlaceholder = 'Cari...',
    allowOther = false,
    otherLabel = 'Lainnya',
    otherHint,
    otherPlaceholder = 'Tulis sendiri',
    hintInTrigger = true,
    invalid = false,
    disabled = false,
    className,
}: {
    id: string;
    value: string;
    onChange: (value: string) => void;
    options: (string | ComboboxOption)[];
    placeholder: string;
    /** Show a search box. Defaults to on for lists longer than 8. */
    searchable?: boolean;
    searchPlaceholder?: string;
    allowOther?: boolean;
    otherLabel?: string;
    /** Small text under "Lainnya" in the list. */
    otherHint?: string;
    otherPlaceholder?: string;
    /** Repeat the selected option's hint on the closed field. */
    hintInTrigger?: boolean;
    invalid?: boolean;
    disabled?: boolean;
    className?: string;
}) {
    const items: ComboboxOption[] = options.map((option) =>
        typeof option === 'string' ? { value: option, label: option } : option,
    );
    const isListed = (text: string) =>
        items.some((item) => item.value === text);
    const withSearch = searchable ?? items.length > 8;

    const listId = useId();
    const triggerRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const otherRef = useRef<HTMLInputElement>(null);

    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [active, setActive] = useState(0);
    const [position, setPosition] = useState<Position | null>(null);
    const [otherMode, setOtherMode] = useState(
        () => allowOther && value !== '' && !isListed(value),
    );

    // Follow outside changes (form reset, AI prefill).
    useEffect(() => {
        if (!allowOther || value === '') return;
        setOtherMode(!isListed(value));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, allowOther]);

    const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const filtered = words.length
        ? items.filter((item) => {
              const text =
                  `${item.label} ${item.hint ?? ''} ${item.keywords ?? ''}`.toLowerCase();

              return words.every((word) => text.includes(word));
          })
        : items;
    const typed = query.trim();
    const rows = allowOther
        ? [...filtered, { value: OTHER, label: otherLabel }]
        : filtered;
    const selected = items.find((item) => item.value === value);

    const place = () => {
        const trigger = triggerRef.current;

        if (!trigger) return;

        const rect = trigger.getBoundingClientRect();
        const gap = 6;
        const margin = 12;
        const ideal = withSearch ? 340 : 280;
        const below = window.innerHeight - rect.bottom - gap - margin;
        const above = rect.top - gap - margin;
        const width = Math.min(
            Math.max(rect.width, 240),
            window.innerWidth - margin * 2,
        );
        const left = Math.max(
            margin,
            Math.min(rect.left, window.innerWidth - width - margin),
        );
        const flip = below < Math.min(ideal, 240) && above > below;

        setPosition(
            flip
                ? {
                      left,
                      width,
                      bottom: window.innerHeight - rect.top + gap,
                      maxHeight: Math.min(ideal, above),
                  }
                : {
                      left,
                      width,
                      top: rect.bottom + gap,
                      maxHeight: Math.min(ideal, below),
                  },
        );
    };

    useLayoutEffect(() => {
        if (!open) return;

        place();
        window.addEventListener('scroll', place, true);
        window.addEventListener('resize', place);

        return () => {
            window.removeEventListener('scroll', place, true);
            window.removeEventListener('resize', place);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    // Close on a click anywhere else.
    useEffect(() => {
        if (!open) return;

        const onPointerDown = (event: PointerEvent) => {
            const target = event.target as Node;

            if (
                !triggerRef.current?.contains(target) &&
                !panelRef.current?.contains(target)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener('pointerdown', onPointerDown);

        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, [open]);

    // Focus the search box (or the list) once the panel is there.
    useEffect(() => {
        if (!open || !position) return;

        (withSearch ? searchRef.current : listRef.current)?.focus({
            preventScroll: true,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, position !== null]);

    // Keep the highlighted row visible while using the arrow keys.
    useEffect(() => {
        if (!open) return;

        document
            .getElementById(`${listId}-${active}`)
            ?.scrollIntoView({ block: 'nearest' });
    }, [active, open, listId]);

    const show = () => {
        if (disabled) return;

        const current = otherMode
            ? rows.length - 1
            : Math.max(
                  0,
                  items.findIndex((item) => item.value === value),
              );

        setQuery('');
        setActive(current);
        setPosition(null);
        setOpen(true);
    };

    const close = (focusTrigger = true) => {
        setOpen(false);

        if (focusTrigger) triggerRef.current?.focus({ preventScroll: true });
    };

    const choose = (row: ComboboxOption) => {
        if (row.value === OTHER) {
            setOtherMode(true);
            // A search with no result becomes the typed value.
            onChange(filtered.length === 0 && typed ? typed : '');
            close(false);
            window.setTimeout(() => otherRef.current?.focus(), 0);

            return;
        }

        setOtherMode(false);
        onChange(row.value);
        close();
    };

    const onPanelKeyDown = (event: KeyboardEvent) => {
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                setActive((index) => Math.min(index + 1, rows.length - 1));
                break;
            case 'ArrowUp':
                event.preventDefault();
                setActive((index) => Math.max(index - 1, 0));
                break;
            case 'Home':
                event.preventDefault();
                setActive(0);
                break;
            case 'End':
                event.preventDefault();
                setActive(rows.length - 1);
                break;
            case 'Enter':
                event.preventDefault();

                if (rows[active]) choose(rows[active]);

                break;
            case 'Escape':
                event.preventDefault();
                close();
                break;
            case 'Tab':
                close(false);
                break;
        }
    };

    const onTriggerKeyDown = (event: KeyboardEvent) => {
        if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
            event.preventDefault();
            show();
        }
    };

    return (
        <div className={cn('flex flex-col gap-2', className)}>
            <button
                ref={triggerRef}
                id={id}
                type="button"
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={listId}
                aria-invalid={invalid && !otherMode}
                disabled={disabled}
                onClick={() => (open ? close() : show())}
                onKeyDown={onTriggerKeyDown}
                className={cn(
                    fieldClass,
                    'flex w-full cursor-pointer items-center gap-2 text-left outline-none disabled:cursor-not-allowed disabled:opacity-50',
                    open && 'border-primary ring-4 ring-primary/15',
                    invalid &&
                        !otherMode &&
                        'border-destructive hover:border-destructive',
                )}
            >
                <span className="min-w-0 flex-1 truncate">
                    {otherMode ? (
                        <span className="inline-flex items-center gap-2">
                            <PenLine
                                className="size-3.5 text-muted-foreground"
                                aria-hidden="true"
                            />
                            {otherLabel}
                        </span>
                    ) : selected ? (
                        <>
                            {selected.label}
                            {hintInTrigger && selected.hint && (
                                <span className="text-muted-foreground">
                                    {' '}
                                    · {selected.hint}
                                </span>
                            )}
                        </>
                    ) : (
                        <span className="text-muted-foreground">
                            {placeholder}
                        </span>
                    )}
                </span>
                <ChevronDown
                    className={cn(
                        'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
                        open && 'rotate-180',
                    )}
                    aria-hidden="true"
                />
            </button>

            {otherMode && (
                <Input
                    ref={otherRef}
                    id={`${id}-other`}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder={otherPlaceholder}
                    aria-label={`${otherLabel}: ${otherPlaceholder}`}
                    aria-invalid={invalid}
                    disabled={disabled}
                    className={fieldClass}
                />
            )}

            {open &&
                position &&
                createPortal(
                    <div
                        ref={panelRef}
                        onKeyDown={onPanelKeyDown}
                        style={{
                            left: position.left,
                            width: position.width,
                            top: position.top,
                            bottom: position.bottom,
                            maxHeight: position.maxHeight,
                        }}
                        className={cn(
                            'fixed z-50 flex animate-in flex-col overflow-hidden rounded-control border border-border bg-popover text-popover-foreground shadow-xl shadow-black/10 duration-150 fade-in-0 zoom-in-95',
                            position.bottom !== undefined
                                ? 'slide-in-from-bottom-1'
                                : 'slide-in-from-top-1',
                        )}
                    >
                        {withSearch && (
                            <div className="flex items-center gap-2 border-b border-border/70 px-3.5">
                                <Search
                                    className="size-4 shrink-0 text-muted-foreground"
                                    aria-hidden="true"
                                />
                                <input
                                    ref={searchRef}
                                    value={query}
                                    onChange={(event) => {
                                        setQuery(event.target.value);
                                        setActive(0);
                                    }}
                                    placeholder={searchPlaceholder}
                                    aria-label={searchPlaceholder}
                                    aria-controls={listId}
                                    aria-activedescendant={`${listId}-${active}`}
                                    autoComplete="off"
                                    className="h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground sm:text-sm"
                                />
                            </div>
                        )}

                        <div
                            ref={listRef}
                            id={listId}
                            role="listbox"
                            tabIndex={-1}
                            aria-activedescendant={
                                withSearch ? undefined : `${listId}-${active}`
                            }
                            className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1.5 outline-none"
                        >
                            {filtered.length === 0 && (
                                <p className="px-3 py-2.5 text-sm text-muted-foreground">
                                    {allowOther
                                        ? 'Tidak ada di daftar.'
                                        : 'Tidak ditemukan.'}
                                </p>
                            )}

                            {rows.map((row, index) => {
                                const isOther = row.value === OTHER;
                                const isSelected = isOther
                                    ? otherMode
                                    : !otherMode && row.value === value;

                                return (
                                    <div
                                        key={row.value}
                                        id={`${listId}-${index}`}
                                        role="option"
                                        aria-selected={isSelected}
                                        onPointerMove={() => setActive(index)}
                                        onClick={() => choose(row)}
                                        className={cn(
                                            'flex cursor-pointer items-center gap-2.5 rounded-[calc(var(--radius-control)-4px)] px-3 py-2.5 text-sm',
                                            index === active && 'bg-muted',
                                            isOther &&
                                                filtered.length > 0 &&
                                                'mt-1 border-t border-border/60',
                                        )}
                                    >
                                        {isOther && (
                                            <PenLine
                                                className="size-4 shrink-0 text-muted-foreground"
                                                aria-hidden="true"
                                            />
                                        )}
                                        <span className="min-w-0 flex-1">
                                            <span
                                                className={cn(
                                                    'block truncate',
                                                    isSelected &&
                                                        'font-semibold',
                                                )}
                                            >
                                                {isOther &&
                                                filtered.length === 0 &&
                                                typed
                                                    ? `Pakai “${typed}”`
                                                    : row.label}
                                            </span>
                                            {(isOther
                                                ? otherHint
                                                : row.hint) && (
                                                <span className="block truncate text-xs text-muted-foreground">
                                                    {isOther
                                                        ? otherHint
                                                        : row.hint}
                                                </span>
                                            )}
                                        </span>
                                        {isSelected && (
                                            <Check
                                                className="size-4 shrink-0 text-primary"
                                                strokeWidth={2.5}
                                                aria-hidden="true"
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>,
                    document.body,
                )}
        </div>
    );
}
