import { Form, Head } from '@inertiajs/react';
import { Fingerprint, KeyRound, ShieldCheck } from 'lucide-react';
import { useRef } from 'react';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import Field from '@/components/form/field';
import type { Props as ManagePasskeysProps } from '@/components/manage-passkeys';
import ManagePasskeys from '@/components/manage-passkeys';
import type { Props as ManageTwoFactorProps } from '@/components/manage-two-factor';
import ManageTwoFactor from '@/components/manage-two-factor';
import PasswordInput from '@/components/password-input';
import SettingsCard from '@/components/settings/settings-card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { fieldClass, primaryButtonClass } from '@/lib/ui';

// oxfmt-ignore
type Props = {
    passwordRules: string;
} & ManagePasskeysProps &
    ManageTwoFactorProps;

/** Settings › Keamanan: password, two-factor authentication, passkeys. */
export default function Security(props: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <>
            <Head title="Pengaturan keamanan" />

            <SettingsCard
                icon={KeyRound}
                title="Kata sandi"
                description="Pakai kata sandi yang panjang dan tidak dipakai di tempat lain."
            >
                <Form
                    {...SecurityController.update.form()}
                    options={{ preserveScroll: true }}
                    resetOnError={[
                        'password',
                        'password_confirmation',
                        'current_password',
                    ]}
                    resetOnSuccess
                    onError={(errors) => {
                        if (errors.password) {
                            passwordInput.current?.focus();
                        }

                        if (errors.current_password) {
                            currentPasswordInput.current?.focus();
                        }
                    }}
                    className="flex flex-col gap-5"
                >
                    {({ errors, processing }) => (
                        <>
                            <Field
                                id="current_password"
                                label="Kata sandi saat ini"
                                error={errors.current_password}
                            >
                                <PasswordInput
                                    id="current_password"
                                    ref={currentPasswordInput}
                                    name="current_password"
                                    autoComplete="current-password"
                                    className={fieldClass}
                                />
                            </Field>
                            <div className="grid gap-5 sm:grid-cols-2">
                                <Field
                                    id="password"
                                    label="Kata sandi baru"
                                    error={errors.password}
                                >
                                    <PasswordInput
                                        id="password"
                                        ref={passwordInput}
                                        name="password"
                                        autoComplete="new-password"
                                        passwordrules={props.passwordRules}
                                        className={fieldClass}
                                    />
                                </Field>
                                <Field
                                    id="password_confirmation"
                                    label="Ulangi kata sandi baru"
                                    error={errors.password_confirmation}
                                >
                                    <PasswordInput
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        autoComplete="new-password"
                                        passwordrules={props.passwordRules}
                                        className={fieldClass}
                                    />
                                </Field>
                            </div>
                            <div>
                                <Button
                                    disabled={processing}
                                    data-test="update-password-button"
                                    className={primaryButtonClass}
                                >
                                    {processing && <Spinner />}
                                    Ganti kata sandi
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </SettingsCard>

            {props.canManageTwoFactor && (
                <SettingsCard
                    icon={ShieldCheck}
                    tone="teal"
                    title="Autentikasi dua langkah"
                    description="Selain kata sandi, minta kode dari aplikasi autentikator saat masuk."
                >
                    <ManageTwoFactor
                        canManageTwoFactor={props.canManageTwoFactor}
                        requiresConfirmation={props.requiresConfirmation}
                        twoFactorEnabled={props.twoFactorEnabled}
                    />
                </SettingsCard>
            )}

            {props.canManagePasskeys && (
                <SettingsCard
                    icon={Fingerprint}
                    tone="navy"
                    title="Passkey"
                    description="Masuk dengan sidik jari, Face ID, atau PIN perangkat tanpa kata sandi."
                >
                    <ManagePasskeys
                        canManagePasskeys={props.canManagePasskeys}
                        passkeys={props.passkeys}
                    />
                </SettingsCard>
            )}
        </>
    );
}
