import { Form, Head, Link, setLayoutProps } from '@inertiajs/react';
import { Lock, TriangleAlert } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { authFieldClass, authSubmitClass } from '@/lib/auth-styles';
import { login } from '@/routes';
import { request, update } from '@/routes/password';

type Props = {
    token: string;
    email: string;
    passwordRules: string;
    tokenValid: boolean;
};

export default function ResetPassword({
    token,
    email,
    passwordRules,
    tokenValid,
}: Props) {
    if (!tokenValid) {
        return <ExpiredLink />;
    }

    return (
        <>
            <Head title="Atur ulang kata sandi" />

            <Form
                {...update.form()}
                transform={(data) => ({ ...data, token, email })}
                resetOnSuccess={['password', 'password_confirmation']}
                // Replace this page in history so Back cannot return to a finished auth step.
                options={{ replace: true }}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    value={email}
                                    readOnly
                                    aria-describedby="email-locked"
                                    className="h-12 cursor-not-allowed rounded-control border-transparent bg-muted pr-11 text-muted-foreground focus-visible:ring-0 dark:bg-muted"
                                />
                                <Lock
                                    className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted-foreground"
                                    aria-hidden="true"
                                />
                            </div>
                            <p
                                id="email-locked"
                                className="text-xs text-muted-foreground"
                            >
                                Email diambil dari link yang kamu buka dan tidak
                                bisa diubah.
                            </p>
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Kata sandi baru</Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                required
                                autoComplete="new-password"
                                autoFocus
                                placeholder="Buat kata sandi baru"
                                className={authFieldClass}
                                passwordrules={passwordRules}
                                aria-invalid={Boolean(errors.password)}
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">
                                Konfirmasi kata sandi
                            </Label>
                            <PasswordInput
                                id="password_confirmation"
                                name="password_confirmation"
                                required
                                autoComplete="new-password"
                                placeholder="Ulangi kata sandi baru"
                                className={authFieldClass}
                                passwordrules={passwordRules}
                                aria-invalid={Boolean(
                                    errors.password_confirmation,
                                )}
                            />
                            <InputError
                                message={errors.password_confirmation}
                            />
                        </div>

                        <Button
                            type="submit"
                            className={authSubmitClass}
                            disabled={processing}
                            data-test="reset-password-button"
                        >
                            {processing && <Spinner />}
                            {processing ? 'Menyimpan...' : 'Simpan kata sandi'}
                        </Button>
                    </>
                )}
            </Form>
        </>
    );
}

ResetPassword.layout = {
    variant: 'reset-password',
    title: 'Buat kata sandi baru.',
    description:
        'Pilih kata sandi yang kuat. Setelah disimpan, kamu bisa langsung masuk.',
};

function ExpiredLink() {
    setLayoutProps({
        title: 'Link sudah tidak berlaku.',
        description:
            'Link atur ulang kata sandi ini sudah dipakai atau sudah kedaluwarsa. Minta link baru untuk melanjutkan.',
    });

    return (
        <>
            <Head title="Link tidak berlaku" />

            <div className="flex flex-col gap-6">
                <div
                    role="alert"
                    className="flex items-start gap-3 rounded-control border border-warning/25 bg-warning/10 p-4 text-sm leading-relaxed text-warning"
                >
                    <TriangleAlert
                        className="mt-0.5 size-5 shrink-0"
                        aria-hidden="true"
                    />
                    <span>
                        Demi keamanan, setiap link hanya bisa dipakai sekali dan
                        berlaku terbatas.
                    </span>
                </div>

                <Button asChild className={authSubmitClass}>
                    <Link href={request()}>Minta link baru</Link>
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                    Sudah ganti kata sandi?{' '}
                    <TextLink href={login()}>Masuk</TextLink>
                </div>
            </div>
        </>
    );
}
