import { Head, Link, router } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import LottieAnimation from '@/components/lottie-animation';
import { dashboard } from '@/routes';

/** How long the welcome stays before opening the dashboard. */
const STAY_MS = 4000;

export default function OnboardingDone({ firstName }: { firstName: string }) {
    const [counting, setCounting] = useState(false);

    useEffect(() => {
        // Start the bar on the next frame so its width transition runs.
        const frame = window.requestAnimationFrame(() => setCounting(true));
        const timer = window.setTimeout(
            () => router.visit(dashboard(), { replace: true }),
            STAY_MS,
        );

        return () => {
            window.cancelAnimationFrame(frame);
            window.clearTimeout(timer);
        };
    }, []);

    return (
        <>
            <Head title="Selamat datang" />

            <div className="mt-10 flex w-full max-w-[440px] flex-col items-center text-center sm:mt-12">
                <LottieAnimation
                    src="/animation/peluangku-selamat-datang.json"
                    loop={false}
                    className="w-60 sm:w-72"
                />

                <h1 className="mt-2 animate-in text-3xl font-extrabold tracking-tight delay-300 duration-500 fill-mode-both fade-in slide-in-from-bottom-2 sm:text-4xl">
                    Selamat datang, {firstName}!
                </h1>
                <p className="mt-3 animate-in text-[15px] leading-relaxed text-muted-foreground delay-500 duration-500 fill-mode-both fade-in slide-in-from-bottom-2">
                    Profilmu sudah siap. Kami sedang mencarikan beasiswa yang
                    cocok untukmu.
                </p>

                <div className="mt-10 w-full max-w-[280px] animate-in delay-700 duration-500 fill-mode-both fade-in">
                    <div
                        className="h-1 overflow-hidden rounded-full bg-border"
                        aria-hidden="true"
                    >
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-teal-300 ease-linear"
                            style={{
                                width: counting ? '100%' : '0%',
                                transitionProperty: 'width',
                                transitionDuration: `${STAY_MS}ms`,
                            }}
                        />
                    </div>
                    <p
                        className="mt-3 text-xs text-muted-foreground"
                        role="status"
                    >
                        Membuka dashboard…
                    </p>
                    <Link
                        href={dashboard()}
                        replace
                        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                    >
                        Buka sekarang
                        <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                </div>
            </div>
        </>
    );
}
