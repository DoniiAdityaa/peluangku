import { Form, Head } from '@inertiajs/react';
import { Send } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import {
    authFieldClass,
    authStatusClass,
    authSubmitClass,
} from '@/lib/auth-styles';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title="Lupa kata sandi" />

            {status && (
                <div role="status" className={authStatusClass}>
                    {status}
                </div>
            )}

            <Form {...email.form()} className="flex flex-col gap-6">
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                required
                                autoComplete="email"
                                autoFocus
                                placeholder="nama@email.com"
                                className={authFieldClass}
                                aria-invalid={Boolean(errors.email)}
                            />
                            <InputError message={errors.email} />
                        </div>

                        <Button
                            type="submit"
                            className={authSubmitClass}
                            disabled={processing}
                            data-test="email-password-reset-link-button"
                        >
                            {processing ? (
                                <Spinner />
                            ) : (
                                <Send className="size-4" aria-hidden="true" />
                            )}
                            {processing
                                ? 'Mengirim link...'
                                : 'Kirim link atur ulang'}
                        </Button>

                        <div className="text-center text-sm text-muted-foreground">
                            Sudah ingat kata sandimu?{' '}
                            <TextLink href={login()}>Masuk</TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

ForgotPassword.layout = {
    variant: 'forgot-password',
    title: 'Lupa kata sandi?',
    description:
        'Masukkan email akunmu. Kami akan mengirim link untuk membuat kata sandi baru.',
};
