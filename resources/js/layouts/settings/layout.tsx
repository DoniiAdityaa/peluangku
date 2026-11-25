import { Link } from '@inertiajs/react';
import { Bell, Palette, ShieldCheck, UserRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit as editNotifications } from '@/routes/notifications';
import { edit as editAccount } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';

const items: {
    title: string;
    description: string;
    icon: LucideIcon;
    href: ReturnType<typeof editAccount>;
}[] = [
    {
        title: 'Akun',
        description: 'Nama, email, hapus akun',
        icon: UserRound,
        href: editAccount(),
    },
    {
        title: 'Keamanan',
        description: 'Kata sandi, 2FA, passkey',
        icon: ShieldCheck,
        href: editSecurity(),
    },
    {
        title: 'Tampilan',
        description: 'Tema terang atau gelap',
        icon: Palette,
        href: editAppearance(),
    },
    {
        title: 'Notifikasi',
        description: 'Pengingat dan info email',
        icon: Bell,
        href: editNotifications(),
    },
];

/**
 * Settings frame: a menu of sections on the left (tabs on mobile) and the
 * section's cards on the right.
 */
export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="mx-auto w-full max-w-[1100px] px-4 py-6 sm:px-6 md:px-10 md:py-9">
            <header className="mb-7">
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-[28px]">
                    Pengaturan
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                    Atur akun, keamanan, tampilan, dan notifikasi.
                </p>
            </header>

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
                <nav
                    aria-label="Bagian pengaturan"
                    className={cn(
                        'flex gap-1 overflow-x-auto lg:sticky lg:top-6 lg:flex-col lg:p-2',
                        'lg:rounded-card lg:border lg:border-border/60 lg:bg-card lg:shadow-card',
                    )}
                >
                    {items.map((item) => {
                        const active = isCurrentOrParentUrl(item.href);

                        return (
                            <Link
                                key={item.title}
                                href={item.href}
                                prefetch
                                aria-current={active ? 'page' : undefined}
                                className={cn(
                                    'flex shrink-0 items-center gap-3 rounded-control px-3 py-2.5 transition-colors',
                                    active
                                        ? 'bg-primary/10 text-foreground'
                                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                                    'max-lg:border max-lg:border-border/60 max-lg:bg-card',
                                    active && 'max-lg:border-primary/50',
                                )}
                            >
                                <span
                                    aria-hidden="true"
                                    className={cn(
                                        'flex size-8 shrink-0 items-center justify-center rounded-[10px]',
                                        active
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-foreground/70',
                                    )}
                                >
                                    <item.icon
                                        className="size-[17px]"
                                        strokeWidth={2}
                                    />
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-sm font-semibold">
                                        {item.title}
                                    </span>
                                    <span className="hidden truncate text-xs text-muted-foreground lg:block">
                                        {item.description}
                                    </span>
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex min-w-0 flex-col gap-5">{children}</div>
            </div>
        </div>
    );
}
