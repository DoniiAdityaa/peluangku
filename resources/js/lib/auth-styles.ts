import {
    fieldClass,
    primaryButtonClass,
    secondaryButtonClass,
    statusClass,
} from '@/lib/ui';

/** Auth pages reuse the shared foundation from lib/ui. */
export const authFieldClass = fieldClass;

export const authSubmitClass = `mt-2 w-full ${primaryButtonClass}`;

export const authSecondaryClass = `w-full ${secondaryButtonClass}`;

export const authStatusClass = `mb-6 ${statusClass}`;
