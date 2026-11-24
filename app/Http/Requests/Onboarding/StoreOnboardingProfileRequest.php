<?php

namespace App\Http\Requests\Onboarding;

use App\Support\OnboardingOptions;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOnboardingProfileRequest extends FormRequest
{
    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $hasCv = $this->user()?->cv_path !== null;

        return [
            'cv' => [$hasCv ? 'nullable' : 'required', 'file', 'mimes:pdf,docx', 'max:5120'],
            'transkrip' => ['nullable', 'file', 'mimes:pdf', 'max:5120'],

            'name' => ['required', 'string', 'max:255'],
            'tanggal_lahir' => ['required', 'date', 'before:today'],
            'jenis_kelamin' => ['required', Rule::in(OnboardingOptions::JENIS_KELAMIN)],
            'no_whatsapp' => ['required', 'string', 'regex:/^(\+62|62|0)8[0-9]{7,12}$/'],
            'domisili' => ['required', 'string', 'max:255'],

            'pendidikan_terakhir' => ['required', Rule::in(OnboardingOptions::JENJANG_SAAT_INI)],
            'kampus' => ['required', 'string', 'max:255'],
            'jurusan' => ['required', 'string', 'max:255'],
            'semester' => ['nullable', 'integer', 'between:1,14'],
            'ipk' => ['nullable', 'numeric', 'between:0,4'],

            'prestasi' => ['nullable', 'array', 'max:10'],
            'prestasi.*' => ['string', 'max:150'],
            'organisasi' => ['nullable', 'array', 'max:10'],
            'organisasi.*' => ['string', 'max:150'],
            'sertifikat_bahasa' => ['nullable', Rule::in(OnboardingOptions::SERTIFIKAT_BAHASA)],
            'skor_bahasa' => ['nullable', 'string', 'max:20'],

            'jenjang_tujuan' => ['required', 'array', 'min:1'],
            'jenjang_tujuan.*' => [Rule::in(OnboardingOptions::JENJANG_TUJUAN)],
            'lokasi_tujuan' => ['required', 'array', 'min:1'],
            'lokasi_tujuan.*' => [Rule::in(OnboardingOptions::LOKASI_TUJUAN)],
            'jenis_pendanaan' => ['required', Rule::in(OnboardingOptions::JENIS_PENDANAAN)],
            'interests' => ['required', 'array', 'min:1'],
            'interests.*' => ['integer', 'exists:interests,id'],
            'penghasilan_ortu' => ['nullable', Rule::in(OnboardingOptions::PENGHASILAN_ORTU)],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'cv' => 'CV',
            'transkrip' => 'transkrip',
            'tanggal_lahir' => 'tanggal lahir',
            'jenis_kelamin' => 'jenis kelamin',
            'no_whatsapp' => 'nomor WhatsApp',
            'domisili' => 'domisili',
            'pendidikan_terakhir' => 'jenjang saat ini',
            'kampus' => 'universitas/sekolah',
            'jurusan' => 'program studi',
            'ipk' => 'IPK',
            'skor_bahasa' => 'skor',
            'jenjang_tujuan' => 'jenjang tujuan',
            'lokasi_tujuan' => 'lokasi',
            'jenis_pendanaan' => 'jenis pendanaan',
            'interests' => 'bidang minat',
            'penghasilan_ortu' => 'penghasilan orang tua',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'no_whatsapp.regex' => 'Nomor WhatsApp tidak valid. Contoh: 081234567890.',
            'jenjang_tujuan.required' => 'Pilih minimal satu jenjang tujuan.',
            'lokasi_tujuan.required' => 'Pilih minimal satu lokasi.',
            'interests.required' => 'Pilih minimal satu bidang minat.',
            'cv.required' => 'Unggah CV kamu dulu.',
        ];
    }
}
