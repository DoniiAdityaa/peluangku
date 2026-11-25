import {
    fieldClass,
    primaryButtonClass,
    secondaryButtonClass,
    statusClass,
} from '@/lib/ui';

/** Auth pages reuse the shared foundation from lib/ui. */
/** Fields get a bit shorter on low desktop screens so the page fits without scrolling. */
export const authFieldClass = `${fieldClass} shorter:h-11`;

export const authSubmitClass = `mt-2 w-full ${primaryButtonClass} shorter:mt-1 shorter:h-11`;

export const authSecondaryClass = `w-full ${secondaryButtonClass}`;

export const authStatusClass = `mb-6 ${statusClass}`;
