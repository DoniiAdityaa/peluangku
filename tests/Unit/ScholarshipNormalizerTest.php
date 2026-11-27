<?php

namespace Tests\Unit;

use App\Services\Scholarships\ScholarshipNormalizer;
use PHPUnit\Framework\TestCase;

class ScholarshipNormalizerTest extends TestCase
{
    private function normalizer(): ScholarshipNormalizer
    {
        return new ScholarshipNormalizer;
    }

    public function test_maps_english_actor_fields_to_scholarship_columns(): void
    {
        $row = $this->normalizer()->normalize([
            'title' => 'Beasiswa Unggulan 2027',
            'provider' => 'Kemendikbudristek',
            'levels' => ['S1', 'S2'],
            'majors' => 'Teknik Informatika, Sistem Informasi',
            'region' => 'Nasional',
            'funding' => 'Biaya pendidikan saja',
            'minGpa' => 'IPK minimal 3,25',
            'deadline' => '31 Desember 2026',
            'url' => 'https://satubeasiswa.kemdiktisaintek.go.id/beasiswa/unggulan',
            'summary' => 'Beasiswa untuk   mahasiswa berprestasi.',
        ]);

        $this->assertNotNull($row);
        $this->assertSame('Beasiswa Unggulan 2027', $row['scholarship_name']);
        $this->assertSame(['S1', 'S2'], $row['levels']);
        $this->assertSame('Teknik Informatika, Sistem Informasi', $row['major']);
        $this->assertNull($row['region'], 'Nasional harus jadi null agar cocok untuk semua wilayah.');
        $this->assertSame('Sebagian', $row['funding']);
        $this->assertSame('3.25', $row['min_gpa']);
        $this->assertSame('2026-12-31', $row['deadline']);
        $this->assertSame('Dalam negeri', $row['location']);
        $this->assertSame('Beasiswa untuk mahasiswa berprestasi.', $row['description']);
    }

    public function test_indonesian_field_names_are_understood(): void
    {
        $row = $this->normalizer()->normalize([
            'nama' => 'Beasiswa Daerah',
            'penyelenggara' => 'Pemprov Jawa Barat',
            'jenjang' => 'D3, S1',
            'jurusan' => 'Semua Jurusan',
            'wilayah' => 'Jawa Barat',
            'pendanaan' => 'Penuh',
            'batas_pendaftaran' => '05-03-2027',
            'link' => 'https://example.test/daerah',
        ]);

        $this->assertNotNull($row);
        $this->assertSame(['D3', 'S1'], $row['levels']);
        $this->assertNull($row['major'], '"Semua jurusan" harus jadi null.');
        $this->assertSame('Jawa Barat', $row['region']);
        $this->assertSame('Penuh', $row['funding']);
        $this->assertSame('2027-03-05', $row['deadline']);
    }

    public function test_items_without_name_or_link_are_rejected(): void
    {
        $this->assertNull($this->normalizer()->normalize(['title' => 'Tanpa link']));
        $this->assertNull($this->normalizer()->normalize(['url' => 'https://example.test/x']));
        $this->assertNull($this->normalizer()->normalize([]));
    }

    public function test_unparseable_deadline_becomes_null(): void
    {
        $row = $this->normalizer()->normalize([
            'title' => 'Beasiswa Tanpa Tanggal',
            'url' => 'https://example.test/tanpa-tanggal',
            'deadline' => 'sampai kuota terpenuhi',
        ]);

        $this->assertNotNull($row);
        $this->assertNull($row['deadline']);
    }

    public function test_levels_default_to_s1_when_missing(): void
    {
        $row = $this->normalizer()->normalize([
            'title' => 'Beasiswa Tanpa Jenjang',
            'url' => 'https://example.test/tanpa-jenjang',
            'deadline' => '2027-01-31',
        ]);

        $this->assertSame(['S1'], $row['levels']);
    }

    public function test_a_short_course_maps_to_the_non_degree_level(): void
    {
        $row = $this->normalizer()->normalize([
            'title' => 'Huayu Enrichment Scholarship',
            'url' => 'https://example.test/huayu',
            'level' => ['Shortcourse'],
            'deadline' => '2027-03-31',
        ]);

        $this->assertSame(
            ['Non-gelar'],
            $row['levels'],
            'Kursus singkat bukan S1: jangan sampai tampil sebagai beasiswa gelar.',
        );
    }

    public function test_a_short_course_bundled_with_degrees_keeps_both(): void
    {
        $row = $this->normalizer()->normalize([
            'title' => 'Beasiswa Prestasi Non Akademik',
            'url' => 'https://example.test/non-akademik',
            'level' => ['Shortcourse', 'D4', 'D3', 'S1'],
            'deadline' => '2027-01-31',
        ]);

        $this->assertSame(['D4', 'D3', 'S1', 'Non-gelar'], $row['levels']);
    }

    public function test_gpa_outside_a_valid_scale_is_dropped(): void
    {
        $row = $this->normalizer()->normalize([
            'title' => 'Beasiswa IPK Aneh',
            'url' => 'https://example.test/ipk',
            'min_gpa' => 'IPK minimal 8.5',
            'deadline' => '2027-01-31',
        ]);

        $this->assertNull($row['min_gpa']);
    }
}
