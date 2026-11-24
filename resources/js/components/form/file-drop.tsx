import { FileText, Upload } from 'lucide-react';
import { useRef } from 'react';
import InputError from '@/components/input-error';
import { cn } from '@/lib/utils';

/** File picker that shows the chosen or already stored file. */
export default function FileDrop({
    id,
    label,
    hint,
    accept,
    buttonLabel,
    existingName,
    existingNote,
    file,
    onChange,
    error,
    highlight = false,
}: {
    id: string;
    label: string;
    hint: string;
    accept: string;
    buttonLabel: string;
    existingName: string | null;
    existingNote?: string;
    file: File | null;
    onChange: (file: File | null) => void;
    error?: string;
    highlight?: boolean;
}) {
    const input = useRef<HTMLInputElement>(null);
    const name = file?.name ?? existingName;
    const note = file ? 'Siap diunggah' : existingNote;

    return (
        <div className="flex min-w-0 flex-col gap-2">
            <span className="text-[13px] font-medium text-foreground/80">
                {label}{' '}
                <span className="font-normal text-muted-foreground">
                    · {hint}
                </span>
            </span>
            <input
                ref={input}
                id={id}
                type="file"
                accept={accept}
                className="sr-only"
                onChange={(e) => onChange(e.target.files?.[0] ?? null)}
                aria-invalid={Boolean(error)}
            />
            {name ? (
                <div className="flex h-16 items-center gap-3 rounded-control border-[1.5px] border-border/70 bg-background/60 px-4">
                    <FileText
                        className="size-5 shrink-0 text-muted-foreground"
                        strokeWidth={1.8}
                        aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold">
                            {name}
                        </p>
                        {note && (
                            <p
                                className={cn(
                                    'mt-0.5 text-xs',
                                    highlight && !file
                                        ? 'text-teal-200'
                                        : 'text-muted-foreground',
                                )}
                            >
                                {note}
                            </p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => input.current?.click()}
                        className="cursor-pointer rounded-lg px-2 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                        Ganti
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => input.current?.click()}
                    className={cn(
                        'flex h-16 cursor-pointer items-center justify-center gap-2.5 rounded-control border-[1.5px] border-dashed border-border bg-background/60 text-[13px] text-muted-foreground transition-colors hover:border-primary hover:text-foreground focus-visible:border-primary focus-visible:outline-none',
                        error && 'border-destructive/60',
                    )}
                >
                    <Upload
                        className="size-[18px] text-primary"
                        aria-hidden="true"
                    />
                    {buttonLabel}
                </button>
            )}
            <InputError message={error} className="text-xs" />
        </div>
    );
}
