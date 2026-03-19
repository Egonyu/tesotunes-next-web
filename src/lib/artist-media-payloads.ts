export interface ArtistSongPayload {
  title: string;
  slug?: string;
  album_id?: number;
  genre?: string;
  featured_artists?: string;
  lyrics?: string;
  release_date?: string;
  price?: number | string;
  is_explicit?: boolean;
  description?: string;
  composer?: string;
  producer?: string;
  is_downloadable?: boolean;
  is_free?: boolean;
}

export interface ArtistSongUploadPayload extends ArtistSongPayload {
  audio_file: File;
  cover_image?: File;
}

export interface ArtistSongUpdatePayload extends Partial<ArtistSongPayload> {
  cover_image?: File;
}

export interface ArtistAlbumPayload {
  title: string;
  cover_image?: File;
  description?: string;
  release_date?: string;
  type?: "album" | "single" | "ep";
  genre?: string;
}

function appendIfPresent(formData: FormData, key: string, value: string | number | undefined) {
  if (value === undefined || value === "") {
    return;
  }

  formData.append(key, String(value));
}

function appendTrimmed(formData: FormData, key: string, value?: string) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return;
  }

  formData.append(key, trimmed);
}

function appendBoolean(formData: FormData, key: string, value?: boolean) {
  if (value === undefined) {
    return;
  }

  formData.append(key, value ? "1" : "0");
}

function appendArtistSongFields(formData: FormData, payload: Partial<ArtistSongPayload>) {
  appendIfPresent(formData, "album_id", payload.album_id);
  appendTrimmed(formData, "genre_id", payload.genre);
  appendTrimmed(formData, "featured_artists", payload.featured_artists);
  appendTrimmed(formData, "lyrics", payload.lyrics);
  appendIfPresent(formData, "release_date", payload.release_date);
  appendIfPresent(formData, "price", payload.price);
  appendBoolean(formData, "is_explicit", payload.is_explicit);
  appendTrimmed(formData, "description", payload.description);
  appendTrimmed(formData, "composer", payload.composer);
  appendTrimmed(formData, "producer", payload.producer);
  appendBoolean(formData, "is_downloadable", payload.is_downloadable);
  appendBoolean(formData, "is_free", payload.is_free);
}

export function buildArtistSongUploadFormData(payload: ArtistSongUploadPayload) {
  const formData = new FormData();
  formData.append("title", payload.title.trim());
  appendTrimmed(formData, "slug", payload.slug);
  formData.append("audio", payload.audio_file);

  if (payload.cover_image) {
    formData.append("cover", payload.cover_image);
  }

  appendArtistSongFields(formData, payload);

  return formData;
}

export function buildArtistSongUpdateFormData(payload: ArtistSongUpdatePayload) {
  const formData = new FormData();
  formData.append("_method", "PUT");
  appendTrimmed(formData, "title", payload.title);

  appendArtistSongFields(formData, payload);

  if (payload.cover_image) {
    formData.append("cover", payload.cover_image);
  }

  return formData;
}

export function buildArtistAlbumCreateFormData(payload: ArtistAlbumPayload) {
  const formData = new FormData();
  formData.append("title", payload.title.trim());
  if (payload.cover_image) {
    formData.append("cover_image", payload.cover_image);
  }
  appendTrimmed(formData, "description", payload.description);
  appendIfPresent(formData, "release_date", payload.release_date);
  appendTrimmed(formData, "type", payload.type);
  appendTrimmed(formData, "genre", payload.genre);

  return formData;
}

export function buildArtistAlbumUpdateFormData(payload: Partial<ArtistAlbumPayload>) {
  const formData = new FormData();
  formData.append("_method", "PUT");
  appendTrimmed(formData, "title", payload.title);
  if (payload.cover_image) {
    formData.append("cover_image", payload.cover_image);
  }
  if (payload.description !== undefined) {
    formData.append("description", payload.description);
  }
  appendIfPresent(formData, "release_date", payload.release_date);
  appendTrimmed(formData, "type", payload.type);
  appendTrimmed(formData, "genre", payload.genre);

  return formData;
}
