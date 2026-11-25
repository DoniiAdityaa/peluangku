import { Link, router, usePage } from '@inertiajs/react';
import BrandLogo from '@/components/brand-logo';
import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { logout } from '@/routes';
import { skip } from '@/routes/onboarding';

const STEPS = ['Pilih cara', 'Isi profil', 'Selesai'];

/** Which step each onboarding page belongs to. */
const STEP_OF_PAGE: Record<string, number> = {
    'onboarding/index': 0,
    'onboarding/ai': 1,
    'onboarding/profile': 1,
    'onboarding/done': 3,
};

export default function OnboardingLayout({
    children,
    progress = 0,
}: {
    children: ReactNode;
    /** 0–1: how far the current step is. Fills the line to the next step. */
    progress?: number;
}) {
    const { component } = usePage();
    const current = STEP_OF_PAGE[component] ?? 0;
    const finished = current >= STEPS.length;

    const skipOnboarding = () => {
        if (
            window.confirm(
                'Lewati pengisian profil? Kamu bisa melengkapinya nanti.',
            )
        ) {
            router.post(skip().url);
        }
    };

    return (
        <div className="min-h-svh bg-background text-foreground">
            <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-7 sm:px-12">
                <BrandLogo className="w-32" />
                <div className="flex items-center gap-4">
                    {!finished && (
                        <>
                            <button
                                type="button"
                                onClick={skipOnboarding}
                                className="cursor-pointer text-sm font-medium text-foreground/80 underline-offset-4 transition-colors hover:text-foreground hover:underline"
                            >
                                Lewati
                            </button>
                            <span
                                aria-hidden="true"
                                className="h-4 w-px bg-border"
                            />
                        </>
                    )}
                    <Link
                        href={logout()}
                        as="button"
                        className="cursor-pointer text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Keluar
                    </Link>
                </div>
            </header>

            <main className="mx-auto flex max-w-6xl flex-col items-center px-6 pt-4 pb-20 sm:px-12">
                <Stepper current={current} progress={progress} />
                {children}
            </main>
        </div>
    );
}

/**
 * Circles joined by one continuous line. The line fills from step to step,
 * and the segment after the current step fills with that step's progress.
 * The layout stays mounted between onboarding pages, so changes animate.
 */
function Stepper({ current, progress }: { current: number; progress: number }) {
    const finished = current >= STEPS.length;

    return (
        <ol
            aria-label="Progres pengisian profil"
            className="flex w-full max-w-[400px] items-center pb-8 sm:max-w-[460px]"
        >
            {STEPS.map((label, index) => {
                const done = index < current;
                const active = index === current;
                const fill =
                    index < current
                        ? 1
                        : index === current
                          ? Math.min(Math.max(progress, 0), 1)
                          : 0;

                return (
                    <li
                        key={label}
                        className={cn(
                            'flex items-center',
                            index < STEPS.length - 1 && 'flex-1',
                        )}
                        aria-current={active ? 'step' : undefined}
                    >
                        <span className="relative flex shrink-0 justify-center">
                            {active && (
                                <span
                                    aria-hidden="true"
                                    className="absolute inset-0 rounded-full bg-primary/25 motion-safe:animate-ping motion-safe:[animation-duration:2s]"
                                />
                            )}
                            <span
                                className={cn(
                                    'relative flex size-10 items-center justify-center rounded-full text-[13px] font-bold transition-all duration-500',
                                    done &&
                                        'bg-primary text-primary-foreground',
                                    done &&
                                        finished &&
                                        'shadow-[0_0_0_6px] shadow-primary/15',
                                    active &&
                                        'border-2 border-primary bg-background text-primary shadow-[0_0_0_6px] shadow-primary/15',
                                    !done &&
                                        !active &&
                                        'border-2 border-border bg-background text-muted-foreground',
                                )}
                            >
                                {done ? (
                                    <Check
                                        key="check"
                                        className="size-[18px] animate-in duration-300 zoom-in-50"
                                        strokeWidth={3}
                                        aria-hidden="true"
                                    />
                                ) : active ? (
                                    <span className="size-3 rounded-full bg-primary" />
                                ) : (
                                    index + 1
                                )}
                            </span>
                            <span
                                className={cn(
                                    'absolute top-full left-1/2 mt-2.5 -translate-x-1/2 text-xs whitespace-nowrap transition-colors duration-500',
                                    active ||
                                        (finished && index === STEPS.length - 1)
                                        ? 'font-bold text-foreground'
                                        : done
                                          ? 'font-medium text-foreground/80'
                                          : 'font-medium text-muted-foreground',
                                )}
                            >
                                {label}
                                {done && (
                                    <span className="sr-only"> (selesai)</span>
                                )}
                            </span>
                        </span>

                        {index < STEPS.length - 1 && (
                            <span
                                aria-hidden="true"
                                className="relative h-[3px] flex-1 overflow-hidden bg-border"
                            >
                                <span
                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-teal-300 transition-[width] duration-700 ease-out"
                                    style={{ width: `${fill * 100}%` }}
                                />
                            </span>
                        )}
                    </li>
                );
            })}
        </ol>
    );
}
