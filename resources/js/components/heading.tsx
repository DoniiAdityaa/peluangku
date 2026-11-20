type HeadingProps = {
    title: string;
    description?: string;
    variant?: 'page' | 'default' | 'small';
    as?: 'h1' | 'h2' | 'h3';
};

const headingStyles = {
    page: 'text-3xl font-bold tracking-tight md:text-4xl',
    default: 'text-xl font-semibold tracking-tight md:text-2xl',
    small: 'text-base font-medium',
};

export default function Heading({
    title,
    description,
    variant = 'default',
    as = 'h2',
}: HeadingProps) {
    const Tag = as;

    return (
        <header
            className={variant === 'small' ? 'space-y-1' : 'mb-8 space-y-2'}
        >
            <Tag className={headingStyles[variant]}>{title}</Tag>
            {description && (
                <p className="text-sm leading-relaxed text-muted-foreground">
                    {description}
                </p>
            )}
        </header>
    );
}
