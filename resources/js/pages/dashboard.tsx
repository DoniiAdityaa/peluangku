import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    ArrowUpRight,
    Bookmark,
    CalendarClock,
    CircleCheck,
    Clock,
    Hourglass,
    Search,
    SearchX,
    Sparkles,
    UserRoundPen,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import ScholarshipCard, {
    deadlineLabel,
    ProviderAvatar,
} from '@/components/dashboard/scholarship-card';
import type { Scholarship } from '@/components/dashboard/scholarship-card';
import ChoiceChips from '@/components/form/choice-chips';
import IconBadge from '@/components/kit/icon-badge';
import type { Tone } from '@/components/kit/icon-badge';
import ScoreRing from '@/components/kit/score-ring';
import { cardClass, primaryButtonClass } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { profile } from '@/routes/account';
import { index as onboardingIndex } from '@/routes/onboarding';

type Saved = {
    id: number;
    scholarshipId: number | null;
    name: string;
    provider: string | null;
    daysLeft: number | null;
    score: number | null;
    link: string;
    image?: string | null;
};

type Profile = {
    percent: number;
    filled: number;
    total: number;
    missing: string[];
    skipped: boolean;
};

type Props = {
    canMatch: boolean;
    totalOpen: number;
    stats: { matches: number; urgent: number; saved: number };
    recommendations: Scholarship[];
    deadlines: Scholarship[];
    saved: Saved[];
    profile: Profile;
};

type Href = ReturnType<typeof profile>;

const FILTERS = ['Semua', 'Dana penuh', 'Segera tutup'];
const SHOWN = 6;

/** Staggered entrance; skipped when the user prefers reduced motion. */
const rise =
    'motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500 motion-safe:fill-mode-both';
const delay = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` });

export default function Dashboard({
    canMatch,
    totalOpen,
    stats,
    recommendations,
    deadlines,
    saved,
    profile: completeness,
}: Props) {
    // Skipped users pick AI or manual first; others go straight to the form.
    const completeHref = completeness.skipped ? onboardingIndex() : profile();
    const nearest = deadlines[0];
    const [query, setQuery] = useState('');

    return (
        <>
            <Head title="Beranda" />

            <div>
                <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-7 px-4 py-6 sm:px-6 md:px-10 md:py-9">
                    <h1 className="sr-only">Beranda</h1>

                    {canMatch && (
                        <SearchBar value={query} onChange={setQuery} />
                    )}

                    <section
                        aria-label="Ringkasan"
                        className="grid grid-cols-3 gap-2.5 sm:gap-4"
                    >
                        <Stat
                            icon={Sparkles}
                            tone="teal"
                            label="Beasiswa cocok"
                            value={stats.matches}
                            note={`dari ${totalOpen} beasiswa aktif`}
                            style={delay(120)}
                        />
                        <Stat
                            icon={Clock}
                            tone="amber"
                            label="Deadline < 7 hari"
                            value={stats.urgent}
                            note={
                                stats.urgent > 0 && nearest
                                    ? `Terdekat ${nearest.daysLeft <= 0 ? 'hari ini' : `${nearest.daysLeft} hari lagi`}`
                                    : 'Aman minggu ini'
                            }
                            style={delay(180)}
                        />
                        <Stat
                            icon={Bookmark}
                            tone="blue"
                            label="Tersimpan"
                            value={stats.saved}
                            note={
                                stats.saved > 0
                                    ? 'Deadline-nya kami pantau'
                                    : 'Belum ada yang disimpan'
                            }
                            style={delay(240)}
                        />
                    </section>

                    <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,1fr)_340px]">
                        <Recommendations
                            canMatch={canMatch}
                            items={recommendations}
                            query={query}
                            completeHref={completeHref}
                        />

                        <aside
                            aria-label="Info lainnya"
                            className="flex flex-col gap-7"
                        >
                            <Deadlines items={deadlines} canMatch={canMatch} />
                            <Priorities
                                profile={completeness}
                                completeHref={completeHref}
                                deadlines={deadlines}
                                savedCount={stats.saved}
                                canMatch={canMatch}
                            />
                            <SavedList items={saved} />
                        </aside>
                    </div>
                </div>
            </div>
        </>
    );
}

/** Search over the recommendations; ⌘K / Ctrl+K focuses it. */
function SearchBar({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) {
    const input = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
                event.preventDefault();
                input.current?.focus();
            }
        };

        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, []);

    return (
        <label className="relative block w-full sm:max-w-md">
            <span className="sr-only">Cari beasiswa</span>
            <Search
                className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
            />
            <input
                ref={input}
                type="search"
                value={value}
                onChange={(event) => {
                    // Jump to the results when a search starts.
                    if (value === '' && event.target.value !== '') {
                        document
                            .getElementById('rekomendasi')
                            ?.scrollIntoView({ behavior: 'smooth' });
                    }

                    onChange(event.target.value);
                }}
                placeholder="Cari beasiswa atau penyelenggara"
                className="h-12 w-full rounded-control border border-border/70 bg-card pr-14 pl-11 text-sm shadow-card outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
            <kbd className="pointer-events-none absolute top-1/2 right-3.5 hidden -translate-y-1/2 rounded-md border border-border/70 bg-muted px-1.5 py-0.5 font-sans text-[11px] font-medium text-muted-foreground sm:block">
                ⌘K
            </kbd>
        </label>
    );
}

function Stat({
    icon: Icon,
    tone,
    label,
    value,
    note,
    style,
}: {
    icon: LucideIcon;
    tone: Tone;
    label: string;
    value: number;
    note: string;
    style?: CSSProperties;
}) {
    return (
        <div
            style={style}
            className={cn(
                cardClass,
                'relative flex flex-col gap-3 overflow-hidden p-3.5 sm:p-5',
                rise,
            )}
        >
            {/* Large faint icon in the corner. */}
            <Icon
                aria-hidden="true"
                strokeWidth={1.4}
                className="pointer-events-none absolute -right-3 -bottom-3 hidden size-24 text-foreground/[0.04] sm:block"
            />
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
                <IconBadge
                    icon={Icon}
                    tone={tone}
                    className="size-9 sm:size-10"
                />
                <p className="text-xs leading-snug text-muted-foreground sm:text-[13px]">
                    {label}
                </p>
            </div>
            <div>
                <p className="text-2xl font-extrabold tabular-nums sm:text-[32px] sm:leading-none">
                    {value}
                </p>
                <p className="mt-1.5 hidden text-xs text-muted-foreground sm:block">
                    {note}
                </p>
            </div>
        </div>
    );
}

function SectionHeader({
    id,
    title,
    count,
    children,
}: {
    id: string;
    title: string;
    count?: string;
    children?: ReactNode;
}) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id={id} className="flex items-center gap-2 text-lg font-bold">
                {title}
                {count && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground tabular-nums">
                        {count}
                    </span>
                )}
            </h2>
            {children}
        </div>
    );
}

function Recommendations({
    canMatch,
    items,
    query,
    completeHref,
}: {
    canMatch: boolean;
    items: Scholarship[];
    query: string;
    completeHref: Href;
}) {
    const [filter, setFilter] = useState('Semua');
    const needle = query.trim().toLowerCase();
    const filtered = items
        .filter(
            (item) =>
                filter === 'Semua' ||
                (filter === 'Dana penuh' && item.funding === 'Penuh') ||
                (filter === 'Segera tutup' && item.daysLeft < 7),
        )
        .filter(
            (item) =>
                needle === '' ||
                item.name.toLowerCase().includes(needle) ||
                (item.provider ?? '').toLowerCase().includes(needle),
        );
    // While searching, show every hit instead of the first few.
    const shown = needle === '' ? filtered.slice(0, SHOWN) : filtered;

    return (
        <section
            id="rekomendasi"
            aria-labelledby="rekomendasi-title"
            className={cn('@container flex scroll-mt-6 flex-col gap-4', rise)}
            style={delay(300)}
        >
            <SectionHeader
                id="rekomendasi-title"
                title="Rekomendasi untukmu"
                count={
                    canMatch && filtered.length > 0
                        ? `${shown.length} dari ${filtered.length}`
                        : undefined
                }
            >
                {canMatch && items.length > 0 && (
                    <ChoiceChips
                        label="Filter rekomendasi"
                        options={FILTERS}
                        selected={[filter]}
                        onToggle={setFilter}
                    />
                )}
            </SectionHeader>

            {!canMatch ? (
                <EmptyState
                    icon={UserRoundPen}
                    title="Lengkapi profil dulu biar rekomendasinya akurat"
                    text="Isi jenjang tujuan, IPK, dan bidang minat. Kami pakai itu untuk mencocokkan beasiswa."
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
                        needle !== ''
                            ? `Tidak ada beasiswa untuk "${query.trim()}".`
                            : filter === 'Semua'
                              ? 'Coba ubah jenjang tujuan atau bidang minat di profilmu.'
                              : 'Belum ada yang cocok dengan filter ini. Coba filter lain.'
                    }
                    action={
                        needle !== '' ? null : filter === 'Semua' ? (
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
                <div className="grid grid-cols-1 gap-4 @2xl:grid-cols-2">
                    {shown.map((item, index) => (
                        <ScholarshipCard
                            key={item.id}
                            scholarship={item}
                            className={rise}
                            style={delay(360 + index * 60)}
                        />
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
    action: ReactNode;
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
            {action && <div className="mt-2">{action}</div>}
        </div>
    );
}

/** Upcoming deadlines as a vertical timeline. */
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
            className={cn('flex flex-col gap-4', rise)}
            style={delay(320)}
        >
            <SectionHeader id="deadline-title" title="Deadline terdekat" />
            <div className={cn(cardClass, 'p-5')}>
                {items.length === 0 ? (
                    <p className="flex items-center gap-3 text-sm text-muted-foreground">
                        <CalendarClock
                            className="size-5 shrink-0"
                            aria-hidden="true"
                        />
                        {canMatch
                            ? 'Belum ada deadline dari beasiswa yang cocok.'
                            : 'Deadline muncul setelah profilmu bisa dicocokkan.'}
                    </p>
                ) : (
                    <ol className="relative flex flex-col gap-5">
                        <span
                            aria-hidden="true"
                            className="absolute top-2 bottom-2 left-[5px] w-px bg-gradient-to-b from-border via-border to-transparent"
                        />
                        {items.map((item) => (
                            <DeadlineItem key={item.id} item={item} />
                        ))}
                    </ol>
                )}
            </div>
        </section>
    );
}

function DeadlineItem({ item }: { item: Scholarship }) {
    const date = new Date(`${item.deadline}T00:00:00`);
    const deadline = deadlineLabel(item.daysLeft);

    return (
        <li className="relative flex gap-4 pl-6">
            <span
                aria-hidden="true"
                className={cn(
                    'absolute top-1.5 left-0 size-[11px] rounded-full ring-4 ring-card',
                    deadline.tone === 'urgent' && 'bg-red-400',
                    deadline.tone === 'soon' && 'bg-warning',
                    deadline.tone === 'normal' && 'bg-primary',
                )}
            />
            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                    <time
                        dateTime={item.deadline}
                        className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase"
                    >
                        {date.toLocaleDateString('id-ID', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                        })}
                    </time>
                    {item.saved && (
                        <Bookmark
                            className="size-3.5 shrink-0 fill-primary text-primary"
                            aria-label="Tersimpan"
                        />
                    )}
                </div>
                <p className="mt-1 truncate text-sm font-semibold">
                    {item.name}
                </p>
                <p
                    className={cn(
                        'mt-0.5 text-xs font-medium',
                        deadline.className,
                    )}
                >
                    {deadline.text}
                </p>
            </div>
        </li>
    );
}

type Task = {
    key: string;
    icon: LucideIcon;
    tone: Tone;
    title: string;
    text: string;
    action: ReactNode;
    extra?: ReactNode;
};

/** What to do next: urgent deadline, missing profile fields, nothing saved. */
function Priorities({
    profile: completeness,
    completeHref,
    deadlines,
    savedCount,
    canMatch,
}: {
    profile: Profile;
    completeHref: Href;
    deadlines: Scholarship[];
    savedCount: number;
    canMatch: boolean;
}) {
    const urgent = deadlines.find((item) => item.daysLeft < 3);
    const tasks: Task[] = [];

    if (urgent) {
        tasks.push({
            key: 'deadline',
            icon: Hourglass,
            tone: 'amber',
            title: `Siapkan berkas ${urgent.name}`,
            text: deadlineLabel(urgent.daysLeft).text,
            action: (
                <a
                    href={urgent.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80"
                >
                    Buka situs
                    <ArrowUpRight className="size-3.5" aria-hidden="true" />
                </a>
            ),
        });
    }

    if (completeness.percent < 100) {
        tasks.push({
            key: 'profile',
            icon: UserRoundPen,
            tone: 'teal',
            title: 'Lengkapi profil',
            text: `${completeness.filled} dari ${completeness.total} kolom terisi`,
            extra: (
                <>
                    <div
                        role="progressbar"
                        aria-valuenow={completeness.percent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label="Kelengkapan profil"
                        className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
                    >
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-teal-400 to-primary"
                            style={{ width: `${completeness.percent}%` }}
                        />
                    </div>
                    <ul className="mt-2.5 flex flex-wrap gap-1.5">
                        {completeness.missing.slice(0, 3).map((field) => (
                            <li
                                key={field}
                                className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium"
                            >
                                {field}
                            </li>
                        ))}
                        {completeness.missing.length > 3 && (
                            <li className="px-1 py-0.5 text-[11px] text-muted-foreground">
                                +{completeness.missing.length - 3} lainnya
                            </li>
                        )}
                    </ul>
                </>
            ),
            action: (
                <Link
                    href={completeHref}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80"
                >
                    Lengkapi
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
            ),
        });
    }

    if (canMatch && savedCount === 0) {
        tasks.push({
            key: 'save',
            icon: Bookmark,
            tone: 'blue',
            title: 'Simpan beasiswa incaranmu',
            text: 'Biar deadline-nya gampang dipantau.',
            action: (
                <a
                    href="#rekomendasi"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80"
                >
                    Pilih beasiswa
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                </a>
            ),
        });
    }

    return (
        <section
            aria-labelledby="prioritas-title"
            className={cn('flex flex-col gap-4', rise)}
            style={delay(380)}
        >
            <SectionHeader
                id="prioritas-title"
                title="Prioritas hari ini"
                count={tasks.length > 0 ? String(tasks.length) : undefined}
            />
            <div className={cn(cardClass, 'p-2')}>
                {tasks.length === 0 ? (
                    <p className="flex items-center gap-3 p-3 text-sm text-muted-foreground">
                        <CircleCheck
                            className="size-5 shrink-0 text-success"
                            aria-hidden="true"
                        />
                        Semua beres. Cek lagi besok, ya.
                    </p>
                ) : (
                    <ol className="divide-y divide-border/50">
                        {tasks.map((task) => (
                            <li key={task.key} className="flex gap-3 p-3">
                                <IconBadge
                                    icon={task.icon}
                                    tone={task.tone}
                                    className="size-9"
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm leading-snug font-semibold">
                                        {task.title}
                                    </p>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        {task.text}
                                    </p>
                                    {task.extra}
                                    <div className="mt-2">{task.action}</div>
                                </div>
                            </li>
                        ))}
                    </ol>
                )}
            </div>
        </section>
    );
}

function SavedList({ items }: { items: Saved[] }) {
    return (
        <section
            aria-labelledby="tersimpan-title"
            className={cn('flex flex-col gap-4', rise)}
            style={delay(440)}
        >
            <SectionHeader
                id="tersimpan-title"
                title="Tersimpan"
                count={items.length > 0 ? String(items.length) : undefined}
            />
            <div className={cn(cardClass, 'p-2')}>
                {items.length === 0 ? (
                    <div className="flex items-center gap-3 p-3">
                        <IconBadge
                            icon={Bookmark}
                            tone="navy"
                            className="size-9"
                        />
                        <div className="text-sm">
                            <p className="text-muted-foreground">
                                Belum ada beasiswa tersimpan.
                            </p>
                            <a
                                href="#rekomendasi"
                                className="font-semibold text-primary hover:text-primary/80"
                            >
                                Mulai jelajahi →
                            </a>
                        </div>
                    </div>
                ) : (
                    <ul className="divide-y divide-border/50">
                        {items.map((item) => {
                            const deadline =
                                item.daysLeft !== null
                                    ? deadlineLabel(item.daysLeft)
                                    : null;

                            return (
                                <li key={item.id}>
                                    <a
                                        href={item.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex items-center gap-3 rounded-control p-3 transition-colors hover:bg-muted/50"
                                    >
                                        <ProviderAvatar
                                            provider={item.provider}
                                            image={item.image}
                                            className="size-9"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold">
                                                {item.name}
                                            </p>
                                            <p
                                                className={cn(
                                                    'mt-0.5 text-xs',
                                                    deadline?.className ??
                                                        'text-muted-foreground',
                                                )}
                                            >
                                                {item.daysLeft === null
                                                    ? (item.provider ??
                                                      'Tanpa deadline')
                                                    : item.daysLeft < 0
                                                      ? 'Sudah tutup'
                                                      : deadline?.text}
                                            </p>
                                        </div>
                                        {item.score !== null && (
                                            <ScoreRing
                                                score={item.score}
                                                size="sm"
                                            />
                                        )}
                                        <span className="sr-only">
                                            (buka situs penyelenggara)
                                        </span>
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </section>
    );
}
