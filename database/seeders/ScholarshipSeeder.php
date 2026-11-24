<?php

namespace Database\Seeders;

use App\Models\Scholarship;
use Illuminate\Database\Seeder;

/**
 * Sample scholarships for the demo.
 *
 * Program names and links point at real providers, but the requirements and
 * deadlines here are made up (deadlines are relative to the day you seed).
 * Check every entry against the official source before showing it as fact.
 */
class ScholarshipSeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->scholarships() as [$name, $provider, $levels, $majors, $location, $region, $funding, $minGpa, $language, $days, $link, $description]) {
            Scholarship::query()->updateOrCreate(['scholarship_name' => $name], [
                'provider' => $provider,
                'levels' => $levels,
                'major' => $majors === [] ? null : implode(', ', $majors),
                'location' => $location,
                'region' => $region,
                'funding' => $funding,
                'min_gpa' => $minGpa,
                'language_requirement' => $language,
                'deadline' => today()->addDays($days),
                'link' => $link,
                'description' => $description,
            ]);
        }
    }

    /**
     * scholarship_name, provider, levels, majors ([] = all majors), location,
     * region, funding, minimum GPA, language requirement, deadline (days from
     * now), link, description.
     *
     * @return list<array{string, string, list<string>, list<string>, string, ?string, string, ?string, ?string, int, string, string}>
     */
    private function scholarships(): array
    {
        return [
            ['LPDP Beasiswa Reguler Dalam Negeri', 'LPDP', ['S2', 'S3'], [], 'Dalam negeri', null, 'Penuh', '3.00', 'TOEFL ITP', 5, 'https://lpdp.kemenkeu.go.id', 'Biaya kuliah, hidup, dan riset untuk studi magister dan doktor di kampus dalam negeri.'],
            ['LPDP Beasiswa Reguler Luar Negeri', 'LPDP', ['S2', 'S3'], [], 'Luar negeri', null, 'Penuh', '3.00', 'IELTS', 19, 'https://lpdp.kemenkeu.go.id', 'Pendanaan penuh untuk magister dan doktor di kampus mitra luar negeri.'],
            ['LPDP Beasiswa Targeted Teknologi Digital', 'LPDP', ['S2'], ['Teknologi Informasi', 'Sains dan Riset'], 'Luar negeri', null, 'Penuh', '3.25', 'IELTS', 33, 'https://lpdp.kemenkeu.go.id', 'Untuk bidang prioritas teknologi digital, AI, dan keamanan siber.'],
            ['Beasiswa Unggulan Masyarakat Berprestasi', 'Kemendikbudristek', ['S1', 'S2'], [], 'Dalam negeri', null, 'Penuh', '3.25', null, 2, 'https://beasiswaunggulan.kemdikbud.go.id', 'Untuk mahasiswa berprestasi akademik maupun non-akademik.'],
            ['KIP Kuliah Merdeka', 'Kemendikbudristek', ['S1'], [], 'Dalam negeri', null, 'Penuh', null, null, 12, 'https://kip-kuliah.kemdikbud.go.id', 'Bantuan biaya pendidikan dan hidup untuk mahasiswa dari keluarga kurang mampu.'],
            ['Djarum Beasiswa Plus', 'Djarum Foundation', ['S1'], [], 'Dalam negeri', null, 'Sebagian', '3.00', null, 6, 'https://djarumbeasiswaplus.org', 'Bantuan dana kuliah plus pelatihan soft skill untuk mahasiswa semester 4.'],
            ['Tanoto TELADAN', 'Tanoto Foundation', ['S1'], [], 'Dalam negeri', null, 'Penuh', '3.00', null, 9, 'https://www.tanotofoundation.org', 'Beasiswa dan program kepemimpinan untuk mahasiswa di kampus mitra.'],
            ['Beasiswa Bank Indonesia', 'Bank Indonesia', ['S1'], ['Ekonomi dan Bisnis', 'Teknologi Informasi', 'Hukum dan Kebijakan Publik'], 'Dalam negeri', null, 'Sebagian', '3.00', null, 15, 'https://www.bi.go.id', 'Bantuan biaya pendidikan dan pembinaan melalui komunitas GenBI.'],
            ['Pertamina Sobat Bumi', 'Pertamina Foundation', ['S1'], ['Lingkungan dan Energi', 'Teknik dan Infrastruktur', 'Sains dan Riset'], 'Dalam negeri', null, 'Sebagian', '3.00', null, 22, 'https://pertaminafoundation.org', 'Untuk mahasiswa yang peduli isu energi dan lingkungan.'],
            ['Beasiswa Cendekia BAZNAS', 'BAZNAS', ['S1'], [], 'Dalam negeri', null, 'Sebagian', '3.00', null, 27, 'https://baznas.go.id', 'Bantuan biaya kuliah untuk mahasiswa dari keluarga prasejahtera.'],
            ['Bakti BCA Beasiswa', 'BCA', ['S1'], ['Ekonomi dan Bisnis', 'Teknologi Informasi'], 'Dalam negeri', null, 'Penuh', '3.00', null, 40, 'https://www.bca.co.id', 'Program pendidikan dengan ikatan kerja setelah lulus.'],
            ['Beasiswa Prestasi Jawa Tengah', 'Pemprov Jawa Tengah', ['S1'], [], 'Dalam negeri', 'Jawa Tengah', 'Sebagian', '3.25', null, 4, 'https://jatengprov.go.id', 'Bantuan biaya pendidikan untuk mahasiswa ber-KTP Jawa Tengah.'],
            ['Beasiswa Pemuda Tangguh Surabaya', 'Pemkot Surabaya', ['S1'], [], 'Dalam negeri', 'Jawa Timur', 'Penuh', null, null, 11, 'https://surabaya.go.id', 'Untuk warga Surabaya yang kuliah di kampus mitra.'],
            ['Chevening Scholarship', 'Pemerintah Inggris', ['S2'], [], 'Luar negeri', null, 'Penuh', '3.00', 'IELTS', 45, 'https://www.chevening.org', 'Magister satu tahun di Inggris untuk calon pemimpin.'],
            ['Australia Awards Scholarship', 'Pemerintah Australia', ['S2', 'S3'], [], 'Luar negeri', null, 'Penuh', '2.90', 'IELTS', 38, 'https://www.australiaawardsindo.or.id', 'Studi magister dan doktor di Australia, termasuk biaya hidup.'],
            ['Fulbright Master\'s Degree', 'AMINEF', ['S2'], [], 'Luar negeri', null, 'Penuh', '3.00', 'TOEFL iBT', 30, 'https://www.aminef.or.id', 'Magister di Amerika Serikat dengan pendanaan penuh.'],
            ['DAAD EPOS Development-Related', 'DAAD', ['S2', 'S3'], ['Teknik dan Infrastruktur', 'Lingkungan dan Energi', 'Ekonomi dan Bisnis', 'Kesehatan'], 'Luar negeri', null, 'Penuh', '3.00', 'IELTS', 52, 'https://www.daad.id', 'Program magister di Jerman untuk bidang terkait pembangunan.'],
            ['Global Korea Scholarship', 'Pemerintah Korea Selatan', ['S1', 'S2', 'S3'], [], 'Luar negeri', null, 'Penuh', '2.80', null, 26, 'https://www.studyinkorea.go.kr', 'Pendanaan penuh termasuk kursus bahasa Korea satu tahun.'],
            ['MEXT Monbukagakusho', 'Pemerintah Jepang', ['S1', 'S2', 'S3'], [], 'Luar negeri', null, 'Penuh', '3.00', null, 60, 'https://www.id.emb-japan.go.jp', 'Beasiswa pemerintah Jepang untuk program gelar dan riset.'],
            ['Erasmus Mundus Joint Master', 'Uni Eropa', ['S2'], ['Teknologi Informasi', 'Sains dan Riset', 'Hubungan Internasional'], 'Luar negeri', null, 'Penuh', '3.00', 'IELTS', 8, 'https://erasmus-plus.ec.europa.eu', 'Magister di dua atau lebih kampus Eropa.'],
            ['Beasiswa Riset Kampus Merdeka', 'Kemendikbudristek', ['S1'], ['Sains dan Riset', 'Teknologi Informasi', 'Kesehatan'], 'Dalam negeri', null, 'Sebagian', '3.25', null, 14, 'https://kampusmerdeka.kemdikbud.go.id', 'Dana riset dan uang saku untuk mahasiswa yang ikut proyek penelitian.'],
            ['Beasiswa Seni dan Budaya Nusantara', 'Kemendikbudristek', ['S1'], ['Seni dan Budaya', 'Komunikasi dan Media'], 'Dalam negeri', null, 'Sebagian', '2.75', null, 18, 'https://kemdikbud.go.id', 'Untuk mahasiswa yang aktif melestarikan seni dan budaya daerah.'],
            ['Beasiswa Kader Surya Kepemimpinan', 'Yayasan contoh', ['S1'], ['Kepemimpinan dan Organisasi', 'Sosial dan Pemberdayaan Masyarakat'], 'Dalam negeri', null, 'Sebagian', '3.00', null, -3, 'https://kemdikbud.go.id', 'Contoh beasiswa yang sudah tutup, tidak tampil di rekomendasi.'],
        ];
    }
}
