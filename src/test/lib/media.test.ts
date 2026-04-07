import { describe, expect, it } from "@jest/globals";
import { pickMediaUrl, resolvePlayableAudioUrl, resolveMediaUrl } from "@/lib/media";

describe("media helpers", () => {
  it("resolves storage-backed media urls", () => {
    expect(resolveMediaUrl("songs/audio/test.mp3")).toContain("/storage/songs/audio/test.mp3");
  });

  it("picks the first valid media url", () => {
    expect(pickMediaUrl(undefined, "", "songs/audio/test.mp3")).toContain("/storage/songs/audio/test.mp3");
  });

  it("resolves the best playable audio url in priority order", () => {
    expect(resolvePlayableAudioUrl({
      audio_url: "",
      stream_url: "https://cdn.example.com/song-stream.mp3",
      preview_url: "https://cdn.example.com/song-preview.mp3",
    })).toBe("https://cdn.example.com/song-stream.mp3");
  });

  it("falls back to preview audio when full audio is unavailable", () => {
    expect(resolvePlayableAudioUrl({
      preview_url: "songs/preview/test-preview.mp3",
    })).toContain("/storage/songs/preview/test-preview.mp3");
  });

  it("returns null when no playable source exists", () => {
    expect(resolvePlayableAudioUrl({})).toBeNull();
    expect(resolvePlayableAudioUrl(null)).toBeNull();
  });
});
