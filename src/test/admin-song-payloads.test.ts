import {
  buildAdminSongCreateFormData,
  buildAdminSongUpdateFormData,
} from '@/lib/admin-song-payloads';

describe('admin song payload builders', () => {
  it('maps admin create payloads to the backend field names', () => {
    const audio = new File(['audio'], 'track.mp3', { type: 'audio/mpeg' });
    const cover = new File(['cover'], 'cover.jpg', { type: 'image/jpeg' });

    const formData = buildAdminSongCreateFormData({
      title: 'Admin Song',
      artist_id: '5',
      status: 'published',
      explicit: true,
      is_featured: true,
      album_id: '3',
      release_date: '2026-03-13',
      description: 'Song description',
      composer: 'Composer',
      producer: 'Producer',
      price: '2500',
      is_downloadable: false,
      is_free: false,
      genre_ids: ['7', '8'],
      featured_artists: ['11', '12'],
      audio_file: audio,
      cover_image: cover,
    });

    expect(formData.get('title')).toBe('Admin Song');
    expect(formData.get('artist_id')).toBe('5');
    expect(formData.get('explicit')).toBe('1');
    expect(formData.get('is_featured')).toBe('1');
    expect(formData.get('audio_file')).toBe(audio);
    expect(formData.get('cover_image')).toBe(cover);
    expect(formData.getAll('genre_ids[]')).toEqual(['7', '8']);
    expect(formData.getAll('featured_artists[]')).toEqual(['11', '12']);
    expect(formData.get('price')).toBe('2500');
    expect(formData.get('is_downloadable')).toBe('0');
    expect(formData.get('is_free')).toBe('0');
  });

  it('uses method spoofing for admin updates', () => {
    const formData = buildAdminSongUpdateFormData({
      title: 'Updated Song',
      artist_id: '9',
      status: 'draft',
      explicit: false,
      is_featured: false,
      genre_ids: ['4'],
      featured_artists: [],
      is_downloadable: true,
      is_free: true,
    });

    expect(formData.get('_method')).toBe('PUT');
    expect(formData.get('title')).toBe('Updated Song');
    expect(formData.get('artist_id')).toBe('9');
    expect(formData.get('explicit')).toBe('0');
    expect(formData.get('is_downloadable')).toBe('1');
    expect(formData.get('is_free')).toBe('1');
    expect(formData.getAll('genre_ids[]')).toEqual(['4']);
  });
});
