<?php

namespace Tests\Unit;

use App\Models\Scholarship;
use App\Models\User;
use App\Services\Scholarships\ScholarshipMatcher;
use Illuminate\Database\Eloquent\Collection;
use PHPUnit\Framework\TestCase;

class ScholarshipMatcherTest extends TestCase
{
    private function user(array $attributes = []): User
    {
        $user = new User($attributes);
        $user->setRelation('interests', new Collection);

        return $user;
    }

    private function scholarship(array $attributes = []): Scholarship
    {
        return new Scholarship([
            'jenjang' => ['S1'],
            'bidang' => [],
            'lokasi' => 'Dalam negeri',
            'wilayah' => null,
            'pendanaan' => 'Penuh',
            'ipk_min' => null,
            ...$attributes,
        ]);
    }

    public function test_a_full_fit_scores_close_to_the_top(): void
    {
        $result = (new ScholarshipMatcher)->match(
            $this->user(['jenjang_tujuan' => ['S1'], 'lokasi_tujuan' => ['Dalam negeri'], 'jenis_pendanaan' => 'Penuh', 'ipk' => '3.40']),
            $this->scholarship(['ipk_min' => '3.00']),
        );

        // "Semua jurusan" gets 18 of the 25 bidang points.
        $this->assertSame(93, $result['score']);
        $this->assertSame(['S1', 'Semua jurusan', 'Dalam negeri', 'IPK cukup', 'Dana penuh'], $result['reasons']);
    }

    public function test_a_low_ipk_and_wrong_level_lower_the_score(): void
    {
        $result = (new ScholarshipMatcher)->match(
            $this->user(['jenjang_tujuan' => ['S2'], 'ipk' => '2.80']),
            $this->scholarship(['ipk_min' => '3.25']),
        );

        $this->assertLessThan(ScholarshipMatcher::RECOMMEND_MIN, $result['score']);
        $this->assertNotContains('IPK cukup', $result['reasons']);
    }

    public function test_regional_scholarships_only_fit_people_living_there(): void
    {
        $matcher = new ScholarshipMatcher;
        $scholarship = $this->scholarship(['wilayah' => 'Jawa Tengah']);
        $profile = ['jenjang_tujuan' => ['S1'], 'lokasi_tujuan' => ['Dalam negeri']];

        $inside = $matcher->match($this->user([...$profile, 'domisili' => 'Semarang, Jawa Tengah']), $scholarship);
        $outside = $matcher->match($this->user([...$profile, 'domisili' => 'Bandung, Jawa Barat']), $scholarship);

        $this->assertContains('Jawa Tengah', $inside['reasons']);
        $this->assertSame(15, $inside['score'] - $outside['score']);
    }
}
