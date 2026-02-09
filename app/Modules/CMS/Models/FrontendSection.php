<?php

namespace App\Modules\CMS\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class FrontendSection extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'page',
        'type',
        'content_type',
        'content_id',
        'query',
        'limit',
        'order_by',
        'order_direction',
        'is_enabled',
        'display_order',
        'settings',
        'background_color',
        'text_color',
        'show_title',
        'show_view_all',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
        'show_title' => 'boolean',
        'show_view_all' => 'boolean',
        'display_order' => 'integer',
        'limit' => 'integer',
        'settings' => 'array',
    ];

    /**
     * Section types
     */
    const TYPE_CAROUSEL = 'carousel';
    const TYPE_GRID = 'grid';
    const TYPE_LIST = 'list';
    const TYPE_FEATURED = 'featured';
    const TYPE_CUSTOM = 'custom';

    /**
     * Content types that can be displayed
     */
    const CONTENT_SONGS = 'songs';
    const CONTENT_ALBUMS = 'albums';
    const CONTENT_ARTISTS = 'artists';
    const CONTENT_PLAYLISTS = 'playlists';
    const CONTENT_MOODS = 'moods';
    const CONTENT_GENRES = 'genres';
    const CONTENT_SLIDESHOW = 'slideshow';
    const CONTENT_CUSTOM = 'custom';

    /**
     * Get the content (polymorphic relationship)
     */
    public function content(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Scope for enabled sections
     */
    public function scopeEnabled($query)
    {
        return $query->where('is_enabled', true);
    }

    /**
     * Scope for specific page
     */
    public function scopeForPage($query, $page)
    {
        return $query->where('page', $page);
    }

    /**
     * Scope ordered by display order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order', 'asc');
    }

    /**
     * Get section data based on query
     */
    public function getSectionData()
    {
        if (!$this->is_enabled) {
            return collect();
        }

        return match($this->content_type) {
            self::CONTENT_SONGS => $this->getSongs(),
            self::CONTENT_ALBUMS => $this->getAlbums(),
            self::CONTENT_ARTISTS => $this->getArtists(),
            self::CONTENT_PLAYLISTS => $this->getPlaylists(),
            self::CONTENT_MOODS => $this->getMoods(),
            self::CONTENT_GENRES => $this->getGenres(),
            self::CONTENT_SLIDESHOW => $this->getSlideshow(),
            default => collect(),
        };
    }

    protected function getSongs()
    {
        $query = \App\Models\Song::query();
        return $this->applyQuery($query);
    }

    protected function getAlbums()
    {
        $query = \App\Models\Album::query();
        return $this->applyQuery($query);
    }

    protected function getArtists()
    {
        $query = \App\Models\Artist::query();
        return $this->applyQuery($query);
    }

    protected function getPlaylists()
    {
        $query = \App\Models\Playlist::query();
        return $this->applyQuery($query);
    }

    protected function getMoods()
    {
        $query = \App\Models\Mood::query();
        return $this->applyQuery($query);
    }

    protected function getGenres()
    {
        $query = \App\Models\Genre::query();
        return $this->applyQuery($query);
    }

    protected function getSlideshow()
    {
        $query = \App\Models\Slide::query();
        return $this->applyQuery($query);
    }

    protected function applyQuery($query)
    {
        if ($this->query) {
            $queryData = is_string($this->query) ? json_decode($this->query, true) : $this->query;
            
            // Apply filters from query
            foreach ($queryData as $key => $value) {
                if (method_exists($query, 'where')) {
                    $query->where($key, $value);
                }
            }
        }

        // Apply ordering
        $query->orderBy($this->order_by ?? 'created_at', $this->order_direction ?? 'desc');

        // Apply limit
        return $query->limit($this->limit ?? 10)->get();
    }
}
