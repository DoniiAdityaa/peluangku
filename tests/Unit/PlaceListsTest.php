<?php

namespace Tests\Unit;

use App\Support\Campuses;
use App\Support\Cities;
use PHPUnit\Framework\TestCase;

class PlaceListsTest extends TestCase
{
    public function test_city_text_from_a_cv_becomes_the_listed_value(): void
    {
        $this->assertSame('Semarang, Jawa Tengah', Cities::normalize('Kota Semarang'));
        $this->assertSame('Surakarta, Jawa Tengah', Cities::normalize('Solo'));
        $this->assertSame('Tangerang Selatan, Banten', Cities::normalize('Tangerang Selatan, Banten'));
        $this->assertSame('Jakarta, DKI Jakarta', Cities::normalize('Jakarta Selatan'));
    }

    public function test_unlisted_city_is_kept_as_typed(): void
    {
        $this->assertSame('Klaten, Jawa Tengah', Cities::normalize('Klaten, Jawa Tengah'));
        $this->assertNull(Cities::normalize(null));
    }

    public function test_campus_text_from_a_cv_becomes_the_listed_name(): void
    {
        $this->assertSame('Universitas Dian Nuswantoro', Campuses::normalize('UDINUS'));
        $this->assertSame('Universitas Diponegoro', Campuses::normalize('universitas diponegoro semarang'));
        $this->assertSame('Universitas Negeri Semarang', Campuses::normalize('Universitas Negeri Semarang'));
        $this->assertSame('Universitas Widya Dharma', Campuses::normalize('Universitas Widya Dharma'));
    }

    public function test_city_values_keep_the_province_for_regional_matching(): void
    {
        foreach (Cities::options() as $option) {
            $this->assertSame("{$option['label']}, {$option['hint']}", $option['value']);
        }
    }
}
