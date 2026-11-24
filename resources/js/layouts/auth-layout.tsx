import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';
import AuthBrandLayout from '@/layouts/auth/auth-brand-layout';
import type { AuthBrandVariant } from '@/layouts/auth/auth-brand-layout';

export default function AuthLayout({
    title = '',
    description = '',
    children,
    variant = 'default',
}: {
    title?: string;
    description?: string;
    children: React.ReactNode;
    variant?: 'default' | AuthBrandVariant;
}) {
    if (variant !== 'default') {
        return (
            <AuthBrandLayout
                title={title}
                description={description}
                variant={variant}
            >
                {children}
            </AuthBrandLayout>
        );
    }

    return (
        <AuthLayoutTemplate title={title} description={description}>
            {children}
        </AuthLayoutTemplate>
    );
}
