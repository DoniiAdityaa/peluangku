<?php

namespace App\Http\Requests\Onboarding;

use App\Models\Certificate;
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
        return [
            'cv' => ['nullable', 'file', 'mimes:pdf,docx', 'max:5120'],
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
            'ipk' => ['nullable', 'numeric', 'decimal:0,2', 'between:0,4'],

            'prestasi' => ['nullable', 'array', 'max:10'],
            'prestasi.*' => ['string', 'max:150'],
            'organisasi' => ['nullable', 'array', 'max:10'],
            'organisasi.*' => ['string', 'max:150'],
            // A listed certificate, or the name typed after picking "Lainnya".
            'sertifikat_bahasa' => ['nullable', 'string', 'max:100', Rule::notIn(['Lainnya'])],
            'skor_bahasa' => ['nullable', 'string', 'max:20'],

            // Kept certificates send their id; new ones send a file.
            'certificates' => ['nullable', 'array', 'max:'.Certificate::MAX_PER_USER],
            'certificates.*.id' => ['nullable', 'integer', Rule::exists('certificates', 'id')->where('user_id', $this->user()?->id)],
            'certificates.*.name' => ['required', 'string', 'max:150'],
            'certificates.*.file' => ['nullable', 'required_without:certificates.*.id', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],

            'jenjang_tujuan' => ['required', 'array', 'min:1'],
            'jenjang_tujuan.*' => [Rule::in(OnboardingOptions::JENJANG_TUJUAN)],
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
            'kampus' => 'universitas',
            'semester' => 'semester',
            'sertifikat_bahasa' => 'sertifikat bahasa',
            'jurusan' => 'program studi',
            'ipk' => 'IPK',
            'skor_bahasa' => 'skor',
            'jenjang_tujuan' => 'jenjang tujuan',
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
            'interests.required' => 'Pilih minimal satu bidang minat.',
            'ipk.between' => 'IPK harus di antara 0.00 dan 4.00.',
            'ipk.decimal' => 'IPK maksimal dua angka di belakang koma.',
            'semester.between' => 'Semester harus di antara 1 dan 14.',
            'sertifikat_bahasa.not_in' => 'Tulis nama sertifikatnya.',
            'certificates.max' => 'Maksimal '.Certificate::MAX_PER_USER.' sertifikat.',
            'certificates.*.name.required' => 'Beri nama sertifikatnya.',
            'certificates.*.file.required_without' => 'Pilih file sertifikatnya.',
            'certificates.*.file.mimes' => 'Sertifikat harus berupa JPG, PNG, atau PDF.',
            'certificates.*.file.max' => 'Ukuran sertifikat maksimal 5 MB.',
        ];
    }
}
