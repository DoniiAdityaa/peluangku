import { cn } from '@/lib/utils';

/**
 * Poses of Lumi, the Peluangku mascot. Each one is an animated SVG in
 * public/animation; the motion is plain CSS inside the file, so it plays
 * without any library and stops for people who prefer reduced motion.
 */
export type MascotPose =
    | 'login'
    | 'register'
    | 'verifikasi'
    | 'keamanan'
    | 'ai'
    | 'error'
    | 'tidak-ditemukan'
    | 'kosong';

export default function Mascot({
    pose,
    label,
    className,
}: {
    pose: MascotPose;
    /** Describe the picture when it carries meaning; leave out when decorative. */
    label?: string;
    className?: string;
}) {
    return (
        <img
            src={`/animation/peluangku-${pose}.svg`}
            alt={label ?? ''}
            aria-hidden={label ? undefined : true}
            draggable={false}
            decoding="async"
            className={cn('pointer-events-none select-none', className)}
        />
    );
}
