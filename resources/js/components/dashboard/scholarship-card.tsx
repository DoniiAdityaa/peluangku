import { router } from '@inertiajs/react';
import {
    ArrowUpRight,
    Bookmark,
    Check,
    CheckCircle2,
    Hourglass,
} from 'lucide-react';
import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { cardClass } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { save, unsave } from '@/routes/scholarships';

export type Scholarship = {
    id: number;
    name: string;
    provider: string | null;
    levels: string[];
    location: string | null;
    funding: string | null;
    deadline: string;
    daysLeft: number;
    link: string;
    description?: string | null;
    image?: string | null;
    score: number;
    reasons: string[];
    saved: boolean;
};

/** "Tutup 5 hari lagi", coloured by urgency: amber under 7 days, red under 3. */
export function deadlineLabel(daysLeft: number): {
    text: string;
    className: string;
    tone: 'urgent' | 'soon' | 'normal';
} {
    const text =
        daysLeft <= 0
            ? 'Tutup hari ini'
            : daysLeft === 1
              ? 'Tutup besok'
              : `Tutup ${daysLeft} hari lagi`;

    if (daysLeft < 3) {
        return { text, className: 'text-danger-ink', tone: 'urgent' };
    }

    if (daysLeft < 7) {
        return { text, className: 'text-warning', tone: 'soon' };
    }

    return { text, className: 'text-muted-foreground', tone: 'normal' };
}

export const DEFAULT_PROVIDER_LOGOS: Record<string, string> = {
    BCA: '/images/providers/bca.svg',
    LPDP: '/images/providers/lpdp.svg',
    Kemendikbudristek: '/images/providers/kemendikbud.svg',
    Kemendikbud: '/images/providers/kemendikbud.svg',
    'Djarum Foundation': '/images/providers/djarum.svg',
    'Tanoto Foundation': '/images/providers/tanoto.svg',
    'Bank Indonesia': '/images/providers/bi.svg',
    'Pertamina Foundation': '/images/providers/pertamina.svg',
    BAZNAS: '/images/providers/baznas.svg',
    'Yayasan KSE': '/images/providers/kse.svg',
    VDMI: '/images/providers/vdmi.svg',
    'Pemprov Jawa Tengah': '/images/providers/pemprov-jateng.svg',
    'Pemkot Surabaya': '/images/providers/pemkot-surabaya.svg',
    'Pemprov Jawa Barat': '/images/providers/pemprov-jabar.svg',
    'Pemprov DKI Jakarta': '/images/providers/pemprov-dki.svg',
    'Yayasan contoh': '/images/providers/yayasan.svg',
};

/** Match provider names reliably, even with partial name differences. */
export function resolveProviderLogo(
    provider: string | null | undefined,
    image: string | null | undefined,
): string | null {
    if (image) return image;
    if (!provider) return null;

    if (DEFAULT_PROVIDER_LOGOS[provider]) {
        return DEFAULT_PROVIDER_LOGOS[provider];
    }

    const normalized = provider.toLowerCase().trim();
    for (const [key, path] of Object.entries(DEFAULT_PROVIDER_LOGOS)) {
        if (
            normalized.includes(key.toLowerCase()) ||
            key.toLowerCase().includes(normalized)
        ) {
            return path;
        }
    }

    return null;
}

const AVATAR_TONES = [
    'bg-primary/15 text-primary border-primary/25',
    'bg-teal-400/15 text-teal-ink border-teal-400/25',
    'bg-amber-400/15 text-amber-ink border-amber-400/25',
    'bg-success/15 text-success border-success/25',
    'bg-navy-300/20 text-navy-ink border-navy-300/30',
];

/**
 * Creative organizer logo: renders official logo when available,
 * or a stylized monogram badge with stable hash colors.
 */
export function ProviderLogo({
    provider,
    image,
    size = 'md',
    className,
}: {
    provider: string | null;
    image?: string | null;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}) {
    const [failed, setFailed] = useState(false);
    const logoSrc = resolveProviderLogo(provider, image);
    const name = provider ?? 'Beasiswa';
    const words = name.split(/\s+/).filter(Boolean);
    const initials =
        words.length > 1 ? `${words[0][0]}${words[1][0]}` : name.slice(0, 2);

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash += name.charCodeAt(i);
    }
    const toneClass = AVATAR_TONES[hash % AVATAR_TONES.length];

    const sizeClasses = {
        sm: 'size-9 text-xs rounded-xl p-1',
        md: 'size-12 text-sm rounded-2xl p-1.5',
        lg: 'size-14 text-base rounded-2xl p-2',
    }[size];

    if (logoSrc && !failed) {
        return (
            <div
                className={cn(
                    'relative flex shrink-0 items-center justify-center overflow-hidden border border-border/80 bg-surface shadow-xs transition-transform duration-200 group-hover/card:scale-105 dark:border-white/10 dark:bg-card',
                    sizeClasses,
                    className,
                )}
            >
                <img
                    src={logoSrc}
                    alt={provider ? `Logo ${provider}` : 'Logo Penyelenggara'}
                    onError={() => setFailed(true)}
                    className="size-full rounded-[inherit] object-contain"
                    loading="lazy"
                />
            </div>
        );
    }

    return (
        <span
            aria-hidden="true"
            className={cn(
                'flex shrink-0 items-center justify-center border font-extrabold tracking-tight uppercase shadow-xs transition-transform duration-200 group-hover/card:scale-105',
                sizeClasses,
                toneClass,
                className,
            )}
        >
            {initials}
        </span>
    );
}

/** Initials or logo of the provider in a tinted tile. */
export function ProviderAvatar({
    provider,
    image,
    className,
}: {
    provider: string | null;
    image?: string | null;
    className?: string;
}) {
    return (
        <ProviderLogo
            provider={provider}
            image={image}
            size="sm"
            className={className}
        />
    );
}

export function SaveButton({
    scholarship,
    className,
    variant = 'label',
}: {
    scholarship: Pick<Scholarship, 'id' | 'saved'> & { name?: string };
    className?: string;
    /** `icon`: a round bookmark button without text. */
    variant?: 'label' | 'icon';
}) {
    const [pending, setPending] = useState(false);

    return (
        <button
            type="button"
            onClick={() =>
                router.visit(
                    scholarship.saved
                        ? unsave(scholarship.id)
                        : save(scholarship.id),
                    {
                        preserveScroll: true,
                        preserveState: true,
                        onStart: () => setPending(true),
                        onFinish: () => setPending(false),
                    },
                )
            }
            disabled={pending}
            aria-pressed={scholarship.saved}
            aria-label={
                variant === 'icon'
                    ? `${scholarship.saved ? 'Hapus dari tersimpan' : 'Simpan'}${scholarship.name ? `: ${scholarship.name}` : ''}`
                    : undefined
            }
            title={
                variant === 'icon'
                    ? scholarship.saved
                        ? 'Tersimpan'
                        : 'Simpan'
                    : undefined
            }
            className={cn(
                'inline-flex cursor-pointer items-center justify-center gap-2 border-[1.5px] text-[13px] font-semibold transition-colors focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:outline-none disabled:opacity-60',
                variant === 'icon'
                    ? 'size-10 rounded-full'
                    : 'h-10 rounded-control px-3.5',
                scholarship.saved
                    ? 'border-primary bg-primary/15 text-foreground'
                    : 'border-border/70 text-muted-foreground hover:border-primary hover:text-foreground',
                className,
            )}
        >
            <Bookmark
                className={cn(
                    variant === 'icon' ? 'size-[18px]' : 'size-4',
                    scholarship.saved && 'fill-primary text-primary',
                )}
                aria-hidden="true"
            />
            {variant === 'label' &&
                (scholarship.saved ? 'Tersimpan' : 'Simpan')}
        </button>
    );
}

type Tone = 'red' | 'amber' | 'green' | 'teal' | 'blue';

const PILL: Record<Tone, string> = {
    red: 'bg-danger-ink/10 text-danger-ink',
    amber: 'bg-warning/15 text-warning',
    green: 'bg-success/15 text-success',
    teal: 'bg-teal-ink/10 text-teal-ink',
    blue: 'bg-primary/15 text-primary',
};

const TEXT: Record<Tone, string> = {
    red: 'text-danger-ink',
    amber: 'text-warning',
    green: 'text-success',
    teal: 'text-teal-ink',
    blue: 'text-primary',
};

const BAR: Record<Tone, string> = {
    red: 'bg-danger-ink',
    amber: 'bg-warning',
    green: 'bg-success',
    teal: 'bg-teal-ink',
    blue: 'bg-primary',
};

/** How well it fits, in words the user can act on. */
function matchTier(score: number): { label: string; tone: Tone } {
    if (score >= 90) {
        return { label: 'Sangat cocok', tone: 'green' };
    }

    if (score >= 75) {
        return { label: 'Cocok', tone: 'teal' };
    }

    return { label: 'Lumayan cocok', tone: 'blue' };
}

/** Status of the registration window, from the days left. */
function statusOf(daysLeft: number): { label: string; tone: Tone } {
    if (daysLeft < 3) {
        return { label: 'Segera tutup', tone: 'red' };
    }

    if (daysLeft < 7) {
        return { label: 'Tutup minggu ini', tone: 'amber' };
    }

    return { label: 'Dibuka', tone: 'green' };
}

function Pill({ tone, children }: { tone: Tone; children: ReactNode }) {
    return (
        <span
            className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                PILL[tone],
            )}
        >
            {children}
        </span>
    );
}

/**
 * One scholarship: status and save at the top, what it is, how well it fits,
 * when registration closes, and a clear way to the official website.
 */
export default function ScholarshipCard({
    scholarship,
    className,
    style,
}: {
    scholarship: Scholarship;
    className?: string;
    style?: CSSProperties;
}) {
    const status = statusOf(scholarship.daysLeft);
    const tier = matchTier(scholarship.score);
    const deadline = new Date(`${scholarship.deadline}T00:00:00`);
    const daysLeft =
        scholarship.daysLeft <= 0
            ? 'Hari ini'
            : scholarship.daysLeft === 1
              ? 'Besok'
              : `${scholarship.daysLeft} hari lagi`;

    return (
        <article
            style={style}
            className={cn(
                cardClass,
                'group/card flex flex-col gap-5 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 sm:p-6',
                className,
            )}
        >
            <div className="flex items-center justify-between gap-3">
                <Pill tone={status.tone}>
                    <span
                        aria-hidden="true"
                        className={cn(
                            'size-1.5 rounded-full',
                            BAR[status.tone],
                            status.tone === 'red' &&
                                'motion-safe:animate-pulse',
                        )}
                    />
                    {status.label}
                </Pill>
                <SaveButton scholarship={scholarship} variant="icon" />
            </div>

            {/* Provider Brand & Scholarship Title */}
            <div className="flex items-start gap-3.5">
                <ProviderLogo
                    provider={scholarship.provider}
                    image={scholarship.image}
                    size="md"
                    className="mt-0.5"
                />
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <span className="truncate">
                            {scholarship.provider ?? 'Penyelenggara'}
                        </span>
                        <CheckCircle2
                            className="size-3.5 shrink-0 text-primary"
                            aria-label="Penyelenggara Terverifikasi"
                        />
                    </div>
                    <h3 className="mt-1 text-lg leading-snug font-bold tracking-tight text-foreground transition-colors group-hover/card:text-primary">
                        {scholarship.name}
                    </h3>
                </div>
            </div>

            {scholarship.description && (
                <p className="-mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {scholarship.description}
                </p>
            )}

            <ul className="-mt-1 flex flex-wrap gap-1.5" aria-label="Info">
                {scholarship.levels.map((level) => (
                    <li
                        key={level}
                        className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary"
                    >
                        {level}
                    </li>
                ))}
                {scholarship.location && (
                    <li className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                        {scholarship.location}
                    </li>
                )}
                {scholarship.funding && (
                    <li className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                        Dana {scholarship.funding.toLowerCase()}
                    </li>
                )}
            </ul>

            <div className="flex flex-col gap-4 border-t border-border/60 pt-5">
                <div>
                    <div className="flex items-end justify-between gap-3">
                        <div>
                            <p className="text-xs text-muted-foreground">
                                Kecocokan denganmu
                            </p>
                            <p
                                className={cn(
                                    'mt-0.5 text-2xl font-extrabold tabular-nums',
                                    TEXT[tier.tone],
                                )}
                            >
                                {scholarship.score}%
                            </p>
                        </div>
                        <Pill tone={tier.tone}>{tier.label}</Pill>
                    </div>
                    <div
                        role="progressbar"
                        aria-valuenow={scholarship.score}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label="Kecocokan"
                        className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"
                    >
                        <div
                            className={cn(
                                'h-full rounded-full',
                                BAR[tier.tone],
                            )}
                            style={{ width: `${scholarship.score}%` }}
                        />
                    </div>
                    {scholarship.reasons.length > 0 && (
                        <p className="mt-2.5 flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
                            <Check
                                className="mt-px size-3.5 shrink-0 text-success"
                                strokeWidth={2.5}
                                aria-hidden="true"
                            />
                            {scholarship.reasons.slice(0, 3).join(' · ')}
                        </p>
                    )}
                </div>

                <div className="flex items-end justify-between gap-3">
                    <div>
                        <p className="text-xs text-muted-foreground">
                            Batas pendaftaran
                        </p>
                        <p className="mt-0.5 font-bold">
                            <time dateTime={scholarship.deadline}>
                                {deadline.toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </time>
                        </p>
                    </div>
                    <Pill tone={status.tone === 'green' ? 'blue' : status.tone}>
                        <Hourglass className="size-3.5" aria-hidden="true" />
                        {daysLeft}
                    </Pill>
                </div>
            </div>

            <a
                href={scholarship.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-control bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-4 focus-visible:ring-primary/25 focus-visible:outline-none"
            >
                Kunjungi situs resmi
                <ArrowUpRight
                    className="size-4 transition-transform group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5"
                    aria-hidden="true"
                />
                <span className="sr-only">
                    {' '}
                    {scholarship.name} (buka di tab baru)
                </span>
            </a>
        </article>
    );
}
