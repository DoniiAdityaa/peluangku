import { usePage } from '@inertiajs/react';
import { Sparkles, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import Mascot from '@/components/mascot';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cardClass } from '@/lib/ui';
import { cn } from '@/lib/utils';

const SEEN_KEY = 'peluangku:lumi-seen';

/** Pages with their own sticky bar at the bottom right, where the button would cover it. */
const HIDDEN_ON = ['account/profile'];

function readSeen(): boolean {
    try {
        return window.localStorage.getItem(SEEN_KEY) === '1';
    } catch {
        return false;
    }
}

/**
 * Lumi's floating button in the bottom-right corner. The AI chat itself is
 * not built yet, so the panel introduces Lumi and says it is coming soon.
 */
export default function LumiAssistant() {
    const { component } = usePage();
    const [open, setOpen] = useState(false);
    const [seen, setSeen] = useState(true);
    const panelId = useId();
    const root = useRef<HTMLDivElement>(null);
    const button = useRef<HTMLButtonElement>(null);

    // Read after mount so server and client markup match.
    useEffect(() => setSeen(readSeen()), []);

    useEffect(() => {
        if (!open) return;

        const onPointerDown = (event: PointerEvent) => {
            if (!root.current?.contains(event.target as Node)) setOpen(false);
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false);
                button.current?.focus();
            }
        };

        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);

    if (HIDDEN_ON.includes(component)) return null;

    const toggle = () => {
        setOpen((value) => !value);

        if (!seen) {
            setSeen(true);

            try {
                window.localStorage.setItem(SEEN_KEY, '1');
            } catch {
                // Private mode: the dot just shows again next time.
            }
        }
    };

    return (
        <div
            ref={root}
            className="fixed right-4 bottom-4 z-40 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6"
        >
            {open && (
                <section
                    id={panelId}
                    aria-label="Lumi, asisten AI"
                    className={cn(
                        cardClass,
                        'w-[min(20rem,calc(100vw-2rem))] origin-bottom-right animate-in overflow-hidden shadow-xl duration-200 fade-in-0 zoom-in-95 slide-in-from-bottom-2',
                    )}
                >
                    <header className="flex items-center gap-3 bg-navy-700 px-4 py-3 text-white">
                        <span className="size-10 shrink-0 overflow-hidden rounded-full border-2 border-teal-300 bg-[#1E4A75]">
                            <Mascot pose="ai" className="size-full" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold">Lumi</p>
                            <p className="text-xs text-navy-100">
                                Asisten AI Peluangku
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            aria-label="Tutup"
                            className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-navy-100 transition-colors hover:bg-white/10 hover:text-white"
                        >
                            <X className="size-4" aria-hidden="true" />
                        </button>
                    </header>
                    <div className="flex flex-col gap-3 p-4">
                        <p className="rounded-2xl rounded-tl-sm bg-muted px-3.5 py-2.5 text-sm leading-relaxed">
                            Hai! Aku Lumi. Sebentar lagi aku bisa bantu kamu
                            tanya-tanya soal beasiswa, cek syarat, dan
                            mengingatkan deadline.
                        </p>
                        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-teal-soft px-2.5 py-1 text-xs font-semibold text-teal-ink">
                            <Sparkles className="size-3.5" aria-hidden="true" />
                            Segera hadir
                        </span>
                    </div>
                </section>
            )}

            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        ref={button}
                        type="button"
                        onClick={toggle}
                        aria-expanded={open}
                        aria-controls={open ? panelId : undefined}
                        aria-label="Tanya Lumi, asisten AI"
                        className="group relative size-14 cursor-pointer rounded-full focus-visible:ring-4 focus-visible:ring-teal-400/40 focus-visible:outline-none motion-safe:animate-lumi-float"
                    >
                        <span className="block size-full overflow-hidden rounded-full border-[3px] border-teal-400 bg-[#1E4A75] shadow-lg shadow-teal-500/30 transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
                            <Mascot pose="ai" className="size-full" />
                        </span>
                        {!seen && (
                            <span
                                aria-hidden="true"
                                className="absolute top-0.5 right-0.5 size-3.5 rounded-full border-2 border-background bg-orange-500 motion-safe:animate-pulse"
                            />
                        )}
                    </button>
                </TooltipTrigger>
                {!open && (
                    <TooltipContent side="left">Tanya Lumi</TooltipContent>
                )}
            </Tooltip>
        </div>
    );
}
