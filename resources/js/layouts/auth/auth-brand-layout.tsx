import { Link } from "@inertiajs/react";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import AuthIllustration from "@/components/auth-illustration";
import { home } from "@/routes";

export type AuthBrandVariant = "register" | "login" | "verification";

const content: Record<
    AuthBrandVariant,
    {
        asideEyebrow: string;
        asideTitle: [string, string];
        asideDescription: string;
        eyebrow: string;
        animation: string;
    }
> = {
    register: {
        asideEyebrow: "Langkah baru, peluang baru",
        asideTitle: ["Mimpi besarmu", "punya peluang."],
        asideDescription:
            "Jelajahi beasiswa dan temukan langkah berikutnya untuk masa depanmu.",
        eyebrow: "Selamat datang di Peluangku",
        animation: "register",
    },
    login: {
        asideEyebrow: "Peluangmu menanti",
        asideTitle: ["Lanjutkan langkah", "menuju mimpimu."],
        asideDescription:
            "Kembali jelajahi peluang beasiswa dan rencanakan langkah berikutnya bersama Peluangku.",
        eyebrow: "Senang bertemu kamu lagi",
        animation: "login",
    },
    verification: {
        asideEyebrow: "Satu langkah lagi",
        asideTitle: ["Akunmu hampir", "siap dipakai."],
        asideDescription:
            "Setelah email terverifikasi, kamu bisa melengkapi profil dan mulai mencari beasiswa yang cocok.",
        eyebrow: "Verifikasi email",
        animation: "cari",
    },
};

export default function AuthBrandLayout({
    title,
    description,
    children,
    variant = "register",
}: {
    title: string;
    description: string;
    children: ReactNode;
    variant?: AuthBrandVariant;
}) {
    const copy = content[variant];

    return (
        <main className="flex min-h-svh items-center justify-center bg-background p-4 text-foreground sm:p-6 lg:p-8">
            <div className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-border bg-card p-2 shadow-sm lg:grid-cols-2 lg:gap-8">
                <aside className="relative hidden flex-col overflow-hidden rounded-3xl bg-navy-700 p-10 text-white lg:flex">
                    <Link
                        href={home()}
                        className="inline-flex w-fit items-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                    >
                        <img
                            src="/images/brand/svg/peluangku-logo-putih.svg"
                            alt="Peluangku — beranda"
                            width="4998"
                            height="1116"
                            className="h-auto w-44"
                        />
                    </Link>
                    <div className="mt-12">
                        <p className="mb-4 text-xs font-semibold tracking-[0.18em] text-teal-200 uppercase">
                            {copy.asideEyebrow}
                        </p>
                        <h2 className="max-w-sm text-4xl leading-tight font-bold tracking-tight">
                            {copy.asideTitle[0]}
                            <br />
                            {copy.asideTitle[1]}
                        </h2>
                        <p className="mt-4 max-w-sm text-sm leading-relaxed text-navy-100">
                            {copy.asideDescription}
                        </p>
                    </div>
                    <AuthIllustration
                        key={variant}
                        src={`/animation/peluangku-${copy.animation}.json`}
                    />
                    <div className="mt-auto flex items-center justify-between border-t border-white/15 pt-5 text-xs text-navy-100">
                        <span>Mulai dari satu langkah kecil.</span>
                        <ArrowUpRight
                            className="size-5 text-teal-200"
                            aria-hidden="true"
                        />
                    </div>
                </aside>
                <section className="flex items-center justify-center px-4 py-8 sm:px-10 sm:py-12 lg:px-8">
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
                        <p className="mb-3 text-xs font-semibold tracking-[0.16em] text-link uppercase">
                            {copy.eyebrow}
                        </p>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {title}
                        </h1>
                        <p className="mt-3 mb-8 text-sm leading-relaxed text-muted-foreground">
                            {description}
                        </p>
                        {children}
                    </div>
                </section>
            </div>
        </main>
    );
}
