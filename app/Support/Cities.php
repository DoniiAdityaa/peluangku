<?php

namespace App\Support;

/**
 * Big cities offered in the "Domisili" dropdown.
 *
 * The saved value is "City, Province" so regional scholarships (matched by
 * province name) still find the user. People whose city is not listed type
 * it themselves, which is why validation accepts any text.
 */
final class Cities
{
    /**
     * [city, province, aliases].
     *
     * @var list<array{0: string, 1: string, 2?: list<string>}>
     */
    private const LIST = [
        ['Banda Aceh', 'Aceh'],
        ['Medan', 'Sumatera Utara'],
        ['Padang', 'Sumatera Barat'],
        ['Pekanbaru', 'Riau'],
        ['Batam', 'Kepulauan Riau'],
        ['Tanjungpinang', 'Kepulauan Riau'],
        ['Jambi', 'Jambi'],
        ['Palembang', 'Sumatera Selatan'],
        ['Bengkulu', 'Bengkulu'],
        ['Bandar Lampung', 'Lampung', ['lampung']],
        ['Pangkalpinang', 'Kepulauan Bangka Belitung'],
        ['Jakarta', 'DKI Jakarta', ['jakarta pusat', 'jakarta utara', 'jakarta barat', 'jakarta selatan', 'jakarta timur']],
        ['Bogor', 'Jawa Barat'],
        ['Depok', 'Jawa Barat'],
        ['Bekasi', 'Jawa Barat'],
        ['Bandung', 'Jawa Barat'],
        ['Cimahi', 'Jawa Barat'],
        ['Karawang', 'Jawa Barat'],
        ['Sukabumi', 'Jawa Barat'],
        ['Tasikmalaya', 'Jawa Barat'],
        ['Cirebon', 'Jawa Barat'],
        ['Tangerang', 'Banten'],
        ['Tangerang Selatan', 'Banten', ['tangsel']],
        ['Serang', 'Banten'],
        ['Cilegon', 'Banten'],
        ['Semarang', 'Jawa Tengah'],
        ['Surakarta', 'Jawa Tengah', ['solo']],
        ['Salatiga', 'Jawa Tengah'],
        ['Magelang', 'Jawa Tengah'],
        ['Pekalongan', 'Jawa Tengah'],
        ['Tegal', 'Jawa Tengah'],
        ['Kudus', 'Jawa Tengah'],
        ['Purwokerto', 'Jawa Tengah', ['banyumas']],
        ['Yogyakarta', 'DI Yogyakarta', ['jogja', 'jogjakarta', 'diy']],
        ['Sleman', 'DI Yogyakarta'],
        ['Bantul', 'DI Yogyakarta'],
        ['Surabaya', 'Jawa Timur'],
        ['Sidoarjo', 'Jawa Timur'],
        ['Malang', 'Jawa Timur'],
        ['Kediri', 'Jawa Timur'],
        ['Madiun', 'Jawa Timur'],
        ['Jember', 'Jawa Timur'],
        ['Banyuwangi', 'Jawa Timur'],
        ['Denpasar', 'Bali'],
        ['Mataram', 'Nusa Tenggara Barat'],
        ['Kupang', 'Nusa Tenggara Timur'],
        ['Pontianak', 'Kalimantan Barat'],
        ['Palangka Raya', 'Kalimantan Tengah', ['palangkaraya']],
        ['Banjarmasin', 'Kalimantan Selatan'],
        ['Banjarbaru', 'Kalimantan Selatan'],
        ['Samarinda', 'Kalimantan Timur'],
        ['Balikpapan', 'Kalimantan Timur'],
        ['Tarakan', 'Kalimantan Utara'],
        ['Manado', 'Sulawesi Utara'],
        ['Gorontalo', 'Gorontalo'],
        ['Palu', 'Sulawesi Tengah'],
        ['Mamuju', 'Sulawesi Barat'],
        ['Makassar', 'Sulawesi Selatan'],
        ['Kendari', 'Sulawesi Tenggara'],
        ['Ambon', 'Maluku'],
        ['Ternate', 'Maluku Utara'],
        ['Jayapura', 'Papua'],
        ['Manokwari', 'Papua Barat'],
        ['Sorong', 'Papua Barat Daya'],
        ['Merauke', 'Papua Selatan'],
        ['Nabire', 'Papua Tengah'],
        ['Wamena', 'Papua Pegunungan'],
    ];

    /**
     * Options for the dropdown, sorted by city name.
     *
     * @return list<array{value: string, label: string, hint: string, keywords: string}>
     */
    public static function options(): array
    {
        $options = array_map(fn (array $city) => [
            'value' => "{$city[0]}, {$city[1]}",
            'label' => $city[0],
            'hint' => $city[1],
            'keywords' => implode(' ', $city[2] ?? []),
        ], self::LIST);

        usort($options, fn (array $a, array $b) => strcmp($a['label'], $b['label']));

        return $options;
    }

    /**
     * Turn free text such as "Kota Semarang" or "Solo" into a listed value.
     * Text that matches no listed city is returned unchanged.
     */
    public static function normalize(?string $text): ?string
    {
        if (blank($text)) {
            return $text;
        }

        $haystack = ' '.mb_strtolower(preg_replace('/[^\pL\pN]+/u', ' ', $text)).' ';
        $best = null;
        $bestLength = 0;

        foreach (self::LIST as $city) {
            foreach ([$city[0], ...($city[2] ?? [])] as $name) {
                $needle = mb_strtolower($name);

                if (str_contains($haystack, " {$needle} ") && mb_strlen($needle) > $bestLength) {
                    $best = "{$city[0]}, {$city[1]}";
                    $bestLength = mb_strlen($needle);
                }
            }
        }

        return $best ?? $text;
    }
}
