import { Form, Head } from '@inertiajs/react';
import {
    index as confirmOptions,
    store as confirmStore,
} from '@/actions/Laravel/Passkeys/Http/Controllers/PasskeyConfirmationController';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import {
    authFieldClass,
    authSecondaryClass,
    authSubmitClass,
} from '@/lib/auth-styles';
import { store } from '@/routes/password/confirm';

export default function ConfirmPassword() {
    return (
        <>
            <Head title="Konfirmasi kata sandi" />

            <PasskeyVerify
                routes={{
                    options: confirmOptions(),
                    submit: confirmStore(),
                }}
                label="Konfirmasi dengan passkey"
                loadingLabel="Mengonfirmasi..."
                separator="atau pakai kata sandi"
                className={authSecondaryClass}
                separatorClassName="bg-card normal-case"
            />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                // Replace this page in history so Back cannot return to a finished auth step.
                options={{ replace: true }}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Kata sandi</Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                required
                                placeholder="Masukkan kata sandi"
                                autoComplete="current-password"
                                autoFocus
                                className={authFieldClass}
                                aria-invalid={Boolean(errors.password)}
                            />
                            <InputError message={errors.password} />
                        </div>

                        <Button
                            type="submit"
                            className={authSubmitClass}
                            disabled={processing}
                            data-test="confirm-password-button"
                        >
                            {processing && <Spinner />}
                            {processing ? 'Mengonfirmasi...' : 'Konfirmasi'}
                        </Button>
                    </>
                )}
            </Form>
        </>
    );
}

ConfirmPassword.layout = {
    variant: 'confirm-password',
    title: 'Konfirmasi dulu, ya.',
    description:
        'Bagian ini butuh keamanan tambahan. Masukkan kata sandimu untuk melanjutkan.',
};
