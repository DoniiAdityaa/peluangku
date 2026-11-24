import { Head, Link, setLayoutProps, useForm } from '@inertiajs/react';
import {
    ArrowRight,
    Compass,
    FileText,
    GraduationCap,
    Sparkles,
    Trophy,
    UserRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import ChoiceChips from '@/components/form/choice-chips';
import Field from '@/components/form/field';
import type { FieldTag } from '@/components/form/field';
import FileDrop from '@/components/form/file-drop';
import NativeSelect from '@/components/form/native-select';
import TagInput from '@/components/form/tag-input';
import type { Tone } from '@/components/kit/icon-badge';
import ProgressMeter from '@/components/kit/progress-meter';
import SectionCard from '@/components/kit/section-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { cardClass, fieldClass, pillClass, primaryButtonClass } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { index, store } from '@/routes/onboarding';

type Values = {
    name: string;
    tanggal_lahir: string | null;
    jenis_kelamin: string | null;
    no_whatsapp: string | null;
    domisili: string | null;
    pendidikan_terakhir: string | null;
    kampus: string | null;
    jurusan: string | null;
    semester: number | string | null;
    ipk: string | null;
    prestasi: string[];
    organisasi: string[];
    sertifikat_bahasa: string | null;
    skor_bahasa: string | null;
    jenjang_tujuan: string[];
    lokasi_tujuan: string[];
    jenis_pendanaan: string | null;
    penghasilan_ortu: string | null;
    interests: number[];
};

type Props = {
    method: 'ai' | 'manual';
    values: Values;
    aiFields: string[];
    flaggedFields: string[];
    cvName: string | null;
    options: Record<
        | 'jenisKelamin'
        | 'jenjangSaatIni'
        | 'jenjangTujuan'
        | 'lokasiTujuan'
        | 'jenisPendanaan'
        | 'sertifikatBahasa'
        | 'penghasilanOrtu',
        string[]
    >;
    interests: { id: number; name: string }[];
};

type FormData = {
    [K in keyof Values]: Values[K] extends string[]
        ? string[]
        : Values[K] extends number[]
          ? number[]
          : string;
} & { cv: File | null; transkrip: File | null };

type SectionId = 'dokumen' | 'diri' | 'pendidikan' | 'prestasi' | 'beasiswa';

type Section = {
    id: SectionId;
    title: string;
    description: string;
    icon: LucideIcon;
    tone: Tone;
    /** Field names counted in the header and used to find errors. */
    fields: string[];
};

const SECTIONS: Section[] = [
    {
        id: 'dokumen',
        title: 'Dokumen',
        description: 'CV dan transkrip nilai',
        icon: FileText,
        tone: 'amber',
        fields: ['cv', 'transkrip'],
    },
    {
        id: 'diri',
        title: 'Data diri',
        description: 'Nama, tanggal lahir, kontak, domisili',
        icon: UserRound,
        tone: 'blue',
        fields: [
            'name',
            'tanggal_lahir',
            'jenis_kelamin',
            'no_whatsapp',
            'domisili',
        ],
    },
    {
        id: 'pendidikan',
        title: 'Pendidikan',
        description: 'Jenjang, kampus, jurusan, IPK',
        icon: GraduationCap,
        tone: 'teal',
        fields: ['pendidikan_terakhir', 'kampus', 'jurusan', 'semester', 'ipk'],
    },
    {
        id: 'prestasi',
        title: 'Prestasi & pengalaman',
        description: 'Prestasi, organisasi, sertifikat bahasa',
        icon: Trophy,
        tone: 'green',
        fields: ['prestasi', 'organisasi', 'sertifikat_bahasa', 'skor_bahasa'],
    },
    {
        id: 'beasiswa',
        title: 'Beasiswa yang dicari',
        description: 'Jenjang, lokasi, pendanaan, bidang minat',
        icon: Compass,
        tone: 'navy',
        fields: [
            'jenjang_tujuan',
            'lokasi_tujuan',
            'jenis_pendanaan',
            'interests',
            'penghasilan_ortu',
        ],
    },
];

const FLAG_NOTES: Record<string, string> = {
    ipk: 'Angka di CV kurang jelas. Samakan dengan transkrip.',
    skor_bahasa: 'Tidak ada di CV. Isi kalau punya sertifikat.',
};

export default function OnboardingProfile({
    method,
    values,
    aiFields,
    flaggedFields,
    cvName,
    options,
    interests,
}: Props) {
    const fromAi = method === 'ai';
    const form = useForm<FormData>({
        name: values.name ?? '',
        tanggal_lahir: values.tanggal_lahir ?? '',
        jenis_kelamin: values.jenis_kelamin ?? '',
        no_whatsapp: values.no_whatsapp ?? '',
        domisili: values.domisili ?? '',
        pendidikan_terakhir: values.pendidikan_terakhir ?? '',
        kampus: values.kampus ?? '',
        jurusan: values.jurusan ?? '',
        semester: values.semester?.toString() ?? '',
        ipk: values.ipk ?? '',
        prestasi: values.prestasi ?? [],
        organisasi: values.organisasi ?? [],
        sertifikat_bahasa: values.sertifikat_bahasa ?? '',
        skor_bahasa: values.skor_bahasa ?? '',
        jenjang_tujuan: values.jenjang_tujuan ?? [],
        lokasi_tujuan: values.lokasi_tujuan ?? [],
        jenis_pendanaan: values.jenis_pendanaan ?? '',
        penghasilan_ortu: values.penghasilan_ortu ?? '',
        interests: values.interests ?? [],
        cv: null,
        transkrip: null,
    });
    const { data, setData, errors, processing } = form;
    const errorKeys = Object.keys(errors);

    const isFilled = (field: string): boolean => {
        if (field === 'cv') return Boolean(data.cv || cvName);
        if (field === 'skor_bahasa' && data.sertifikat_bahasa === 'Belum punya')
            return true;

        const value = data[field as keyof FormData];

        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'string') return value.trim() !== '';

        return Boolean(value);
    };

    const progress = SECTIONS.map((section) => ({
        ...section,
        filled: section.fields.filter(isFilled).length,
        total: section.fields.length,
        hasError: section.fields.some((field) =>
            errorKeys.some(
                (key) => key === field || key.startsWith(`${field}.`),
            ),
        ),
        hasAi:
            fromAi &&
            section.fields.some(
                (field) =>
                    aiFields.includes(field) || flaggedFields.includes(field),
            ),
        hasFlag:
            fromAi && section.fields.some((f) => flaggedFields.includes(f)),
    }));
    const totalFilled = progress.reduce((sum, s) => sum + s.filled, 0);
    const totalFields = progress.reduce((sum, s) => sum + s.total, 0);

    // The stepper line towards "Selesai" fills up as the form fills up.
    setLayoutProps({ progress: totalFilled / totalFields });

    // Open the first part that still needs work.
    const [open, setOpen] = useState<SectionId | null>(
        () =>
            progress.find((s) => s.hasFlag)?.id ??
            progress.find((s) => s.filled < s.total)?.id ??
            'dokumen',
    );

    const tag = (field: string): FieldTag | undefined => {
        if (!fromAi) return undefined;
        if (flaggedFields.includes(field)) return 'flag';
        if (aiFields.includes(field)) return 'ai';

        return undefined;
    };

    const goTo = (id: SectionId) => {
        setOpen(id);
        window.setTimeout(
            () =>
                document
                    .getElementById(`${id}-trigger`)
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
            220,
        );
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(store().url, {
            forceFormData: true,
            replace: true,
            preserveScroll: true,
            onError: (formErrors) => {
                const keys = Object.keys(formErrors);
                const first = SECTIONS.find((section) =>
                    section.fields.some((field) =>
                        keys.some(
                            (key) =>
                                key === field || key.startsWith(`${field}.`),
                        ),
                    ),
                );

                if (!first) return;

                goTo(first.id);
                window.setTimeout(
                    () =>
                        document
                            .querySelector<HTMLElement>(
                                `#${first.id}-content [aria-invalid="true"]`,
                            )
                            ?.focus({ preventScroll: true }),
                    260,
                );
            },
        });
    };

    const nextOf = (current: SectionId): Section | undefined =>
        SECTIONS[SECTIONS.findIndex((s) => s.id === current) + 1];

    return (
        <>
            <Head title={fromAi ? 'Cek hasil dari AI' : 'Lengkapi profil'} />

            <h1 className="mt-16 text-center text-3xl font-extrabold tracking-tight sm:mt-[72px] sm:text-4xl">
                {fromAi ? 'Cek hasil dari AI' : 'Lengkapi profilmu'}
            </h1>
            <p className="mt-3 mb-10 max-w-md text-center text-[15px] leading-relaxed text-muted-foreground">
                {fromAi
                    ? 'Buka tiap bagian dan pastikan datanya benar sebelum disimpan.'
                    : 'Isi tiap bagian. Semakin lengkap, semakin akurat rekomendasinya.'}
            </p>

            <form
                onSubmit={submit}
                noValidate
                className="flex w-full max-w-[720px] flex-col gap-3"
            >
                {fromAi && (
                    <div
                        className={cn(
                            cardClass,
                            'mb-2 flex items-center gap-3.5 px-5 py-4',
                        )}
                    >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-navy-700 text-teal-200">
                            <Sparkles
                                className="size-[18px]"
                                strokeWidth={1.9}
                                aria-hidden="true"
                            />
                        </span>
                        <p className="text-[13px] leading-relaxed text-muted-foreground">
                            Kolom bertanda{' '}
                            <span className="font-bold text-teal-200">AI</span>{' '}
                            diisi dari CV.
                            {flaggedFields.length > 0 && (
                                <>
                                    {' '}
                                    <span className="font-bold text-warning">
                                        {flaggedFields.length} kolom
                                    </span>{' '}
                                    perlu kamu cek.
                                </>
                            )}
                        </p>
                    </div>
                )}

                {progress.map((section) => {
                    const next = nextOf(section.id);

                    return (
                        <SectionCard
                            key={section.id}
                            id={section.id}
                            icon={section.icon}
                            tone={section.tone}
                            title={section.title}
                            description={section.description}
                            filled={section.filled}
                            total={section.total}
                            hasError={section.hasError}
                            badge={
                                section.hasAi ? (
                                    <span
                                        className={cn(
                                            pillClass,
                                            section.hasFlag
                                                ? 'bg-warning/15 text-warning'
                                                : 'bg-navy-700 text-teal-200',
                                        )}
                                    >
                                        {section.hasFlag ? 'Cek lagi' : 'AI'}
                                    </span>
                                ) : undefined
                            }
                            open={open === section.id}
                            onOpenChange={(isOpen) =>
                                setOpen(isOpen ? section.id : null)
                            }
                        >
                            <div id={`${section.id}-content`}>
                                {renderSection(section.id)}
                                {next && (
                                    <div className="mt-6 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => goTo(next.id)}
                                            className="inline-flex cursor-pointer items-center gap-2 rounded-control px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
                                        >
                                            Lanjut ke {next.title}
                                            <ArrowRight
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </SectionCard>
                    );
                })}

                <div
                    className={cn(
                        cardClass,
                        'sticky bottom-4 z-10 mt-4 flex flex-col gap-4 border-border bg-card/95 p-4 backdrop-blur sm:flex-row sm:items-center sm:p-5',
                    )}
                >
                    <ProgressMeter
                        value={(totalFilled / totalFields) * 100}
                        label={`${totalFilled} dari ${totalFields} kolom terisi`}
                        className="flex-1"
                    />
                    <div className="flex items-center gap-3">
                        <Link
                            href={index()}
                            className="px-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Ganti cara
                        </Link>
                        <Button
                            type="submit"
                            disabled={processing}
                            className={cn(primaryButtonClass, 'flex-1')}
                        >
                            {processing && <Spinner />}
                            {processing ? 'Menyimpan...' : 'Simpan profil'}
                        </Button>
                    </div>
                </div>
            </form>
        </>
    );

    function renderSection(id: SectionId): ReactNode {
        switch (id) {
            case 'dokumen':
                return (
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FileDrop
                            id="cv"
                            label="CV"
                            hint="wajib"
                            accept=".pdf,.docx"
                            buttonLabel="Unggah CV (PDF/DOCX)"
                            existingName={cvName}
                            existingNote={
                                fromAi
                                    ? 'Dibaca AI'
                                    : 'Tersimpan sebagai lampiran'
                            }
                            file={data.cv}
                            onChange={(file) => setData('cv', file)}
                            error={errors.cv}
                            highlight={fromAi}
                        />
                        <FileDrop
                            id="transkrip"
                            label="Transkrip nilai"
                            hint="opsional"
                            accept=".pdf"
                            buttonLabel="Unggah transkrip (PDF)"
                            existingName={null}
                            file={data.transkrip}
                            onChange={(file) => setData('transkrip', file)}
                            error={errors.transkrip}
                        />
                    </div>
                );
            case 'diri':
                return (
                    <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
                        <Field
                            id="name"
                            label="Nama lengkap"
                            tag={tag('name')}
                            error={errors.name}
                            className="sm:col-span-2"
                        >
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                placeholder="Sesuai KTP"
                                autoComplete="name"
                                className={fieldClass}
                                aria-invalid={Boolean(errors.name)}
                            />
                        </Field>
                        <Field
                            id="tanggal_lahir"
                            label="Tanggal lahir"
                            tag={tag('tanggal_lahir')}
                            error={errors.tanggal_lahir}
                        >
                            <Input
                                id="tanggal_lahir"
                                type="date"
                                value={data.tanggal_lahir}
                                onChange={(e) =>
                                    setData('tanggal_lahir', e.target.value)
                                }
                                autoComplete="bday"
                                className={cn(
                                    fieldClass,
                                    '[color-scheme:dark]',
                                )}
                                aria-invalid={Boolean(errors.tanggal_lahir)}
                            />
                        </Field>
                        <Field
                            label="Jenis kelamin"
                            error={errors.jenis_kelamin}
                        >
                            <ChoiceChips
                                label="Jenis kelamin"
                                options={options.jenisKelamin}
                                selected={
                                    data.jenis_kelamin
                                        ? [data.jenis_kelamin]
                                        : []
                                }
                                onToggle={(value) =>
                                    setData('jenis_kelamin', value)
                                }
                                variant="segmented"
                                invalid={Boolean(errors.jenis_kelamin)}
                            />
                        </Field>
                        <Field
                            id="no_whatsapp"
                            label="No. WhatsApp"
                            tag={tag('no_whatsapp')}
                            error={errors.no_whatsapp}
                        >
                            <Input
                                id="no_whatsapp"
                                type="tel"
                                inputMode="tel"
                                value={data.no_whatsapp}
                                onChange={(e) =>
                                    setData('no_whatsapp', e.target.value)
                                }
                                placeholder="08xx xxxx xxxx"
                                autoComplete="tel"
                                className={fieldClass}
                                aria-invalid={Boolean(errors.no_whatsapp)}
                            />
                        </Field>
                        <Field
                            id="domisili"
                            label="Domisili"
                            tag={tag('domisili')}
                            error={errors.domisili}
                        >
                            <Input
                                id="domisili"
                                value={data.domisili}
                                onChange={(e) =>
                                    setData('domisili', e.target.value)
                                }
                                placeholder="Kota, provinsi"
                                autoComplete="address-level2"
                                className={fieldClass}
                                aria-invalid={Boolean(errors.domisili)}
                            />
                        </Field>
                    </div>
                );
            case 'pendidikan':
                return (
                    <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
                        <Field
                            label="Jenjang saat ini"
                            tag={tag('pendidikan_terakhir')}
                            error={errors.pendidikan_terakhir}
                            className="sm:col-span-2"
                        >
                            <ChoiceChips
                                label="Jenjang saat ini"
                                options={options.jenjangSaatIni}
                                selected={
                                    data.pendidikan_terakhir
                                        ? [data.pendidikan_terakhir]
                                        : []
                                }
                                onToggle={(value) =>
                                    setData('pendidikan_terakhir', value)
                                }
                                variant="segmented"
                                invalid={Boolean(errors.pendidikan_terakhir)}
                            />
                        </Field>
                        <Field
                            id="kampus"
                            label="Universitas / sekolah"
                            tag={tag('kampus')}
                            error={errors.kampus}
                            className="sm:col-span-2"
                        >
                            <Input
                                id="kampus"
                                value={data.kampus}
                                onChange={(e) =>
                                    setData('kampus', e.target.value)
                                }
                                placeholder="Nama kampus atau sekolah"
                                autoComplete="organization"
                                className={fieldClass}
                                aria-invalid={Boolean(errors.kampus)}
                            />
                        </Field>
                        <Field
                            id="jurusan"
                            label="Program studi / jurusan"
                            tag={tag('jurusan')}
                            error={errors.jurusan}
                            className="sm:col-span-2"
                        >
                            <Input
                                id="jurusan"
                                value={data.jurusan}
                                onChange={(e) =>
                                    setData('jurusan', e.target.value)
                                }
                                placeholder="Contoh: Teknik Informatika"
                                className={fieldClass}
                                aria-invalid={Boolean(errors.jurusan)}
                            />
                        </Field>
                        <Field
                            id="semester"
                            label="Semester"
                            hint="opsional"
                            tag={tag('semester')}
                            error={errors.semester}
                        >
                            <Input
                                id="semester"
                                type="number"
                                inputMode="numeric"
                                min={1}
                                max={14}
                                value={data.semester}
                                onChange={(e) =>
                                    setData('semester', e.target.value)
                                }
                                placeholder="Contoh: 5"
                                className={fieldClass}
                                aria-invalid={Boolean(errors.semester)}
                            />
                        </Field>
                        <Field
                            id="ipk"
                            label="IPK / nilai rata-rata"
                            hint="opsional"
                            tag={tag('ipk')}
                            note={
                                tag('ipk') === 'flag'
                                    ? FLAG_NOTES.ipk
                                    : undefined
                            }
                            error={errors.ipk}
                        >
                            <Input
                                id="ipk"
                                inputMode="decimal"
                                value={data.ipk}
                                onChange={(e) => setData('ipk', e.target.value)}
                                placeholder="0.00 – 4.00"
                                className={cn(
                                    fieldClass,
                                    tag('ipk') === 'flag' &&
                                        'border-warning hover:border-warning',
                                )}
                                aria-invalid={Boolean(errors.ipk)}
                            />
                        </Field>
                    </div>
                );
            case 'prestasi':
                return (
                    <div className="flex flex-col gap-5">
                        <Field
                            id="prestasi"
                            label="Prestasi"
                            hint="opsional"
                            tag={tag('prestasi')}
                            error={errors.prestasi}
                        >
                            <TagInput
                                id="prestasi"
                                items={data.prestasi}
                                onChange={(items) => setData('prestasi', items)}
                                placeholder="Contoh: Juara 1 lomba karya tulis"
                            />
                        </Field>
                        <Field
                            id="organisasi"
                            label="Organisasi & kepanitiaan"
                            hint="opsional"
                            tag={tag('organisasi')}
                            error={errors.organisasi}
                        >
                            <TagInput
                                id="organisasi"
                                items={data.organisasi}
                                onChange={(items) =>
                                    setData('organisasi', items)
                                }
                                placeholder="Contoh: Ketua BEM"
                            />
                        </Field>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field
                                id="sertifikat_bahasa"
                                label="Sertifikat bahasa"
                                hint="opsional"
                                error={errors.sertifikat_bahasa}
                            >
                                <NativeSelect
                                    id="sertifikat_bahasa"
                                    value={data.sertifikat_bahasa}
                                    onChange={(value) =>
                                        setData('sertifikat_bahasa', value)
                                    }
                                    placeholder="Pilih sertifikat"
                                    options={options.sertifikatBahasa}
                                />
                            </Field>
                            <Field
                                id="skor_bahasa"
                                label="Skor"
                                tag={tag('skor_bahasa')}
                                flagLabel="Tidak ditemukan"
                                note={
                                    tag('skor_bahasa') === 'flag'
                                        ? FLAG_NOTES.skor_bahasa
                                        : undefined
                                }
                                error={errors.skor_bahasa}
                            >
                                <Input
                                    id="skor_bahasa"
                                    value={data.skor_bahasa}
                                    onChange={(e) =>
                                        setData('skor_bahasa', e.target.value)
                                    }
                                    placeholder="Contoh: 550"
                                    disabled={
                                        data.sertifikat_bahasa === 'Belum punya'
                                    }
                                    className={cn(
                                        fieldClass,
                                        tag('skor_bahasa') === 'flag' &&
                                            'border-warning hover:border-warning',
                                    )}
                                    aria-invalid={Boolean(errors.skor_bahasa)}
                                />
                            </Field>
                        </div>
                    </div>
                );
            case 'beasiswa':
                return (
                    <div className="flex flex-col gap-5">
                        <Field
                            label="Jenjang tujuan"
                            hint="boleh lebih dari satu"
                            error={errors.jenjang_tujuan}
                        >
                            <ChoiceChips
                                label="Jenjang tujuan"
                                options={options.jenjangTujuan}
                                selected={data.jenjang_tujuan}
                                onToggle={(value) =>
                                    setData(
                                        'jenjang_tujuan',
                                        toggle(data.jenjang_tujuan, value),
                                    )
                                }
                                multiple
                                invalid={Boolean(errors.jenjang_tujuan)}
                            />
                        </Field>
                        <Field
                            label="Lokasi"
                            hint="boleh lebih dari satu"
                            error={errors.lokasi_tujuan}
                        >
                            <ChoiceChips
                                label="Lokasi"
                                options={options.lokasiTujuan}
                                selected={data.lokasi_tujuan}
                                onToggle={(value) =>
                                    setData(
                                        'lokasi_tujuan',
                                        toggle(data.lokasi_tujuan, value),
                                    )
                                }
                                multiple
                                invalid={Boolean(errors.lokasi_tujuan)}
                            />
                        </Field>
                        <Field
                            label="Jenis pendanaan"
                            error={errors.jenis_pendanaan}
                        >
                            <ChoiceChips
                                label="Jenis pendanaan"
                                options={options.jenisPendanaan}
                                selected={
                                    data.jenis_pendanaan
                                        ? [data.jenis_pendanaan]
                                        : []
                                }
                                onToggle={(value) =>
                                    setData('jenis_pendanaan', value)
                                }
                                invalid={Boolean(errors.jenis_pendanaan)}
                            />
                        </Field>
                        <Field
                            label="Bidang minat"
                            hint="boleh lebih dari satu"
                            error={errors.interests}
                        >
                            <ChoiceChips
                                label="Bidang minat"
                                options={interests.map((item) => item.name)}
                                selected={interests
                                    .filter((item) =>
                                        data.interests.includes(item.id),
                                    )
                                    .map((item) => item.name)}
                                onToggle={(name) => {
                                    const id = interests.find(
                                        (item) => item.name === name,
                                    )?.id;

                                    if (id !== undefined) {
                                        setData(
                                            'interests',
                                            toggle(data.interests, id),
                                        );
                                    }
                                }}
                                multiple
                                invalid={Boolean(errors.interests)}
                            />
                        </Field>
                        <Field
                            id="penghasilan_ortu"
                            label="Penghasilan orang tua per bulan"
                            hint="opsional"
                            note="Dipakai untuk mencocokkan beasiswa berbasis kebutuhan ekonomi."
                            noteTone="muted"
                            error={errors.penghasilan_ortu}
                        >
                            <NativeSelect
                                id="penghasilan_ortu"
                                value={data.penghasilan_ortu}
                                onChange={(value) =>
                                    setData('penghasilan_ortu', value)
                                }
                                placeholder="Pilih rentang"
                                options={options.penghasilanOrtu}
                            />
                        </Field>
                    </div>
                );
        }
    }
}

function toggle<T>(list: T[], value: T): T[] {
    return list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value];
}
