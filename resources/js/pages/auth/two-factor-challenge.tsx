import { Form, Head, setLayoutProps } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import { authFieldClass, authSubmitClass } from '@/lib/auth-styles';
import { store } from '@/routes/two-factor/login';

export default function TwoFactorChallenge() {
    const [showRecoveryInput, setShowRecoveryInput] = useState<boolean>(false);
    const [code, setCode] = useState<string>('');

    const authConfigContent = useMemo<{
        title: string;
        description: string;
        toggleText: string;
    }>(() => {
        if (showRecoveryInput) {
            return {
                title: 'Masukkan kode pemulihan.',
                description:
                    'Gunakan salah satu kode pemulihan yang kamu simpan saat mengaktifkan verifikasi dua langkah.',
                toggleText: 'Pakai kode autentikator',
            };
        }

        return {
            title: 'Masukkan kode verifikasi.',
            description:
                'Buka aplikasi autentikator di HP-mu, lalu masukkan 6 digit kode yang muncul.',
            toggleText: 'Pakai kode pemulihan',
        };
    }, [showRecoveryInput]);

    setLayoutProps({
        variant: 'two-factor',
        title: authConfigContent.title,
        description: authConfigContent.description,
    });

    const toggleRecoveryMode = (clearErrors: () => void): void => {
        setShowRecoveryInput(!showRecoveryInput);
        clearErrors();
        setCode('');
    };

    return (
        <>
            <Head title="Verifikasi dua langkah" />

            <Form
                {...store.form()}
                // Replace this page in history so Back cannot return to a finished auth step.
                options={{ replace: true }}
                className="flex flex-col gap-6"
                resetOnError
                resetOnSuccess={!showRecoveryInput}
            >
                {({ errors, processing, clearErrors }) => (
                    <>
                        {showRecoveryInput ? (
                            <div className="grid gap-2">
                                <Input
                                    name="recovery_code"
                                    type="text"
                                    aria-label="Kode pemulihan"
                                    placeholder="xxxxxxxxxx-xxxxxxxxxx"
                                    autoFocus={showRecoveryInput}
                                    required
                                    className={authFieldClass}
                                    aria-invalid={Boolean(errors.recovery_code)}
                                />
                                <InputError message={errors.recovery_code} />
                            </div>
                        ) : (
                            <div className="grid gap-2">
                                <InputOTP
                                    name="code"
                                    maxLength={OTP_MAX_LENGTH}
                                    value={code}
                                    onChange={(value) => setCode(value)}
                                    disabled={processing}
                                    pattern={REGEXP_ONLY_DIGITS}
                                    autoFocus
                                    aria-label="Kode verifikasi"
                                    containerClassName="w-full"
                                >
                                    <InputOTPGroup className="grid w-full grid-cols-6 gap-2">
                                        {Array.from(
                                            { length: OTP_MAX_LENGTH },
                                            (_, index) => (
                                                <InputOTPSlot
                                                    key={index}
                                                    index={index}
                                                    className="h-14 w-full rounded-control border-[1.5px] border-border/70 bg-background/60 text-lg font-semibold first:rounded-control last:rounded-control"
                                                />
                                            ),
                                        )}
                                    </InputOTPGroup>
                                </InputOTP>
                                <InputError message={errors.code} />
                            </div>
                        )}

                        <Button
                            type="submit"
                            className={authSubmitClass}
                            disabled={processing}
                        >
                            {processing ? 'Memeriksa...' : 'Lanjutkan'}
                        </Button>

                        <div className="text-center text-sm text-muted-foreground">
                            Tidak bisa pakai cara ini?{' '}
                            <button
                                type="button"
                                className="cursor-pointer text-foreground underline decoration-neutral-500 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current!"
                                onClick={() => toggleRecoveryMode(clearErrors)}
                            >
                                {authConfigContent.toggleText}
                            </button>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

TwoFactorChallenge.layout = {
    variant: 'two-factor',
};
