import { http, HttpResponse } from 'msw';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Mock data
const songs = [
  {
    id: '1',
    title: 'Afrobeat Vibes',
    slug: 'afrobeat-vibes',
    artist: { id: '1', name: 'Eddy Kenzo', slug: 'eddy-kenzo' },
    duration: 245,
    plays: 125000,
    artwork_url: '/images/songs/1.jpg',
    audio_url: '/audio/songs/1.mp3',
    created_at: '2024-01-15',
  },
  {
    id: '2',
    title: 'Midnight Love',
    slug: 'midnight-love',
    artist: { id: '2', name: 'Sheebah', slug: 'sheebah' },
    duration: 198,
    plays: 89000,
    artwork_url: '/images/songs/2.jpg',
    audio_url: '/audio/songs/2.mp3',
    created_at: '2024-01-20',
  },
];

const artists = [
  {
    id: '1',
    name: 'Eddy Kenzo',
    slug: 'eddy-kenzo',
    bio: 'Award-winning Ugandan artist',
    avatar_url: '/images/artists/1.jpg',
    followers_count: 250000,
    songs_count: 45,
    is_verified: true,
  },
  {
    id: '2',
    name: 'Sheebah',
    slug: 'sheebah',
    bio: 'Queen of Ugandan music',
    avatar_url: '/images/artists/2.jpg',
    followers_count: 180000,
    songs_count: 32,
    is_verified: true,
  },
];

const albums = [
  {
    id: '1',
    title: 'Golden Era',
    slug: 'golden-era',
    artist: artists[0],
    artwork_url: '/images/albums/1.jpg',
    release_date: '2024-02-01',
    tracks_count: 12,
  },
];

const genres = [
  { id: '1', name: 'Afrobeat', slug: 'afrobeat', color: '#FF6B6B', songs_count: 1500 },
  { id: '2', name: 'Dancehall', slug: 'dancehall', color: '#4ECDC4', songs_count: 890 },
  { id: '3', name: 'Gospel', slug: 'gospel', color: '#45B7D1', songs_count: 670 },
];

export const handlers = [
  // Songs
  http.get(`${API_URL}/songs`, () => {
    return HttpResponse.json({
      data: songs,
      meta: { total: songs.length, per_page: 20, current_page: 1 },
    });
  }),

  http.get(`${API_URL}/songs/:slug`, ({ params }) => {
    const song = songs.find((s) => s.slug === params.slug);
    if (!song) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json({ data: song });
  }),

  // Trending songs
  http.get(`${API_URL}/songs/trending`, () => {
    return HttpResponse.json({ data: songs });
  }),

  // Artists
  http.get(`${API_URL}/artists`, () => {
    return HttpResponse.json({
      data: artists,
      meta: { total: artists.length, per_page: 20, current_page: 1 },
    });
  }),

  http.get(`${API_URL}/artists/:slug`, ({ params }) => {
    const artist = artists.find((a) => a.slug === params.slug);
    if (!artist) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json({ data: artist });
  }),

  // Albums
  http.get(`${API_URL}/albums`, () => {
    return HttpResponse.json({
      data: albums,
      meta: { total: albums.length, per_page: 20, current_page: 1 },
    });
  }),

  http.get(`${API_URL}/albums/:slug`, ({ params }) => {
    const album = albums.find((a) => a.slug === params.slug);
    if (!album) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json({
      data: {
        ...album,
        tracks: songs,
      },
    });
  }),

  // Genres
  http.get(`${API_URL}/genres`, () => {
    return HttpResponse.json({ data: genres });
  }),

  // Search
  http.get(`${API_URL}/search`, ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q')?.toLowerCase() || '';

    const matchedSongs = songs.filter((s) =>
      s.title.toLowerCase().includes(query)
    );
    const matchedArtists = artists.filter((a) =>
      a.name.toLowerCase().includes(query)
    );
    const matchedAlbums = albums.filter((a) =>
      a.title.toLowerCase().includes(query)
    );

    return HttpResponse.json({
      data: {
        songs: matchedSongs,
        artists: matchedArtists,
        albums: matchedAlbums,
      },
    });
  }),

  // Auth - User profile
  http.get(`${API_URL}/user`, () => {
    return HttpResponse.json({
      data: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        avatar_url: '/images/users/1.jpg',
      },
    });
  }),

  // Library
  http.get(`${API_URL}/library/songs`, () => {
    return HttpResponse.json({ data: songs });
  }),

  http.get(`${API_URL}/library/artists`, () => {
    return HttpResponse.json({ data: artists });
  }),

  http.get(`${API_URL}/library/albums`, () => {
    return HttpResponse.json({ data: albums });
  }),

  // Play tracking
  http.post(`${API_URL}/songs/:id/play`, () => {
    return HttpResponse.json({ success: true });
  }),

  // Like/Unlike
  http.post(`${API_URL}/songs/:id/like`, () => {
    return HttpResponse.json({ success: true, liked: true });
  }),

  http.delete(`${API_URL}/songs/:id/like`, () => {
    return HttpResponse.json({ success: true, liked: false });
  }),
];
