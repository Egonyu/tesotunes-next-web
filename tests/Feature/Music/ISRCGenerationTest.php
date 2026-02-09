<?php

namespace Tests\Feature\Music;

use Tests\TestCase;
use App\Models\User;
use App\Models\Artist;
use App\Models\ArtistProfile;
use App\Models\Song;
use App\Models\Album;
use App\Models\ISRCCode;
use App\Models\PublishingRights;
use App\Models\RoyaltySplit;
use App\Jobs\ProcessISRCRegistration;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Event;

class ISRCGenerationTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();
        Queue::fake();
        Event::fake();
    }

    /**
     * Test ISRC generation endpoint for a single song
     */
    public function test_generate_isrc_for_song()
    {
        // Arrange
        $artist = User::factory()->create();
        $artistProfile = ArtistProfile::factory()->create(['user_id' => $artist->id]);
        $song = Song::factory()->create(['artist_id' => $artistProfile->id]);

        // Act
        $response = $this->actingAs($artist)->postJson("/api/songs/{$song->id}/generate-isrc", [
            'copyright_owner' => 'Test Music Publishing',
            'copyright_year' => 2024,
            'recording_location' => 'Kampala, Uganda',
            'master_ownership_percentage' => 100,
            'publishing_ownership_percentage' => 100,
        ]);

        // Assert
        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'isrc' => [
                    'id',
                    'isrc_code',
                    'formatted_isrc',
                    'status',
                    'song_id',
                    'artist_id',
                ]
            ]);

        // Verify ISRC was created in database
        $this->assertDatabaseHas('isrc_codes', [
            'song_id' => $song->id,
            'artist_id' => $artistProfile->id,
            'status' => 'pending',
            'copyright_owner' => 'Test Music Publishing',
            'copyright_year' => 2024,
        ]);

        // Verify job was queued for registration processing
        Queue::assertPushed(ProcessISRCRegistration::class);
    }

    /**
     * Test ISRC generation with publishing splits
     */
    public function test_generate_isrc_with_publishing_splits()
    {
        $artist = User::factory()->create();
        $artistProfile = ArtistProfile::factory()->create(['user_id' => $artist->id]);
        $song = Song::factory()->create(['artist_id' => $artistProfile->id]);

        $response = $this->actingAs($artist)->postJson("/api/songs/{$song->id}/generate-isrc", [
            'copyright_owner' => 'Test Music Publishing',
            'copyright_year' => 2024,
            'master_ownership_percentage' => 100,
            'publishing_ownership_percentage' => 100,
            'publishing_splits' => [
                [
                    'contributor_name' => 'John Songwriter',
                    'percentage' => 60,
                    'role' => 'composer',
                    'contact_email' => 'john@example.com',
                ],
                [
                    'contributor_name' => 'Jane Writer',
                    'percentage' => 40,
                    'role' => 'writer',
                    'contact_email' => 'jane@example.com',
                ]
            ],
        ]);

        $response->assertStatus(201);

        $isrc = ISRCCode::where('song_id', $song->id)->first();

        // Verify publishing splits were created
        $this->assertDatabaseHas('royalty_splits', [
            'song_id' => $song->id,
            'collaborator_name' => 'John Songwriter',
            'split_percentage' => 60,
            'role' => 'composer',
        ]);

        $this->assertDatabaseHas('royalty_splits', [
            'song_id' => $song->id,
            'collaborator_name' => 'Jane Writer',
            'split_percentage' => 40,
            'role' => 'writer',
        ]);

        // Verify splits data is stored in ISRC record
        $this->assertNotNull($isrc->publishing_splits);
        $this->assertCount(2, $isrc->publishing_splits);
    }

    /**
     * Test ISRC generation validation
     */
    public function test_isrc_generation_validation()
    {
        $artist = User::factory()->create();
        $artistProfile = ArtistProfile::factory()->create(['user_id' => $artist->id]);
        $song = Song::factory()->create(['artist_id' => $artistProfile->id]);
        $song2 = Song::factory()->create(['artist_id' => $artistProfile->id]);

        // Test that generation works with empty fields (all are nullable)
        $response = $this->actingAs($artist)->postJson("/api/songs/{$song->id}/generate-isrc", []);

        $response->assertStatus(201);

        // Test invalid percentage values
        $response = $this->actingAs($artist)->postJson("/api/songs/{$song2->id}/generate-isrc", [
            'copyright_owner' => 'Test Music',
            'copyright_year' => 2024,
            'master_ownership_percentage' => 150, // Invalid > 100
            'publishing_ownership_percentage' => -10, // Invalid < 0
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'master_ownership_percentage',
                'publishing_ownership_percentage',
            ]);

        // Test publishing splits validation
        $response = $this->actingAs($artist)->postJson("/api/songs/{$song->id}/generate-isrc", [
            'copyright_owner' => 'Test Music',
            'copyright_year' => 2024,
            'master_ownership_percentage' => 100,
            'publishing_ownership_percentage' => 100,
            'publishing_splits' => [
                [
                    'contributor_name' => 'John',
                    'percentage' => 60,
                    'role' => 'composer',
                ],
                [
                    'contributor_name' => 'Jane',
                    'percentage' => 50, // Total > 100%
                    'role' => 'lyricist',
                ]
            ],
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['publishing_splits']);
    }

    /**
     * Test ISRC generation for song not owned by user
     */
    public function test_isrc_generation_unauthorized()
    {
        $artist1 = User::factory()->create();
        $artist2 = User::factory()->create();
        $artistProfile2 = ArtistProfile::factory()->create(['user_id' => $artist2->id]);
        $song = Song::factory()->create(['artist_id' => $artistProfile2->id]);

        $response = $this->actingAs($artist1)->postJson("/api/songs/{$song->id}/generate-isrc", [
            'copyright_owner' => 'Test Music',
            'copyright_year' => 2024,
            'master_ownership_percentage' => 100,
            'publishing_ownership_percentage' => 100,
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'You do not have permission to generate ISRC for this song',
            ]);
    }

    /**
     * Test ISRC generation for song that already has an ISRC
     */
    public function test_isrc_generation_duplicate_prevention()
    {
        $artist = User::factory()->create();
        $artistProfile = ArtistProfile::factory()->create(['user_id' => $artist->id]);
        $song = Song::factory()->create(['artist_id' => $artistProfile->id]);

        // Create existing ISRC
        ISRCCode::factory()->create(['song_id' => $song->id]);

        $response = $this->actingAs($artist)->postJson("/api/songs/{$song->id}/generate-isrc", [
            'copyright_owner' => 'Test Music',
            'copyright_year' => 2024,
            'master_ownership_percentage' => 100,
            'publishing_ownership_percentage' => 100,
        ]);

        $response->assertStatus(409)
            ->assertJson([
                'success' => false,
                'message' => 'ISRC already exists for this song',
            ]);
    }

    /**
     * Test batch ISRC generation for album
     */
    public function test_batch_isrc_generation_for_album()
    {
        $artist = User::factory()->create();
        $artistProfile = ArtistProfile::factory()->create(['user_id' => $artist->id]);
        $album = Album::factory()->create(['artist_id' => $artistProfile->id]);

        // Create songs in the album
        $songs = Song::factory()->count(5)->create([
            'artist_id' => $artistProfile->id,
            'album_id' => $album->id,
        ]);

        $response = $this->actingAs($artist)->postJson("/api/albums/{$album->id}/generate-isrc-batch", [
            'copyright_owner' => 'Test Music Publishing',
            'copyright_year' => 2024,
            'recording_location' => 'Kampala, Uganda',
            'master_ownership_percentage' => 100,
            'publishing_ownership_percentage' => 100,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'batch_id',
                'isrc_codes_generated',
                'total_songs',
            ]);

        // Verify ISRCs were created for all songs
        foreach ($songs as $song) {
            $this->assertDatabaseHas('isrc_codes', [
                'song_id' => $song->id,
                'artist_id' => $artistProfile->id,
                'album_id' => $album->id,
            ]);
        }

        // Verify sequential designation codes
        $isrcCodes = ISRCCode::where('album_id', $album->id)
            ->orderBy('designation_code')
            ->get();

        for ($i = 0; $i < 5; $i++) {
            $expectedDesignation = str_pad($i + 1, 5, '0', STR_PAD_LEFT);
            $this->assertEquals($expectedDesignation, $isrcCodes[$i]->designation_code);
        }
    }

    /**
     * Test ISRC registration processing
     */
    public function test_isrc_registration_processing()
    {
        $artist = User::factory()->create();
        $artistProfile = ArtistProfile::factory()->create(['user_id' => $artist->id]);
        $isrc = ISRCCode::factory()->create([
            'artist_id' => $artistProfile->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($artist)->postJson("/api/isrc/{$isrc->id}/register", [
            'registration_authority' => 'Uganda Registration Authority',
            'registration_reference' => 'URA_123456789',
            'international_registration' => true,
            'international_territories' => ['Kenya', 'Tanzania', 'Rwanda'],
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'ISRC registration processed successfully',
            ]);

        $isrc->refresh();
        $this->assertEquals('registered', $isrc->status);
        $this->assertEquals('URA_123456789', $isrc->registration_reference);
        $this->assertTrue($isrc->international_registration);
        $this->assertEquals(['Kenya', 'Tanzania', 'Rwanda'], $isrc->international_territories);
    }

    /**
     * Test ISRC distribution clearance
     */
    public function test_isrc_distribution_clearance()
    {
        $admin = User::factory()->create();
        $isrc = ISRCCode::factory()->create([
            'status' => 'registered',
            'cleared_for_distribution' => false,
        ]);

        $response = $this->actingAs($admin)->postJson("/api/isrc/{$isrc->id}/clear-for-distribution", [
            'distribution_restrictions' => ['No explicit content markets'],
            'territorial_restrictions' => ['China'],
            'clearance_notes' => 'Cleared for worldwide distribution except restricted territories',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'ISRC cleared for distribution',
            ]);

        $isrc->refresh();
        $this->assertTrue($isrc->cleared_for_distribution);
        $this->assertEquals(['No explicit content markets'], $isrc->distribution_restrictions);
        $this->assertEquals(['China'], $isrc->territorial_restrictions);
    }

    /**
     * Test ISRC analytics and reporting
     */
    public function test_isrc_analytics_and_reporting()
    {
        $artist = User::factory()->create();
        $artistProfile = ArtistProfile::factory()->create(['user_id' => $artist->id]);

        // Create test ISRCs with different statuses
        ISRCCode::factory()->count(5)->create([
            'artist_id' => $artistProfile->id,
            'status' => 'registered',
            'cleared_for_distribution' => true,
        ]);

        ISRCCode::factory()->count(3)->create([
            'artist_id' => $artistProfile->id,
            'status' => 'pending',
            'cleared_for_distribution' => false,
        ]);

        ISRCCode::factory()->count(2)->create([
            'artist_id' => $artistProfile->id,
            'status' => 'registered',
            'cleared_for_distribution' => false,
        ]);

        $response = $this->actingAs($artist)->getJson('/api/isrc/analytics');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'total_isrc_codes',
                'registered_codes',
                'pending_codes',
                'cleared_for_distribution',
                'international_registrations',
                'status_breakdown',
                'monthly_generation_trend',
            ]);

        $data = $response->json();
        $this->assertEquals(10, $data['total_isrc_codes']);
        $this->assertEquals(7, $data['registered_codes']);
        $this->assertEquals(3, $data['pending_codes']);
        $this->assertEquals(5, $data['cleared_for_distribution']);
    }

    /**
     * Test ISRC bulk operations
     */
    public function test_isrc_bulk_operations()
    {
        $admin = User::factory()->create();
        $artist = ArtistProfile::factory()->create();

        $isrcCodes = ISRCCode::factory()->count(5)->create([
            'artist_id' => $artist->id,
            'status' => 'pending',
        ]);

        $isrcIds = $isrcCodes->pluck('id')->toArray();

        // Test bulk registration
        $response = $this->actingAs($admin)->postJson('/api/isrc/bulk-register', [
            'isrc_ids' => $isrcIds,
            'registration_authority' => 'Uganda Registration Authority',
            'batch_reference' => 'BATCH_2024_001',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'processed_count' => 5,
            ]);

        // Verify all ISRCs were registered
        foreach ($isrcCodes as $isrc) {
            $isrc->refresh();
            $this->assertEquals('registered', $isrc->status);
            $this->assertEquals('Uganda Registration Authority', $isrc->registration_authority);
        }

        // Test bulk clearance for distribution
        $response = $this->actingAs($admin)->postJson('/api/isrc/bulk-clear-distribution', [
            'isrc_ids' => $isrcIds,
            'clearance_notes' => 'Bulk clearance for Q1 2024 releases',
        ]);

        $response->assertStatus(200);

        // Verify all ISRCs were cleared
        foreach ($isrcCodes as $isrc) {
            $isrc->refresh();
            $this->assertTrue($isrc->cleared_for_distribution);
        }
    }

    /**
     * Test ISRC search and filtering
     */
    public function test_isrc_search_and_filtering()
    {
        $artist = User::factory()->create();
        $artistProfile = ArtistProfile::factory()->create(['user_id' => $artist->id]);

        // Create test data
        $song1 = Song::factory()->create(['title' => 'Amazing Song', 'artist_id' => $artistProfile->id]);
        $song2 = Song::factory()->create(['title' => 'Different Track', 'artist_id' => $artistProfile->id]);

        ISRCCode::factory()->create([
            'song_id' => $song1->id,
            'artist_id' => $artistProfile->id,
            'status' => 'registered',
            'year_code' => '24',
        ]);

        ISRCCode::factory()->create([
            'song_id' => $song2->id,
            'artist_id' => $artistProfile->id,
            'status' => 'pending',
            'year_code' => '23',
        ]);

        // Test search by song title
        $response = $this->actingAs($artist)->getJson('/api/isrc/search?query=Amazing');

        $response->assertStatus(200);
        $data = $response->json();
        $this->assertEquals(1, count($data['data']));
        $this->assertEquals($song1->id, $data['data'][0]['song_id']);

        // Test filter by status
        $response = $this->actingAs($artist)->getJson('/api/isrc?status=registered');

        $response->assertStatus(200);
        $data = $response->json();
        $this->assertEquals(1, count($data['data']));

        // Test filter by year
        $response = $this->actingAs($artist)->getJson('/api/isrc?year=2024');

        $response->assertStatus(200);
        $data = $response->json();
        $this->assertEquals(1, count($data['data']));
    }

    /**
     * Test ISRC export functionality
     */
    public function test_isrc_export()
    {
        $artist = User::factory()->create();
        $artistProfile = ArtistProfile::factory()->create(['user_id' => $artist->id]);

        ISRCCode::factory()->count(10)->create(['artist_id' => $artistProfile->id]);

        $response = $this->actingAs($artist)->getJson('/api/isrc/export?format=csv');

        $response->assertStatus(200);
        $this->assertTrue(
            str_contains($response->headers->get('Content-Type'), 'text/csv'),
            'Content-Type should contain text/csv'
        );
        $response->assertHeader('Content-Disposition', 'attachment; filename="isrc_codes.csv"');

        // Test Excel export
        $response = $this->actingAs($artist)->getJson('/api/isrc/export?format=xlsx');

        $response->assertStatus(200);
        $this->assertTrue(
            str_contains($response->headers->get('Content-Type'), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
            'Content-Type should contain xlsx MIME type'
        );
    }

    /**
     * Test ISRC validation endpoint
     */
    public function test_isrc_validation_endpoint()
    {
        $this->markTestSkipped('ISRC validation API endpoint not yet implemented');
        
        // Test valid ISRC
        $response = $this->postJson('/api/isrc/validate', [
            'isrc_code' => 'UGABC2400001',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'valid' => true,
                'formatted' => 'UG-ABC-24-00001',
                'components' => [
                    'country_code' => 'UG',
                    'registrant_code' => 'ABC',
                    'year_code' => '24',
                    'designation_code' => '00001',
                ],
            ]);

        // Test invalid ISRC
        $response = $this->postJson('/api/isrc/validate', [
            'isrc_code' => 'INVALID',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'valid' => false,
                'errors' => ['Invalid ISRC format'],
            ]);
    }

    /**
     * Test ISRC duplicate detection across system
     */
    public function test_isrc_duplicate_detection()
    {
        $artist1 = ArtistProfile::factory()->create();
        $artist2 = ArtistProfile::factory()->create();
        $user = User::factory()->create();

        // Create ISRC with specific code
        ISRCCode::factory()->create([
            'artist_id' => $artist1->id,
            'isrc_code' => 'UGABC2400001',
            'country_code' => 'UG',
            'registrant_code' => 'ABC',
            'year_code' => '24',
            'designation_code' => '00001',
        ]);

        // Try to create duplicate ISRC code
        $response = $this->actingAs($user)->postJson('/api/isrc/check-duplicate', [
            'isrc_code' => 'UGABC2400001',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'exists' => true,
                'message' => 'ISRC code already exists in the system',
            ]);

        // Test non-duplicate
        $response = $this->actingAs($user)->postJson('/api/isrc/check-duplicate', [
            'isrc_code' => 'UGABC2400002',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'exists' => false,
            ]);
    }

    /**
     * Test ISRC international standards compliance
     */
    public function test_isrc_international_standards_compliance()
    {
        $artist = User::factory()->create();
        $artistProfile = ArtistProfile::factory()->create(['user_id' => $artist->id]);
        $song = Song::factory()->create(['artist_id' => $artistProfile->id]);

        $response = $this->actingAs($artist)->postJson("/api/songs/{$song->id}/generate-isrc", [
            'copyright_owner' => 'Test Music Publishing',
            'copyright_year' => 2024,
            'master_ownership_percentage' => 100,
            'publishing_ownership_percentage' => 100,
            'iso_3901_compliance' => true,
            'recording_details' => [
                'recording_engineer' => 'John Engineer',
                'mixing_engineer' => 'Jane Mixer',
                'mastering_engineer' => 'Bob Master',
                'producer' => 'Alice Producer',
            ],
        ]);

        $response->assertStatus(201);

        $isrc = ISRCCode::where('song_id', $song->id)->first();

        // Verify ISO 3901 compliance fields
        $this->assertNotNull($isrc->recording_details);
        $this->assertEquals('John Engineer', $isrc->recording_details['recording_engineer']);

        // Verify ISRC code follows international standard format
        $this->assertTrue(ISRCCode::validateISRCFormat($isrc->isrc_code));
        $this->assertEquals(12, strlen($isrc->isrc_code)); // Standard length
        $this->assertEquals('UG', substr($isrc->isrc_code, 0, 2)); // Country code
    }
}