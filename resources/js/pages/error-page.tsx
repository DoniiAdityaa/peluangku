import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Home } from 'lucide-react';
import BrandLogo from '@/components/brand-logo';
import Mascot from '@/components/mascot';
import { primaryButtonClass, secondaryButtonClass } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { dashboard, home } from '@/routes';

const COPY: Record<number, { title: string; text: string }> = {
    403: {
        title: 'Kamu belum punya akses ke sini',
        text: 'Halaman ini hanya bisa dibuka oleh pemiliknya. Coba masuk dengan akun yang benar.',
    },
    404: {
        title: 'Halamannya tidak ditemukan',
        text: 'Mungkin tautannya salah ketik atau halamannya sudah dipindahkan.',
    },
    419: {
        title: 'Sesimu sudah habis',
        text: 'Muat ulang halaman, lalu coba lagi.',
    },
    429: {
        title: 'Pelan-pelan dulu ya',
        text: 'Terlalu banyak permintaan dalam waktu singkat. Tunggu sebentar, lalu coba lagi.',
    },
    500: {
        title: 'Ada yang salah di sistem kami',
        text: 'Ini bukan salahmu. Coba lagi beberapa saat lagi.',
    },
    503: {
        title: 'Peluangku sedang dirapikan',
        text: 'Kami sedang melakukan perawatan sebentar. Silakan kembali lagi nanti.',
    },
};

/** Friendly error screen with Lumi, used for 403/404/419/429/500/503. */
export default function ErrorPage({ status }: { status: number }) {
    const { auth } = usePage<{ auth: { user: unknown } }>().props;
    const copy = COPY[status] ?? COPY[500];

    return (
        <>
            <Head title={copy.title} />
            <main className="flex min-h-svh flex-col items-center justify-center bg-background px-6 py-10 text-center text-foreground">
                <Link href={home()} className="mb-6 rounded-lg">
                    <BrandLogo className="w-32" />
                </Link>
                <Mascot
                    pose="error"
                    className="size-56 sm:size-64"
                    label="Lumi cemas karena terjadi kesalahan"
                />
                <p className="mt-2 text-sm font-semibold tracking-[0.16em] text-primary tabular-nums">
                    ERROR {status}
                </p>
                <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                    {copy.title}
                </h1>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                    {copy.text}
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className={cn(
                            secondaryButtonClass,
                            'inline-flex cursor-pointer items-center justify-center gap-2 border border-border bg-card text-sm hover:bg-muted',
                        )}
                    >
                        <ArrowLeft className="size-4" aria-hidden="true" />
                        Kembali
                    </button>
                    <Link
                        href={auth?.user ? dashboard() : home()}
                        className={cn(
                            primaryButtonClass,
                            'inline-flex items-center justify-center gap-2 bg-primary text-sm text-primary-foreground',
                        )}
                    >
                        <Home className="size-4" aria-hidden="true" />
                        {auth?.user ? 'Ke beranda' : 'Ke halaman utama'}
                    </Link>
                </div>
            </main>
        </>
    );
}
