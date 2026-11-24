import { ChevronDown } from 'lucide-react';
import { fieldClass } from '@/lib/ui';
import { cn } from '@/lib/utils';

/** Native select styled like the other fields (keeps mobile pickers). */
export default function NativeSelect({
    id,
    value,
    onChange,
    placeholder,
    options,
}: {
    id: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    options: string[];
}) {
    return (
        <div className="relative">
            <select
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={cn(
                    fieldClass,
                    'w-full cursor-pointer appearance-none pr-10 [color-scheme:dark]',
                    !value && 'text-muted-foreground',
                )}
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
            <ChevronDown
                className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
            />
        </div>
    );
}
