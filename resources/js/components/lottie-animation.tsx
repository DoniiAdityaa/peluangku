import type { AnimationItem } from 'lottie-web';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

type Props = {
    /** Path to a Lottie .json file under /public. */
    src: string;
    loop?: boolean;
    className?: string;
};

/**
 * Plays a Lottie animation. Shows the first frame only when the user
 * prefers reduced motion. Decorative, so it is hidden from screen readers.
 */
export default function LottieAnimation({
    src,
    loop = true,
    className,
}: Props) {
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = container.current;
        const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;
        let animation: AnimationItem | undefined;
        let cancelled = false;

        void import('lottie-web').then(({ default: lottie }) => {
            if (cancelled || !element) return;

            animation = lottie.loadAnimation({
                container: element,
                renderer: 'svg',
                loop: reducedMotion ? false : loop,
                autoplay: !reducedMotion,
                path: src,
            });

            if (reducedMotion) {
                animation.addEventListener('DOMLoaded', () =>
                    animation?.goToAndStop(0, true),
                );
            }
        });

        return () => {
            cancelled = true;
            animation?.destroy();
        };
    }, [src, loop]);

    return (
        <div
            ref={container}
            aria-hidden="true"
            className={cn('aspect-square', className)}
        />
    );
}
