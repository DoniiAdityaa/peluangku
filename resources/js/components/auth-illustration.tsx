import type { MascotPose } from '@/components/mascot';

/**
 * Lumi on the brand panel of the sign-in screens. The pose is an animated
 * SVG, so it shows at once (no player to load) and stays still for people
 * who prefer reduced motion.
 */
export default function AuthIllustration({ pose }: { pose: MascotPose }) {
    return (
        <div
            aria-hidden="true"
            className="relative mx-auto my-6 aspect-square w-full max-w-sm short:my-4 short:aspect-auto short:min-h-32 short:flex-1"
        >
            <img
                src={`/animation/peluangku-${pose}.svg`}
                alt=""
                draggable={false}
                className="absolute inset-0 size-full object-contain select-none"
            />
        </div>
    );
}
