<?php

namespace App\Support;

/**
 * Big Indonesian campuses offered in the "Universitas" dropdown.
 *
 * People whose campus is not listed type it themselves, so validation
 * accepts any text and this list only makes picking faster.
 */
final class Campuses
{
    /**
     * [name, short name, city].
     *
     * @var list<array{0: string, 1: string, 2: string}>
     */
    private const LIST = [
        // Universitas negeri
        ['Universitas Indonesia', 'UI', 'Depok'],
        ['Institut Teknologi Bandung', 'ITB', 'Bandung'],
        ['Universitas Gadjah Mada', 'UGM', 'Yogyakarta'],
        ['Institut Pertanian Bogor', 'IPB', 'Bogor'],
        ['Institut Teknologi Sepuluh Nopember', 'ITS', 'Surabaya'],
        ['Universitas Airlangga', 'UNAIR', 'Surabaya'],
        ['Universitas Diponegoro', 'UNDIP', 'Semarang'],
        ['Universitas Padjadjaran', 'UNPAD', 'Bandung'],
        ['Universitas Brawijaya', 'UB', 'Malang'],
        ['Universitas Sebelas Maret', 'UNS', 'Surakarta'],
        ['Universitas Hasanuddin', 'UNHAS', 'Makassar'],
        ['Universitas Sumatera Utara', 'USU', 'Medan'],
        ['Universitas Andalas', 'UNAND', 'Padang'],
        ['Universitas Pendidikan Indonesia', 'UPI', 'Bandung'],
        ['Universitas Negeri Semarang', 'UNNES', 'Semarang'],
        ['Universitas Negeri Yogyakarta', 'UNY', 'Yogyakarta'],
        ['Universitas Negeri Malang', 'UM', 'Malang'],
        ['Universitas Negeri Surabaya', 'UNESA', 'Surabaya'],
        ['Universitas Negeri Jakarta', 'UNJ', 'Jakarta'],
        ['Universitas Negeri Padang', 'UNP', 'Padang'],
        ['Universitas Negeri Medan', 'UNIMED', 'Medan'],
        ['Universitas Negeri Makassar', 'UNM', 'Makassar'],
        ['Universitas Jenderal Soedirman', 'UNSOED', 'Purwokerto'],
        ['Universitas Sriwijaya', 'UNSRI', 'Palembang'],
        ['Universitas Lampung', 'UNILA', 'Bandar Lampung'],
        ['Universitas Riau', 'UNRI', 'Pekanbaru'],
        ['Universitas Syiah Kuala', 'USK', 'Banda Aceh'],
        ['Universitas Udayana', 'UNUD', 'Denpasar'],
        ['Universitas Jember', 'UNEJ', 'Jember'],
        ['Universitas Mataram', 'UNRAM', 'Mataram'],
        ['Universitas Mulawarman', 'UNMUL', 'Samarinda'],
        ['Universitas Lambung Mangkurat', 'ULM', 'Banjarmasin'],
        ['Universitas Tanjungpura', 'UNTAN', 'Pontianak'],
        ['Universitas Sam Ratulangi', 'UNSRAT', 'Manado'],
        ['Universitas Pattimura', 'UNPATTI', 'Ambon'],
        ['Universitas Cenderawasih', 'UNCEN', 'Jayapura'],
        ['Universitas Nusa Cendana', 'UNDANA', 'Kupang'],
        ['Universitas Tadulako', 'UNTAD', 'Palu'],
        ['Universitas Halu Oleo', 'UHO', 'Kendari'],
        ['Universitas Jambi', 'UNJA', 'Jambi'],
        ['Universitas Bengkulu', 'UNIB', 'Bengkulu'],
        ['Universitas Sultan Ageng Tirtayasa', 'UNTIRTA', 'Serang'],
        ['Universitas Trunojoyo Madura', 'UTM', 'Bangkalan'],
        ['Universitas Pembangunan Nasional Veteran Jakarta', 'UPNVJ', 'Jakarta'],
        ['Universitas Pembangunan Nasional Veteran Yogyakarta', 'UPNVY', 'Yogyakarta'],
        ['Universitas Pembangunan Nasional Veteran Jawa Timur', 'UPNVJT', 'Surabaya'],
        ['Institut Teknologi Sumatera', 'ITERA', 'Lampung Selatan'],
        ['Universitas Terbuka', 'UT', 'Tangerang Selatan'],
        ['UIN Syarif Hidayatullah Jakarta', 'UIN Jakarta', 'Tangerang Selatan'],
        ['UIN Sunan Kalijaga Yogyakarta', 'UIN Suka', 'Yogyakarta'],
        ['UIN Walisongo Semarang', 'UIN Walisongo', 'Semarang'],
        ['UIN Sunan Ampel Surabaya', 'UINSA', 'Surabaya'],
        ['UIN Sunan Gunung Djati Bandung', 'UIN SGD', 'Bandung'],
        ['UIN Maulana Malik Ibrahim Malang', 'UIN Malang', 'Malang'],

        // Politeknik
        ['Politeknik Negeri Semarang', 'POLINES', 'Semarang'],
        ['Politeknik Negeri Bandung', 'POLBAN', 'Bandung'],
        ['Politeknik Negeri Jakarta', 'PNJ', 'Depok'],
        ['Politeknik Negeri Malang', 'POLINEMA', 'Malang'],
        ['Politeknik Elektronika Negeri Surabaya', 'PENS', 'Surabaya'],
        ['Politeknik Keuangan Negara STAN', 'PKN STAN', 'Tangerang Selatan'],

        // Universitas swasta
        ['Universitas Dian Nuswantoro', 'UDINUS', 'Semarang'],
        ['Universitas Katolik Soegijapranata', 'UNIKA', 'Semarang'],
        ['Universitas Islam Sultan Agung', 'UNISSULA', 'Semarang'],
        ['Universitas Muhammadiyah Semarang', 'UNIMUS', 'Semarang'],
        ['Universitas Semarang', 'USM', 'Semarang'],
        ['Universitas Stikubank', 'UNISBANK', 'Semarang'],
        ['Universitas Kristen Satya Wacana', 'UKSW', 'Salatiga'],
        ['Universitas Muhammadiyah Surakarta', 'UMS', 'Surakarta'],
        ['Universitas Muhammadiyah Yogyakarta', 'UMY', 'Yogyakarta'],
        ['Universitas Islam Indonesia', 'UII', 'Yogyakarta'],
        ['Universitas Atma Jaya Yogyakarta', 'UAJY', 'Yogyakarta'],
        ['Universitas Sanata Dharma', 'USD', 'Yogyakarta'],
        ['Universitas Ahmad Dahlan', 'UAD', 'Yogyakarta'],
        ['Universitas Amikom Yogyakarta', 'AMIKOM', 'Yogyakarta'],
        ['Universitas Muhammadiyah Malang', 'UMM', 'Malang'],
        ['Universitas Islam Malang', 'UNISMA', 'Malang'],
        ['Universitas Bina Nusantara', 'BINUS', 'Jakarta'],
        ['Universitas Trisakti', 'Trisakti', 'Jakarta'],
        ['Universitas Tarumanagara', 'UNTAR', 'Jakarta'],
        ['Universitas Katolik Indonesia Atma Jaya', 'Atma Jaya', 'Jakarta'],
        ['Universitas Mercu Buana', 'UMB', 'Jakarta'],
        ['Universitas Pancasila', 'UP', 'Jakarta'],
        ['Universitas Muhammadiyah Prof. Dr. Hamka', 'UHAMKA', 'Jakarta'],
        ['Universitas Gunadarma', 'Gunadarma', 'Depok'],
        ['Universitas Pelita Harapan', 'UPH', 'Tangerang'],
        ['Universitas Prasetiya Mulya', 'Prasmul', 'Tangerang'],
        ['Universitas Telkom', 'Tel-U', 'Bandung'],
        ['Universitas Katolik Parahyangan', 'UNPAR', 'Bandung'],
        ['Universitas Kristen Maranatha', 'Maranatha', 'Bandung'],
        ['Universitas Islam Bandung', 'UNISBA', 'Bandung'],
        ['Universitas Pasundan', 'UNPAS', 'Bandung'],
        ['Universitas Kristen Petra', 'Petra', 'Surabaya'],
        ['Universitas Surabaya', 'UBAYA', 'Surabaya'],
        ['Universitas Ciputra', 'UC', 'Surabaya'],
        ['Universitas Muhammadiyah Sumatera Utara', 'UMSU', 'Medan'],
        ['Universitas Islam Riau', 'UIR', 'Pekanbaru'],
        ['Universitas Muslim Indonesia', 'UMI', 'Makassar'],
    ];

    /**
     * Options for the dropdown, sorted by name.
     *
     * @return list<array{value: string, label: string, hint: string, keywords: string}>
     */
    public static function options(): array
    {
        $options = array_map(fn (array $campus) => [
            'value' => $campus[0],
            'label' => $campus[0],
            'hint' => "{$campus[1]} · {$campus[2]}",
            'keywords' => $campus[1],
        ], self::LIST);

        usort($options, fn (array $a, array $b) => strcmp($a['label'], $b['label']));

        return $options;
    }

    /**
     * Turn text such as "UDINUS" or "universitas diponegoro semarang" into a
     * listed name. Text that matches no listed campus is returned unchanged.
     */
    public static function normalize(?string $text): ?string
    {
        if (blank($text)) {
            return $text;
        }

        $clean = mb_strtolower(trim($text));

        foreach (self::LIST as [$name, $short]) {
            if ($clean === mb_strtolower($name) || $clean === mb_strtolower($short)) {
                return $name;
            }
        }

        // Longest name first, so "Universitas Negeri Semarang" wins over "Universitas Semarang".
        $byLength = self::LIST;
        usort($byLength, fn (array $a, array $b) => mb_strlen($b[0]) <=> mb_strlen($a[0]));

        foreach ($byLength as [$name]) {
            if (str_contains($clean, mb_strtolower($name))) {
                return $name;
            }
        }

        return $text;
    }
}
