import type Hls from "hls.js";

/**
 * Attach the best playback source to an <audio> element.
 *
 * Preference order:
 *  1. HLS master playlist — native on Safari/iOS, via hls.js elsewhere.
 *     Adaptive bitrate, playback starts from the first segment, and the
 *     full file is never exposed as one URL.
 *  2. Progressive URL (stream_url) — the universal fallback, also used
 *     when an hls.js fatal error makes adaptive playback unrecoverable.
 *
 * Returns a cleanup function that must be called before re-attaching.
 */

type AttachableSong = {
  hls_master_url?: string | null;
};

let hlsModule: typeof import("hls.js") | null = null;

async function loadHls(): Promise<typeof import("hls.js")> {
  if (!hlsModule) {
    hlsModule = await import("hls.js");
  }
  return hlsModule;
}

export interface AttachedSource {
  /** Tear down any hls.js instance bound to the element. */
  destroy: () => void;
  /** Which transport ended up being used (useful for debugging/telemetry). */
  transport: "hls-native" | "hls-mse" | "progressive";
}

export async function attachAudioSource(
  audio: HTMLAudioElement,
  song: AttachableSong | null,
  progressiveUrl: string,
): Promise<AttachedSource> {
  const hlsUrl = song?.hls_master_url ?? null;

  if (hlsUrl && audio.canPlayType("application/vnd.apple.mpegurl")) {
    audio.src = hlsUrl;
    audio.load();
    return { destroy: () => undefined, transport: "hls-native" };
  }

  if (hlsUrl) {
    const { default: HlsClass } = await loadHls();

    if (HlsClass.isSupported()) {
      const hls: Hls = new HlsClass({
        maxBufferLength: 30,
        backBufferLength: 30,
      });

      hls.loadSource(hlsUrl);
      hls.attachMedia(audio);

      hls.on(HlsClass.Events.ERROR, (_event, data) => {
        if (!data.fatal) return;

        // Unrecoverable adaptive playback — drop to the progressive file
        // at the position the listener had reached.
        const resumeAt = audio.currentTime;
        const wasPlaying = !audio.paused;
        hls.destroy();

        if (progressiveUrl) {
          audio.src = progressiveUrl;
          audio.load();
          audio.currentTime = resumeAt;
          if (wasPlaying) void audio.play().catch(() => undefined);
        }
      });

      return { destroy: () => hls.destroy(), transport: "hls-mse" };
    }
  }

  audio.src = progressiveUrl;
  audio.load();
  return { destroy: () => undefined, transport: "progressive" };
}
