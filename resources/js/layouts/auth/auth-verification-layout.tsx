import { Link } from '@inertiajs/react';
import { MailCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { home } from '@/routes';

export default function AuthVerificationLayout({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <main className="flex min-h-svh flex-col items-center justify-center gap-8 bg-background px-4 py-10 text-foreground sm:px-6">
            <Link href={home()} className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
                <img src="/images/brand/svg/peluangku-logo.svg" alt="Peluangku — beranda" width="4998" height="1116" className="h-auto w-44 dark:hidden" />
                <img src="/images/brand/svg/peluangku-logo-putih.svg" alt="Peluangku — beranda" width="4998" height="1116" className="hidden h-auto w-44 dark:block" />
            </Link>
            <section className="w-full max-w-lg rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-10" aria-labelledby="verification-title">
                <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-3xl bg-secondary text-primary">
                    <MailCheck className="size-10" strokeWidth={1.5} aria-hidden="true" />
                </div>
                <header className="text-center">
                    <p className="mb-3 text-xs font-semibold tracking-[0.16em] text-link uppercase">Satu langkah lagi</p>
                    <h1 id="verification-title" className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
                </header>
                {children}
            </section>
            <p className="text-center text-xs text-muted-foreground">Langkah kecil menuju peluang yang lebih besar.</p>
        </main>
    );
}
