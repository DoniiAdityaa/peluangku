import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    ArrowUp,
    Bookmark,
    CalendarClock,
    Check,
    ChevronDown,
    FileText,
    GraduationCap,
    MapPin,
    MessageCircle,
    ShieldCheck,
    Sparkles,
    Target,
    UserPlus,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent, ReactNode } from 'react';
import BrandLogo from '@/components/brand-logo';
import Mascot from '@/components/mascot';
import type { MascotPose } from '@/components/mascot';
import { cardClass, primaryButtonClass } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { dashboard, login, register } from '@/routes';

type Props = {
    stats: { open: number; closingSoon: number; nearestDays: number | null };
};

type Cta = { href: ReturnType<typeof register>; label: string };

const NAV = [
    { href: '#fitur', label: 'Fitur' },
    { href: '#cara-kerja', label: 'Cara kerja' },
    { href: '#lumi', label: 'Lumi' },
    { href: '#faq', label: 'FAQ' },
];

export default function Welcome({ stats }: Props) {
    const { auth } = usePage().props;
    const signedIn = Boolean(auth.user);
    const cta: Cta = signedIn
        ? { href: dashboard(), label: 'Buka dashboard' }
        : { href: register(), label: 'Daftar gratis' };

    // Glide between sections for every in-page link (header, footer, buttons).
    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
            return;

        const root = document.documentElement;
        root.style.scrollBehavior = 'smooth';

        return () => {
            root.style.scrollBehavior = '';
        };
    }, []);

    return (
        <>
            <Head title="Temukan beasiswa yang cocok buatmu">
                <meta
                    name="description"
                    content="Peluangku mencocokkan profilmu dengan beasiswa dalam negeri yang sedang dibuka, lengkap dengan skor kecocokan dan pengingat deadline."
                />
            </Head>
            <div className="min-h-svh overflow-x-clip bg-background text-foreground">
                <SiteHeader signedIn={signedIn} cta={cta} />
                <main>
                    <Hero cta={cta} stats={stats} />
                    <KeywordBands />
                    <ScrollStory />
                    <Features />
                    <Steps cta={cta} />
                    <MeetLumi />
                    <Faq />
                </main>
                <SiteFooter cta={cta} signedIn={signedIn} />
            </div>
        </>
    );
}

/* ------------------------------------------------------------------ */
/* Motion helpers                                                     */
/* ------------------------------------------------------------------ */

function usePrefersReducedMotion(): boolean {
    const [reduced, setReduced] = useState(false);

    useEffect(() => {
        const query = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setReduced(query.matches);

        update();
        query.addEventListener('change', update);

        return () => query.removeEventListener('change', update);
    }, []);

    return reduced;
}

function useInView<T extends Element>(threshold = 0.2) {
    const ref = useRef<T>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const element = ref.current;

        if (!element) return;

        if (!('IntersectionObserver' in window)) {
            setInView(true);

            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.disconnect();
                }
            },
            { threshold, rootMargin: '0px 0px -10% 0px' },
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [threshold]);

    return { ref, inView };
}

/** 0 → 1 while a tall section scrolls past its sticky child. */
function useStickyProgress<T extends HTMLElement>() {
    const ref = useRef<T>(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let frame = 0;

        const update = () => {
            frame = 0;
            const element = ref.current;

            if (!element) return;

            const rect = element.getBoundingClientRect();
            const distance = rect.height - window.innerHeight;
            const value = distance > 0 ? -rect.top / distance : 1;

            setProgress(Math.min(1, Math.max(0, value)));
        };
        const schedule = () => {
            if (!frame) frame = requestAnimationFrame(update);
        };

        update();
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule);

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('scroll', schedule);
            window.removeEventListener('resize', schedule);
        };
    }, []);

    return { ref, progress };
}

function Reveal({
    children,
    delay = 0,
    className,
}: {
    children: ReactNode;
    delay?: number;
    className?: string;
}) {
    const { ref, inView } = useInView<HTMLDivElement>();

    return (
        <div
            ref={ref}
            style={{ transitionDelay: `${delay}ms` }}
            className={cn(
                'transition-[opacity,transform] duration-700 ease-out motion-reduce:transform-none motion-reduce:opacity-100 motion-reduce:transition-none',
                inView
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-8 opacity-0',
                className,
            )}
        >
            {children}
        </div>
    );
}

/** A small rotated label that pops in. */
function Sticker({
    children,
    tilt = -6,
    tone = 'navy',
    delay = 0,
    className,
}: {
    children: ReactNode;
    tilt?: number;
    tone?: 'light' | 'navy';
    delay?: number;
    className?: string;
}) {
    return (
        <span
            style={
                {
                    '--tilt': `${tilt}deg`,
                    transform: `rotate(${tilt}deg)`,
                    animationDelay: `${delay}ms`,
                } as CSSProperties
            }
            className={cn(
                'pointer-events-none inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs leading-none font-bold tracking-normal whitespace-nowrap shadow-lg motion-safe:animate-sticker sm:text-sm',
                tone === 'light' && 'bg-white text-navy-900',
                tone === 'navy' &&
                    'border border-teal-400/30 bg-navy-900 text-teal-200',
                className,
            )}
        >
            {children}
        </span>
    );
}

/** Hand-drawn looking stroke that draws itself in. */
function Squiggle({
    d,
    className,
    delay = 0,
}: {
    d: string;
    className?: string;
    delay?: number;
}) {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 400 400"
            fill="none"
            className={cn('pointer-events-none absolute', className)}
        >
            <path
                d={d}
                pathLength={1}
                stroke="currentColor"
                strokeWidth={12}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ strokeDasharray: 1, animationDelay: `${delay}ms` }}
                className="[stroke-dashoffset:1] motion-safe:animate-draw motion-reduce:[stroke-dashoffset:0]"
            />
        </svg>
    );
}

function Eyebrow({ children }: { children: ReactNode }) {
    return (
        <p className="text-xs font-bold tracking-[0.2em] text-teal-ink uppercase">
            {children}
        </p>
    );
}

function BigTitle({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <h2
            className={cn(
                'text-4xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-5xl',
                className,
            )}
        >
            {children}
        </h2>
    );
}

function CtaButton({ cta, className }: { cta: Cta; className?: string }) {
    return (
        <Link
            href={cta.href}
            className={cn(
                primaryButtonClass,
                'group inline-flex items-center justify-center gap-2 bg-primary whitespace-nowrap text-primary-foreground',
                className,
            )}
        >
            {cta.label}
            <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
            />
        </Link>
    );
}

/* ------------------------------------------------------------------ */
/* Header                                                             */
/* ------------------------------------------------------------------ */

function SiteHeader({ signedIn, cta }: { signedIn: boolean; cta: Cta }) {
    const [scrolled, setScrolled] = useState(false);
    const [hidden, setHidden] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const active = useActiveSection(NAV.map((item) => item.href.slice(1)));
    const navRef = useRef<HTMLUListElement>(null);
    const [pill, setPill] = useState<{ left: number; width: number } | null>(
        null,
    );

    // Shrink once the page moves, slide away while reading down, come back on the way up.
    useEffect(() => {
        let last = window.scrollY;

        const onScroll = () => {
            const y = window.scrollY;

            setScrolled(y > 8);
            setHidden(y > 240 && y > last + 4);

            if (y < last - 4 || y <= 240) setHidden(false);

            last = y;
        };

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Move the highlight pill under the link of the section on screen.
    useEffect(() => {
        const place = () => {
            const list = navRef.current;
            const link = list?.querySelector<HTMLAnchorElement>(
                `a[href="#${active}"]`,
            );

            if (!list || !link) {
                setPill(null);

                return;
            }

            // Measure against the list itself: each link sits in its own <li>.
            const listRect = list.getBoundingClientRect();
            const linkRect = link.getBoundingClientRect();

            setPill({
                left: linkRect.left - listRect.left,
                width: linkRect.width,
            });
        };

        place();
        window.addEventListener('resize', place);
        void document.fonts?.ready.then(place);

        return () => window.removeEventListener('resize', place);
    }, [active]);

    return (
        <header
            className={cn(
                'sticky top-0 z-40 px-3 pt-3 transition-transform duration-500 ease-out sm:px-4',
                hidden && !menuOpen && '-translate-y-[120%]',
            )}
        >
            <div
                className={cn(
                    'relative mx-auto max-w-6xl overflow-hidden rounded-[1.75rem] border border-white/10 bg-navy-700/95 text-white shadow-xl shadow-black/20 backdrop-blur-md transition-[padding] duration-300',
                    scrolled ? 'py-1.5' : 'py-2.5',
                )}
            >
                <div className="flex items-center gap-4 pr-2 pl-5">
                    <a
                        href="#"
                        onClick={(event) => goTo(event, '')}
                        className="shrink-0 rounded-lg"
                        aria-label="Peluangku, ke atas"
                    >
                        <BrandLogo variant="white" className="w-28" />
                    </a>

                    <nav
                        aria-label="Navigasi utama"
                        className="hidden flex-1 justify-center md:flex"
                    >
                        <ul
                            ref={navRef}
                            className="relative flex items-center gap-1"
                        >
                            {pill && (
                                <span
                                    aria-hidden="true"
                                    className="absolute inset-y-0 rounded-full bg-white/12 transition-all duration-500 ease-[cubic-bezier(0.34,1.4,0.64,1)]"
                                    style={{
                                        left: pill.left,
                                        width: pill.width,
                                    }}
                                />
                            )}
                            {NAV.map((item) => {
                                const isActive = active === item.href.slice(1);

                                return (
                                    <li key={item.href} className="relative">
                                        <a
                                            href={item.href}
                                            onClick={(event) =>
                                                goTo(event, item.href)
                                            }
                                            aria-current={
                                                isActive
                                                    ? 'location'
                                                    : undefined
                                            }
                                            className={cn(
                                                'block rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                                                isActive
                                                    ? 'text-white'
                                                    : 'text-navy-100/75 hover:text-white',
                                            )}
                                        >
                                            {item.label}
                                        </a>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    <div className="ml-auto flex items-center gap-1.5 md:ml-0">
                        {!signedIn && (
                            <Link
                                href={login()}
                                className="hidden rounded-full px-4 py-2 text-sm font-semibold text-navy-100/85 transition-colors hover:text-white sm:block"
                            >
                                Masuk
                            </Link>
                        )}
                        <Link
                            href={cta.href}
                            className="group inline-flex h-11 items-center gap-2.5 rounded-full bg-white py-1 pr-1 pl-4 text-sm font-bold whitespace-nowrap text-navy-900 transition-transform hover:-translate-y-px"
                        >
                            {cta.label}
                            <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-300 group-hover:-rotate-45">
                                <ArrowRight
                                    className="size-4"
                                    aria-hidden="true"
                                />
                            </span>
                        </Link>
                        <button
                            type="button"
                            onClick={() => setMenuOpen((value) => !value)}
                            aria-expanded={menuOpen}
                            aria-controls="menu-landing"
                            aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
                            className="flex size-11 cursor-pointer items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 md:hidden"
                        >
                            <span
                                className="relative block h-3 w-5"
                                aria-hidden="true"
                            >
                                <span
                                    className={cn(
                                        'absolute left-0 h-0.5 w-5 rounded-full bg-current transition-all duration-300',
                                        menuOpen
                                            ? 'top-1.5 rotate-45'
                                            : 'top-0',
                                    )}
                                />
                                <span
                                    className={cn(
                                        'absolute left-0 h-0.5 w-5 rounded-full bg-current transition-all duration-300',
                                        menuOpen
                                            ? 'top-1.5 -rotate-45'
                                            : 'top-3',
                                    )}
                                />
                            </span>
                        </button>
                    </div>
                </div>

                <div
                    id="menu-landing"
                    className={cn(
                        'grid transition-[grid-template-rows,opacity] duration-300 ease-out md:hidden',
                        menuOpen
                            ? 'grid-rows-[1fr] opacity-100'
                            : 'grid-rows-[0fr] opacity-0',
                    )}
                >
                    <div className="overflow-hidden">
                        <ul className="flex flex-col gap-1 px-3 pt-3 pb-2">
                            {NAV.map((item) => (
                                <li key={item.href}>
                                    <a
                                        href={item.href}
                                        onClick={(event) => {
                                            setMenuOpen(false);
                                            goTo(event, item.href);
                                        }}
                                        className={cn(
                                            'block rounded-2xl px-4 py-3 text-base font-semibold transition-colors',
                                            active === item.href.slice(1)
                                                ? 'bg-white/12 text-white'
                                                : 'text-navy-100/85 hover:bg-white/8',
                                        )}
                                    >
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                            {!signedIn && (
                                <li>
                                    <Link
                                        href={login()}
                                        className="block rounded-2xl px-4 py-3 text-base font-semibold text-navy-100/85 hover:bg-white/8"
                                    >
                                        Masuk
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </header>
    );
}

/** Smoothly scroll to a section (or the top) instead of jumping. */
function goTo(event: MouseEvent<HTMLAnchorElement>, hash: string) {
    const target = hash
        ? document.querySelector<HTMLElement>(hash)
        : document.body;

    if (!target) return;

    event.preventDefault();

    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)')
        .matches;

    if (hash) {
        target.scrollIntoView({
            behavior: smooth ? 'smooth' : 'auto',
            block: 'start',
        });
    } else {
        window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
    }

    window.history.replaceState(null, '', hash || window.location.pathname);
}

/** Id of the section currently in the middle of the screen. */
function useActiveSection(ids: string[]): string | null {
    const [active, setActive] = useState<string | null>(null);
    const key = ids.join(',');

    useEffect(() => {
        const sections = key
            .split(',')
            .map((id) => document.getElementById(id))
            .filter((element): element is HTMLElement => element !== null);

        if (sections.length === 0 || !('IntersectionObserver' in window))
            return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActive(entry.target.id);
                });
            },
            { rootMargin: '-45% 0px -50% 0px' },
        );

        sections.forEach((section) => observer.observe(section));

        const onScroll = () => {
            if (window.scrollY < 200) setActive(null);
        };

        window.addEventListener('scroll', onScroll, { passive: true });

        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', onScroll);
        };
    }, [key]);

    return active;
}

/* ------------------------------------------------------------------ */
/* Hero                                                               */
/* ------------------------------------------------------------------ */

const ENTER =
    'motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-700 motion-safe:fill-mode-both';

function Hero({ cta, stats }: { cta: Cta; stats: Props['stats'] }) {
    const nearest = stats.nearestDays;

    return (
        <section className="relative isolate">
            <Squiggle
                d="M20 330 C 90 250, 40 160, 120 120 S 260 140, 250 60 S 330 10, 390 40"
                className="-top-10 -right-24 -z-10 size-[30rem] text-teal-400/30 sm:-right-10"
                delay={200}
            />
            <Squiggle
                d="M10 60 C 120 40, 160 140, 90 200 S 40 330, 160 350 S 330 300, 390 380"
                className="top-[55%] -left-40 -z-10 size-[26rem] text-primary/20"
                delay={600}
            />

            <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-10 pb-16 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:gap-6 lg:pt-16 lg:pb-24">
                <div className="flex flex-col items-start gap-7">
                    <Sticker tilt={-3} delay={150}>
                        <span className="size-2 rounded-full bg-teal-300" />
                        Khusus beasiswa dalam negeri
                    </Sticker>

                    <h1 className="text-5xl leading-[1.02] font-extrabold tracking-tight sm:text-6xl xl:text-7xl">
                        <span
                            className={cn(
                                'block motion-safe:slide-in-from-bottom-6',
                                ENTER,
                            )}
                        >
                            Beasiswa
                        </span>
                        <span
                            className={cn(
                                'block motion-safe:slide-in-from-bottom-6',
                                ENTER,
                            )}
                            style={{ animationDelay: '60ms' }}
                        >
                            yang <span className="text-teal-ink">pas</span>,
                        </span>
                        <span
                            className={cn(
                                'block motion-safe:slide-in-from-bottom-6',
                                ENTER,
                            )}
                            style={{ animationDelay: '120ms' }}
                        >
                            tanpa ribet.
                        </span>
                    </h1>

                    <p
                        className={cn(
                            'max-w-lg text-lg leading-relaxed text-muted-foreground',
                            ENTER,
                        )}
                        style={{ animationDelay: '250ms' }}
                    >
                        Isi profil sekali, Peluangku langsung mencocokkan dengan
                        beasiswa yang sedang dibuka. Lengkap dengan skor
                        kecocokan, alasannya, dan pengingat deadline.
                    </p>

                    <div
                        className={cn(
                            'flex w-full flex-col gap-3 sm:w-auto sm:flex-row',
                            ENTER,
                        )}
                        style={{ animationDelay: '380ms' }}
                    >
                        <CtaButton cta={cta} className="h-13 px-7 text-base" />
                        <a
                            href="#cara-kerja"
                            onClick={(event) => goTo(event, '#cara-kerja')}
                            className="inline-flex h-13 items-center justify-center gap-2 rounded-control border border-border bg-card px-7 text-base font-semibold transition-colors hover:bg-muted"
                        >
                            Lihat cara kerja
                        </a>
                    </div>

                    <div
                        className={cn('flex items-center gap-3', ENTER)}
                        style={{ animationDelay: '500ms' }}
                    >
                        <span className="flex size-10 items-center justify-center rounded-full bg-teal-soft text-teal-ink">
                            <GraduationCap
                                className="size-5"
                                aria-hidden="true"
                            />
                        </span>
                        <p className="text-sm leading-snug text-muted-foreground">
                            <span className="font-bold text-foreground">
                                {stats.open} beasiswa
                            </span>{' '}
                            sedang dibuka
                            <br />
                            {stats.closingSoon} di antaranya tutup dalam 2
                            minggu
                        </p>
                    </div>
                </div>

                <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                    <div
                        className={cn(
                            'relative mx-auto aspect-square w-full max-w-[28rem] motion-safe:zoom-in-90',
                            ENTER,
                        )}
                        style={{ animationDelay: '200ms' }}
                    >
                        <div
                            aria-hidden="true"
                            className="absolute inset-[14%] rounded-full bg-teal-400/20 blur-3xl"
                        />
                        <Mascot
                            pose="login"
                            className="relative size-full"
                            label="Lumi, maskot Peluangku, melambai menyapa"
                        />
                        <Sticker
                            tilt={-8}
                            tone="light"
                            delay={1100}
                            className="absolute top-[3%] right-[8%]"
                        >
                            Hai, aku Lumi!
                        </Sticker>

                        <FloatingCard
                            className="top-[20%] -left-2 sm:-left-12"
                            style={{ animationDelay: '0s' }}
                        >
                            <IconTile icon={Target} tone="green" />
                            <div>
                                <p className="text-[13px] font-bold">
                                    Beasiswa S1 Prestasi
                                </p>
                                <p className="mt-0.5 flex items-center gap-1.5 text-xs">
                                    <span className="rounded-full bg-success/15 px-1.5 py-0.5 font-bold text-success">
                                        92% cocok
                                    </span>
                                    <span className="text-muted-foreground">
                                        contoh
                                    </span>
                                </p>
                            </div>
                        </FloatingCard>

                        <FloatingCard
                            className="top-[52%] -right-2 sm:-right-8"
                            style={{ animationDelay: '0.8s' }}
                        >
                            <IconTile icon={Sparkles} tone="teal" />
                            <div>
                                <p className="text-[13px] font-bold">
                                    CV dibaca AI
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Profil terisi otomatis
                                </p>
                            </div>
                        </FloatingCard>

                        <FloatingCard
                            className="bottom-[2%] left-[4%]"
                            style={{ animationDelay: '1.6s' }}
                        >
                            <IconTile icon={CalendarClock} tone="amber" />
                            <div>
                                <p className="text-[13px] font-bold">
                                    {nearest === null
                                        ? 'Pengingat deadline'
                                        : nearest <= 0
                                          ? 'Ada yang tutup hari ini'
                                          : `Tutup ${nearest} hari lagi`}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Jangan sampai kelewat
                                </p>
                            </div>
                        </FloatingCard>
                    </div>
                </div>
            </div>
        </section>
    );
}

function IconTile({
    icon: Icon,
    tone,
}: {
    icon: LucideIcon;
    tone: 'green' | 'teal' | 'amber' | 'blue';
}) {
    return (
        <span
            className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-xl',
                tone === 'green' && 'bg-success/15 text-success',
                tone === 'teal' && 'bg-teal-soft text-teal-ink',
                tone === 'amber' && 'bg-warning/15 text-warning',
                tone === 'blue' && 'bg-primary/15 text-primary',
            )}
        >
            <Icon className="size-[18px]" aria-hidden="true" />
        </span>
    );
}

function FloatingCard({
    children,
    className,
    style,
}: {
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
}) {
    return (
        <div
            style={style}
            className={cn(
                cardClass,
                'absolute flex max-w-[15rem] items-center gap-3 px-3.5 py-3 shadow-xl motion-safe:animate-lumi-float',
                className,
            )}
        >
            {children}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Crossing keyword bands                                             */
/* ------------------------------------------------------------------ */

const KEYWORDS = [
    'Rekomendasi cocok',
    'Skor kecocokan',
    'AI baca CV',
    'Pengingat deadline',
    'Beasiswa dalam negeri',
    'Gratis',
];

function Star() {
    return (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="size-4 shrink-0 text-teal-300"
        >
            <path
                d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z"
                fill="currentColor"
            />
        </svg>
    );
}

function Band({
    reverse,
    className,
}: {
    reverse?: boolean;
    className?: string;
}) {
    const words = [...KEYWORDS, ...KEYWORDS, ...KEYWORDS, ...KEYWORDS];

    return (
        <div className={cn('overflow-hidden py-3', className)}>
            <ul
                className={cn(
                    'flex w-max items-center gap-6 motion-safe:animate-marquee-fast',
                    reverse && '[animation-direction:reverse]',
                )}
            >
                {words.map((word, index) => (
                    <li
                        key={`${word}-${index}`}
                        aria-hidden={
                            index >= KEYWORDS.length ? true : undefined
                        }
                        className="flex items-center gap-6 text-base font-extrabold tracking-wide whitespace-nowrap uppercase sm:text-lg"
                    >
                        {word}
                        <Star />
                    </li>
                ))}
            </ul>
        </div>
    );
}

function KeywordBands() {
    return (
        <section aria-label="Yang kamu dapat" className="relative py-10">
            <Band
                reverse
                className="absolute inset-x-[-5%] top-1/2 -translate-y-1/2 rotate-2 border-y border-border/60 bg-muted text-muted-foreground"
            />
            <Band className="relative mx-[-5%] -rotate-2 bg-navy-700 text-white shadow-xl" />
        </section>
    );
}

/* ------------------------------------------------------------------ */
/* Scroll-lit story                                                   */
/* ------------------------------------------------------------------ */

const STORY: { text: string; accent?: boolean }[] = [
    { text: 'Cari beasiswa itu melelahkan. Infonya' },
    { text: 'tersebar', accent: true },
    { text: 'di mana-mana, syaratnya beda-beda, dan deadline sering' },
    { text: 'kelewat.', accent: true },
    {
        text: 'Peluangku merapikan semuanya: isi profil sekali, lalu lihat beasiswa yang benar-benar',
    },
    { text: 'cocok', accent: true },
    { text: 'buatmu.' },
];

const STORY_WORDS = STORY.flatMap((piece) =>
    piece.text.split(' ').map((word) => ({ word, accent: piece.accent })),
);

function ScrollStory() {
    const reduced = usePrefersReducedMotion();
    const { ref, progress } = useStickyProgress<HTMLElement>();
    const lit = reduced
        ? STORY_WORDS.length
        : Math.floor((progress / 0.85) * STORY_WORDS.length);

    return (
        <section
            ref={ref}
            aria-label="Kenapa Peluangku"
            className={cn('relative', reduced ? 'py-20' : 'h-[200vh]')}
        >
            <div
                className={cn(
                    'flex items-center',
                    !reduced && 'sticky top-0 h-svh',
                )}
            >
                <div className="mx-auto max-w-4xl px-4 sm:px-6">
                    <div className="mb-8 flex justify-center">
                        <Eyebrow>Kenapa Peluangku</Eyebrow>
                    </div>
                    <p className="text-center text-3xl leading-[1.3] font-extrabold tracking-tight sm:text-5xl">
                        {STORY_WORDS.map((item, index) => {
                            const on = index < lit;

                            return (
                                <span
                                    key={index}
                                    className={cn(
                                        'transition-colors duration-300',
                                        on
                                            ? item.accent
                                                ? 'text-teal-ink'
                                                : 'text-foreground'
                                            : 'text-foreground/15',
                                    )}
                                >
                                    {item.word}
                                    {index < STORY_WORDS.length - 1 && ' '}
                                </span>
                            );
                        })}
                    </p>
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/* Features                                                           */
/* ------------------------------------------------------------------ */

const SMALL_FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
    {
        icon: CalendarClock,
        title: 'Deadline nggak kelewat',
        text: 'Beasiswa yang paling dekat tutupnya selalu tampil paling atas di berandamu.',
    },
    {
        icon: Bookmark,
        title: 'Simpan & pantau',
        text: 'Tandai beasiswa incaran, lalu pantau sisa waktunya dari satu daftar.',
    },
    {
        icon: MapPin,
        title: 'Fokus dalam negeri',
        text: 'Semua beasiswanya untuk kuliah di Indonesia, dari jenjang D3 sampai S3.',
    },
];

function Features() {
    return (
        <section id="fitur" className="scroll-mt-20 py-16 sm:py-24">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <Reveal className="mb-12 flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="flex flex-col gap-3">
                        <Eyebrow>Fitur</Eyebrow>
                        <BigTitle>
                            Semua yang kamu butuh,
                            <br />
                            <span className="text-teal-ink">
                                di satu tempat.
                            </span>
                        </BigTitle>
                    </div>
                    <p className="max-w-sm text-muted-foreground">
                        Dari menemukan beasiswa yang cocok sampai memastikan
                        kamu daftar sebelum terlambat.
                    </p>
                </Reveal>

                <div className="grid gap-4 md:grid-cols-6">
                    <Reveal className="md:col-span-4">
                        <TiltCard className="h-full">
                            <FeatureBody
                                icon={Target}
                                title="Skor kecocokan yang bisa dijelaskan"
                                text="Setiap beasiswa diberi skor dari jenjang, jurusan, IPK, pendanaan, dan domisilimu. Kamu juga lihat alasannya."
                            >
                                <MatchDemo />
                            </FeatureBody>
                        </TiltCard>
                    </Reveal>
                    <Reveal delay={100} className="md:col-span-2">
                        <TiltCard className="h-full">
                            <FeatureBody
                                icon={FileText}
                                title="Unggah CV, AI yang isi"
                                text="Tidak perlu mengetik ulang. AI membaca CV-mu, kamu tinggal cek hasilnya."
                            >
                                <CvDemo />
                            </FeatureBody>
                        </TiltCard>
                    </Reveal>
                    {SMALL_FEATURES.map((item, index) => (
                        <Reveal
                            key={item.title}
                            delay={index * 100}
                            className="md:col-span-2"
                        >
                            <TiltCard className="h-full">
                                <FeatureBody {...item} />
                            </TiltCard>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}

/** Card that leans toward the pointer, with a soft light following it. */
function TiltCard({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const reduced = usePrefersReducedMotion();

    const onMove = (event: MouseEvent<HTMLDivElement>) => {
        const element = ref.current;

        if (!element || reduced) return;

        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;

        element.style.setProperty('--rx', `${(0.5 - y) * 5}deg`);
        element.style.setProperty('--ry', `${(x - 0.5) * 6}deg`);
        element.style.setProperty('--gx', `${x * 100}%`);
        element.style.setProperty('--gy', `${y * 100}%`);
    };

    const onLeave = () => {
        ref.current?.style.setProperty('--rx', '0deg');
        ref.current?.style.setProperty('--ry', '0deg');
    };

    return (
        <div
            ref={ref}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            style={{
                transform:
                    'perspective(900px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))',
            }}
            className={cn(
                cardClass,
                'group relative overflow-hidden transition-[transform,border-color] duration-200 ease-out hover:border-primary/40',
                className,
            )}
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                    background:
                        'radial-gradient(420px circle at var(--gx, 50%) var(--gy, 50%), color-mix(in oklab, var(--color-teal-400) 12%, transparent), transparent 60%)',
                }}
            />
            <div className="relative h-full">{children}</div>
        </div>
    );
}

function FeatureBody({
    icon: Icon,
    title,
    text,
    children,
}: {
    icon: LucideIcon;
    title: string;
    text: string;
    children?: ReactNode;
}) {
    return (
        <div className="flex h-full flex-col gap-4 p-6">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary/12 text-primary transition-transform duration-300 group-hover:-rotate-6">
                <Icon className="size-5" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-1.5">
                <h3 className="text-lg font-bold tracking-tight">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    {text}
                </p>
            </div>
            {children && <div className="mt-auto pt-2">{children}</div>}
        </div>
    );
}

function MatchDemo() {
    const { ref, inView } = useInView<HTMLDivElement>(0.4);
    const reasons = [
        'Jenjang S1',
        'IPK di atas syarat',
        'Domisili sesuai',
        'Dana penuh',
    ];

    return (
        <div
            ref={ref}
            className="rounded-2xl border border-border/60 bg-background/60 p-4"
        >
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">Kecocokan denganmu</p>
                <p className="text-2xl font-extrabold text-success tabular-nums">
                    92%
                </p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div
                    className="h-full rounded-full bg-success transition-[width] duration-[1400ms] ease-out motion-reduce:transition-none"
                    style={{ width: inView ? '92%' : '0%' }}
                />
            </div>
            <ul className="mt-4 flex flex-wrap gap-2">
                {reasons.map((reason, index) => (
                    <li
                        key={reason}
                        style={{ transitionDelay: `${400 + index * 150}ms` }}
                        className={cn(
                            'flex items-center gap-1.5 rounded-full bg-success/12 px-2.5 py-1 text-xs font-semibold text-success transition-[opacity,transform] duration-500 motion-reduce:transition-none',
                            inView
                                ? 'translate-y-0 opacity-100'
                                : 'translate-y-2 opacity-0',
                        )}
                    >
                        <Check
                            className="size-3.5"
                            strokeWidth={3}
                            aria-hidden="true"
                        />
                        {reason}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function CvDemo() {
    const { ref, inView } = useInView<HTMLDivElement>(0.4);
    const fields = ['Nama', 'Kampus', 'Jurusan', 'IPK'];

    return (
        <div
            ref={ref}
            className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-background/60 p-4"
        >
            {fields.map((field, index) => (
                <div key={field} className="flex items-center gap-2 text-xs">
                    <span className="w-14 shrink-0 text-muted-foreground">
                        {field}
                    </span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <span
                            className="block h-full rounded-full bg-teal-400/70 transition-[width] duration-700 ease-out motion-reduce:transition-none"
                            style={{
                                width: inView
                                    ? `${70 + ((index * 13) % 30)}%`
                                    : '0%',
                                transitionDelay: `${index * 250}ms`,
                            }}
                        />
                    </span>
                    <span className="rounded bg-teal-soft px-1 text-[10px] font-bold text-teal-ink">
                        AI
                    </span>
                </div>
            ))}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Steps (click to switch)                                            */
/* ------------------------------------------------------------------ */

const STEPS: {
    icon: LucideIcon;
    title: string;
    text: string;
    pose: MascotPose;
    line: string;
}[] = [
    {
        icon: UserPlus,
        title: 'Buat akun',
        text: 'Cukup nama, email, dan kata sandi. Verifikasi email, beres.',
        pose: 'login',
        line: 'Hai! Yuk mulai, cuma butuh sebentar.',
    },
    {
        icon: FileText,
        title: 'Isi profil',
        text: 'Unggah CV biar AI yang mengisi, atau isi manual. Bisa dilengkapi kapan saja.',
        pose: 'verifikasi',
        line: 'Kirim CV-mu, aku bantu baca dan isi.',
    },
    {
        icon: Target,
        title: 'Dapat rekomendasi',
        text: 'Beasiswa paling cocok muncul duluan, lengkap dengan alasan dan deadline.',
        pose: 'register',
        line: 'Ketemu! Ini beasiswa yang paling pas buatmu.',
    },
];

function Steps({ cta }: { cta: Cta }) {
    const [active, setActive] = useState(0);
    const step = STEPS[active];
    const panelId = useId();

    return (
        <section id="cara-kerja" className="scroll-mt-20 py-16 sm:py-24">
            <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.3fr_1fr]">
                <div className="flex flex-col gap-6">
                    <Reveal className="flex flex-col gap-3">
                        <Eyebrow>Cara kerja</Eyebrow>
                        <BigTitle>
                            Tiga langkah.{' '}
                            <span className="text-teal-ink">
                                Langsung jalan.
                            </span>
                        </BigTitle>
                        <p className="text-muted-foreground">
                            Klik tiap langkah untuk lihat detailnya.
                        </p>
                    </Reveal>

                    <div className="flex items-center gap-4">
                        <p className="shrink-0 text-sm font-extrabold tabular-nums">
                            LANGKAH{' '}
                            <span className="text-teal-ink">0{active + 1}</span>
                            <span className="text-muted-foreground">
                                {' '}
                                / 0{STEPS.length}
                            </span>
                        </p>
                        <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-border">
                            <div
                                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-teal-300 transition-[width] duration-500 ease-out"
                                style={{
                                    width: `${((active + 1) / STEPS.length) * 100}%`,
                                }}
                            />
                        </div>
                    </div>

                    <div
                        role="tablist"
                        aria-label="Langkah"
                        className="grid gap-3 md:grid-cols-3"
                    >
                        {STEPS.map((item, index) => {
                            const isActive = index === active;
                            const done = index < active;

                            return (
                                <button
                                    key={item.title}
                                    type="button"
                                    role="tab"
                                    aria-selected={isActive}
                                    aria-controls={panelId}
                                    onClick={() => setActive(index)}
                                    className={cn(
                                        'group flex cursor-pointer flex-col gap-2 rounded-2xl border p-4 text-left transition-all duration-300 md:p-5',
                                        isActive
                                            ? 'border-primary bg-primary/10 shadow-lg md:-translate-y-1'
                                            : 'border-border/70 bg-card hover:-translate-y-0.5 hover:border-primary/40',
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <span
                                            className={cn(
                                                'text-3xl font-extrabold tracking-tight transition-colors md:text-4xl',
                                                isActive
                                                    ? 'text-primary'
                                                    : done
                                                      ? 'text-teal-ink'
                                                      : 'text-foreground/25',
                                            )}
                                        >
                                            0{index + 1}
                                        </span>
                                        {done ? (
                                            <Check
                                                className="size-5 text-teal-ink"
                                                strokeWidth={3}
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            <item.icon
                                                className={cn(
                                                    'size-5 transition-transform',
                                                    isActive
                                                        ? 'text-primary'
                                                        : 'opacity-60',
                                                    'group-hover:scale-110',
                                                )}
                                                aria-hidden="true"
                                            />
                                        )}
                                    </div>
                                    <span className="text-base font-bold md:text-lg">
                                        {item.title}
                                    </span>
                                    <span
                                        className={cn(
                                            'text-xs leading-relaxed text-muted-foreground md:text-sm',
                                            !isActive && 'max-md:hidden',
                                        )}
                                    >
                                        {item.text}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div>
                        <CtaButton cta={cta} />
                    </div>
                </div>

                <div
                    id={panelId}
                    role="tabpanel"
                    className="relative mx-auto w-full max-w-sm"
                >
                    <div
                        aria-hidden="true"
                        className="absolute inset-[15%] rounded-full bg-teal-400/15 blur-3xl"
                    />
                    <Mascot
                        key={step.pose}
                        pose={step.pose}
                        className="relative w-full animate-in duration-500 fade-in-0 zoom-in-90 slide-in-from-bottom-4"
                        label={`Lumi: ${step.line}`}
                    />
                    <p
                        key={step.line}
                        className="relative mx-auto -mt-4 max-w-xs animate-in rounded-2xl rounded-bl-sm bg-white px-4 py-3 text-center text-sm font-semibold text-navy-900 shadow-lg delay-150 duration-500 fade-in-0 fill-mode-both slide-in-from-bottom-3"
                    >
                        {step.line}
                    </p>
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/* Lumi                                                               */
/* ------------------------------------------------------------------ */

const LUMI_MOMENTS: { pose: MascotPose; title: string; line: string }[] = [
    {
        pose: 'login',
        title: 'Menyapa',
        line: 'Hai! Aku Lumi. Yuk, cari beasiswa yang paling pas buatmu.',
    },
    {
        pose: 'verifikasi',
        title: 'Menemani',
        line: 'Cek emailmu ya, satu langkah lagi akunmu siap.',
    },
    {
        pose: 'tidak-ditemukan',
        title: 'Mencari',
        line: 'Belum ketemu? Coba kata kunci lain, aku bantu cari.',
    },
    {
        pose: 'keamanan',
        title: 'Menjaga',
        line: 'Data profil dan dokumenmu aman, cuma kamu yang bisa buka.',
    },
];

function MeetLumi() {
    const [active, setActive] = useState(0);
    const moment = LUMI_MOMENTS[active];

    return (
        <section id="lumi" className="scroll-mt-20 bg-muted/40 py-16 sm:py-24">
            <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
                <Reveal className="relative order-2 lg:order-1">
                    <div className="relative mx-auto max-w-md">
                        <div
                            className={cn(
                                cardClass,
                                'relative overflow-hidden bg-navy-700 p-6 text-white',
                            )}
                        >
                            <Mascot
                                key={moment.pose}
                                pose={moment.pose}
                                className="mx-auto aspect-[46/40] w-full animate-in duration-500 fade-in-0 zoom-in-95"
                                label={`Lumi sedang ${moment.title.toLowerCase()}`}
                            />
                            <p
                                key={moment.line}
                                className="mx-auto -mt-2 max-w-xs animate-in rounded-2xl rounded-bl-sm bg-white px-4 py-3 text-sm font-medium text-navy-900 shadow-lg duration-500 fade-in-0 slide-in-from-bottom-2"
                                aria-live="polite"
                            >
                                {moment.line}
                            </p>
                        </div>
                        <div
                            role="tablist"
                            aria-label="Momen Lumi"
                            className="mt-4 grid grid-cols-4 gap-2"
                        >
                            {LUMI_MOMENTS.map((item, index) => (
                                <button
                                    key={item.pose}
                                    type="button"
                                    role="tab"
                                    aria-selected={index === active}
                                    onClick={() => setActive(index)}
                                    className={cn(
                                        'flex cursor-pointer flex-col items-center gap-1 rounded-xl border px-2 py-2 text-xs font-semibold transition-all hover:-translate-y-0.5',
                                        index === active
                                            ? 'border-primary bg-primary/10 text-foreground'
                                            : 'border-border/70 bg-card text-muted-foreground hover:text-foreground',
                                    )}
                                >
                                    <Mascot
                                        pose={item.pose}
                                        className="size-10"
                                    />
                                    {item.title}
                                </button>
                            ))}
                        </div>
                    </div>
                </Reveal>

                <div className="order-1 flex flex-col gap-6 lg:order-2">
                    <Reveal className="flex flex-col gap-3">
                        <Eyebrow>Kenalan sama Lumi</Eyebrow>
                        <BigTitle>
                            Teman cari beasiswa yang{' '}
                            <span className="text-teal-ink">
                                nggak bikin pusing.
                            </span>
                        </BigTitle>
                        <p className="text-muted-foreground">
                            Lumi si penguin kutu buku menemanimu dari daftar
                            akun sampai dapat rekomendasi. Ramah, sabar, dan
                            selalu siap menyemangati. Klik momennya buat lihat
                            Lumi beraksi.
                        </p>
                    </Reveal>
                    <Reveal delay={120}>
                        <ul className="flex flex-col gap-3">
                            {[
                                {
                                    icon: Sparkles,
                                    text: 'Muncul di tiap langkah, dari daftar sampai halaman kosong',
                                },
                                {
                                    icon: ShieldCheck,
                                    text: 'Mengingatkan hal penting tanpa bikin panik',
                                },
                                {
                                    icon: MessageCircle,
                                    text: 'Segera: tanya Lumi langsung soal syarat dan dokumen',
                                },
                            ].map((item) => (
                                <li
                                    key={item.text}
                                    className="flex items-start gap-3 text-sm leading-relaxed"
                                >
                                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-teal-soft text-teal-ink">
                                        <item.icon
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                    </span>
                                    {item.text}
                                </li>
                            ))}
                        </ul>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/* FAQ (animated accordion)                                           */
/* ------------------------------------------------------------------ */

const FAQS = [
    {
        q: 'Apakah Peluangku gratis?',
        a: 'Ya. Daftar, isi profil, dan melihat rekomendasi beasiswa tidak dipungut biaya.',
    },
    {
        q: 'Beasiswa apa saja yang ada?',
        a: 'Beasiswa untuk kuliah di dalam negeri dari berbagai penyelenggara, untuk jenjang D3 sampai S3. Daftarnya terus diperbarui.',
    },
    {
        q: 'Apakah wajib mengunggah CV?',
        a: 'Tidak. CV hanya mempercepat pengisian karena AI bisa membacanya. Kamu tetap bisa mengisi profil secara manual.',
    },
    {
        q: 'Bagaimana skor kecocokan dihitung?',
        a: 'Dari jenjang tujuan, jurusan, IPK, jenis pendanaan, dan domisilimu dibanding syarat tiap beasiswa. Alasannya ditampilkan di setiap kartu beasiswa.',
    },
    {
        q: 'Apakah dataku aman?',
        a: 'CV, transkrip, dan sertifikat disimpan privat dan hanya bisa dibuka oleh kamu sendiri.',
    },
    {
        q: 'Apakah Peluangku menggantikan pendaftaran resmi?',
        a: 'Tidak. Peluangku membantu menemukan dan memantau beasiswa. Pendaftaran tetap dilakukan di situs resmi penyelenggara yang kami tautkan.',
    },
];

function Faq() {
    const [open, setOpen] = useState<number | null>(0);

    return (
        <section id="faq" className="scroll-mt-20 py-16 sm:py-24">
            <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
                <Reveal className="flex flex-col gap-3 lg:sticky lg:top-24 lg:self-start">
                    <Eyebrow>FAQ</Eyebrow>
                    <BigTitle>
                        Masih ragu?
                        <br />
                        <span className="text-teal-ink">Wajar kok.</span>
                    </BigTitle>
                    <p className="text-muted-foreground">
                        Ini yang paling sering ditanyakan.
                    </p>
                </Reveal>
                <div className="flex flex-col gap-3">
                    {FAQS.map((item, index) => (
                        <Reveal key={item.q} delay={index * 60}>
                            <FaqItem
                                question={item.q}
                                answer={item.a}
                                open={open === index}
                                onToggle={() =>
                                    setOpen(open === index ? null : index)
                                }
                            />
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}

function FaqItem({
    question,
    answer,
    open,
    onToggle,
}: {
    question: string;
    answer: string;
    open: boolean;
    onToggle: () => void;
}) {
    const id = useId();

    return (
        <div
            className={cn(
                cardClass,
                'transition-colors duration-300',
                open && 'border-primary/50',
            )}
        >
            <h3>
                <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`${id}-answer`}
                    onClick={onToggle}
                    className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left font-semibold"
                >
                    {question}
                    <span
                        className={cn(
                            'flex size-8 shrink-0 items-center justify-center rounded-full transition-all duration-300',
                            open
                                ? 'rotate-180 bg-primary text-primary-foreground'
                                : 'bg-muted',
                        )}
                    >
                        <ChevronDown className="size-4" aria-hidden="true" />
                    </span>
                </button>
            </h3>
            <div
                id={`${id}-answer`}
                role="region"
                className={cn(
                    'grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none',
                    open
                        ? 'grid-rows-[1fr] opacity-100'
                        : 'grid-rows-[0fr] opacity-0',
                )}
            >
                <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                        {answer}
                    </p>
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Footer: big closing panel with navigation                          */
/* ------------------------------------------------------------------ */

function SiteFooter({ cta, signedIn }: { cta: Cta; signedIn: boolean }) {
    return (
        <footer className="px-3 pb-3 sm:px-4 sm:pb-4">
            <div className="relative isolate overflow-hidden rounded-panel bg-navy-700 text-white">
                <Squiggle
                    d="M10 300 C 100 120, 180 360, 260 160 S 360 60, 390 20"
                    className="-right-16 -bottom-24 -z-10 size-[28rem] text-teal-300/25"
                />
                <Squiggle
                    d="M380 40 C 300 80, 340 200, 250 230 S 90 200, 20 330"
                    className="-top-24 -left-24 -z-10 size-80 text-white/10"
                />

                <div className="mx-auto grid max-w-6xl gap-12 px-6 pt-14 pb-10 sm:px-10 lg:grid-cols-[1.4fr_1fr]">
                    <div className="flex flex-col items-start gap-6">
                        <h2 className="text-5xl leading-[1.02] font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
                            Udah cukup
                            <br />
                            scroll-nya.
                        </h2>
                        <p className="max-w-md text-lg text-navy-100">
                            {signedIn
                                ? 'Lanjutkan pencarianmu di dashboard.'
                                : 'Buat akun gratis sekarang. Rekomendasi pertamamu siap begitu profil terisi.'}
                        </p>
                        <Link
                            href={cta.href}
                            className="group inline-flex h-13 items-center gap-3 rounded-full bg-white py-1.5 pr-1.5 pl-6 text-base font-bold text-navy-900 transition-transform hover:-translate-y-0.5"
                        >
                            {cta.label}
                            <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:rotate-[-30deg]">
                                <ArrowRight
                                    className="size-4"
                                    aria-hidden="true"
                                />
                            </span>
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-8 text-sm">
                        <nav
                            aria-label="Menu bawah"
                            className="flex flex-col gap-3"
                        >
                            <p className="text-navy-100/70">Menu</p>
                            {NAV.map((item) => (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    className="w-fit text-lg font-semibold transition-colors hover:text-teal-200"
                                >
                                    {item.label}
                                </a>
                            ))}
                        </nav>
                        <div className="flex flex-col gap-3">
                            <p className="text-navy-100/70">Akun</p>
                            {signedIn ? (
                                <Link
                                    href={dashboard()}
                                    className="w-fit text-lg font-semibold transition-colors hover:text-teal-200"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="w-fit text-lg font-semibold transition-colors hover:text-teal-200"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="w-fit text-lg font-semibold transition-colors hover:text-teal-200"
                                    >
                                        Daftar
                                    </Link>
                                </>
                            )}
                            <div className="mt-auto pt-6">
                                <Mascot
                                    pose="register"
                                    className="-ml-4 w-32"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mx-auto flex max-w-6xl flex-col gap-3 border-t border-white/10 px-6 py-5 text-xs text-navy-100/80 sm:flex-row sm:items-center sm:justify-between sm:px-10">
                    <p>
                        © {new Date().getFullYear()} Peluangku · Dibuat untuk
                        mahasiswa Indonesia.
                    </p>
                    <a
                        href="#"
                        className="inline-flex w-fit items-center gap-1 hover:text-white"
                    >
                        Kembali ke atas{' '}
                        <ArrowUp className="size-3.5" aria-hidden="true" />
                    </a>
                </div>

                <p
                    aria-hidden="true"
                    className="pointer-events-none -mt-2 -mb-[0.2em] text-center text-[18vw] leading-none font-extrabold tracking-tight text-white/[0.07] select-none"
                >
                    peluangku
                </p>
            </div>
        </footer>
    );
}
