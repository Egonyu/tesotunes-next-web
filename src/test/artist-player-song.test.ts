import { describe, expect, it } from "@jest/globals";
import { mapArtistSongToPlayerSong } from "@/lib/artist-player-song";

describe("artist player song mapping", () => {
  it("maps artist dashboard songs into playable store songs", () => {
    const mapped = mapArtistSongToPlayerSong({
      id: 42,
      title: "River Flow",
      slug: "river-flow",
      duration_seconds: 185,
      plays: 1200,
      downloads: 300,
      status: "published",
      audio_url: "https://cdn.example.com/river-flow.mp3",
      artwork_url: "https://cdn.example.com/river-flow.jpg",
      release_date: "2026-04-01",
      created_at: "2026-04-01T10:00:00Z",
      artist: {
        id: 7,
        name: "Ayo",
        slug: "ayo",
      },
    });

    expect(mapped.id).toBe(42);
    expect(mapped.slug).toBe("river-flow");
    expect(mapped.duration_seconds).toBe(185);
    expect(mapped.audio_url).toBe("https://cdn.example.com/river-flow.mp3");
    expect(mapped.artist.id).toBe(7);
    expect(mapped.artist.name).toBe("Ayo");
    expect(mapped.artwork_url).toBe("https://cdn.example.com/river-flow.jpg");
  });

  it("falls back safely when artist pages only have minimal metadata", () => {
    const mapped = mapArtistSongToPlayerSong({
      id: 9,
      title: "Untitled",
      plays: 0,
      downloads: 0,
      duration_seconds: 45,
      status: "draft",
      preview_url: "/preview.mp3",
    });

    expect(mapped.slug).toBe("9");
    expect(mapped.duration_seconds).toBe(45);
    expect(mapped.audio_url).toBe("/preview.mp3");
    expect(mapped.artist.slug).toBe("9");
  });
});
