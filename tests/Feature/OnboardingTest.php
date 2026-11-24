<?php

namespace Tests\Feature;

use App\Models\Interest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class OnboardingTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array<string, mixed>
     */
    private function validProfile(): array
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
            'semester' => 5,
            'ipk' => '3.50',
            'prestasi' => ['Juara 1 lomba'],
            'organisasi' => [],
            'jenjang_tujuan' => ['S2'],
            'lokasi_tujuan' => ['Luar negeri'],
            'jenis_pendanaan' => 'Penuh',
            'interests' => [Interest::query()->value('id')],
        ];
    }

    public function test_users_who_have_not_onboarded_are_sent_to_onboarding(): void
    {
        $user = User::factory()->notOnboarded()->create();

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertRedirect(route('onboarding.index'));
    }

    public function test_onboarded_users_cannot_open_onboarding_again(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('onboarding.index'))
            ->assertRedirect(route('dashboard'));
    }

    public function test_unverified_users_must_verify_before_onboarding(): void
    {
        $user = User::factory()->unverified()->notOnboarded()->create();

        $this->actingAs($user)
            ->get(route('onboarding.index'))
            ->assertRedirect(route('verification.notice'));
    }

    public function test_onboarding_pages_render(): void
    {
        $user = User::factory()->notOnboarded()->create();

        $this->actingAs($user)->get(route('onboarding.index'))->assertOk();
        $this->actingAs($user)->get(route('onboarding.ai'))->assertOk();
        $this->actingAs($user)->get(route('onboarding.profile'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('onboarding/profile')
                ->where('method', 'manual')
                ->where('cvName', null));
    }

    public function test_uploading_a_cv_prefills_the_profile_form(): void
    {
        Storage::fake();
        $user = User::factory()->notOnboarded()->create();

        $this->actingAs($user)
            ->post(route('onboarding.ai.parse'), [
                'cv' => UploadedFile::fake()->create('CV_Saya.pdf', 200, 'application/pdf'),
            ])
            ->assertRedirect(route('onboarding.ai'));

        Storage::assertExists($user->fresh()->cv_path);

        $this->actingAs($user)
            ->get(route('onboarding.profile', ['sumber' => 'ai']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('method', 'ai')
                ->where('cvName', 'CV_Saya.pdf')
                ->where('values.kampus', 'Universitas Dian Nuswantoro')
                ->where('flaggedFields', ['ipk', 'skor_bahasa']));
    }

    public function test_cv_upload_rejects_other_file_types(): void
    {
        $user = User::factory()->notOnboarded()->create();

        $this->actingAs($user)
            ->post(route('onboarding.ai.parse'), [
                'cv' => UploadedFile::fake()->create('foto.png', 100, 'image/png'),
            ])
            ->assertSessionHasErrors('cv');
    }

    public function test_manual_onboarding_requires_a_cv(): void
    {
        $user = User::factory()->notOnboarded()->create();

        $this->actingAs($user)
            ->post(route('onboarding.store'), $this->validProfile())
            ->assertSessionHasErrors('cv');

        $this->assertNull($user->fresh()->onboarded_at);
    }

    public function test_profile_can_be_saved_and_onboarding_finished(): void
    {
        Storage::fake();
        $user = User::factory()->notOnboarded()->create();

        $this->actingAs($user)
            ->post(route('onboarding.store'), [
                ...$this->validProfile(),
                'cv' => UploadedFile::fake()->create('cv.pdf', 200, 'application/pdf'),
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('onboarding.done'));

        $user->refresh();

        $this->assertNotNull($user->onboarded_at);
        $this->assertSame('manual', $user->onboarding_method);
        $this->assertSame('Teknik Informatika', $user->jurusan);
        $this->assertSame(['S2'], $user->jenjang_tujuan);
        $this->assertCount(1, $user->interests);
        Storage::assertExists($user->cv_path);

        $this->actingAs($user)->get(route('dashboard'))->assertOk();
    }

    public function test_welcome_screen_is_shown_once_after_onboarding(): void
    {
        $user = User::factory()->create(['name' => 'Rina Putri']);

        $this->actingAs($user)
            ->withSession(['onboarding.welcome' => true])
            ->get(route('onboarding.done'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('onboarding/done')
                ->where('firstName', 'Rina'));
    }

    public function test_welcome_screen_redirects_to_dashboard_when_revisited(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('onboarding.done'))
            ->assertRedirect(route('dashboard'));
    }

    public function test_welcome_screen_requires_finished_onboarding(): void
    {
        $user = User::factory()->notOnboarded()->create();

        $this->actingAs($user)
            ->withSession(['onboarding.welcome' => true])
            ->get(route('onboarding.done'))
            ->assertRedirect(route('onboarding.index'));
    }

    public function test_required_profile_fields_are_validated(): void
    {
        $user = User::factory()->notOnboarded()->create();

        $this->actingAs($user)
            ->post(route('onboarding.store'), [])
            ->assertSessionHasErrors([
                'name', 'tanggal_lahir', 'jenis_kelamin', 'no_whatsapp', 'domisili',
                'pendidikan_terakhir', 'kampus', 'jurusan', 'jenjang_tujuan',
                'lokasi_tujuan', 'jenis_pendanaan', 'interests', 'cv',
            ]);
    }
}
