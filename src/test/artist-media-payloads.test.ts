import {
  buildArtistAlbumCreateFormData,
  buildArtistAlbumUpdateFormData,
  buildArtistSongUpdateFormData,
  buildArtistSongUploadFormData,
} from "@/lib/artist-media-payloads";

describe("artist media payload builders", () => {
  it("maps artist song upload fields to the backend contract", () => {
    const audio = new File(["audio"], "track.mp3", { type: "audio/mpeg" });
    const cover = new File(["cover"], "cover.jpg", { type: "image/jpeg" });

    const formData = buildArtistSongUploadFormData({
      title: "  Test Song  ",
      audio_file: audio,
      cover_image: cover,
      album_id: 5,
      genre: "12",
      featured_artists: "Guest Artist",
      lyrics: "Lyrics",
      release_date: "2026-03-13",
      price: 2500,
      is_explicit: true,
      description: "Description",
      composer: "Composer",
      producer: "Producer",
      is_downloadable: false,
      is_free: false,
    });

    expect(formData.get("title")).toBe("Test Song");
    expect(formData.get("audio")).toBe(audio);
    expect(formData.get("cover")).toBe(cover);
    expect(formData.get("album_id")).toBe("5");
    expect(formData.get("genre_id")).toBe("12");
    expect(formData.get("featured_artists")).toBe("Guest Artist");
    expect(formData.get("is_explicit")).toBe("1");
    expect(formData.get("is_downloadable")).toBe("0");
    expect(formData.get("is_free")).toBe("0");
  });

  it("uses method spoofing for artist song updates", () => {
    const cover = new File(["cover"], "cover.jpg", { type: "image/jpeg" });

    const formData = buildArtistSongUpdateFormData({
      title: "Updated Song",
      genre: "afrobeats",
      is_free: true,
      cover_image: cover,
    });

    expect(formData.get("_method")).toBe("PUT");
    expect(formData.get("title")).toBe("Updated Song");
    expect(formData.get("genre_id")).toBe("afrobeats");
    expect(formData.get("is_free")).toBe("1");
    expect(formData.get("cover")).toBe(cover);
  });

  it("builds artist album create payloads with the expected field names", () => {
    const cover = new File(["cover"], "album.jpg", { type: "image/jpeg" });

    const formData = buildArtistAlbumCreateFormData({
      title: "  Debut Album ",
      cover_image: cover,
      description: "Album description",
      release_date: "2026-03-20",
      type: "ep",
      genre: "afrobeats",
    });

    expect(formData.get("title")).toBe("Debut Album");
    expect(formData.get("cover_image")).toBe(cover);
    expect(formData.get("description")).toBe("Album description");
    expect(formData.get("release_date")).toBe("2026-03-20");
    expect(formData.get("type")).toBe("ep");
    expect(formData.get("genre")).toBe("afrobeats");
  });

  it("builds artist album update payloads with method spoofing", () => {
    const cover = new File(["cover"], "album.jpg", { type: "image/jpeg" });

    const formData = buildArtistAlbumUpdateFormData({
      title: "Updated Album",
      description: "",
      release_date: "2026-03-22",
      type: "single",
      genre: "dancehall",
      cover_image: cover,
    });

    expect(formData.get("_method")).toBe("PUT");
    expect(formData.get("title")).toBe("Updated Album");
    expect(formData.get("description")).toBe("");
    expect(formData.get("release_date")).toBe("2026-03-22");
    expect(formData.get("type")).toBe("single");
    expect(formData.get("genre")).toBe("dancehall");
    expect(formData.get("cover_image")).toBe(cover);
  });
});
