import { Head, Link } from '@inertiajs/react';
import { ArrowRight, PencilLine, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import IconBadge from '@/components/kit/icon-badge';
import type { Tone } from '@/components/kit/icon-badge';
import { cardClass } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { ai, profile } from '@/routes/onboarding';

export default function OnboardingIndex() {
    return (
        <>
            <Head title="Lengkapi profil" />

            <h1 className="mt-16 text-center text-3xl font-extrabold tracking-tight sm:mt-[72px] sm:text-4xl">
                Mau isi profil dengan cara apa?
            </h1>
            <p className="mt-3 mb-12 text-center text-[15px] leading-relaxed text-muted-foreground sm:mb-14">
                Kamu tetap bisa mengubahnya nanti.
            </p>

            <div className="grid w-full max-w-[760px] gap-4 sm:grid-cols-2">
                <ChoiceCard
                    href={profile()}
                    icon={PencilLine}
                    tone="blue"
                    title="Isi manual"
                    description="Isi formulir sendiri, lalu lampirkan CV."
                    meta="± 5 menit"
                />
                <ChoiceCard
                    href={ai()}
                    icon={Sparkles}
                    tone="teal"
                    title="Isi dengan AI"
                    description="Unggah CV, AI yang mengisi. Kamu tinggal cek."
                    meta="± 2 menit · Lebih cepat"
                    highlight
                />
            </div>
        </>
    );
}

function ChoiceCard({
    href,
    icon,
    tone,
    title,
    description,
    meta,
    highlight = false,
}: {
    href: ReturnType<typeof ai>;
    icon: LucideIcon;
    tone: Tone;
    title: string;
    description: string;
    meta: string;
    highlight?: boolean;
}) {
    return (
        <Link
            href={href}
            className={cn(
                cardClass,
                'group flex flex-col gap-5 border-[1.5px] p-7 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary focus-visible:-translate-y-0.5 focus-visible:border-primary focus-visible:outline-none',
            )}
        >
            <div className="flex items-center justify-between">
                <IconBadge icon={icon} tone={tone} size="lg" />
                <ArrowRight
                    className="size-5 -translate-x-1.5 text-primary opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                    aria-hidden="true"
                />
            </div>
            <div>
                <h2 className="text-lg font-bold">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {description}
                </p>
            </div>
            <p
                className={cn(
                    'text-xs font-medium',
                    highlight ? 'text-teal-ink' : 'text-muted-foreground',
                )}
            >
                {meta}
            </p>
        </Link>
    );
}
