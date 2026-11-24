import type { AnimationItem } from 'lottie-web';
import { useEffect, useRef, useState } from 'react';

export default function AuthIllustration({ src }: { src: string }) {
    const container = useRef<HTMLDivElement>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const element = container.current;
        const desktop = window.matchMedia('(min-width: 1024px)');
        const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        );
        let animation: AnimationItem | undefined;
        let cancelled = false;

        const updatePlayback = () => {
            if (!animation) return;
            if (reducedMotion.matches) {
                animation.goToAndStop(0, true);
            } else if (desktop.matches) {
                animation.play();
            } else {
                animation.pause();
            }
        };

        const loadAnimation = async () => {
            if (!element || animation || !desktop.matches) return;

            try {
                const { default: lottie } = await import('lottie-web');
                if (cancelled || animation) return;

                animation = lottie.loadAnimation({
                    container: element,
                    renderer: 'svg',
                    loop: true,
                    autoplay: false,
                    path: src,
                });
                animation.addEventListener('DOMLoaded', () => {
                    if (cancelled) return;
                    setLoaded(true);
                    updatePlayback();
                });
                animation.addEventListener('data_failed', () =>
                    setLoaded(false),
                );
            } catch {
                // Keep the static illustration if the player cannot load.
            }
        };

        const onViewportChange = () => {
            void loadAnimation();
            updatePlayback();
        };

        void loadAnimation();
        desktop.addEventListener('change', onViewportChange);
        reducedMotion.addEventListener('change', updatePlayback);

        return () => {
            cancelled = true;
            desktop.removeEventListener('change', onViewportChange);
            reducedMotion.removeEventListener('change', updatePlayback);
            animation?.destroy();
        };
    }, [src]);

    return (
        <div
            aria-hidden="true"
            className="relative mx-auto my-6 aspect-square w-full max-w-sm"
        >
            {!loaded && (
                <img
                    src="/images/student.svg"
                    alt=""
                    onError={(event) => {
                        event.currentTarget.hidden = true;
                    }}
                    className="absolute inset-0 size-full object-contain"
                    width="440"
                    height="350"
                />
            )}
            <div ref={container} className="absolute inset-0" />
        </div>
    );
}
