import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

/**
 * Top bar of the app. Pages without breadcrumbs (like Beranda) only need it on
 * mobile, where it holds the logo and the button that opens the sidebar.
 */
export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header
            className={cn(
                'flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-4 md:px-6',
                breadcrumbs.length === 0 && 'md:hidden',
            )}
        >
            <SidebarTrigger className="-ml-1" aria-label="Buka menu" />
            {breadcrumbs.length > 0 ? (
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            ) : (
                <img
                    src="/images/brand/svg/peluangku-logo-putih.svg"
                    alt="Peluangku"
                    width="4998"
                    height="1116"
                    className="h-auto w-28"
                />
            )}
        </header>
    );
}
