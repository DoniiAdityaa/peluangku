<?php

namespace Database\Seeders;

use App\Models\Scholarship;
use Illuminate\Database\Seeder;

/**
 * Sample scholarships in Indonesia for the demo (Peluangku is domestic only).
 *
 * Program names and links point at real providers, but the requirements and
 * deadlines here are made up (deadlines are relative to the day you seed).
 * Check every entry against the official source before showing it as fact.
 */
class ScholarshipSeeder extends Seeder
{
    public function run(): void
    {
        $providerLogos = [
            'BCA' => '/images/providers/bca.svg',
            'LPDP' => '/images/providers/lpdp.svg',
            'Kemendikbudristek' => '/images/providers/kemendikbud.svg',
            'Djarum Foundation' => '/images/providers/djarum.svg',
            'Tanoto Foundation' => '/images/providers/tanoto.svg',
            'Bank Indonesia' => '/images/providers/bi.svg',
            'Pertamina Foundation' => '/images/providers/pertamina.svg',
            'BAZNAS' => '/images/providers/baznas.svg',
            'Yayasan KSE' => '/images/providers/kse.svg',
            'VDMI' => '/images/providers/vdmi.svg',
            'Pemprov Jawa Tengah' => '/images/providers/pemprov-jateng.svg',
            'Pemkot Surabaya' => '/images/providers/pemkot-surabaya.svg',
            'Pemprov Jawa Barat' => '/images/providers/pemprov-jabar.svg',
            'Pemprov DKI Jakarta' => '/images/providers/pemprov-dki.svg',
            'Yayasan contoh' => '/images/providers/yayasan.svg',
        ];

        foreach ($this->scholarships() as [$name, $provider, $levels, $majors, $region, $funding, $minGpa, $language, $days, $link, $description]) {
            Scholarship::query()->updateOrCreate(['scholarship_name' => $name], [
                'provider' => $provider,
                'levels' => $levels,
                'major' => $majors === [] ? null : implode(', ', $majors),
                'location' => 'Dalam negeri',
                'region' => $region,
                'funding' => $funding,
                'min_gpa' => $minGpa,
                'language_requirement' => $language,
                'deadline' => today()->addDays($days),
                'link' => $link,
                'description' => $description,
                'image' => $providerLogos[$provider] ?? null,
            ]);
        }
    }

    /**
     * scholarship_name, provider, levels, majors ([] = all majors), region
     * (null = nationwide), funding, minimum GPA, language requirement,
     * deadline (days from now), link, description.
     *
     * @return list<array{string, string, list<string>, list<string>, ?string, string, ?string, ?string, int, string, string}>
     */
    private function scholarships(): array
    {
        return [
            ['LPDP Beasiswa Reguler Dalam Negeri', 'LPDP', ['S2', 'S3'], [], null, 'Penuh', '3.00', 'TOEFL ITP', 5, 'https://lpdp.kemenkeu.go.id', 'Biaya kuliah, hidup, dan riset untuk studi magister dan doktor di kampus dalam negeri.'],
            ['LPDP Beasiswa Afirmasi', 'LPDP', ['S2'], [], null, 'Penuh', '2.75', 'TOEFL ITP', 21, 'https://lpdp.kemenkeu.go.id', 'Untuk putra-putri daerah afirmasi, penyandang disabilitas, dan keluarga prasejahtera.'],
            ['Beasiswa Pendidikan Indonesia Dalam Negeri', 'Kemendikbudristek', ['S2', 'S3'], ['Pendidikan', 'Sains dan Riset'], null, 'Penuh', '3.25', 'TOEFL ITP', 29, 'https://kemdikbud.go.id', 'Untuk dosen, guru, dan tenaga kependidikan yang melanjutkan studi.'],
            ['Beasiswa Unggulan Masyarakat Berprestasi', 'Kemendikbudristek', ['S1', 'S2'], [], null, 'Penuh', '3.25', null, 2, 'https://beasiswaunggulan.kemdikbud.go.id', 'Untuk mahasiswa berprestasi akademik maupun non-akademik.'],
            ['KIP Kuliah Merdeka', 'Kemendikbudristek', ['S1'], [], null, 'Penuh', null, null, 12, 'https://kip-kuliah.kemdikbud.go.id', 'Bantuan biaya pendidikan dan hidup untuk mahasiswa dari keluarga kurang mampu.'],
            ['Beasiswa Riset Kampus Merdeka', 'Kemendikbudristek', ['S1'], ['Sains dan Riset', 'Teknologi Informasi', 'Kesehatan'], null, 'Sebagian', '3.25', null, 14, 'https://kampusmerdeka.kemdikbud.go.id', 'Dana riset dan uang saku untuk mahasiswa yang ikut proyek penelitian.'],
            ['Beasiswa Seni dan Budaya Nusantara', 'Kemendikbudristek', ['S1'], ['Seni dan Budaya', 'Komunikasi dan Media'], null, 'Sebagian', '2.75', null, 18, 'https://kemdikbud.go.id', 'Untuk mahasiswa yang aktif melestarikan seni dan budaya daerah.'],
            ['Djarum Beasiswa Plus', 'Djarum Foundation', ['S1'], [], null, 'Sebagian', '3.00', null, 6, 'https://djarumbeasiswaplus.org', 'Bantuan dana kuliah plus pelatihan soft skill untuk mahasiswa semester 4.'],
            ['Tanoto TELADAN', 'Tanoto Foundation', ['S1'], [], null, 'Penuh', '3.00', null, 9, 'https://www.tanotofoundation.org', 'Beasiswa dan program kepemimpinan untuk mahasiswa di kampus mitra.'],
            ['Beasiswa Bank Indonesia', 'Bank Indonesia', ['S1'], ['Ekonomi dan Bisnis', 'Teknologi Informasi', 'Hukum dan Kebijakan Publik'], null, 'Sebagian', '3.00', null, 15, 'https://www.bi.go.id', 'Bantuan biaya pendidikan dan pembinaan melalui komunitas GenBI.'],
            ['Pertamina Sobat Bumi', 'Pertamina Foundation', ['S1'], ['Lingkungan dan Energi', 'Teknik dan Infrastruktur', 'Sains dan Riset'], null, 'Sebagian', '3.00', null, 22, 'https://pertaminafoundation.org', 'Untuk mahasiswa yang peduli isu energi dan lingkungan.'],
            ['Beasiswa Cendekia BAZNAS', 'BAZNAS', ['S1'], [], null, 'Sebagian', '3.00', null, 27, 'https://baznas.go.id', 'Bantuan biaya kuliah untuk mahasiswa dari keluarga prasejahtera.'],
            ['Bakti BCA Beasiswa', 'BCA', ['S1'], ['Ekonomi dan Bisnis', 'Teknologi Informasi'], null, 'Penuh', '3.00', null, 40, 'https://www.bca.co.id', 'Program pendidikan dengan ikatan kerja setelah lulus.'],
            ['Beasiswa Karya Salemba Empat', 'Yayasan KSE', ['S1'], [], null, 'Sebagian', '3.00', null, 10, 'https://www.kse.or.id', 'Bantuan biaya kuliah dan pengembangan diri lewat paguyuban di kampus.'],
            ['Beasiswa Van Deventer-Maas Indonesia', 'VDMI', ['S1'], [], null, 'Sebagian', '3.00', null, 33, 'https://www.vdmi.or.id', 'Bantuan biaya kuliah dan pendampingan untuk mahasiswa berprestasi yang membutuhkan.'],
            ['Beasiswa Prestasi Jawa Tengah', 'Pemprov Jawa Tengah', ['S1'], [], 'Jawa Tengah', 'Sebagian', '3.25', null, 4, 'https://jatengprov.go.id', 'Bantuan biaya pendidikan untuk mahasiswa ber-KTP Jawa Tengah.'],
            ['Beasiswa Pemuda Tangguh Surabaya', 'Pemkot Surabaya', ['S1'], [], 'Jawa Timur', 'Penuh', null, null, 11, 'https://surabaya.go.id', 'Untuk warga Surabaya yang kuliah di kampus mitra.'],
            ['Jabar Future Leaders Scholarship', 'Pemprov Jawa Barat', ['S1', 'S2'], [], 'Jawa Barat', 'Penuh', '3.00', null, 24, 'https://jabarprov.go.id', 'Untuk mahasiswa ber-KTP Jawa Barat yang aktif berorganisasi.'],
            ['KJMU DKI Jakarta', 'Pemprov DKI Jakarta', ['S1'], [], 'DKI Jakarta', 'Sebagian', null, null, 16, 'https://jakarta.go.id', 'Bantuan biaya pendidikan untuk mahasiswa dari keluarga tidak mampu di Jakarta.'],
            ['Beasiswa Kader Surya Kepemimpinan', 'Yayasan contoh', ['S1'], ['Kepemimpinan dan Organisasi', 'Sosial dan Pemberdayaan Masyarakat'], null, 'Sebagian', '3.00', null, -3, 'https://kemdikbud.go.id', 'Contoh beasiswa yang sudah tutup, tidak tampil di rekomendasi.'],
        ];
    }
}
