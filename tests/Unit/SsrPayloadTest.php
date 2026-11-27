<?php

namespace Tests\Unit;

use App\Exceptions\ScholarshipSourceException;
use App\Services\SatuBeasiswa\SsrPayload;
use PHPUnit\Framework\TestCase;

/**
 * The listing payload is a JavaScript object literal, not JSON. These cases pin
 * the two rewrites that make it decodable, plus the string handling that keeps a
 * description from breaking the block scan.
 */
class SsrPayloadTest extends TestCase
{
    private function payload(): SsrPayload
    {
        return new SsrPayload;
    }

    public function test_decodes_bare_keys_and_back_references(): void
    {
        $html = '<script>self.$R=self.$R||{};...l:$R[16]={scholarships:$R[17]={'
            .'data:$R[18]=[$R[19]={id:735,uid:"r4n2",name:"Beasiswa KIP Kuliah",'
            .'level:$R[21]=["D3","D4","S1"],deadline:null},$R[24]={id:691,'
            .'uid:"3fsb",name:"Beasiswa Runata",deadline:"2027-11-30"}],'
            .'lastPage:12,total:103},locale:"id"};...($R["tsr"]);</script>';

        $decoded = $this->payload()->decode($html, 'scholarships', 'https://example.test');

        $this->assertSame(12, $decoded['lastPage']);
        $this->assertSame(103, $decoded['total']);
        $this->assertCount(2, $decoded['data']);
        $this->assertSame('r4n2', $decoded['data'][0]['uid']);
        $this->assertSame(['D3', 'D4', 'S1'], $decoded['data'][0]['level']);
        $this->assertNull($decoded['data'][0]['deadline']);
        $this->assertSame('2027-11-30', $decoded['data'][1]['deadline']);
    }

    public function test_a_brace_inside_a_description_does_not_end_the_block(): void
    {
        $html = 'scholarships:$R[2]={data:[{name:"Bantuan {ukt} untuk } mahasiswa",'
            .'description:"kata } lain { lagi"},],total:1},next:"x"';

        $decoded = $this->payload()->decode($html, 'scholarships', 'https://example.test');

        $this->assertSame(1, $decoded['total']);
        $this->assertSame('Bantuan {ukt} untuk } mahasiswa', $decoded['data'][0]['name']);
        $this->assertSame('kata } lain { lagi', $decoded['data'][0]['description']);
    }

    public function test_escaped_quotes_and_newlines_survive(): void
    {
        $html = 'scholarships:$R[1]={data:[{description:"Tentang:\n\"KIP\" Kuliah"}]}';

        $decoded = $this->payload()->decode($html, 'scholarships', 'https://example.test');

        $this->assertSame("Tentang:\n\"KIP\" Kuliah", $decoded['data'][0]['description']);
    }

    public function test_missing_payload_raises_a_source_exception(): void
    {
        $this->expectException(ScholarshipSourceException::class);
        $this->expectExceptionMessage('Payload beasiswa tidak ditemukan');

        $this->payload()->decode('<html>halaman lain</html>', 'scholarships', 'https://example.test/x');
    }

    public function test_unbalanced_block_raises_a_source_exception(): void
    {
        $html = 'scholarships:$R[1]={data:[{name:"terpotong"';

        $this->expectException(ScholarshipSourceException::class);

        $this->payload()->decode($html, 'scholarships', 'https://example.test/x');
    }
}
