<?php

namespace Tests\Feature;

use App\Models\Interest;
use App\Models\Scholarship;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    private function matchingUser(): User
    {
        $user = User::factory()->create([
            'name' => 'Rina Putri',
            'jenjang_tujuan' => ['S2'],
            'jenis_pendanaan' => 'Penuh',
            'ipk' => '3.50',
            'domisili' => 'Semarang, Jawa Tengah',
        ]);
        $user->interests()->attach(Interest::query()->where('name', 'Teknologi Informasi')->value('id'));

        return $user;
    }

    public function test_guests_are_redirected_to_the_login_page(): void
    {
        $this->get(route('dashboard'))->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_visit_the_dashboard(): void
    {
        $this->actingAs(User::factory()->create())
            ->get(route('dashboard'))
            ->assertOk();
    }

    public function test_dashboard_shows_matching_open_scholarships_best_first(): void
    {
        $user = $this->matchingUser();
        $best = Scholarship::factory()->create(['scholarship_name' => 'Cocok', 'levels' => ['S2'], 'major' => 'Teknologi Informasi', 'deadline' => today()->addDays(4)]);
        Scholarship::factory()->create(['scholarship_name' => 'Kurang cocok', 'levels' => ['S1'], 'region' => 'Papua', 'funding' => 'Sebagian', 'min_gpa' => '3.90', 'major' => 'Seni dan Budaya']);
        Scholarship::factory()->closed()->create(['scholarship_name' => 'Sudah tutup', 'levels' => ['S2']]);

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard')
                ->where('canMatch', true)
                ->has('recommendations', 1)
                ->where('recommendations.0.id', $best->id)
                ->where('recommendations.0.score', 100)
                ->where('recommendations.0.daysLeft', 4)
                ->where('recommendations.0.reasons', ['S2', 'Teknologi Informasi', 'Dana penuh'])
                ->where('stats.matches', 1)
                ->where('stats.urgent', 1)
                ->where('stats.saved', 0)
                ->has('deadlines', 1));
    }

    public function test_skipped_users_are_asked_to_complete_their_profile(): void
    {
        $user = User::factory()->create(['onboarding_method' => 'skipped']);
        Scholarship::factory()->create();

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('canMatch', false)
                ->has('recommendations', 0)
                ->where('profile.skipped', true)
                ->where('profile.missing.0', 'Jenjang tujuan'));
    }

    public function test_scholarships_can_be_saved_and_unsaved(): void
    {
        $user = $this->matchingUser();
        $scholarship = Scholarship::factory()->create(['levels' => ['S2']]);

        $this->actingAs($user)
            ->from(route('dashboard'))
            ->post(route('scholarships.save', $scholarship))
            ->assertRedirect(route('dashboard'));

        $this->assertDatabaseHas('fav_user', [
            'user_id' => $user->id,
            'scholarships_id' => $scholarship->id,
        ]);

        // Saving twice keeps one row.
        $this->actingAs($user)->post(route('scholarships.save', $scholarship));
        $this->assertSame(1, $user->favoriteScholarships()->count());

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('stats.saved', 1)
                ->where('recommendations.0.saved', true)
                ->where('saved.0.name', $scholarship->scholarship_name));

        $this->actingAs($user)
            ->delete(route('scholarships.unsave', $scholarship))
            ->assertRedirect();

        $this->assertSame(0, $user->favoriteScholarships()->count());
    }

    public function test_skipped_users_can_return_to_onboarding(): void
    {
        $user = User::factory()->create(['onboarding_method' => 'skipped']);

        $this->actingAs($user)->get(route('onboarding.index'))->assertOk();
    }

    public function test_profile_page_opens_for_users_who_filled_their_profile(): void
    {
        $user = User::factory()->create(['onboarding_method' => 'manual', 'kampus' => 'UDINUS']);

        $this->actingAs($user)
            ->get(route('account.profile'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('account/profile')
                ->where('values.kampus', 'UDINUS'));
    }

    public function test_profile_page_sends_users_who_skipped_to_onboarding(): void
    {
        $user = User::factory()->create(['onboarding_method' => 'skipped']);

        $this->actingAs($user)
            ->get(route('account.profile'))
            ->assertRedirect(route('onboarding.index'));
    }

    public function test_onboarding_form_sends_finished_users_to_the_profile_page(): void
    {
        $user = User::factory()->create(['onboarding_method' => 'manual']);

        $this->actingAs($user)
            ->get(route('onboarding.profile'))
            ->assertRedirect(route('account.profile'));
    }

    public function test_profile_can_be_updated_from_the_profile_page(): void
    {
        $user = User::factory()->create(['onboarding_method' => 'manual', 'cv_path' => 'cv/x.pdf']);

        $this->actingAs($user)
            ->post(route('account.profile.update'), [
                'name' => 'Nama Baru',
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
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('account.profile'));

        $user->refresh();
        $this->assertSame('Nama Baru', $user->name);
        $this->assertSame('manual', $user->onboarding_method);
    }
}
