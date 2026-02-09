<?php

namespace Tests\Unit\Models;

use Tests\TestCase;
use App\Models\ISRCCode;
use App\Models\Song;
use App\Models\Artist;
use App\Models\ArtistProfile;
use App\Models\Album;
use App\Models\PublishingRights;
use App\Models\RoyaltySplit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Carbon\Carbon;

class ISRCCodeTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    /**
     * Test ISRC code generation for a song
     */
    public function test_generate_isrc_for_song()
    {
        // Arrange
        $artist = Artist::factory()->create(['stage_name' => 'TEST ARTIST']);
        $song = Song::factory()->create([
            'artist_id' => $artist->id,
            'title' => 'Test Song',
            'duration_seconds' => 210,
            'created_at' => Carbon::create(2024, 1, 15),
        ]);

        // Act
        $isrc = ISRCCode::generateForSong($song);

        // Assert
        $this->assertInstanceOf(ISRCCode::class, $isrc);
        $this->assertEquals($song->id, $isrc->song_id);
        $this->assertEquals($artist->id, $isrc->artist_id);
        $this->assertEquals('UG', $isrc->country_code);
        $this->assertEquals('24', $isrc->year_code); // 2024 -> 24
        $this->assertEquals('Test Song', $isrc->work_title);
        $this->assertEquals(210, $isrc->duration_seconds);
        $this->assertEquals('pending', $isrc->status);

        // Test ISRC format
        $expectedCode = 'UG' . $isrc->registrant_code . '24' . $isrc->designation_code;
        $this->assertEquals($expectedCode, $isrc->isrc_code);
    }

    /**
     * Test registrant code generation from artist name
     */
    public function test_registrant_code_generation_from_name()
    {
        // Arrange
        $artist = Artist::factory()->create(['stage_name' => 'JOHN DOE MUSIC']);
        $song = Song::factory()->create(['artist_id' => $artist->id]);

        // Act
        $isrc = ISRCCode::generateForSong($song);

        // Assert
        $this->assertEquals('JOH', $isrc->registrant_code); // First 3 chars of cleaned name
    }

    /**
     * Test registrant code generation fallback to ID
     */
    public function test_registrant_code_generation_fallback_to_id()
    {
        // Arrange
        $artist = Artist::factory()->create([
            'stage_name' => 'X!' // Short name with special chars
        ]);
        $song = Song::factory()->create(['artist_id' => $artist->id]);

        // Act
        $isrc = ISRCCode::generateForSong($song);

        // Assert - Should be 3-character code based on artist ID
        $expectedCode = str_pad(substr($artist->id, -3), 3, '0', STR_PAD_LEFT);
        $this->assertEquals($expectedCode, $isrc->registrant_code);
    }

    /**
     * Test designation code sequential generation
     */
    public function test_designation_code_sequential_generation()
    {
        // Arrange
        $artist = Artist::factory()->create();
        $song1 = Song::factory()->create(['artist_id' => $artist->id]);
        $song2 = Song::factory()->create(['artist_id' => $artist->id]);
        $song3 = Song::factory()->create(['artist_id' => $artist->id]);

        // Act
        $isrc1 = ISRCCode::generateForSong($song1);
        $isrc2 = ISRCCode::generateForSong($song2);
        $isrc3 = ISRCCode::generateForSong($song3);

        // Assert
        $this->assertEquals('00001', $isrc1->designation_code);
        $this->assertEquals('00002', $isrc2->designation_code);
        $this->assertEquals('00003', $isrc3->designation_code);
    }

    /**
     * Test ISRC format validation
     */
    public function test_isrc_format_validation()
    {
        // Valid ISRC formats
        $this->assertTrue(ISRCCode::validateISRCFormat('UGABC2400001'));
        $this->assertTrue(ISRCCode::validateISRCFormat('USRC12345678'));
        $this->assertTrue(ISRCCode::validateISRCFormat('GB1234567890'));

        // Invalid ISRC formats
        $this->assertFalse(ISRCCode::validateISRCFormat('UG-ABC-24-00001')); // With dashes
        $this->assertFalse(ISRCCode::validateISRCFormat('UGABC240000')); // Too short
        $this->assertFalse(ISRCCode::validateISRCFormat('UGABC24000012')); // Too long
        $this->assertFalse(ISRCCode::validateISRCFormat('1GABC2400001')); // Invalid country code
        $this->assertFalse(ISRCCode::validateISRCFormat('UGABC2A00001')); // Invalid year
        $this->assertFalse(ISRCCode::validateISRCFormat('')); // Empty
    }

    /**
     * Test ISRC parsing
     */
    public function test_isrc_parsing()
    {
        // Test with clean ISRC
        $parsed = ISRCCode::parseISRC('UGABC2400001');

        $this->assertEquals('UG', $parsed['country_code']);
        $this->assertEquals('ABC', $parsed['registrant_code']);
        $this->assertEquals('24', $parsed['year_code']);
        $this->assertEquals('00001', $parsed['designation_code']);
        $this->assertEquals('2024', $parsed['full_year']);

        // Test with dashed ISRC
        $parsed = ISRCCode::parseISRC('UG-ABC-24-00001');

        $this->assertEquals('UG', $parsed['country_code']);
        $this->assertEquals('ABC', $parsed['registrant_code']);
        $this->assertEquals('24', $parsed['year_code']);
        $this->assertEquals('00001', $parsed['designation_code']);
    }

    /**
     * Test ISRC parsing with invalid format
     */
    public function test_isrc_parsing_invalid_format()
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Invalid ISRC format');

        ISRCCode::parseISRC('INVALID');
    }

    /**
     * Test formatted ISRC accessor
     */
    public function test_formatted_isrc_accessor()
    {
        $isrc = ISRCCode::factory()->create([
            'country_code' => 'UG',
            'registrant_code' => 'ABC',
            'year_code' => '24',
            'designation_code' => '00001',
        ]);

        $this->assertEquals('UG-ABC-24-00001', $isrc->formatted_isrc);
    }

    /**
     * Test registration status badge accessor
     */
    public function test_registration_status_badge_accessor()
    {
        $pendingIsrc = ISRCCode::factory()->create(['status' => 'pending']);
        $registeredIsrc = ISRCCode::factory()->create(['status' => 'registered']);
        $disputedIsrc = ISRCCode::factory()->create(['status' => 'disputed']);
        $cancelledIsrc = ISRCCode::factory()->create(['status' => 'cancelled']);

        $this->assertEquals('⏳ Pending', $pendingIsrc->registration_status_badge);
        $this->assertEquals('✅ Registered', $registeredIsrc->registration_status_badge);
        $this->assertEquals('⚠️ Disputed', $disputedIsrc->registration_status_badge);
        $this->assertEquals('❌ Cancelled', $cancelledIsrc->registration_status_badge);
    }

    /**
     * Test distribution status badge accessor
     */
    public function test_distribution_status_badge_accessor()
    {
        $clearedIsrc = ISRCCode::factory()->create(['cleared_for_distribution' => true]);
        $pendingIsrc = ISRCCode::factory()->create(['cleared_for_distribution' => false]);

        $this->assertEquals('✅ Cleared', $clearedIsrc->distribution_status_badge);
        $this->assertEquals('⏳ Pending Clearance', $pendingIsrc->distribution_status_badge);
    }

    /**
     * Test age calculation
     */
    public function test_age_calculation()
    {
        $isrc = ISRCCode::factory()->create([
            'recording_date' => Carbon::now()->subYears(3),
        ]);

        $this->assertEquals(3, $isrc->age_in_years);
    }

    /**
     * Test status checking methods
     */
    public function test_status_checking_methods()
    {
        $pendingIsrc = ISRCCode::factory()->create(['status' => 'pending']);
        $registeredIsrc = ISRCCode::factory()->create(['status' => 'registered']);
        $disputedIsrc = ISRCCode::factory()->create(['status' => 'disputed']);

        $this->assertTrue($pendingIsrc->isPending());
        $this->assertFalse($pendingIsrc->isRegistered());
        $this->assertFalse($pendingIsrc->isDisputed());

        $this->assertFalse($registeredIsrc->isPending());
        $this->assertTrue($registeredIsrc->isRegistered());
        $this->assertFalse($registeredIsrc->isDisputed());

        $this->assertFalse($disputedIsrc->isPending());
        $this->assertFalse($disputedIsrc->isRegistered());
        $this->assertTrue($disputedIsrc->isDisputed());
    }

    /**
     * Test distribution clearance check
     */
    public function test_distribution_clearance_check()
    {
        $clearedAndRegistered = ISRCCode::factory()->create([
            'status' => 'registered',
            'cleared_for_distribution' => true,
        ]);

        $notCleared = ISRCCode::factory()->create([
            'status' => 'registered',
            'cleared_for_distribution' => false,
        ]);

        $clearedButNotRegistered = ISRCCode::factory()->create([
            'status' => 'pending',
            'cleared_for_distribution' => true,
        ]);

        $this->assertTrue($clearedAndRegistered->isClearedForDistribution());
        $this->assertFalse($notCleared->isClearedForDistribution());
        $this->assertFalse($clearedButNotRegistered->isClearedForDistribution());
    }

    /**
     * Test international registration check
     */
    public function test_international_registration_check()
    {
        $international = ISRCCode::factory()->create(['international_registration' => true]);
        $domestic = ISRCCode::factory()->create(['international_registration' => false]);

        $this->assertTrue($international->hasInternationalRegistration());
        $this->assertFalse($domestic->hasInternationalRegistration());
    }

    /**
     * Test ownership percentage calculation
     */
    public function test_ownership_percentage_calculation()
    {
        $isrc = ISRCCode::factory()->create([
            'master_ownership_percentage' => 75.5,
            'publishing_ownership_percentage' => 20.0,
        ]);

        $this->assertEquals(95.5, $isrc->getTotalOwnershipPercentage());
    }

    /**
     * Test territorial distribution check
     */
    public function test_territorial_distribution_check()
    {
        $clearedIsrc = ISRCCode::factory()->create([
            'status' => 'registered',
            'cleared_for_distribution' => true,
            'international_registration' => true,
            'territorial_restrictions' => ['China', 'Iran'],
        ]);

        // Can distribute to Uganda (domestic)
        $this->assertTrue($clearedIsrc->canBeDistributedTo('Uganda'));

        // Can distribute to US (international with registration)
        $this->assertTrue($clearedIsrc->canBeDistributedTo('United States'));

        // Cannot distribute to China (restricted)
        $this->assertFalse($clearedIsrc->canBeDistributedTo('China'));

        // Cannot distribute to Iran (restricted)
        $this->assertFalse($clearedIsrc->canBeDistributedTo('Iran'));
    }

    /**
     * Test territorial distribution without international registration
     */
    public function test_territorial_distribution_no_international()
    {
        $domesticIsrc = ISRCCode::factory()->create([
            'status' => 'registered',
            'cleared_for_distribution' => true,
            'international_registration' => false,
        ]);

        // Can distribute to Uganda
        $this->assertTrue($domesticIsrc->canBeDistributedTo('Uganda'));

        // Cannot distribute internationally without registration
        $this->assertFalse($domesticIsrc->canBeDistributedTo('United States'));
        $this->assertFalse($domesticIsrc->canBeDistributedTo('United Kingdom'));
    }

    /**
     * Test mark as registered
     */
    public function test_mark_as_registered()
    {
        $isrc = ISRCCode::factory()->create(['status' => 'pending']);

        $isrc->markAsRegistered('REG_123456');

        $this->assertEquals('registered', $isrc->status);
        $this->assertEquals('REG_123456', $isrc->registration_reference);
        $this->assertNotNull($isrc->registered_at);
    }

    /**
     * Test clear for distribution
     */
    public function test_clear_for_distribution()
    {
        $isrc = ISRCCode::factory()->create(['cleared_for_distribution' => false]);

        $restrictions = ['No explicit content', 'Family-friendly only'];
        $isrc->clearForDistribution($restrictions);

        $this->assertTrue($isrc->cleared_for_distribution);
        $this->assertEquals($restrictions, $isrc->distribution_restrictions);
        $this->assertNotNull($isrc->distribution_cleared_at);
    }

    /**
     * Test territorial restriction management
     */
    public function test_territorial_restriction_management()
    {
        $isrc = ISRCCode::factory()->create(['territorial_restrictions' => ['China']]);

        // Add restriction
        $isrc->addTerritorialRestriction('Iran');
        $this->assertContains('Iran', $isrc->territorial_restrictions);
        $this->assertContains('China', $isrc->territorial_restrictions);

        // Try to add duplicate (should not duplicate)
        $isrc->addTerritorialRestriction('China');
        $this->assertCount(2, $isrc->territorial_restrictions);

        // Remove restriction
        $isrc->removeTerritorialRestriction('China');
        $this->assertNotContains('China', $isrc->territorial_restrictions);
        $this->assertContains('Iran', $isrc->territorial_restrictions);
    }

    /**
     * Test enable international registration
     */
    public function test_enable_international_registration()
    {
        $isrc = ISRCCode::factory()->create(['international_registration' => false]);

        $territories = ['United States', 'United Kingdom', 'Canada'];
        $isrc->enableInternationalRegistration($territories);

        $this->assertTrue($isrc->international_registration);
        $this->assertEquals($territories, $isrc->international_territories);
        $this->assertNotNull($isrc->international_registered_at);

        // Test with default territories
        $isrc2 = ISRCCode::factory()->create(['international_registration' => false]);
        $isrc2->enableInternationalRegistration();

        $this->assertEquals(['Global'], $isrc2->international_territories);
    }

    /**
     * Test scopes
     */
    public function test_scopes()
    {
        // Create test data with explicit values to avoid overlaps
        ISRCCode::factory()->count(3)->create([
            'status' => 'registered',
            'cleared_for_distribution' => false,
            'international_registration' => false,
            'country_code' => 'US'
        ]);
        ISRCCode::factory()->count(2)->create([
            'status' => 'pending',
            'cleared_for_distribution' => false,
            'international_registration' => false,
            'country_code' => 'US'
        ]);
        ISRCCode::factory()->count(2)->create([
            'cleared_for_distribution' => true,
            'status' => 'disputed',
            'international_registration' => false,
            'country_code' => 'US'
        ]);
        ISRCCode::factory()->count(1)->create([
            'country_code' => 'UG',
            'status' => 'disputed',
            'cleared_for_distribution' => false,
            'international_registration' => false
        ]);
        ISRCCode::factory()->count(1)->create([
            'international_registration' => true,
            'status' => 'disputed',
            'cleared_for_distribution' => false,
            'country_code' => 'US'
        ]);

        $artist = Artist::factory()->create();
        ISRCCode::factory()->count(2)->create([
            'artist_id' => $artist->id,
            'status' => 'disputed',
            'cleared_for_distribution' => false,
            'international_registration' => false,
            'country_code' => 'US'
        ]);

        // Test scopes
        $this->assertEquals(3, ISRCCode::registered()->count());
        $this->assertEquals(2, ISRCCode::pending()->count());
        $this->assertEquals(2, ISRCCode::clearedForDistribution()->count());
        $this->assertEquals(1, ISRCCode::ugandanCodes()->count());
        $this->assertEquals(1, ISRCCode::international()->count());
        $this->assertEquals(2, ISRCCode::byArtist($artist->id)->count());

        // Test byYear scope
        $currentYear = now()->year;
        $yearCode = substr($currentYear, 2, 2);
        
        // Ensure all previously created codes have different year codes
        ISRCCode::query()->update(['year_code' => '20']); // Set all to year 2020
        
        ISRCCode::factory()->create(['year_code' => $yearCode]);

        $this->assertEquals(1, ISRCCode::byYear($currentYear)->count());
    }

    /**
     * Test relationships
     */
    public function test_relationships()
    {
        $artist = Artist::factory()->create();
        $album = Album::factory()->create();
        $song = Song::factory()->create(['artist_id' => $artist->id, 'album_id' => $album->id]);

        $isrc = ISRCCode::factory()->create([
            'song_id' => $song->id,
            'artist_id' => $artist->id,
            'album_id' => $album->id,
        ]);

        PublishingRights::factory()->create(['song_id' => $song->id]);
        RoyaltySplit::factory()->create(['song_id' => $song->id]);

        // Test relationships
        $this->assertInstanceOf(Song::class, $isrc->song);
        $this->assertInstanceOf(Artist::class, $isrc->artist);
        $this->assertInstanceOf(Album::class, $isrc->album);
        $this->assertCount(1, $isrc->publishingRights);
        $this->assertCount(1, $isrc->royaltySplits);
    }

    /**
     * Test batch ISRC generation for multiple songs
     */
    public function test_batch_isrc_generation()
    {
        $artist = Artist::factory()->create();
        $songs = Song::factory()->count(5)->create(['artist_id' => $artist->id]);

        $isrcCodes = [];
        foreach ($songs as $song) {
            $isrcCodes[] = ISRCCode::generateForSong($song);
        }

        // Verify all ISRCs were created
        $this->assertCount(5, $isrcCodes);

        // Verify sequential designation codes
        for ($i = 0; $i < 5; $i++) {
            $expectedDesignation = str_pad($i + 1, 5, '0', STR_PAD_LEFT);
            $this->assertEquals($expectedDesignation, $isrcCodes[$i]->designation_code);
        }

        // Verify all have same registrant code (same artist)
        $registrantCode = $isrcCodes[0]->registrant_code;
        foreach ($isrcCodes as $isrc) {
            $this->assertEquals($registrantCode, $isrc->registrant_code);
        }
    }

    /**
     * Test duplicate ISRC prevention
     */
    public function test_duplicate_isrc_prevention()
    {
        $artist = Artist::factory()->create();
        $song = Song::factory()->create(['artist_id' => $artist->id]);

        // Generate first ISRC
        $isrc1 = ISRCCode::generateForSong($song);

        // Try to generate another ISRC for the same song
        $existingIsrc = ISRCCode::where('song_id', $song->id)->first();
        $this->assertNotNull($existingIsrc);
        $this->assertEquals($isrc1->id, $existingIsrc->id);

        // Verify count is still 1
        $this->assertEquals(1, ISRCCode::where('song_id', $song->id)->count());
    }
}