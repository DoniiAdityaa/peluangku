<?php

namespace Tests\Feature\Settings;

use App\Models\Interest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_page_is_displayed()
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get(route('profile.edit'));

        $response->assertOk();
    }

    public function test_profile_information_can_be_updated()
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch(route('profile.update'), [
                'name' => 'Test User',
                'email' => 'test@example.com',
                'domisili' => 'Bandung',
                'kampus' => 'Universitas Indonesia',
                'jurusan' => 'Teknik Informatika',
                'pendidikan_terakhir' => 'Sarjana (S1)',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('profile.edit'));

        $user->refresh();

        $this->assertSame('Test User', $user->name);
        $this->assertSame('test@example.com', $user->email);
        $this->assertSame('Bandung', $user->domisili);
        $this->assertSame('Universitas Indonesia', $user->kampus);
        $this->assertSame('Teknik Informatika', $user->jurusan);
        $this->assertSame('Sarjana (S1)', $user->pendidikan_terakhir);
        $this->assertNull($user->email_verified_at);
    }

    public function test_user_can_add_and_remove_profile_interests()
    {
        $user = User::factory()->create();
        $interest = Interest::query()->where('name', 'Pendidikan')->firstOrFail();

        $this->actingAs($user)
            ->post(route('profile.interests.store'), [
                'interest_id' => $interest->id,
            ])
            ->assertRedirect(route('profile.edit'));

        $this->assertTrue($user->interests()->whereKey($interest->id)->exists());

        $this->delete(route('profile.interests.destroy', $interest))
            ->assertRedirect(route('profile.edit'));

        $this->assertFalse($user->interests()->whereKey($interest->id)->exists());
    }

    public function test_email_is_stored_in_lowercase_so_the_user_can_still_log_in()
    {
        $user = User::factory()->create();

        $this
            ->actingAs($user)
            ->patch(route('profile.update'), [
                'name' => 'Test User',
                'email' => 'Test@Example.com',
            ])
            ->assertSessionHasNoErrors();

        $this->assertSame('test@example.com', $user->refresh()->email);

        $this->post(route('logout'));

        $this->post(route('login.store'), [
            'email' => 'Test@Example.com',
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($user);
    }

    public function test_email_must_be_unique_regardless_of_case()
    {
        User::factory()->create(['email' => 'taken@example.com']);

        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->from(route('profile.edit'))
            ->patch(route('profile.update'), [
                'name' => 'Test User',
                'email' => 'Taken@Example.com',
            ]);

        $response
            ->assertSessionHasErrors('email')
            ->assertRedirect(route('profile.edit'));
    }

    public function test_email_verification_status_is_unchanged_when_the_email_address_is_unchanged()
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch(route('profile.update'), [
                'name' => 'Test User',
                'email' => $user->email,
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('profile.edit'));

        $this->assertNotNull($user->refresh()->email_verified_at);
    }

    public function test_user_can_delete_their_account()
    {
        $user = User::factory()->create();
        $interest = Interest::query()->firstOrFail();
        $user->interests()->attach($interest);

        $response = $this
            ->actingAs($user)
            ->delete(route('profile.destroy'), [
                'password' => 'password',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('home'));

        $this->assertGuest();
        $this->assertNull($user->fresh());
        $this->assertDatabaseMissing('interest_user', [
            'user_id' => $user->id,
            'interest_id' => $interest->id,
        ]);
    }

    public function test_correct_password_must_be_provided_to_delete_account()
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->from(route('profile.edit'))
            ->delete(route('profile.destroy'), [
                'password' => 'wrong-password',
            ]);

        $response
            ->assertSessionHasErrors('password')
            ->assertRedirect(route('profile.edit'));

        $this->assertNotNull($user->fresh());
    }
}
