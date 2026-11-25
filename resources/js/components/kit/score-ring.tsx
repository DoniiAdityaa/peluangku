import { cn } from '@/lib/utils';

const SIZES = {
    sm: { box: 40, stroke: 4, text: 'text-[11px]', label: false },
    md: { box: 62, stroke: 5, text: 'text-[15px]', label: true },
    lg: { box: 88, stroke: 7, text: 'text-xl', label: true },
} as const;

/** Match score drawn as a ring, e.g. 92% "cocok". */
export default function ScoreRing({
    score,
    size = 'md',
    caption = 'cocok',
    className,
}: {
    score: number;
    size?: keyof typeof SIZES;
    /** Small word under the number. */
    caption?: string;
    className?: string;
}) {
    const { box, stroke, text, label } = SIZES[size];
    const radius = (box - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const value = Math.max(0, Math.min(100, score));

    return (
        <span
            className={cn(
                'relative inline-flex shrink-0 items-center justify-center',
                className,
            )}
            style={{ width: box, height: box }}
        >
            <svg
                viewBox={`0 0 ${box} ${box}`}
                className="absolute inset-0 -rotate-90"
                aria-hidden="true"
            >
                <circle
                    cx={box / 2}
                    cy={box / 2}
                    r={radius}
                    fill="none"
                    strokeWidth={stroke}
                    className="stroke-teal-400/15"
                />
                <circle
                    cx={box / 2}
                    cy={box / 2}
                    r={radius}
                    fill="none"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - value / 100)}
                    className="stroke-teal-ink transition-[stroke-dashoffset] duration-700 ease-out"
                />
            </svg>
            <span className="relative flex flex-col items-center leading-none">
                <span className={cn('font-extrabold tabular-nums', text)}>
                    {value}%
                </span>
                {label && (
                    <span className="mt-0.5 text-[9px] font-semibold tracking-wide text-teal-ink/80 uppercase">
                        {caption}
                    </span>
                )}
            </span>
        </span>
    );
}
