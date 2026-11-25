import { Form, Head, router, usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { Plus, X } from 'lucide-react';
import * as React from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { edit } from '@/routes/profile';
import type { Auth } from '@/types';
import { send } from '@/routes/verification';

type Interest = {
    id: number;
    name: string;
};

type PageProps = {
    auth: Auth;
    availableInterests: Interest[];
    userInterests: Interest[];
};

const OTHER_OPTION = '__other__';

const cities = [
    'Jakarta',
    'Surabaya',
    'Bandung',
    'Medan',
    'Semarang',
    'Makassar',
    'Palembang',
    'Yogyakarta',
    'Denpasar',
    'Balikpapan',
    'Samarinda',
    'Malang',
    'Tangerang',
    'Bekasi',
    'Depok',
    'Bogor',
    'Batam',
    'Pekanbaru',
    'Padang',
    'Bandar Lampung',
    'Pontianak',
    'Banjarmasin',
    'Manado',
    'Jayapura',
];

const campuses = [
    'Universitas Indonesia',
    'Universitas Gadjah Mada',
    'Institut Teknologi Bandung',
    'Institut Pertanian Bogor',
    'Institut Teknologi Sepuluh Nopember',
    'Universitas Airlangga',
    'Universitas Diponegoro',
    'Universitas Padjadjaran',
    'Universitas Brawijaya',
    'Universitas Hasanuddin',
    'Universitas Sebelas Maret',
    'Universitas Negeri Yogyakarta',
    'Universitas Pendidikan Indonesia',
    'Universitas Sumatera Utara',
    'Universitas Andalas',
    'Universitas Bina Nusantara',
    'Universitas Telkom',
    'Universitas Terbuka',
];

const majors = [
    'Akuntansi',
    'Administrasi Bisnis',
    'Agribisnis',
    'Arsitektur',
    'Biologi',
    'Ekonomi',
    'Farmasi',
    'Ilmu Hukum',
    'Ilmu Komunikasi',
    'Ilmu Politik',
    'Kedokteran',
    'Keperawatan',
    'Manajemen',
    'Pendidikan',
    'Psikologi',
    'Sistem Informasi',
    'Teknik Elektro',
    'Teknik Industri',
    'Teknik Informatika',
    'Teknik Sipil',
];

const educationLevels = [
    'SMA Sederajat',
    'Diploma 1 (D1)',
    'Diploma 2 (D2)',
    'Diploma 3 (D3)',
    'Diploma 4 (D4)/Sarjana Terapan',
    'Sarjana (S1)',
    'Magister (S2)',
    'Doktor (S3)',
];

function ProfileSelectField({
    name,
    label,
    options,
    defaultValue,
    error,
}: {
    name: string;
    label: string;
    options: string[];
    defaultValue: string | null | undefined;
    error?: string;
}) {
    const isKnownValue = defaultValue ? options.includes(defaultValue) : true;
    const [selection, setSelection] = React.useState(
        isKnownValue ? (defaultValue ?? '') : OTHER_OPTION,
    );
    const [customValue, setCustomValue] = React.useState(
        isKnownValue ? '' : (defaultValue ?? ''),
    );

    return (
        <div className="grid gap-2">
            <Label htmlFor={name}>{label}</Label>
            <Select
                value={selection}
                onValueChange={setSelection}
                name={selection === OTHER_OPTION ? undefined : name}
                required
            >
                <SelectTrigger id={name} className="mt-1 w-full">
                    <SelectValue placeholder={`Pilih ${label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option} value={option}>
                            {option}
                        </SelectItem>
                    ))}
                    {name !== 'pendidikan_terakhir' && (
                        <SelectItem value={OTHER_OPTION}>Lainnya</SelectItem>
                    )}
                </SelectContent>
            </Select>
            {selection === OTHER_OPTION && (
                <Input
                    id={`${name}_custom`}
                    value={customValue}
                    onChange={(event) => setCustomValue(event.target.value)}
                    name={name}
                    required
                    placeholder={`Masukkan ${label.toLowerCase()}`}
                />
            )}
            <InputError className="mt-2" message={error} />
        </div>
    );
}

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth, availableInterests, userInterests } =
        usePage<PageProps>().props;
    const [updatingInterest, setUpdatingInterest] = React.useState(false);
    const [interestError, setInterestError] = React.useState<string>();

    const addInterest = (interestId: string) => {
        setInterestError(undefined);
        setUpdatingInterest(true);
        router.post(
            '/settings/profile/interests',
            { interest_id: Number(interestId) },
            {
                preserveScroll: true,
                onError: (errors) => {
                    setInterestError(Object.values(errors)[0]);
                },
                onFinish: () => setUpdatingInterest(false),
            },
        );
    };

    const removeInterest = (interestId: number) => {
        setInterestError(undefined);
        setUpdatingInterest(true);
        router.delete(`/settings/profile/interests/${interestId}`, {
            preserveScroll: true,
            onError: (errors) => {
                setInterestError(Object.values(errors)[0]);
            },
            onFinish: () => setUpdatingInterest(false),
        });
    };

    return (
        <>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Profile"
                    description="Update your profile"
                />

                <Form
                    {...ProfileController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>

                                <Input
                                    id="name"
                                    className="mt-1 block w-full"
                                    defaultValue={auth.user.name}
                                    name="name"
                                    required
                                    autoComplete="name"
                                    placeholder="Full name"
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.name}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>

                                <Input
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    defaultValue={auth.user.email}
                                    name="email"
                                    required
                                    autoComplete="username"
                                    placeholder="Email address"
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.email}
                                />
                            </div>

                            <ProfileSelectField
                                name="domisili"
                                label="Domisili"
                                options={cities}
                                defaultValue={auth.user.domisili}
                                error={errors.domisili}
                            />

                            <ProfileSelectField
                                name="kampus"
                                label="Kampus"
                                options={campuses}
                                defaultValue={auth.user.kampus}
                                error={errors.kampus}
                            />

                            <ProfileSelectField
                                name="jurusan"
                                label="Jurusan"
                                options={majors}
                                defaultValue={auth.user.jurusan}
                                error={errors.jurusan}
                            />

                            <ProfileSelectField
                                name="pendidikan_terakhir"
                                label="Pendidikan Terakhir"
                                options={educationLevels}
                                defaultValue={auth.user.pendidikan_terakhir}
                                error={errors.pendidikan_terakhir}
                            />

                            <div className="grid gap-2">
                                <Label>Bidang Minat</Label>
                                <div className="flex flex-wrap items-center gap-2">
                                    {userInterests.map((interest) => (
                                        <Button
                                            key={interest.id}
                                            type="button"
                                            variant="outline"
                                            disabled={updatingInterest}
                                            onClick={() =>
                                                removeInterest(interest.id)
                                            }
                                            aria-label={`Hapus bidang minat ${interest.name}`}
                                        >
                                            {interest.name}
                                            <X aria-hidden="true" />
                                        </Button>
                                    ))}
                                    <Select
                                        value=""
                                        onValueChange={addInterest}
                                        disabled={updatingInterest}
                                    >
                                        <SelectTrigger
                                            aria-label="Tambah bidang minat"
                                            className="size-9 min-w-9 justify-center p-0"
                                        >
                                            <Plus aria-hidden="true" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableInterests
                                                .filter(
                                                    (interest) =>
                                                        !userInterests.some(
                                                            (selected) =>
                                                                selected.id ===
                                                                interest.id,
                                                        ),
                                                )
                                                .map((interest) => (
                                                    <SelectItem
                                                        key={interest.id}
                                                        value={String(
                                                            interest.id,
                                                        )}
                                                    >
                                                        {interest.name}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <InputError
                                    className="mt-2"
                                    message={interestError}
                                />
                            </div>

                            {mustVerifyEmail &&
                                auth.user.email_verified_at === null && (
                                    <div>
                                        <p className="-mt-4 text-sm text-muted-foreground">
                                            Your email address is unverified.{' '}
                                            <Link
                                                href={send()}
                                                as="button"
                                                className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                            >
                                                Click here to re-send the
                                                verification email.
                                            </Link>
                                        </p>

                                        {status ===
                                            'verification-link-sent' && (
                                            <div className="mt-2 text-sm font-medium text-green-600">
                                                A new verification link has been
                                                sent to your email address.
                                            </div>
                                        )}
                                    </div>
                                )}

                            <div className="flex items-center gap-4">
                                <Button
                                    disabled={processing}
                                    data-test="update-profile-button"
                                >
                                    Save
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>

            <DeleteUser />
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Profile settings',
            href: edit(),
        },
    ],
};
