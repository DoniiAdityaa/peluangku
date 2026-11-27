import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';
import AuthIllustration from '@/components/auth-illustration';
import type { MascotPose } from '@/components/mascot';
import { home } from '@/routes';

export type AuthBrandVariant =
    | 'register'
    | 'login'
    | 'verification'
    | 'forgot-password'
    | 'reset-password'
    | 'confirm-password'
    | 'two-factor';

const securityAside = {
    asideEyebrow: 'Akunmu tetap aman',
    asideTitle: ['Keamanan dulu,', 'baru melangkah.'] as [string, string],
    asideDescription:
        'Kami menjaga akunmu supaya data profil dan dokumen beasiswamu tetap aman.',
    pose: 'keamanan' as MascotPose,
};

const content: Record<
    AuthBrandVariant,
    {
        asideEyebrow: string;
        asideTitle: [string, string];
        asideDescription: string;
        eyebrow: string;
        pose: MascotPose;
    }
> = {
    register: {
        asideEyebrow: 'Langkah baru, peluang baru',
        asideTitle: ['Mimpi besarmu', 'punya peluang.'],
        asideDescription:
            'Jelajahi beasiswa dan temukan langkah berikutnya untuk masa depanmu.',
        eyebrow: 'Selamat datang di Peluangku',
        pose: 'register',
    },
    login: {
        asideEyebrow: 'Peluangmu menanti',
        asideTitle: ['Lanjutkan langkah', 'menuju mimpimu.'],
        asideDescription:
            'Kembali jelajahi peluang beasiswa dan rencanakan langkah berikutnya bersama Peluangku.',
        eyebrow: 'Senang bertemu kamu lagi',
        pose: 'login',
    },
    verification: {
        asideEyebrow: 'Satu langkah lagi',
        asideTitle: ['Akunmu hampir', 'siap dipakai.'],
        asideDescription:
            'Setelah email terverifikasi, kamu bisa melengkapi profil dan mulai mencari beasiswa yang cocok.',
        eyebrow: 'Verifikasi email',
        pose: 'verifikasi',
    },
    'forgot-password': {
        asideEyebrow: 'Tenang, bisa diatur ulang',
        asideTitle: ['Lupa itu wajar,', 'langkahmu lanjut.'],
        asideDescription:
            'Kami kirimkan link untuk membuat kata sandi baru ke emailmu.',
        eyebrow: 'Lupa kata sandi',
        pose: 'login',
    },
    'reset-password': {
        asideEyebrow: 'Hampir selesai',
        asideTitle: ['Kata sandi baru,', 'semangat baru.'],
        asideDescription:
            'Buat kata sandi yang kuat, lalu lanjutkan pencarian beasiswamu.',
        eyebrow: 'Atur ulang kata sandi',
        pose: 'login',
    },
    'confirm-password': {
        ...securityAside,
        eyebrow: 'Konfirmasi keamanan',
    },
    'two-factor': {
        ...securityAside,
        eyebrow: 'Verifikasi dua langkah',
    },
};

export default function AuthBrandLayout({
    title,
    description,
    children,
    variant = 'register',
}: {
    title: string;
    description: string;
    children: ReactNode;
    variant?: AuthBrandVariant;
}) {
    const copy = content[variant];

    return (
        <main className="flex min-h-svh items-center justify-center bg-background p-4 text-foreground sm:p-6 lg:p-8 short:py-4 shorter:py-3">
            <div className="grid w-full max-w-6xl overflow-hidden rounded-panel border border-border/60 bg-card p-2 shadow-card lg:grid-cols-2 lg:gap-8">
                <aside className="relative hidden flex-col overflow-hidden rounded-card bg-navy-700 p-10 text-white lg:flex short:p-8 shorter:px-8 shorter:py-6">
                    <Link
                        href={home()}
                        className="inline-flex w-fit items-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                    >
                        <img
                            src="/images/brand/svg/peluangku-logo-putih.svg"
                            alt="Peluangku — beranda"
                            width="4998"
                            height="1116"
                            className="h-auto w-44 short:w-36"
                        />
                    </Link>
                    <div className="mt-12 short:mt-8 shorter:mt-6">
                        <p className="mb-4 text-xs font-semibold tracking-[0.18em] text-teal-200 uppercase">
                            {copy.asideEyebrow}
                        </p>
                        <h2 className="max-w-sm text-4xl leading-tight font-bold tracking-tight short:text-3xl">
                            {copy.asideTitle[0]}
                            <br />
                            {copy.asideTitle[1]}
                        </h2>
                        <p className="mt-4 max-w-sm text-sm leading-relaxed text-navy-100">
                            {copy.asideDescription}
                        </p>
                    </div>
                    <AuthIllustration key={variant} pose={copy.pose} />
                    <div className="mt-auto flex items-center justify-between border-t border-white/15 pt-5 text-xs text-navy-100 short:pt-4">
                        <span>Mulai dari satu langkah kecil.</span>
                        <ArrowUpRight
                            className="size-5 text-teal-200"
                            aria-hidden="true"
                        />
                    </div>
                </aside>
                <section className="flex items-center justify-center px-4 py-8 sm:px-10 sm:py-12 lg:px-8 short:py-6 shorter:py-4">
                    <div className="w-full max-w-sm">
                        <Link
                            href={home()}
                            className="mb-10 inline-flex items-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring lg:hidden"
                        >
                            <img
                                src="/images/brand/svg/peluangku-logo.svg"
                                alt="Peluangku — beranda"
                                width="4998"
                                height="1116"
                                className="h-auto w-40 dark:hidden"
                            />
                            <img
                                src="/images/brand/svg/peluangku-logo-putih.svg"
                                alt="Peluangku — beranda"
                                width="4998"
                                height="1116"
                                className="hidden h-auto w-40 dark:block"
                            />
                        </Link>
                        <p className="mb-3 text-xs font-semibold tracking-[0.16em] text-link uppercase short:mb-2 shorter:hidden">
                            {copy.eyebrow}
                        </p>
                        <h1 className="text-3xl font-bold tracking-tight short:text-2xl">
                            {title}
                        </h1>
                        <p className="mt-3 mb-8 text-sm leading-relaxed text-muted-foreground short:mt-2 short:mb-6 shorter:mb-4">
                            {description}
                        </p>
                        {children}
                    </div>
                </section>
            </div>
        </main>
    );
}
