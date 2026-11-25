/**
 * Design foundation shared by every screen.
 *
 * Radius tokens (rounded-control / rounded-card / rounded-panel) and the
 * card shadows live in resources/css/app.css; these class strings combine
 * them so pages never hand-roll their own surfaces, fields or buttons.
 */

/** Cards: settings blocks, choice cards, section cards. */
export const cardClass =
    'rounded-card border border-border/60 bg-card shadow-card';

/** Text inputs, selects and date fields. */
export const fieldClass =
    'h-12 rounded-control border-[1.5px] border-border/70 bg-background/60 px-4 text-sm shadow-none transition-colors hover:border-border focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15 dark:bg-background/60';

/** Main call to action. */
export const primaryButtonClass =
    'h-12 rounded-control px-6 font-semibold shadow-cta transition-all hover:-translate-y-px hover:bg-primary/90 active:translate-y-0';

/** Secondary action next to a primary one. */
export const secondaryButtonClass = 'h-12 rounded-control px-6 font-semibold';

/** Success message box (e.g. "link sent"). */
export const statusClass =
    'rounded-control border border-success/25 bg-success/10 p-4 text-sm leading-relaxed text-success';

/** Small "AI" / "Cek lagi" style pills next to labels. */
export const pillClass =
    'inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold';

/** Raised card inside the app frame (dashboard panels). */
export const panelClass =
    'rounded-[22px] border border-white/[0.06] bg-surface shadow-[0_1px_0_0_rgb(255_255_255/0.03)_inset]';

/** Square icon tile at the start of a panel header or KPI. */
export const iconTileClass =
    'flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.06] text-foreground';
