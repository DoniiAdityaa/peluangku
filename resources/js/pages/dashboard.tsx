import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    ArrowUpRight,
    Bookmark,
    CalendarClock,
    Check,
    Clock,
    SearchX,
    Sparkles,
    UserRoundPen,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import ScholarshipCard, {
    deadlineLabel,
    ScoreBadge,
} from '@/components/dashboard/scholarship-card';
import type { Scholarship } from '@/components/dashboard/scholarship-card';
import ChoiceChips from '@/components/form/choice-chips';
import IconBadge from '@/components/kit/icon-badge';
import type { Tone } from '@/components/kit/icon-badge';
import ProgressMeter from '@/components/kit/progress-meter';
import { cardClass, primaryButtonClass } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { index as onboardingIndex, profile } from '@/routes/onboarding';

type Saved = {
    id: number;
    scholarshipId: number | null;
    name: string;
    provider: string | null;
    daysLeft: number | null;
    score: number | null;
    link: string;
};

type Profile = {
    percent: number;
    filled: number;
    total: number;
    missing: string[];
    skipped: boolean;
};

type Props = {
    firstName: string;
    canMatch: boolean;
    stats: { matches: number; urgent: number; saved: number };
    recommendations: Scholarship[];
    deadlines: Scholarship[];
    saved: Saved[];
    profile: Profile;
};

const FILTERS = ['Semua', 'Dalam negeri', 'Luar negeri'];
const SHOWN = 6;

export default function Dashboard({
    firstName,
    canMatch,
    stats,
    recommendations,
    deadlines,
    saved,
    profile: completeness,
}: Props) {
    // Skipped users pick AI or manual first; others go straight to the form.
    const completeHref = completeness.skipped ? onboardingIndex() : profile();

    return (
        <>
            <Head title="Beranda" />

            <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-7 px-4 py-6 sm:px-6 md:px-10 md:py-9">
                <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight sm:text-[28px]">
                            Halo, {firstName}
                        </h1>
                        <p className="mt-1.5 text-sm text-muted-foreground">
                            {canMatch
                                ? stats.matches > 0
                                    ? `Ada ${stats.matches} beasiswa yang cocok dengan profilmu.`
                                    : 'Belum ada beasiswa yang benar-benar cocok. Coba lengkapi profilmu.'
                                : 'Lengkapi profil supaya kami bisa mencarikan beasiswa yang cocok.'}
                        </p>
                    </div>
                    <ProfilePill percent={completeness.percent} />
                </header>

                <section
                    aria-label="Ringkasan"
                    className="grid grid-cols-3 gap-2.5 sm:gap-4"
                >
                    <Stat
                        icon={Sparkles}
                        tone="teal"
                        label="Beasiswa cocok"
                        value={stats.matches}
                    />
                    <Stat
                        icon={Clock}
                        tone="amber"
                        label="Deadline < 7 hari"
                        value={stats.urgent}
                    />
                    <Stat
                        icon={Bookmark}
                        tone="blue"
                        label="Tersimpan"
                        value={stats.saved}
                    />
                </section>

                <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,1fr)_340px]">
                    <Recommendations
                        canMatch={canMatch}
                        items={recommendations}
                        completeHref={completeHref}
                    />

                    <aside
                        aria-label="Info lainnya"
                        className="flex flex-col gap-7"
                    >
                        <Deadlines items={deadlines} canMatch={canMatch} />
                        {completeness.percent < 100 && (
                            <CompleteProfile
                                profile={completeness}
                                href={completeHref}
                            />
                        )}
                        <SavedList items={saved} />
                    </aside>
                </div>
            </div>
        </>
    );
}

function ProfilePill({ percent }: { percent: number }) {
    const complete = percent >= 100;

    return (
        <span
            className={cn(
                'inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold',
                complete
                    ? 'bg-success/15 text-success'
                    : 'bg-warning/15 text-warning',
            )}
        >
            {complete && (
                <Check
                    className="size-3.5"
                    strokeWidth={3}
                    aria-hidden="true"
                />
            )}
            {complete ? 'Profil lengkap' : `Profil ${percent}% lengkap`}
        </span>
    );
}

function Stat({
    icon,
    tone,
    label,
    value,
}: {
    icon: LucideIcon;
    tone: Tone;
    label: string;
    value: number;
}) {
    return (
        <div
            className={cn(
                cardClass,
                'flex flex-col gap-2.5 p-3.5 sm:flex-row sm:items-center sm:gap-4 sm:p-5',
            )}
        >
            <IconBadge
                icon={icon}
                tone={tone}
                size="lg"
                className="size-9 sm:size-12"
            />
            <div className="flex min-w-0 flex-col-reverse sm:flex-col">
                <p className="mt-0.5 text-xs leading-snug text-muted-foreground sm:mt-0 sm:text-[13px]">
                    {label}
                </p>
                <p className="text-xl font-extrabold tabular-nums sm:mt-0.5 sm:text-2xl">
                    {value}
                </p>
            </div>
        </div>
    );
}

function SectionTitle({
    id,
    children,
}: {
    id?: string;
    children: React.ReactNode;
}) {
    return (
        <h2 id={id} className="text-lg font-bold">
            {children}
        </h2>
    );
}

function Recommendations({
    canMatch,
    items,
    completeHref,
}: {
    canMatch: boolean;
    items: Scholarship[];
    completeHref: ReturnType<typeof profile>;
}) {
    const [filter, setFilter] = useState('Semua');
    const shown = items
        .filter((item) => filter === 'Semua' || item.lokasi === filter)
        .slice(0, SHOWN);

    return (
        <section
            id="rekomendasi"
            aria-labelledby="rekomendasi-title"
            className="flex scroll-mt-6 flex-col gap-4"
        >
            <div className="flex flex-wrap items-center justify-between gap-3">
                <SectionTitle id="rekomendasi-title">
                    Rekomendasi untukmu
                </SectionTitle>
                {canMatch && items.length > 0 && (
                    <ChoiceChips
                        label="Filter lokasi"
                        options={FILTERS}
                        selected={[filter]}
                        onToggle={setFilter}
                    />
                )}
            </div>

            {!canMatch ? (
                <EmptyState
                    icon={UserRoundPen}
                    title="Lengkapi profil dulu biar rekomendasinya akurat"
                    text="Isi jenjang tujuan, bidang minat, dan lokasi studi. Kami pakai itu untuk mencocokkan beasiswa."
                    action={
                        <Link
                            href={completeHref}
                            className={cn(
                                primaryButtonClass,
                                'inline-flex items-center gap-2 bg-primary text-sm text-primary-foreground',
                            )}
                        >
                            Lengkapi profil
                            <ArrowRight className="size-4" aria-hidden="true" />
                        </Link>
                    }
                />
            ) : shown.length === 0 ? (
                <EmptyState
                    icon={SearchX}
                    title="Belum ada yang pas"
                    text={
                        filter === 'Semua'
                            ? 'Coba ubah jenjang atau lokasi tujuan di profilmu.'
                            : 'Coba ubah filter lokasi atau jenjang.'
                    }
                    action={
                        filter === 'Semua' ? (
                            <Link
                                href={completeHref}
                                className="text-sm font-semibold text-primary hover:text-primary/80"
                            >
                                Ubah profil
                            </Link>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setFilter('Semua')}
                                className="cursor-pointer text-sm font-semibold text-primary hover:text-primary/80"
                            >
                                Lihat semua
                            </button>
                        )
                    }
                />
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {shown.map((item) => (
                        <ScholarshipCard key={item.id} scholarship={item} />
                    ))}
                </div>
            )}
        </section>
    );
}

function EmptyState({
    icon,
    title,
    text,
    action,
}: {
    icon: LucideIcon;
    title: string;
    text: string;
    action: React.ReactNode;
}) {
    return (
        <div
            className={cn(
                cardClass,
                'flex flex-col items-center gap-3 border-dashed px-6 py-12 text-center',
            )}
        >
            <IconBadge icon={icon} tone="navy" size="lg" />
            <h3 className="mt-1 text-base font-bold">{title}</h3>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                {text}
            </p>
            <div className="mt-2">{action}</div>
        </div>
    );
}

function Deadlines({
    items,
    canMatch,
}: {
    items: Scholarship[];
    canMatch: boolean;
}) {
    return (
        <section
            aria-labelledby="deadline-title"
            className="flex flex-col gap-4"
        >
            <SectionTitle id="deadline-title">Deadline terdekat</SectionTitle>
            <div className={cn(cardClass, 'p-2')}>
                {items.length === 0 ? (
                    <p className="flex items-center gap-3 p-4 text-sm text-muted-foreground">
                        <CalendarClock
                            className="size-5 shrink-0"
                            aria-hidden="true"
                        />
                        {canMatch
                            ? 'Belum ada deadline dari beasiswa yang cocok.'
                            : 'Deadline muncul setelah profilmu bisa dicocokkan.'}
                    </p>
                ) : (
                    <ol className="divide-y divide-border/60">
                        {items.map((item) => (
                            <DeadlineRow key={item.id} item={item} />
                        ))}
                    </ol>
                )}
            </div>
        </section>
    );
}

function DeadlineRow({ item }: { item: Scholarship }) {
    const date = new Date(`${item.deadline}T00:00:00`);
    const deadline = deadlineLabel(item.daysLeft);

    return (
        <li className="flex items-center gap-3.5 px-3 py-3">
            <time
                dateTime={item.deadline}
                className="flex w-11 shrink-0 flex-col items-center"
            >
                <span
                    className={cn(
                        'text-lg leading-none font-extrabold tabular-nums',
                        item.daysLeft < 7 && deadline.className,
                    )}
                >
                    {String(date.getDate()).padStart(2, '0')}
                </span>
                <span className="mt-1 text-[10px] font-semibold text-muted-foreground uppercase">
                    {date.toLocaleDateString('id-ID', { month: 'short' })}
                </span>
            </time>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{item.name}</p>
                <p
                    className={cn(
                        'mt-0.5 text-xs font-medium',
                        deadline.className,
                    )}
                >
                    {deadline.text}
                </p>
            </div>
            {item.saved && (
                <Bookmark
                    className="size-4 shrink-0 fill-primary text-primary"
                    aria-label="Tersimpan"
                />
            )}
        </li>
    );
}

function CompleteProfile({
    profile: completeness,
    href,
}: {
    profile: Profile;
    href: ReturnType<typeof profile>;
}) {
    return (
        <section
            aria-labelledby="profil-title"
            className={cn(cardClass, 'flex flex-col gap-4 p-5')}
        >
            <div className="flex items-center gap-3">
                <IconBadge icon={UserRoundPen} tone="teal" />
                <div>
                    <h2 id="profil-title" className="text-[15px] font-bold">
                        Lengkapi profil
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        Profil lengkap, rekomendasi lebih akurat.
                    </p>
                </div>
            </div>
            <ProgressMeter
                value={completeness.percent}
                label={`${completeness.filled} dari ${completeness.total} kolom terisi`}
            />
            <div>
                <p className="text-xs font-medium text-muted-foreground">
                    Belum diisi
                </p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                    {completeness.missing.slice(0, 4).map((field) => (
                        <li
                            key={field}
                            className="rounded-md bg-muted px-2 py-1 text-xs font-medium"
                        >
                            {field}
                        </li>
                    ))}
                    {completeness.missing.length > 4 && (
                        <li className="px-1 py-1 text-xs text-muted-foreground">
                            +{completeness.missing.length - 4} lainnya
                        </li>
                    )}
                </ul>
            </div>
            <Link
                href={href}
                className={cn(
                    primaryButtonClass,
                    'inline-flex items-center justify-center gap-2 bg-primary text-sm text-primary-foreground',
                )}
            >
                Lengkapi sekarang
                <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
        </section>
    );
}

function SavedList({ items }: { items: Saved[] }) {
    return (
        <section
            aria-labelledby="tersimpan-title"
            className="flex flex-col gap-4"
        >
            <SectionTitle id="tersimpan-title">Tersimpan</SectionTitle>
            <div className={cn(cardClass, 'p-2')}>
                {items.length === 0 ? (
                    <div className="flex flex-col gap-1 p-4 text-sm">
                        <p className="text-muted-foreground">
                            Belum ada beasiswa tersimpan.
                        </p>
                        <a
                            href="#rekomendasi"
                            className="w-fit font-semibold text-primary hover:text-primary/80"
                        >
                            Mulai jelajahi →
                        </a>
                    </div>
                ) : (
                    <ul className="divide-y divide-border/60">
                        {items.map((item) => (
                            <li key={item.id}>
                                <a
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center gap-3 rounded-control px-3 py-3 transition-colors hover:bg-muted/50"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold">
                                            {item.name}
                                        </p>
                                        <p
                                            className={cn(
                                                'mt-0.5 text-xs',
                                                item.daysLeft !== null
                                                    ? deadlineLabel(
                                                          item.daysLeft,
                                                      ).className
                                                    : 'text-muted-foreground',
                                            )}
                                        >
                                            {item.daysLeft === null
                                                ? (item.provider ??
                                                  'Tanpa deadline')
                                                : item.daysLeft < 0
                                                  ? 'Sudah tutup'
                                                  : deadlineLabel(item.daysLeft)
                                                        .text}
                                        </p>
                                    </div>
                                    {item.score !== null && (
                                        <ScoreBadge score={item.score} />
                                    )}
                                    <ArrowUpRight
                                        className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                                        aria-hidden="true"
                                    />
                                    <span className="sr-only">
                                        (buka situs penyelenggara)
                                    </span>
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}
