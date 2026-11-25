import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { authFieldClass, authSubmitClass } from '@/lib/auth-styles';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    return (
        <>
            <Head title="Buat akun" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                // Replace this page in history so Back cannot return to a finished auth step.
                options={{ replace: true }}
                className="flex flex-col gap-6 short:gap-4"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6 short:gap-4 shorter:gap-3">
                            <div className="grid gap-2 shorter:gap-1.5">
                                <Label htmlFor="name">Nama lengkap</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Masukkan nama lengkapmu"
                                    className={authFieldClass}
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2 shorter:gap-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    name="email"
                                    placeholder="nama@email.com"
                                    className={authFieldClass}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2 shorter:gap-1.5">
                                <Label htmlFor="password">Kata sandi</Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Buat kata sandi"
                                    className={authFieldClass}
                                    passwordrules={passwordRules}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2 shorter:gap-1.5">
                                <Label htmlFor="password_confirmation">
                                    Konfirmasi kata sandi
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Ulangi kata sandi"
                                    className={authFieldClass}
                                    passwordrules={passwordRules}
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className={authSubmitClass}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                {processing ? 'Membuat akun...' : 'Buat akun'}
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Sudah punya akun?{' '}
                            <TextLink href={login()}>Masuk</TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    variant: 'register',
    title: 'Mulai langkahmu.',
    description:
        'Buat akun untuk menjelajahi peluang beasiswa. Profil bisa kamu lengkapi setelah verifikasi email.',
};
