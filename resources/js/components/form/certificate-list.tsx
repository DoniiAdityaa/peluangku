import { Award, ExternalLink, FileText, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { DragEvent } from 'react';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';
import {
    compressImage,
    formatBytes,
    isCompressibleImage,
} from '@/lib/compress-image';
import { cn } from '@/lib/utils';

export type CertificateItem = {
    /** Stable React key (stored id or a random one for new files). */
    key: string;
    /** Set for certificates that are already stored. */
    id?: number;
    name: string;
    /** New file to upload (already compressed if it was an image). */
    file?: File;
    size: number;
    mime: string;
    url?: string;
    compressing?: boolean;
};

const ACCEPT = '.jpg,.jpeg,.png,.pdf';
const ALLOWED = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_BYTES = 5 * 1024 * 1024;

let counter = 0;

/** Key for a new row. (crypto.randomUUID needs HTTPS, which a phone on the LAN lacks.) */
function newKey(): string {
    counter += 1;

    return `new-${Date.now()}-${counter}`;
}

/** "Juara_1-hackathon.pdf" → "Juara 1 hackathon". */
function nameFromFile(fileName: string): string {
    return fileName
        .replace(/\.[^.]+$/, '')
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 150);
}

/**
 * Upload list for certificates: several JPG/PNG/PDF files, each with an
 * editable name. Photos are quietly compressed in the browser before upload.
 */
export default function CertificateList({
    id,
    items,
    onChange,
    max,
    errors,
}: {
    id: string;
    items: CertificateItem[];
    /** Gets an updater, since compression finishes after other changes. */
    onChange: (update: (items: CertificateItem[]) => CertificateItem[]) => void;
    max: number;
    /** Form errors, keyed like "certificates.0.file". */
    errors: Record<string, string | undefined>;
}) {
    const input = useRef<HTMLInputElement>(null);
    const [problems, setProblems] = useState<string[]>([]);
    const [dragging, setDragging] = useState(false);
    const left = max - items.length;

    const add = (files: File[]) => {
        const found: string[] = [];
        const accepted: CertificateItem[] = [];

        for (const file of files) {
            if (accepted.length >= left) {
                found.push(`Maksimal ${max} sertifikat.`);
                break;
            }

            if (!ALLOWED.includes(file.type)) {
                found.push(`${file.name}: format harus JPG, PNG, atau PDF.`);
                continue;
            }

            if (!isCompressibleImage(file) && file.size > MAX_BYTES) {
                found.push(
                    `${file.name} lebih dari 5 MB. Kompres PDF-nya dulu atau unggah sebagai foto.`,
                );
                continue;
            }

            accepted.push({
                key: newKey(),
                name: nameFromFile(file.name),
                file,
                size: file.size,
                mime: file.type,
                compressing: isCompressibleImage(file),
            });
        }

        setProblems(found);

        if (accepted.length === 0) return;

        onChange((current) => [...current, ...accepted]);

        accepted
            .filter((item) => item.compressing && item.file)
            .forEach(async (item) => {
                const original = item.file as File;
                let compressed = original;

                try {
                    compressed = await compressImage(original);
                } catch {
                    // Keep the original if the browser cannot read the image.
                }

                if (compressed.size > MAX_BYTES) {
                    setProblems((list) => [
                        ...list,
                        `${original.name} lebih dari 5 MB.`,
                    ]);
                    onChange((current) =>
                        current.filter((entry) => entry.key !== item.key),
                    );

                    return;
                }

                onChange((current) =>
                    current.map((entry) =>
                        entry.key === item.key
                            ? {
                                  ...entry,
                                  file: compressed,
                                  size: compressed.size,
                                  mime: compressed.type,
                                  compressing: false,
                              }
                            : entry,
                    ),
                );
            });
    };

    const onDrop = (event: DragEvent) => {
        event.preventDefault();
        setDragging(false);
        add(Array.from(event.dataTransfer.files));
    };

    return (
        <div className="flex flex-col gap-2.5">
            <input
                ref={input}
                id={id}
                type="file"
                accept={ACCEPT}
                multiple
                className="sr-only"
                onChange={(event) => {
                    add(Array.from(event.target.files ?? []));
                    event.target.value = '';
                }}
            />

            {items.length > 0 && (
                <ul className="flex flex-col gap-1.5">
                    {items.map((item, index) => (
                        <CertificateRow
                            key={item.key}
                            item={item}
                            error={
                                errors[`certificates.${index}.name`] ??
                                errors[`certificates.${index}.file`] ??
                                errors[`certificates.${index}.id`]
                            }
                            onRename={(name) =>
                                onChange((current) =>
                                    current.map((entry) =>
                                        entry.key === item.key
                                            ? { ...entry, name }
                                            : entry,
                                    ),
                                )
                            }
                            onRemove={() =>
                                onChange((current) =>
                                    current.filter(
                                        (entry) => entry.key !== item.key,
                                    ),
                                )
                            }
                        />
                    ))}
                </ul>
            )}

            {left > 0 && (
                <button
                    type="button"
                    onClick={() => input.current?.click()}
                    onDragOver={(event) => {
                        event.preventDefault();
                        setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                    className={cn(
                        'flex h-11 cursor-pointer items-center justify-center gap-2 rounded-control border-[1.5px] border-dashed border-border bg-background/60 px-4 text-[13px] text-muted-foreground transition-colors hover:border-primary hover:text-foreground focus-visible:border-primary focus-visible:outline-none',
                        dragging && 'border-primary bg-primary/5',
                        errors.certificates && 'border-destructive/60',
                    )}
                >
                    <Upload
                        className="size-4 shrink-0 text-primary"
                        aria-hidden="true"
                    />
                    <span className="font-medium whitespace-nowrap">
                        {items.length === 0
                            ? 'Unggah sertifikat'
                            : 'Tambah sertifikat'}
                    </span>
                    <span className="text-xs whitespace-nowrap text-muted-foreground/80">
                        <span className="hidden sm:inline">
                            JPG, PNG, PDF ·{' '}
                        </span>
                        sisa {left}
                    </span>
                </button>
            )}

            {problems.map((problem) => (
                <InputError
                    key={problem}
                    message={problem}
                    className="text-xs"
                />
            ))}
            <InputError message={errors.certificates} className="text-xs" />
        </div>
    );
}

function CertificateRow({
    item,
    error,
    onRename,
    onRemove,
}: {
    item: CertificateItem;
    error?: string;
    onRename: (name: string) => void;
    onRemove: () => void;
}) {
    const isImage = item.mime.startsWith('image/');
    const preview = usePreview(item);

    return (
        <li
            className={cn(
                'rounded-control border border-border/70 bg-background/60 py-1.5 pr-1.5 pl-2',
                error && 'border-destructive/60',
            )}
        >
            <div className="flex items-center gap-2.5">
                <span className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                    {isImage && preview ? (
                        <img
                            src={preview}
                            alt=""
                            className="size-full object-cover"
                        />
                    ) : isImage ? (
                        <Award
                            className="size-4 text-muted-foreground"
                            aria-hidden="true"
                        />
                    ) : (
                        <FileText
                            className="size-4 text-muted-foreground"
                            strokeWidth={1.8}
                            aria-hidden="true"
                        />
                    )}
                    {item.compressing && (
                        <span className="absolute inset-0 flex items-center justify-center bg-background/70">
                            <Spinner className="size-3.5" />
                        </span>
                    )}
                </span>

                <input
                    value={item.name}
                    onChange={(event) => onRename(event.target.value)}
                    placeholder="Nama sertifikat"
                    aria-label="Nama sertifikat"
                    aria-invalid={Boolean(error)}
                    maxLength={150}
                    className="h-8 min-w-0 flex-1 rounded-md bg-transparent px-1.5 text-[13px] font-medium outline-none placeholder:font-normal placeholder:text-muted-foreground hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:ring-2 focus-visible:ring-primary/30"
                />

                {!item.compressing && (
                    <span className="hidden shrink-0 text-xs text-muted-foreground tabular-nums sm:inline">
                        {isImage ? 'Gambar' : 'PDF'} · {formatBytes(item.size)}
                    </span>
                )}

                {item.id && item.url && (
                    <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Lihat ${item.name || 'sertifikat'}`}
                        title="Lihat"
                        className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                        <ExternalLink className="size-3.5" aria-hidden="true" />
                    </a>
                )}

                <button
                    type="button"
                    onClick={onRemove}
                    aria-label={`Hapus ${item.name || 'sertifikat'}`}
                    title="Hapus"
                    className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                    <X className="size-4" aria-hidden="true" />
                </button>
            </div>
            {error && (
                <InputError message={error} className="mt-1 px-1 text-xs" />
            )}
        </li>
    );
}

/** Thumbnail source: a local preview for new images, the stored file otherwise. */
function usePreview(item: CertificateItem): string | undefined {
    const [url, setUrl] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (!item.file || !item.mime.startsWith('image/')) {
            setUrl(item.url);

            return;
        }

        const objectUrl = URL.createObjectURL(item.file);
        setUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [item.file, item.mime, item.url]);

    return url;
}
