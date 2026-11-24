import { Link } from '@inertiajs/react';
import {
    Bookmark,
    ClipboardCheck,
    House,
    Search,
    Settings,
    UserRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { dashboard } from '@/routes';
import { profile } from '@/routes/onboarding';
import { edit as settings } from '@/routes/profile';

type Item = {
    title: string;
    icon: LucideIcon;
    /** No href yet: the page is not built, shown as "Segera". */
    href?: ReturnType<typeof dashboard>;
};

const mainItems: Item[] = [
    { title: 'Beranda', icon: House, href: dashboard() },
    { title: 'Cari Beasiswa', icon: Search },
    { title: 'Tersimpan', icon: Bookmark },
    { title: 'Lamaran Saya', icon: ClipboardCheck },
    { title: 'Profil & Dokumen', icon: UserRound, href: profile() },
];

const itemClass =
    'h-11 gap-3 rounded-control px-3 text-sm font-medium text-muted-foreground hover:bg-muted/70 hover:text-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:font-semibold data-[active=true]:text-sidebar-accent-foreground [&>svg]:size-5';

export function AppSidebar() {
    return (
        <Sidebar collapsible="offcanvas">
            <SidebarHeader className="px-5 pt-6 pb-5">
                <Link
                    href={dashboard()}
                    prefetch
                    aria-label="Beranda Peluangku"
                >
                    <img
                        src="/images/brand/svg/peluangku-logo-putih.svg"
                        alt="Peluangku"
                        width="4998"
                        height="1116"
                        className="h-auto w-[136px]"
                    />
                </Link>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup className="px-3 py-0">
                    <nav aria-label="Menu utama">
                        <SidebarMenu className="gap-1">
                            {mainItems.map((item) => (
                                <NavItem key={item.title} item={item} />
                            ))}
                        </SidebarMenu>
                    </nav>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="gap-2 px-3 pb-4">
                <SidebarMenu>
                    <NavItem
                        item={{
                            title: 'Pengaturan',
                            icon: Settings,
                            href: settings(),
                        }}
                    />
                </SidebarMenu>
                <div className="border-t border-sidebar-border pt-2">
                    <NavUser />
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}

function NavItem({ item }: { item: Item }) {
    const { isCurrentUrl } = useCurrentUrl();

    if (!item.href) {
        return (
            <SidebarMenuItem>
                <SidebarMenuButton
                    aria-disabled="true"
                    className={`${itemClass} aria-disabled:opacity-60`}
                >
                    <item.icon aria-hidden="true" />
                    <span>{item.title}</span>
                    <span className="ml-auto rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        Segera
                    </span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        );
    }

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                asChild
                isActive={isCurrentUrl(item.href)}
                className={itemClass}
            >
                <Link href={item.href} prefetch>
                    <item.icon aria-hidden="true" />
                    <span>{item.title}</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}
