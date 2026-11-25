<?php

namespace Tests\Feature;

use App\Models\Certificate;
use App\Models\Interest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CertificateTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array<string, mixed>
     */
    private function profile(array $certificates): array
    {
        return [
            'name' => 'Nama Lengkap',
            'tanggal_lahir' => '2004-05-01',
            'jenis_kelamin' => 'Perempuan',
            'no_whatsapp' => '081234567890',
            'domisili' => 'Semarang, Jawa Tengah',
            'pendidikan_terakhir' => 'S1',
            'kampus' => 'Universitas Dian Nuswantoro',
            'jurusan' => 'Teknik Informatika',
            'jenjang_tujuan' => ['S2'],
            'jenis_pendanaan' => 'Penuh',
            'interests' => [Interest::query()->value('id')],
            'certificates' => $certificates,
        ];
    }

    public function test_certificates_are_stored_with_onboarding(): void
    {
        Storage::fake();
        $user = User::factory()->notOnboarded()->create();

        $this->actingAs($user)
            ->post(route('onboarding.store'), $this->profile([
                ['name' => 'Juara 1 Hackathon', 'file' => UploadedFile::fake()->image('juara.jpg')],
                ['name' => 'Sertifikat Pelatihan', 'file' => UploadedFile::fake()->create('pelatihan.pdf', 300, 'application/pdf')],
            ]))
            ->assertSessionHasNoErrors();

        $certificates = $user->certificates()->orderBy('id')->get();

        $this->assertCount(2, $certificates);
        $this->assertSame('Juara 1 Hackathon', $certificates[0]->name);
        $this->assertSame('application/pdf', $certificates[1]->mime);
        Storage::assertExists($certificates[0]->path);
    }

    public function test_certificate_files_and_count_are_limited(): void
    {
        Storage::fake();
        $user = User::factory()->notOnboarded()->create();

        $this->actingAs($user)
            ->post(route('onboarding.store'), $this->profile([
                ['name' => 'Dokumen', 'file' => UploadedFile::fake()->create('file.docx', 100)],
                ['name' => 'Besar', 'file' => UploadedFile::fake()->create('besar.pdf', 6000, 'application/pdf')],
                ['name' => '', 'file' => UploadedFile::fake()->image('a.jpg')],
            ]))
            ->assertSessionHasErrors(['certificates.0.file', 'certificates.1.file', 'certificates.2.name']);

        $tooMany = array_map(fn ($i) => ['name' => "S{$i}", 'file' => UploadedFile::fake()->image("{$i}.jpg")], range(1, Certificate::MAX_PER_USER + 1));

        $this->actingAs($user)
            ->post(route('onboarding.store'), $this->profile($tooMany))
            ->assertSessionHasErrors('certificates');

        $this->assertSame(0, Certificate::count());
    }

    public function test_editing_the_profile_renames_keeps_and_removes_certificates(): void
    {
        Storage::fake();
        $user = User::factory()->create();
        $keep = $user->certificates()->create([
            'name' => 'Lama', 'path' => UploadedFile::fake()->image('a.jpg')->store("certificates/{$user->id}"),
            'original_name' => 'a.jpg', 'size' => 100, 'mime' => 'image/jpeg',
        ]);
        $remove = $user->certificates()->create([
            'name' => 'Hapus', 'path' => UploadedFile::fake()->image('b.jpg')->store("certificates/{$user->id}"),
            'original_name' => 'b.jpg', 'size' => 100, 'mime' => 'image/jpeg',
        ]);

        $this->actingAs($user)
            ->post(route('account.profile.update'), $this->profile([
                ['id' => $keep->id, 'name' => 'Nama baru'],
            ]))
            ->assertSessionHasNoErrors();

        $this->assertSame('Nama baru', $keep->fresh()->name);
        $this->assertNull($remove->fresh());
        Storage::assertMissing($remove->path);
        Storage::assertExists($keep->path);
    }

    public function test_certificates_of_another_user_cannot_be_claimed(): void
    {
        $user = User::factory()->create();
        $other = Certificate::factory()->create();

        $this->actingAs($user)
            ->post(route('account.profile.update'), $this->profile([
                ['id' => $other->id, 'name' => 'Punya orang'],
            ]))
            ->assertSessionHasErrors('certificates.0.id');
    }

    public function test_only_the_owner_can_open_a_certificate(): void
    {
        Storage::fake();
        $owner = User::factory()->create();
        $certificate = $owner->certificates()->create([
            'name' => 'Juara', 'path' => UploadedFile::fake()->image('juara.jpg')->store("certificates/{$owner->id}"),
            'original_name' => 'juara.jpg', 'size' => 100, 'mime' => 'image/jpeg',
        ]);

        $this->actingAs($owner)->get(route('certificates.show', $certificate))->assertOk();
        $this->actingAs(User::factory()->create())->get(route('certificates.show', $certificate))->assertNotFound();
    }
}
