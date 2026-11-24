import { Form, Head, usePage } from '@inertiajs/react';
import { CheckCircle2, Mail, Send } from 'lucide-react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { authSubmitClass } from '@/lib/auth-styles';
import { logout } from '@/routes';
import { send } from '@/routes/verification';
import type { Auth } from '@/types';

const steps = [
    'Buka email dari Peluangku di kotak masukmu.',
    'Klik tombol verifikasi di dalam email tersebut.',
    'Belum ada? Periksa folder Spam atau Promosi.',
];

export default function VerifyEmail({ status }: { status?: string }) {
    const { auth } = usePage<{ auth: Auth }>().props;

    return (
        <>
            <Head title="Verifikasi email" />

            {status === 'verification-link-sent' && (
                <div
                    role="status"
                    className="mb-6 flex items-start gap-3 rounded-control border border-success/25 bg-success/10 p-4 text-sm leading-relaxed text-success"
                >
                    <CheckCircle2
                        className="mt-0.5 size-5 shrink-0"
                        aria-hidden="true"
                    />
                    <span>
                        Link verifikasi baru sudah dikirim. Silakan periksa
                        emailmu.
                    </span>
                </div>
            )}

            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3 rounded-control border-[1.5px] border-border/70 bg-background/60 px-4 py-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-link">
                        <Mail className="size-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 text-sm font-semibold break-all">
                        {auth.user.email}
                    </span>
                </div>

                <ol className="grid gap-3 text-sm leading-relaxed text-muted-foreground">
                    {steps.map((step, index) => (
                        <li key={step} className="flex items-start gap-3">
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border text-xs font-semibold text-foreground">
                                {index + 1}
                            </span>
                            <span className="pt-0.5">{step}</span>
                        </li>
                    ))}
                </ol>

                <Form {...send.form()} className="flex flex-col gap-6">
                    {({ processing, errors }) => (
                        <>
                            {Object.values(errors).length > 0 && (
                                <div
                                    role="alert"
                                    className="rounded-control border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive"
                                >
                                    {Object.values(errors).join(' ')}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={processing}
                                className={authSubmitClass}
                            >
                                {processing ? (
                                    <Spinner />
                                ) : (
                                    <Send
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                )}
                                {processing
                                    ? 'Mengirim link...'
                                    : 'Kirim ulang email verifikasi'}
                            </Button>

                            <div className="text-center text-sm text-muted-foreground">
                                Ingin memakai akun lain?{' '}
                                <TextLink href={logout()} as="button">
                                    Keluar
                                </TextLink>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

VerifyEmail.layout = {
    variant: 'verification',
    title: 'Cek email kamu.',
    description:
        'Kami sudah mengirim link verifikasi ke alamat di bawah. Verifikasi emailmu untuk melanjutkan ke Peluangku.',
};
