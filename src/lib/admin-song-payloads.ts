export interface AdminSongPayload {
  title: string;
  artist_id: string;
  status: string;
  explicit: boolean;
  is_featured: boolean;
  slug?: string;
  album_id?: string;
  duration_seconds?: string;
  release_date?: string;
  track_number?: string;
  disc_number?: string;
  lyrics?: string;
  description?: string;
  isrc?: string;
  bpm?: string;
  key?: string;
  composer?: string;
  producer?: string;
  price?: string;
  is_downloadable?: boolean;
  is_free?: boolean;
  genre_ids: string[];
  featured_artists: string[];
  credits?: string;
  audio_file?: File | null;
  cover_image?: File | null;
}

function appendTrimmed(formData: FormData, key: string, value?: string) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return;
  }

  formData.append(key, trimmed);
}

function appendIfPresent(formData: FormData, key: string, value?: string) {
  if (!value) {
    return;
  }

  formData.append(key, value);
}

function appendArray(formData: FormData, key: string, values: string[]) {
  values.forEach((value) => {
    if (value) {
      formData.append(`${key}[]`, value);
    }
  });
}

function appendBaseAdminSongFields(formData: FormData, payload: AdminSongPayload) {
  appendTrimmed(formData, "title", payload.title);
  appendIfPresent(formData, "artist_id", payload.artist_id);
  appendIfPresent(formData, "status", payload.status);
  formData.append("explicit", payload.explicit ? "1" : "0");
  formData.append("is_featured", payload.is_featured ? "1" : "0");
  appendTrimmed(formData, "slug", payload.slug);
  appendIfPresent(formData, "album_id", payload.album_id);
  appendTrimmed(formData, "duration_seconds", payload.duration_seconds);
  appendIfPresent(formData, "release_date", payload.release_date);
  appendIfPresent(formData, "track_number", payload.track_number);
  appendIfPresent(formData, "disc_number", payload.disc_number);
  appendTrimmed(formData, "lyrics", payload.lyrics);
  appendTrimmed(formData, "description", payload.description);
  appendTrimmed(formData, "isrc", payload.isrc);
  appendIfPresent(formData, "bpm", payload.bpm);
  appendTrimmed(formData, "key", payload.key);
  appendTrimmed(formData, "composer", payload.composer);
  appendTrimmed(formData, "producer", payload.producer);
  appendIfPresent(formData, "price", payload.price);
  if (payload.is_downloadable !== undefined) {
    formData.append("is_downloadable", payload.is_downloadable ? "1" : "0");
  }
  if (payload.is_free !== undefined) {
    formData.append("is_free", payload.is_free ? "1" : "0");
  }
  appendTrimmed(formData, "credits", payload.credits);
  appendArray(formData, "genre_ids", payload.genre_ids);
  appendArray(formData, "featured_artists", payload.featured_artists);
}

export function buildAdminSongCreateFormData(payload: AdminSongPayload) {
  const formData = new FormData();
  appendBaseAdminSongFields(formData, payload);

  if (payload.audio_file) {
    formData.append("audio_file", payload.audio_file);
  }

  if (payload.cover_image) {
    formData.append("cover_image", payload.cover_image);
  }

  return formData;
}

export function buildAdminSongUpdateFormData(payload: AdminSongPayload) {
  const formData = new FormData();
  formData.append("_method", "PUT");
  appendBaseAdminSongFields(formData, payload);

  if (payload.audio_file) {
    formData.append("audio_file", payload.audio_file);
  }

  if (payload.cover_image) {
    formData.append("cover_image", payload.cover_image);
  }

  return formData;
}
