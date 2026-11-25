import { cn } from '@/lib/utils';

/**
 * Peluangku wordmark: the coloured logo on light backgrounds, the white one
 * in dark mode. Pass `variant="white"` on surfaces that are always dark.
 */
export default function BrandLogo({
    className,
    variant = 'auto',
}: {
    className?: string;
    variant?: 'auto' | 'white';
}) {
    const size = { width: 4998, height: 1116 };

    if (variant === 'white') {
        return (
            <img
                src="/images/brand/svg/peluangku-logo-putih.svg"
                alt="Peluangku"
                {...size}
                className={cn('h-auto', className)}
            />
        );
    }

    return (
        <>
            <img
                src="/images/brand/svg/peluangku-logo.svg"
                alt="Peluangku"
                {...size}
                className={cn('h-auto dark:hidden', className)}
            />
            <img
                src="/images/brand/svg/peluangku-logo-putih.svg"
                alt="Peluangku"
                {...size}
                className={cn('hidden h-auto dark:block', className)}
            />
        </>
    );
}
