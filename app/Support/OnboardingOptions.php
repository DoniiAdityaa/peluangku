<?php

namespace App\Support;

/**
 * Choices offered on the onboarding profile form.
 *
 * The same lists drive validation and the options shown in the UI.
 */
final class OnboardingOptions
{
    public const JENIS_KELAMIN = ['Laki-laki', 'Perempuan'];

    public const JENJANG_SAAT_INI = ['D3/D4', 'S1', 'S2'];

    public const JENJANG_TUJUAN = ['S1', 'S2', 'S3', 'Non-gelar'];

    public const JENIS_PENDANAAN = ['Penuh', 'Sebagian', 'Semua'];

    /** "Lainnya" is added by the dropdown; people then type the certificate name. */
    public const SERTIFIKAT_BAHASA = ['Belum punya', 'TOEFL ITP', 'TOEFL iBT', 'IELTS'];

    public const PENGHASILAN_ORTU = ['< Rp2 juta', 'Rp2–5 juta', 'Rp5–10 juta', '> Rp10 juta'];

    /**
     * @return array<string, list<string>>
     */
    public static function all(): array
    {
        return [
            'jenisKelamin' => self::JENIS_KELAMIN,
            'jenjangSaatIni' => self::JENJANG_SAAT_INI,
            'jenjangTujuan' => self::JENJANG_TUJUAN,
            'jenisPendanaan' => self::JENIS_PENDANAAN,
            'sertifikatBahasa' => self::SERTIFIKAT_BAHASA,
            'penghasilanOrtu' => self::PENGHASILAN_ORTU,
        ];
    }
}
