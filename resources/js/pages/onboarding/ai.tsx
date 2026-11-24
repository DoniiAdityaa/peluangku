import { Head, Link, router, useForm } from '@inertiajs/react';
import { Check, FileText, LockKeyhole, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import InputError from '@/components/input-error';
import LottieAnimation from '@/components/lottie-animation';
import { cardClass } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { index, profile } from '@/routes/onboarding';
import { parse } from '@/routes/onboarding/ai';

type Result = { filled: number; flagged: number } | null;
type Stage = 'upload' | 'reading' | 'done';

const STEPS = [
    'Membaca dokumen',
    'Mengenali data diri',
    'Mengenali pendidikan',
    'Mengenali prestasi & pengalaman',
];
const STEP_MS = 700;
const MAX_BYTES = 5 * 1024 * 1024;

export default function OnboardingAi({ result }: { result: Result }) {
    const form = useForm<{ cv: File | null }>({ cv: null });
    const input = useRef<HTMLInputElement>(null);
    const [stage, setStage] = useState<Stage>('upload');
    const [step, setStep] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [clientError, setClientError] = useState<string>();
    const [fileName, setFileName] = useState('CV');

    // Walk through the checklist while the CV is being read.
    useEffect(() => {
        if (stage !== 'reading') return;

        const timer = window.setInterval(
            () => setStep((current) => Math.min(current + 1, STEPS.length - 1)),
            STEP_MS,
        );

        return () => window.clearInterval(timer);
    }, [stage]);

    // Finish once the server has answered and the checklist reached the end.
    useEffect(() => {
        if (stage === 'reading' && result && step === STEPS.length - 1) {
            const timer = window.setTimeout(() => setStage('done'), STEP_MS);

            return () => window.clearTimeout(timer);
        }
    }, [stage, result, step]);

    // Then go straight to the form to review what the AI filled in.
    useEffect(() => {
        if (stage !== 'done') return;

        const timer = window.setTimeout(
            () =>
                router.visit(profile({ query: { sumber: 'ai' } }), {
                    replace: true,
                }),
            1600,
        );

        return () => window.clearTimeout(timer);
    }, [stage]);

    const upload = (file: File | undefined) => {
        if (!file) return;

        const extension = file.name.split('.').pop()?.toLowerCase();

        if (!['pdf', 'docx'].includes(extension ?? '')) {
            setClientError('Format CV harus PDF atau DOCX.');

            return;
        }

        if (file.size > MAX_BYTES) {
            setClientError('Ukuran CV maksimal 5 MB.');

            return;
        }

        setClientError(undefined);
        setFileName(file.name);
        setStep(0);
        setStage('reading');
        form.transform(() => ({ cv: file }));
        form.post(parse().url, {
            forceFormData: true,
            preserveState: true,
            preserveScroll: true,
            onError: () => setStage('upload'),
        });
    };

    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        upload(event.target.files?.[0]);
        event.target.value = '';
    };

    const onDrop = (event: DragEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setDragging(false);
        upload(event.dataTransfer.files?.[0]);
    };

    const copy = {
        upload: [
            'Unggah CV kamu',
            'AI akan membaca CV dan mengisi formulir profil untukmu.',
        ],
        reading: ['AI sedang membaca CV…', 'Biasanya kurang dari satu menit.'],
        done: [
            'CV selesai dibaca',
            result
                ? `${result.filled} kolom terisi. Sebentar lagi kamu bisa mengeceknya.`
                : 'Sebentar lagi kamu bisa mengeceknya.',
        ],
    }[stage];

    return (
        <>
            <Head title="Isi profil dengan AI" />

            <h1
                className="mt-16 text-center text-3xl font-extrabold tracking-tight sm:mt-[72px] sm:text-4xl"
                aria-live="polite"
            >
                {copy[0]}
            </h1>
            <p className="mt-3 mb-10 text-center text-[15px] leading-relaxed text-muted-foreground">
                {copy[1]}
            </p>

            <div className="w-full max-w-[560px]">
                {stage === 'upload' ? (
                    <>
                        <input
                            ref={input}
                            type="file"
                            accept=".pdf,.docx"
                            className="sr-only"
                            tabIndex={-1}
                            onChange={onChange}
                            aria-label="Pilih file CV"
                        />
                        <button
                            type="button"
                            onClick={() => input.current?.click()}
                            onDragOver={(event) => {
                                event.preventDefault();
                                setDragging(true);
                            }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={onDrop}
                            className={cn(
                                'flex w-full cursor-pointer flex-col items-center gap-4 rounded-card border-[1.5px] border-dashed border-border bg-card px-8 py-12 shadow-card transition-colors hover:border-primary focus-visible:border-primary focus-visible:outline-none',
                                dragging && 'border-primary bg-navy-900/40',
                            )}
                        >
                            <span className="flex size-14 items-center justify-center rounded-full bg-navy-700 text-teal-200">
                                <Upload
                                    className="size-6"
                                    strokeWidth={1.8}
                                    aria-hidden="true"
                                />
                            </span>
                            <span className="text-[15px] font-semibold">
                                Tarik CV ke sini atau{' '}
                                <span className="text-primary">pilih file</span>
                            </span>
                            <span className="text-xs text-muted-foreground">
                                PDF atau DOCX · maks. 5 MB
                            </span>
                        </button>
                        <InputError
                            message={clientError ?? form.errors.cv}
                            className="mt-3 text-center"
                        />
                    </>
                ) : (
                    <div className={cn(cardClass, 'flex flex-col gap-6 p-7')}>
                        <LottieAnimation
                            key={stage}
                            src={`/animation/peluangku-${stage === 'done' ? 'lolos' : 'cari'}.json`}
                            loop={stage !== 'done'}
                            className="mx-auto w-40"
                        />

                        <div className="flex items-center gap-3.5">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-control bg-muted">
                                <FileText
                                    className="size-5 text-muted-foreground"
                                    strokeWidth={1.8}
                                    aria-hidden="true"
                                />
                            </span>
                            <p className="min-w-0 flex-1 truncate text-sm font-semibold">
                                {fileName}
                            </p>
                            <span
                                className={cn(
                                    'text-[13px] font-semibold',
                                    stage === 'done'
                                        ? 'text-primary'
                                        : 'text-muted-foreground',
                                )}
                            >
                                {stage === 'done'
                                    ? '100%'
                                    : `${Math.round(((step + 1) / (STEPS.length + 1)) * 100)}%`}
                            </span>
                        </div>

                        <ul
                            className="flex flex-col gap-3.5"
                            aria-live="polite"
                        >
                            {STEPS.map((label, index) => {
                                const done = stage === 'done' || index < step;
                                const active =
                                    stage === 'reading' && index === step;

                                return (
                                    <li
                                        key={label}
                                        className={cn(
                                            'flex items-center gap-3 text-sm',
                                            done || active
                                                ? 'text-foreground'
                                                : 'text-muted-foreground',
                                        )}
                                    >
                                        <span className="flex size-[18px] items-center justify-center">
                                            {done && (
                                                <Check
                                                    className="size-[18px] text-primary"
                                                    strokeWidth={2.5}
                                                    aria-hidden="true"
                                                />
                                            )}
                                            {active && (
                                                <span className="size-4 animate-spin rounded-full border-2 border-teal-200 border-t-transparent" />
                                            )}
                                            {!done && !active && (
                                                <span className="size-1.5 rounded-full bg-border" />
                                            )}
                                        </span>
                                        {label}
                                        {done && (
                                            <span className="sr-only">
                                                {' '}
                                                selesai
                                            </span>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}

                <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <LockKeyhole className="size-3.5" aria-hidden="true" />
                    CV hanya dipakai untuk mengisi profilmu.
                </p>
                {stage === 'upload' && (
                    <p className="mt-2 text-center text-[13px]">
                        <Link
                            href={index()}
                            className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Ganti cara
                        </Link>
                    </p>
                )}
            </div>
        </>
    );
}
