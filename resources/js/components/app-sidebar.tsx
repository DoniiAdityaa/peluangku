import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import BrandLogo from '@/components/brand-logo';
import {
    ArrowRight,
    Bookmark,
    ChevronsUpDown,
    ClipboardCheck,
    House,
    Search,
    Settings,
    UserRound,
    BadgeCheck,
    CircleAlert,
    LogOut,
    Mail,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
    useSidebar,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { cn } from '@/lib/utils';
import { dashboard, logout } from '@/routes';
import { profile as accountProfile } from '@/routes/account';
import { index as onboardingIndex } from '@/routes/onboarding';
import { edit as settings } from '@/routes/profile';

type Item = {
    title: string;
    icon: LucideIcon;
    /** No href yet: the page is not built, shown as "Segera". */
    href?: ReturnType<typeof dashboard>;
};

const menu: Item[] = [
    { title: 'Beranda', icon: House, href: dashboard() },
    { title: 'Cari Beasiswa', icon: Search },
    { title: 'Tersimpan', icon: Bookmark },
    { title: 'Lamaran Saya', icon: ClipboardCheck },
];

/**
 * Where "Profil & Dokumen" leads: onboarding for people who skipped it and
 * never filled anything in, otherwise the profile editing page.
 */
function useProfileHref() {
    const { profileCompletion } = usePage().props;

    return profileCompletion?.skipped ? onboardingIndex() : accountProfile();
}

/**
 * Floating, rounded sidebar: grouped menu, icons in small tiles, a glowing
 * active item, profile progress as a ring, and the account at the bottom.
 * It collapses to icons only (button next to the logo, or ⌘B / Ctrl+B);
 * the choice is remembered in a cookie.
 */
export function AppSidebar() {
    const { state, isMobile, toggleSidebar } = useSidebar();
    const isCollapsed = state === 'collapsed' && !isMobile;
    const account: Item[] = [
        { title: 'Profil & Dokumen', icon: UserRound, href: useProfileHref() },
        { title: 'Pengaturan', icon: Settings, href: settings() },
    ];

    return (
        <Sidebar
            variant="floating"
            collapsible="icon"
            className="p-3 [&>[data-sidebar=sidebar]]:rounded-panel [&>[data-sidebar=sidebar]]:border-border/60 [&>[data-sidebar=sidebar]]:shadow-card"
        >
            <SidebarHeader
                className={cn(
                    'flex-row items-center justify-between gap-2 px-6 pt-7 pb-6',
                    'group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:pt-6 group-data-[collapsible=icon]:pb-4',
                )}
            >
                {isCollapsed ? (
                    // Collapsed: the round logo is the button that opens it again.
                    <button
                        type="button"
                        onClick={toggleSidebar}
                        aria-label="Lebarkan sidebar"
                        title="Lebarkan sidebar"
                        className="cursor-pointer rounded-full transition-transform outline-none hover:scale-105 focus-visible:ring-4 focus-visible:ring-primary/25"
                    >
                        <img
                            src="/images/brand/svg/peluangku-ikon-bulat.svg"
                            alt=""
                            className="size-10"
                        />
                    </button>
                ) : (
                    <>
                        <Link
                            href={dashboard()}
                            prefetch
                            aria-label="Beranda Peluangku"
                            className="w-fit"
                        >
                            <BrandLogo className="w-[124px]" />
                        </Link>
                        <SidebarTrigger
                            aria-label="Ciutkan sidebar"
                            className="hidden size-9 rounded-control text-muted-foreground hover:bg-muted hover:text-foreground md:inline-flex"
                        />
                    </>
                )}
            </SidebarHeader>

            <SidebarContent className="gap-5 px-3">
                <NavGroup label="Menu" items={menu} />
                <NavGroup label="Akun" items={account} />
            </SidebarContent>

            <SidebarFooter className="gap-3 p-3">
                <ProfileProgress />
                <AccountTile />
            </SidebarFooter>
        </Sidebar>
    );
}

function NavGroup({ label, items }: { label: string; items: Item[] }) {
    return (
        <SidebarGroup className="p-0">
            <SidebarGroupLabel className="h-auto px-3 pb-2 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground/80 uppercase">
                {label}
            </SidebarGroupLabel>
            <nav aria-label={label}>
                <SidebarMenu className="gap-1">
                    {items.map((item) => (
                        <NavItem key={item.title} item={item} />
                    ))}
                </SidebarMenu>
            </nav>
        </SidebarGroup>
    );
}

function NavItem({ item }: { item: Item }) {
    const { isCurrentUrl } = useCurrentUrl();
    const active = item.href ? isCurrentUrl(item.href) : false;

    const content = (
        <>
            <span
                aria-hidden="true"
                className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-[10px] transition-all duration-200',
                    active
                        ? 'bg-primary text-primary-foreground shadow-[0_6px_16px_-4px] shadow-primary/60'
                        : 'bg-muted text-foreground/70 group-hover/item:bg-primary/15 group-hover/item:text-primary',
                )}
            >
                <item.icon className="size-[17px]" strokeWidth={2} />
            </span>
            <span className="truncate group-data-[collapsible=icon]:hidden">
                {item.title}
            </span>
            {!item.href && (
                <span className="ml-auto rounded-full border border-border/70 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground group-data-[collapsible=icon]:hidden">
                    Segera
                </span>
            )}
        </>
    );

    const className = cn(
        'group/item relative h-12 gap-3 overflow-visible rounded-card px-2 text-sm font-medium transition-colors',
        'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
        // Active: soft gradient wash plus a small bar on the outer edge.
        'data-[active=true]:bg-gradient-to-r data-[active=true]:from-primary/20 data-[active=true]:to-primary/[0.03] data-[active=true]:font-semibold data-[active=true]:text-foreground',
        'before:absolute before:top-1/2 before:-left-3 before:h-6 before:w-1 before:-translate-y-1/2 before:rounded-r-full before:bg-primary before:opacity-0 before:transition-opacity data-[active=true]:before:opacity-100',
        // Collapsed: just the icon tile, centred.
        'group-data-[collapsible=icon]:size-12! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2! group-data-[collapsible=icon]:hover:bg-transparent group-data-[collapsible=icon]:data-[active=true]:bg-none',
    );

    return (
        <SidebarMenuItem>
            {item.href ? (
                <SidebarMenuButton
                    asChild
                    isActive={active}
                    tooltip={item.title}
                    className={className}
                >
                    <Link href={item.href} prefetch>
                        {content}
                    </Link>
                </SidebarMenuButton>
            ) : (
                <SidebarMenuButton
                    aria-disabled="true"
                    tooltip={`${item.title} (segera)`}
                    className={cn(className, 'aria-disabled:opacity-55')}
                >
                    {content}
                </SidebarMenuButton>
            )}
        </SidebarMenuItem>
    );
}

/** Ring showing how complete the profile is, until it reaches 100%. */
function ProfileProgress() {
    const { profileCompletion } = usePage().props;

    if (!profileCompletion || profileCompletion.percent >= 100) {
        return null;
    }

    const { percent, skipped } = profileCompletion;
    const radius = 19;
    const circumference = 2 * Math.PI * radius;

    return (
        <Link
            href={skipped ? onboardingIndex() : accountProfile()}
            aria-label={`Profil ${percent}% lengkap. Lengkapi sekarang`}
            className="group/profile flex items-center gap-3 rounded-card border border-border/60 bg-gradient-to-br from-teal-400/10 to-transparent p-3 transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:bg-none group-data-[collapsible=icon]:p-0 hover:border-teal-ink/40"
        >
            <span className="relative flex size-12 shrink-0 items-center justify-center">
                <svg
                    viewBox="0 0 48 48"
                    className="absolute inset-0 -rotate-90"
                    aria-hidden="true"
                >
                    <circle
                        cx="24"
                        cy="24"
                        r={radius}
                        fill="none"
                        strokeWidth="4"
                        className="stroke-muted"
                    />
                    <circle
                        cx="24"
                        cy="24"
                        r={radius}
                        fill="none"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference * (1 - percent / 100)}
                        className="stroke-teal-ink transition-[stroke-dashoffset] duration-700 ease-out"
                    />
                </svg>
                <span className="text-[11px] font-extrabold tabular-nums">
                    {percent}%
                </span>
            </span>
            <span className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                <span className="block text-[13px] font-bold">
                    Profil belum lengkap
                </span>
                <span className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-teal-ink">
                    Lengkapi sekarang
                    <ArrowRight
                        className="size-3.5 transition-transform group-hover/profile:translate-x-0.5"
                        aria-hidden="true"
                    />
                </span>
            </span>
        </Link>
    );
}

function AccountTile() {
    const { auth } = usePage().props;
    const { isMobile, state } = useSidebar();
    const getInitials = useInitials();
    const cleanup = useMobileNavigation();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const collapsed = state === 'collapsed' && !isMobile;

    if (!auth.user) {
        return null;
    }

    const initials = getInitials(auth.user.name);
    const verified = auth.user.email_verified_at !== null;

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger className="flex w-full cursor-pointer items-center gap-3 rounded-card bg-muted/40 p-2.5 text-left transition-colors outline-none group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0 hover:bg-muted/70 focus-visible:ring-4 focus-visible:ring-primary/15 data-[state=open]:bg-muted/70">
                    <span
                        aria-hidden="true"
                        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-teal-300 text-[13px] font-extrabold text-primary-foreground"
                    >
                        {initials}
                    </span>
                    <span className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                        <span className="block truncate text-[13px] font-semibold">
                            {auth.user.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                            {auth.user.email}
                        </span>
                    </span>
                    <ChevronsUpDown
                        className="size-4 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden"
                        aria-hidden="true"
                    />
                    <span className="sr-only">Buka menu akun</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    // Collapsed: open beside the avatar. Expanded: above the tile, as wide as it.
                    side={collapsed ? 'right' : isMobile ? 'bottom' : 'top'}
                    align="end"
                    sideOffset={collapsed ? 14 : 8}
                    className={cn(
                        'rounded-card p-1.5',
                        collapsed
                            ? 'w-64'
                            : 'w-(--radix-dropdown-menu-trigger-width) min-w-60',
                    )}
                >
                    <div className="flex items-center gap-3 rounded-control bg-muted/50 p-3">
                        <span
                            aria-hidden="true"
                            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-teal-300 text-sm font-extrabold text-primary-foreground"
                        >
                            {initials}
                        </span>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                                {auth.user.name}
                            </p>
                            <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                                <Mail
                                    className="size-3 shrink-0"
                                    aria-hidden="true"
                                />
                                <span className="truncate">
                                    {auth.user.email}
                                </span>
                            </p>
                            <p
                                className={cn(
                                    'mt-1 inline-flex items-center gap-1 text-[11px] font-semibold',
                                    verified ? 'text-success' : 'text-warning',
                                )}
                            >
                                {verified ? (
                                    <BadgeCheck
                                        className="size-3"
                                        aria-hidden="true"
                                    />
                                ) : (
                                    <CircleAlert
                                        className="size-3"
                                        aria-hidden="true"
                                    />
                                )}
                                {verified
                                    ? 'Email terverifikasi'
                                    : 'Email belum diverifikasi'}
                            </p>
                        </div>
                    </div>
                    <DropdownMenuItem
                        onSelect={() => setConfirmOpen(true)}
                        className="mt-1.5 cursor-pointer gap-2.5 rounded-control px-3 py-2.5 text-sm font-medium text-destructive focus:bg-destructive/10 focus:text-destructive"
                    >
                        <LogOut
                            className="size-4 text-destructive"
                            aria-hidden="true"
                        />
                        Keluar
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent className="max-w-sm rounded-card text-center sm:max-w-sm">
                    <span
                        aria-hidden="true"
                        className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive"
                    >
                        <LogOut className="size-5" />
                    </span>
                    <DialogTitle className="text-center">
                        Yakin mau keluar?
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        Kamu perlu masuk lagi untuk melihat rekomendasi dan
                        beasiswa yang kamu simpan.
                    </DialogDescription>
                    <DialogFooter className="mt-2 grid grid-cols-2 gap-2 sm:justify-normal">
                        <DialogClose asChild>
                            <Button
                                variant="secondary"
                                className="h-11 rounded-control"
                            >
                                Batal
                            </Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            asChild
                            className="h-11 rounded-control"
                        >
                            <Link
                                href={logout()}
                                as="button"
                                onClick={() => {
                                    cleanup();
                                    router.flushAll();
                                }}
                                data-test="logout-button"
                            >
                                Ya, keluar
                            </Link>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
