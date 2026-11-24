import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { fieldClass } from '@/lib/ui';
import { cn } from '@/lib/utils';

/** Free-text list: type an item and press Enter (or +) to add it. */
export default function TagInput({
    id,
    items,
    onChange,
    placeholder,
    max = 10,
}: {
    id: string;
    items: string[];
    onChange: (items: string[]) => void;
    placeholder: string;
    max?: number;
}) {
    const [draft, setDraft] = useState('');

    const add = () => {
        const value = draft.trim();

        if (value && !items.includes(value) && items.length < max) {
            onChange([...items, value]);
        }

        setDraft('');
    };

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            add();
        }

        if (event.key === 'Backspace' && !draft && items.length) {
            onChange(items.slice(0, -1));
        }
    };

    return (
        <div className="flex flex-col gap-2.5">
            {items.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                    {items.map((item) => (
                        <li
                            key={item}
                            className="inline-flex h-9 max-w-full items-center gap-1.5 rounded-full border border-border/70 bg-muted pr-1.5 pl-3.5 text-[13px]"
                        >
                            <span className="truncate">{item}</span>
                            <button
                                type="button"
                                onClick={() =>
                                    onChange(items.filter((i) => i !== item))
                                }
                                aria-label={`Hapus ${item}`}
                                className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                            >
                                <X className="size-3.5" aria-hidden="true" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            <div className="relative">
                <Input
                    id={id}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={onKeyDown}
                    onBlur={add}
                    placeholder={placeholder}
                    className={cn(fieldClass, 'pr-12')}
                />
                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={add}
                    disabled={!draft.trim()}
                    aria-label="Tambah"
                    className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-primary transition-colors hover:bg-primary/15 disabled:cursor-default disabled:text-muted-foreground disabled:hover:bg-transparent"
                >
                    <Plus className="size-4" aria-hidden="true" />
                </button>
            </div>
        </div>
    );
}
