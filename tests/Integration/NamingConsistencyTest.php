<?php

namespace Tests\Integration;

use Tests\TestCase;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\Artist;
use App\Models\Song;

/**
 * Naming Consistency Test
 * 
 * Ensures that model $fillable arrays match actual database columns.
 * Prevents future divergence between models and migrations.
 * 
 * This test will FAIL FAST if someone adds non-existent columns to $fillable
 * or if migrations add columns without updating models.
 */
class NamingConsistencyTest extends TestCase
{
    /**
     * Test that Artist model $fillable only contains real DB columns
     */
    public function test_artist_fillable_matches_database_columns(): void
    {
        $artist = new Artist();
        $fillable = $artist->getFillable();
        $dbColumns = Schema::getColumnListing('artists');
        
        // Check each fillable column exists in DB
        $nonExistentColumns = [];
        foreach ($fillable as $column) {
            if (!in_array($column, $dbColumns)) {
                $nonExistentColumns[] = $column;
            }
        }
        
        $this->assertEmpty(
            $nonExistentColumns,
            "Artist model \$fillable contains non-existent columns: " . implode(', ', $nonExistentColumns) . 
            "\nRemove these from app/Models/Artist.php \$fillable array."
        );
    }
    
    /**
     * Test that Song model $fillable only contains real DB columns
     */
    public function test_song_fillable_matches_database_columns(): void
    {
        $song = new Song();
        $fillable = $song->getFillable();
        $dbColumns = Schema::getColumnListing('songs');
        
        // Check each fillable column exists in DB
        $nonExistentColumns = [];
        foreach ($fillable as $column) {
            if (!in_array($column, $dbColumns)) {
                $nonExistentColumns[] = $column;
            }
        }
        
        $this->assertEmpty(
            $nonExistentColumns,
            "Song model \$fillable contains non-existent columns: " . implode(', ', $nonExistentColumns) . 
            "\nRemove these from app/Models/Song.php \$fillable array." .
            "\nSee docs/NAMING_CONVENTIONS.md for canonical column names."
        );
    }
    
    /**
     * Test that critical Artist columns are present in database
     */
    public function test_artist_required_columns_exist(): void
    {
        $requiredColumns = [
            'id', 'user_id', 'stage_name', 'slug', 'is_verified',
            'total_songs_count', 'total_plays_count', 'total_revenue',
            'followers_count', 'created_at', 'updated_at'
        ];
        
        $dbColumns = Schema::getColumnListing('artists');
        
        $missingColumns = [];
        foreach ($requiredColumns as $column) {
            if (!in_array($column, $dbColumns)) {
                $missingColumns[] = $column;
            }
        }
        
        $this->assertEmpty(
            $missingColumns,
            "Artists table is missing required columns: " . implode(', ', $missingColumns)
        );
    }
    
    /**
     * Test that critical Song columns are present in database
     */
    public function test_song_required_columns_exist(): void
    {
        $requiredColumns = [
            'id', 'user_id', 'artist_id', 'title', 'slug',
            'audio_file_original', 'duration_seconds', 'status',
            'play_count', 'revenue_generated', 'is_downloadable',
            'created_at', 'updated_at'
        ];
        
        $dbColumns = Schema::getColumnListing('songs');
        
        $missingColumns = [];
        foreach ($requiredColumns as $column) {
            if (!in_array($column, $dbColumns)) {
                $missingColumns[] = $column;
            }
        }
        
        $this->assertEmpty(
            $missingColumns,
            "Songs table is missing required columns: " . implode(', ', $missingColumns)
        );
    }
    
    /**
     * Test that Song model uses canonical column names (not legacy aliases)
     */
    public function test_song_does_not_have_legacy_fillable_columns(): void
    {
        $song = new Song();
        $fillable = $song->getFillable();
        
        // These should NOT be in $fillable (they're either accessors or don't exist)
        $legacyColumns = [
            'audio_file',      // Should be 'audio_file_original'
            'file_path',       // Should be 'audio_file_original'
            'file_path_128',   // Should be 'audio_file_128'
            'file_path_320',   // Should be 'audio_file_320'
            'preview_path',    // Should be 'audio_file_preview'
            'duration',        // Should be 'duration_seconds'
            'unique_listeners', // Should be 'unique_listeners_count'
            'revenue',         // Should be 'revenue_generated'
            'allow_downloads', // Should be 'is_downloadable'
        ];
        
        $foundLegacy = [];
        foreach ($legacyColumns as $legacy) {
            if (in_array($legacy, $fillable)) {
                $foundLegacy[] = $legacy;
            }
        }
        
        $this->assertEmpty(
            $foundLegacy,
            "Song model \$fillable contains legacy column names: " . implode(', ', $foundLegacy) . 
            "\nUse canonical names instead (see docs/NAMING_CONVENTIONS.md)"
        );
    }
    
    /**
     * Test that Song model $casts uses canonical column names
     */
    public function test_song_casts_use_canonical_names(): void
    {
        $song = new Song();
        $casts = $song->getCasts();
        
        // These should NOT be in $casts
        $legacyCasts = ['duration', 'unique_listeners', 'revenue', 'allow_downloads'];
        
        $foundLegacy = [];
        foreach ($legacyCasts as $legacy) {
            if (array_key_exists($legacy, $casts)) {
                $foundLegacy[] = $legacy;
            }
        }
        
        $this->assertEmpty(
            $foundLegacy,
            "Song model \$casts contains legacy column names: " . implode(', ', $foundLegacy)
        );
    }
    
    /**
     * Test that Song model accessors work correctly
     */
    public function test_song_backward_compatibility_accessors(): void
    {
        $song = new Song();
        $song->duration_seconds = 180;
        $song->audio_file_original = 'test.mp3';
        
        // Accessors should map to canonical columns
        $this->assertEquals(180, $song->duration, 'duration accessor should return duration_seconds');
        $this->assertEquals('test.mp3', $song->audio_file, 'audio_file accessor should return audio_file_original');
    }
    
    /**
     * Test that artists table has performance cache columns
     */
    public function test_artist_has_cache_columns(): void
    {
        $dbColumns = Schema::getColumnListing('artists');
        
        $cacheColumns = ['total_plays_cached', 'total_revenue_cached'];
        
        foreach ($cacheColumns as $column) {
            $this->assertContains(
                $column,
                $dbColumns,
                "Artists table should have performance cache column: $column"
            );
        }
    }
    
    /**
     * Test that new cultural context columns exist (from consolidation migration)
     */
    public function test_song_has_cultural_context_columns(): void
    {
        $dbColumns = Schema::getColumnListing('songs');
        
        $culturalColumns = ['credits', 'local_genres', 'cultural_context'];
        
        foreach ($culturalColumns as $column) {
            $this->assertContains(
                $column,
                $dbColumns,
                "Songs table should have cultural context column: $column (added in consolidation migration)"
            );
        }
    }
}
