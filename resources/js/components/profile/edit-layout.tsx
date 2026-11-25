import { Head } from '@inertiajs/react';
import { Check, ChevronRight, FileText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import IconBadge from '@/components/kit/icon-badge';
import type { Tone } from '@/components/kit/icon-badge';
import { useInitials } from '@/hooks/use-initials';
import { cardClass } from '@/lib/ui';
import { cn } from '@/lib/utils';

type SectionSummary = {
    id: string;
    title: string;
    icon: LucideIcon;
    tone: Tone;
    filled: number;
    total: number;
    hasError: boolean;
};

/**
 * "Profil & Dokumen" page frame: a sticky summary on the left (who you are,
 * how complete the profile is, your documents, jump links) and the form on
 * the right.
 */
export default function EditLayout({
    name,
    kampus,
    jurusan,
    cvName,
    hasTranskrip,
    percent,
    sections,
    onJump,
    children,
}: {
    name: string;
    kampus: string;
    jurusan: string;
    cvName: string | null;
    hasTranskrip: boolean;
    percent: number;
    sections: SectionSummary[];
    onJump: (id: string) => void;
    children: ReactNode;
}) {
    const getInitials = useInitials();
    const study = [jurusan, kampus].filter((part) => part.trim() !== '');
    const remaining = sections.reduce(
        (sum, section) => sum + Math.max(section.total - section.filled, 0),
        0,
    );
    const complete = remaining === 0;

    return (
        <>
            <Head title="Profil & Dokumen" />

            <div className="mx-auto w-full max-w-[1240px] px-4 py-6 sm:px-6 md:px-10 md:py-9">
                <header className="mb-7">
                    <h1 className="text-2xl font-extrabold tracking-tight sm:text-[28px]">
                        Profil & Dokumen
                    </h1>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                        Perbarui datamu kapan saja. Profil yang lengkap membuat
                        rekomendasi lebih tepat.
                    </p>
                </header>

                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
                    <aside
                        aria-label="Ringkasan profil"
                        className="flex flex-col gap-4 lg:sticky lg:top-6"
                    >
                        <section
                            className={cn(
                                cardClass,
                                'flex flex-col items-center px-5 pt-7 pb-5 text-center',
                            )}
                        >
                            <AvatarRing
                                initials={getInitials(name || 'P')}
                                percent={percent}
                            />
                            <p className="mt-4 text-lg font-bold">
                                {name || 'Tanpa nama'}
                            </p>
                            {study.length > 0 && (
                                <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
                                    {study.join(' · ')}
                                </p>
                            )}

                            <div className="mt-5 w-full border-t border-border/60 pt-4">
                                {complete ? (
                                    <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-success">
                                        <Check
                                            className="size-4"
                                            strokeWidth={2.5}
                                            aria-hidden="true"
                                        />
                                        Profil sudah lengkap
                                    </p>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        <span className="font-semibold text-foreground">
                                            {remaining} kolom
                                        </span>{' '}
                                        lagi untuk profil lengkap
                                    </p>
                                )}
                            </div>
                        </section>

                        <section className={cn(cardClass, 'p-5')}>
                            <h2 className="text-sm font-semibold">Dokumen</h2>
                            <ul className="mt-3 flex flex-col gap-2.5">
                                <DocumentRow
                                    label="CV"
                                    detail={cvName ?? 'Belum diunggah'}
                                    ready={cvName !== null}
                                />
                                <DocumentRow
                                    label="Transkrip nilai"
                                    detail={
                                        hasTranskrip
                                            ? 'Sudah diunggah'
                                            : 'Opsional, belum diunggah'
                                    }
                                    ready={hasTranskrip}
                                />
                            </ul>
                        </section>

                        <nav
                            aria-label="Bagian profil"
                            className={cn(cardClass, 'hidden p-2 lg:block')}
                        >
                            <ul>
                                {sections.map((section) => {
                                    const complete =
                                        section.filled >= section.total;

                                    return (
                                        <li key={section.id}>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onJump(section.id)
                                                }
                                                className="group flex w-full cursor-pointer items-center gap-3 rounded-control p-2.5 text-left transition-colors hover:bg-muted/60"
                                            >
                                                <IconBadge
                                                    icon={section.icon}
                                                    tone={section.tone}
                                                    className="size-8 [&>svg]:size-4"
                                                />
                                                <span className="flex-1 text-sm font-medium">
                                                    {section.title}
                                                </span>
                                                <span
                                                    className={cn(
                                                        'flex items-center gap-1 text-xs font-semibold tabular-nums',
                                                        section.hasError
                                                            ? 'text-destructive'
                                                            : complete
                                                              ? 'text-success'
                                                              : 'text-muted-foreground',
                                                    )}
                                                >
                                                    {complete &&
                                                        !section.hasError && (
                                                            <Check
                                                                className="size-3.5"
                                                                strokeWidth={3}
                                                                aria-hidden="true"
                                                            />
                                                        )}
                                                    {section.filled}/
                                                    {section.total}
                                                </span>
                                                <ChevronRight
                                                    className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                                                    aria-hidden="true"
                                                />
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>
                    </aside>

                    <div className="min-w-0">{children}</div>
                </div>
            </div>
        </>
    );
}

function DocumentRow({
    label,
    detail,
    ready,
}: {
    label: string;
    detail: string;
    ready: boolean;
}) {
    return (
        <li className="flex items-center gap-3">
            <span
                aria-hidden="true"
                className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-lg',
                    ready
                        ? 'bg-success/15 text-success'
                        : 'bg-muted text-muted-foreground',
                )}
            >
                {ready ? (
                    <Check className="size-4" strokeWidth={2.5} />
                ) : (
                    <FileText className="size-4" />
                )}
            </span>
            <div className="min-w-0">
                <p className="text-sm font-medium">{label}</p>
                <p className="truncate text-xs text-muted-foreground">
                    {detail}
                </p>
            </div>
        </li>
    );
}

/**
 * Avatar wrapped in a thin ring that fills up with profile completeness, with
 * the percentage in a small chip at the bottom.
 */
function AvatarRing({
    initials,
    percent,
}: {
    initials: string;
    percent: number;
}) {
    const size = 104;
    const stroke = 4;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const value = Math.max(0, Math.min(100, percent));
    const complete = value >= 100;

    return (
        <div
            className="relative"
            style={{ width: size, height: size }}
            role="img"
            aria-label={`Profil ${value}% lengkap`}
        >
            <svg
                viewBox={`0 0 ${size} ${size}`}
                className="absolute inset-0 -rotate-90"
                aria-hidden="true"
            >
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    strokeWidth={stroke}
                    className="stroke-muted"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - value / 100)}
                    className={cn(
                        'transition-[stroke-dashoffset] duration-700 ease-out',
                        complete ? 'stroke-success' : 'stroke-primary',
                    )}
                />
            </svg>
            <span
                aria-hidden="true"
                className="absolute inset-[10px] flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-teal-300 text-2xl font-extrabold text-primary-foreground"
            >
                {initials}
            </span>
            <span
                aria-hidden="true"
                className={cn(
                    'absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full border-2 border-card px-2 py-0.5 text-xs font-bold tabular-nums',
                    complete
                        ? 'bg-success text-white'
                        : 'bg-primary text-primary-foreground',
                )}
            >
                {value}%
            </span>
        </div>
    );
}
