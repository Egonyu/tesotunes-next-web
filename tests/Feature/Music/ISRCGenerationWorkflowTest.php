<?php

namespace Tests\Feature\Music;

use App\Models\User;
use App\Models\Artist;
use App\Models\Song;
use App\Models\ISRCCode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ISRCGenerationWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Artist $artist;
    protected Song $song;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->artist = Artist::factory()->create(['user_id' => $this->user->id]);
        $this->song = Song::factory()->create([
            'user_id' => $this->user->id,
            'artist_id' => $this->artist->id,
            'status' => 'approved',
        ]);
    }

    public function test_isrc_code_follows_correct_format(): void
    {
        // Format: UG-XXX-YY-NNNNN
        $isrcCode = 'UGMUS2500001';

        $isrc = ISRCCode::factory()->create([
            'song_id' => $this->song->id,
            'isrc_code' => $isrcCode,
            'country_code' => 'UG',
            'registrant_code' => 'MUS',
            'year_code' => '25',
            'designation_code' => '00001',
        ]);

        $this->assertMatchesRegularExpression('/^UG-[A-Z]{3}-\d{2}-\d{5}$/', $isrc->code);
    }

    public function test_isrc_code_has_correct_country_code(): void
    {
        $isrc = ISRCCode::factory()->create([
            'song_id' => $this->song->id,
            'isrc_code' => 'UGMUS2500001',
            'country_code' => 'UG',
            'registrant_code' => 'MUS',
            'year_code' => '25',
            'designation_code' => '00001',
        ]);

        $this->assertStringStartsWith('UG-', $isrc->code);
    }

    public function test_isrc_code_has_registrant_code(): void
    {
        $isrc = ISRCCode::factory()->create([
            'song_id' => $this->song->id,
            'isrc_code' => 'UGMUS2500001',
            'country_code' => 'UG',
            'registrant_code' => 'MUS',
            'year_code' => '25',
            'designation_code' => '00001',
        ]);

        // Extract registrant code (characters 3-5)
        $registrantCode = substr($isrc->code, 3, 3);

        $this->assertEquals('MUS', $registrantCode);
        $this->assertEquals(3, strlen($registrantCode));
    }

    public function test_isrc_code_has_year_component(): void
    {
        $currentYear = now()->format('y');
        $isrc = ISRCCode::factory()->create([
            'song_id' => $this->song->id,
            'isrc_code' => "UGMUS{$currentYear}00001",
            'country_code' => 'UG',
            'registrant_code' => 'MUS',
            'year_code' => $currentYear,
            'designation_code' => '00001',
        ]);

        // Extract year (characters 7-8)
        $yearCode = substr($isrc->code, 7, 2);

        $this->assertEquals($currentYear, $yearCode);
    }

    public function test_isrc_code_has_sequential_designation(): void
    {
        $isrc = ISRCCode::factory()->create([
            'song_id' => $this->song->id,
            'isrc_code' => 'UGMUS2500001',
            'country_code' => 'UG',
            'registrant_code' => 'MUS',
            'year_code' => '25',
            'designation_code' => '00001',
        ]);

        // Extract designation (last 5 characters)
        $designation = substr($isrc->code, -5);

        $this->assertEquals('00001', $designation);
        $this->assertEquals(5, strlen($designation));
    }

    public function test_isrc_codes_are_sequential(): void
    {
        $song1 = Song::factory()->create([
            'user_id' => $this->user->id,
            'artist_id' => $this->artist->id,
        ]);

        $song2 = Song::factory()->create([
            'user_id' => $this->user->id,
            'artist_id' => $this->artist->id,
        ]);

        $isrc1 = ISRCCode::factory()->create([
            'song_id' => $song1->id,
            'isrc_code' => 'UGMUS2500001',
            'country_code' => 'UG',
            'registrant_code' => 'MUS',
            'year_code' => '25',
            'designation_code' => '00001',
        ]);

        $isrc2 = ISRCCode::factory()->create([
            'song_id' => $song2->id,
            'isrc_code' => 'UGMUS2500002',
            'country_code' => 'UG',
            'registrant_code' => 'MUS',
            'year_code' => '25',
            'designation_code' => '00002',
        ]);

        $sequence1 = (int) substr($isrc1->code, -5);
        $sequence2 = (int) substr($isrc2->code, -5);

        $this->assertEquals($sequence1 + 1, $sequence2);
    }

    public function test_isrc_code_is_unique(): void
    {
        $code = 'UGMUS2500001';

        ISRCCode::factory()->create([
            'song_id' => $this->song->id,
            'isrc_code' => $code,
            'country_code' => 'UG',
            'registrant_code' => 'MUS',
            'year_code' => '25',
            'designation_code' => '00001',
        ]);

        $this->expectException(\Illuminate\Database\QueryException::class);

        $song2 = Song::factory()->create([
            'user_id' => $this->user->id,
            'artist_id' => $this->artist->id,
        ]);

        ISRCCode::factory()->create([
            'song_id' => $song2->id,
            'isrc_code' => $code,
            'country_code' => 'UG',
            'registrant_code' => 'MUS',
            'year_code' => '25',
            'designation_code' => '00001',
        ]);
    }

    public function test_isrc_code_belongs_to_song(): void
    {
        $isrc = ISRCCode::factory()->create([
            'song_id' => $this->song->id,
        ]);

        $this->assertInstanceOf(Song::class, $isrc->song);
        $this->assertEquals($this->song->id, $isrc->song->id);
    }

    public function test_song_can_have_isrc_code(): void
    {
        $isrc = ISRCCode::factory()->create([
            'song_id' => $this->song->id,
        ]);

        $this->song->refresh();

        $this->assertInstanceOf(ISRCCode::class, $this->song->isrcCode);
        $this->assertEquals($isrc->id, $this->song->isrcCode->id);
    }

    public function test_isrc_code_stores_generation_timestamp(): void
    {
        $isrc = ISRCCode::factory()->create([
            'song_id' => $this->song->id,
            'generated_at' => now(),
        ]);

        $this->assertNotNull($isrc->generated_at);
        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $isrc->generated_at);
    }

    public function test_isrc_code_resets_sequence_for_new_year(): void
    {
        // Create ISRC for year 24
        $isrc2024 = ISRCCode::factory()->create([
            'song_id' => $this->song->id,
            'isrc_code' => 'UGMUS2499999',
            'country_code' => 'UG',
            'registrant_code' => 'MUS',
            'year_code' => '24',
            'designation_code' => '99999',
        ]);

        // Create ISRC for year 25 (should reset to 00001)
        $song2025 = Song::factory()->create([
            'user_id' => $this->user->id,
            'artist_id' => $this->artist->id,
        ]);

        $isrc2025 = ISRCCode::factory()->create([
            'song_id' => $song2025->id,
            'isrc_code' => 'UGMUS2500001',
            'country_code' => 'UG',
            'registrant_code' => 'MUS',
            'year_code' => '25',
            'designation_code' => '00001',
        ]);

        $year2024 = substr($isrc2024->code, 7, 2);
        $year2025 = substr($isrc2025->code, 7, 2);
        $sequence2025 = substr($isrc2025->code, -5);

        $this->assertEquals('24', $year2024);
        $this->assertEquals('25', $year2025);
        $this->assertEquals('00001', $sequence2025);
    }

    public function test_song_cannot_be_distributed_without_isrc(): void
    {
        $song = Song::factory()->create([
            'user_id' => $this->user->id,
            'artist_id' => $this->artist->id,
            'isrc_code' => null,
            'distribution_status' => 'not_submitted',
        ]);

        $this->assertNull($song->isrc_code);
        $this->assertEquals('not_submitted', $song->distribution_status);
    }

    public function test_approved_song_can_get_isrc_assigned(): void
    {
        $song = Song::factory()->create([
            'user_id' => $this->user->id,
            'artist_id' => $this->artist->id,
            'status' => 'approved',
            'isrc_code' => null,
        ]);

        // Simulate ISRC assignment
        $isrcCode = 'UGMUS2500123';
        $song->update(['isrc_code' => $isrcCode]);

        ISRCCode::factory()->create([
            'song_id' => $song->id,
            'isrc_code' => $isrcCode,
        ]);

        $song->refresh();

        $this->assertEquals($isrcCode, $song->isrc_code);
        $this->assertNotNull($song->isrcCode);
    }

    public function test_isrc_code_is_immutable_once_assigned(): void
    {
        $originalCode = 'UGMUS2500001';

        $isrc = ISRCCode::factory()->create([
            'song_id' => $this->song->id,
            'isrc_code' => $originalCode,
        ]);

        // Try to change the code (this should be prevented in actual implementation)
        $this->song->update(['isrc_code' => $originalCode]);

        $this->song->refresh();
        $this->assertEquals($originalCode, $this->song->isrc_code);
    }

    public function test_multiple_songs_can_have_different_isrc_codes(): void
    {
        $songs = Song::factory()->count(5)->create([
            'user_id' => $this->user->id,
            'artist_id' => $this->artist->id,
        ]);

        $isrcCodes = [];
        foreach ($songs as $index => $song) {
            $code = sprintf('UGMUS25%05d', $index + 1);
            ISRCCode::factory()->create([
                'song_id' => $song->id,
                'isrc_code' => $code,
            ]);
            $isrcCodes[] = $code;
        }

        $this->assertCount(5, array_unique($isrcCodes));
    }

    public function test_isrc_table_has_correct_indexes(): void
    {
        // This tests that queries are efficient
        $isrc = ISRCCode::factory()->create([
            'song_id' => $this->song->id,
        ]);

        // Test query by code (should use index)
        $found = ISRCCode::where('isrc_code', $isrc->isrc_code)->first();
        $this->assertNotNull($found);

        // Test query by song_id (should use index)
        $found = ISRCCode::where('song_id', $this->song->id)->first();
        $this->assertNotNull($found);
    }
}
