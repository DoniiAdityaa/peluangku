import { router } from '@inertiajs/react';
import { ArrowUpRight, Bookmark, Check, Hourglass } from 'lucide-react';
import { useState } from 'react';
import { cardClass } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { save, unsave } from '@/routes/scholarships';

export type Scholarship = {
    id: number;
    name: string;
    provider: string;
    jenjang: string[];
    lokasi: string;
    pendanaan: string;
    deadline: string;
    daysLeft: number;
    link: string;
    score: number;
    reasons: string[];
    saved: boolean;
};

/** "Tutup 5 hari lagi", coloured by urgency: amber under 7 days, red under 3. */
export function deadlineLabel(daysLeft: number): {
    text: string;
    className: string;
} {
    const text =
        daysLeft <= 0
            ? 'Tutup hari ini'
            : daysLeft === 1
              ? 'Tutup besok'
              : `Tutup ${daysLeft} hari lagi`;
    const className =
        daysLeft < 3
            ? 'text-red-400'
            : daysLeft < 7
              ? 'text-warning'
              : 'text-muted-foreground';

    return { text, className };
}

export function ScoreBadge({ score }: { score: number }) {
    return (
        <span className="flex shrink-0 flex-col items-center rounded-control bg-teal-400/15 px-2.5 py-1.5 text-teal-200">
            <span className="text-base leading-none font-extrabold tabular-nums">
                {score}%
            </span>
            <span className="mt-0.5 text-[10px] font-medium text-teal-200/80">
                cocok
            </span>
        </span>
    );
}

export default function ScholarshipCard({
    scholarship,
}: {
    scholarship: Scholarship;
}) {
    const [pending, setPending] = useState(false);
    const deadline = deadlineLabel(scholarship.daysLeft);

    const toggleSave = () => {
        router.visit(
            scholarship.saved ? unsave(scholarship.id) : save(scholarship.id),
            {
                preserveScroll: true,
                preserveState: true,
                onStart: () => setPending(true),
                onFinish: () => setPending(false),
            },
        );
    };

    return (
        <article className={cn(cardClass, 'flex flex-col gap-4 p-5')}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="text-[15px] leading-snug font-bold">
                        {scholarship.name}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {scholarship.provider} · {scholarship.jenjang.join('/')}{' '}
                        · {scholarship.lokasi}
                    </p>
                </div>
                <ScoreBadge score={scholarship.score} />
            </div>

            <p
                className={cn(
                    'flex items-center gap-1.5 text-[13px] font-semibold',
                    deadline.className,
                )}
            >
                <Hourglass className="size-4" aria-hidden="true" />
                {deadline.text}
            </p>

            {scholarship.reasons.length > 0 && (
                <ul
                    aria-label="Alasan cocok"
                    className="flex flex-wrap gap-1.5"
                >
                    {scholarship.reasons.slice(0, 4).map((reason) => (
                        <li
                            key={reason}
                            className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground/90"
                        >
                            <Check
                                className="size-3 text-success"
                                strokeWidth={3}
                                aria-hidden="true"
                            />
                            {reason}
                        </li>
                    ))}
                </ul>
            )}

            <div className="mt-auto flex items-center justify-between gap-3 pt-1">
                <button
                    type="button"
                    onClick={toggleSave}
                    disabled={pending}
                    aria-pressed={scholarship.saved}
                    className={cn(
                        'inline-flex h-10 cursor-pointer items-center gap-2 rounded-control border-[1.5px] px-3.5 text-[13px] font-semibold transition-colors focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:outline-none disabled:opacity-60',
                        scholarship.saved
                            ? 'border-primary bg-primary/15 text-foreground'
                            : 'border-border/70 text-muted-foreground hover:border-primary hover:text-foreground',
                    )}
                >
                    <Bookmark
                        className={cn(
                            'size-4',
                            scholarship.saved && 'fill-primary text-primary',
                        )}
                        aria-hidden="true"
                    />
                    {scholarship.saved ? 'Tersimpan' : 'Simpan'}
                </button>
                <a
                    href={scholarship.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center gap-1 rounded-control px-2 text-[13px] font-semibold text-primary transition-colors hover:text-primary/80"
                >
                    Detail
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                    <span className="sr-only">
                        {' '}
                        {scholarship.name} (buka situs penyelenggara)
                    </span>
                </a>
            </div>
        </article>
    );
}
