import { Form, Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CircleCheck,
    FolderOpen,
    Mail,
    TriangleAlert,
    UserRound,
} from 'lucide-react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Field from '@/components/form/field';
import SettingsCard from '@/components/settings/settings-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { cardClass, fieldClass, primaryButtonClass } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { profile as accountProfile } from '@/routes/account';
import { send } from '@/routes/verification';

/** Settings › Akun: name and email, a pointer to profile data, delete account. */
export default function AccountSettings({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage().props;
    const user = auth.user;
    const verified = user?.email_verified_at !== null;

    return (
        <>
            <Head title="Pengaturan akun" />

            <SettingsCard
                icon={UserRound}
                title="Informasi akun"
                description="Nama dan email yang dipakai untuk masuk."
            >
                <Form
                    {...ProfileController.update.form()}
                    options={{ preserveScroll: true }}
                    className="flex flex-col gap-5"
                >
                    {({ processing, errors }) => (
                        <>
                            <Field id="name" label="Nama" error={errors.name}>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={user?.name}
                                    required
                                    autoComplete="name"
                                    className={fieldClass}
                                />
                            </Field>

                            <Field
                                id="email"
                                label="Email"
                                error={errors.email}
                            >
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    defaultValue={user?.email}
                                    required
                                    autoComplete="username"
                                    className={fieldClass}
                                />
                            </Field>

                            {mustVerifyEmail && (
                                <div
                                    className={cn(
                                        'flex items-start gap-2.5 rounded-control p-3.5 text-sm',
                                        verified
                                            ? 'bg-success/10 text-success'
                                            : 'bg-warning/10 text-warning',
                                    )}
                                >
                                    {verified ? (
                                        <CircleCheck
                                            className="mt-0.5 size-4 shrink-0"
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        <Mail
                                            className="mt-0.5 size-4 shrink-0"
                                            aria-hidden="true"
                                        />
                                    )}
                                    <div>
                                        {verified ? (
                                            'Email sudah terverifikasi.'
                                        ) : (
                                            <>
                                                Email belum terverifikasi.{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="cursor-pointer font-semibold underline underline-offset-4"
                                                >
                                                    Kirim ulang link verifikasi
                                                </Link>
                                                {status ===
                                                    'verification-link-sent' && (
                                                    <p className="mt-1 font-medium">
                                                        Link baru sudah dikirim
                                                        ke emailmu.
                                                    </p>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    data-test="update-profile-button"
                                    className={primaryButtonClass}
                                >
                                    {processing && <Spinner />}
                                    Simpan
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </SettingsCard>

            <Link
                href={accountProfile()}
                className={cn(
                    cardClass,
                    'group flex items-center gap-4 p-5 transition-colors hover:border-primary/40',
                )}
            >
                <span
                    aria-hidden="true"
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-teal-soft text-teal-ink"
                >
                    <FolderOpen className="size-[18px]" strokeWidth={1.9} />
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block font-semibold">
                        Data diri dan dokumen
                    </span>
                    <span className="block text-sm text-muted-foreground">
                        Kampus, jurusan, IPK, minat, CV, dan transkrip ada di
                        Profil & Dokumen.
                    </span>
                </span>
                <ArrowRight
                    className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                    aria-hidden="true"
                />
            </Link>

            <SettingsCard
                icon={TriangleAlert}
                title="Hapus akun"
                description="Semua data, profil, dan beasiswa tersimpan akan dihapus permanen."
                danger
            >
                <DeleteUser />
            </SettingsCard>
        </>
    );
}
