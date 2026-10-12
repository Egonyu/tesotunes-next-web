"use client";

import { usePlayerStore } from "@/stores/player";
import s from "./edula.module.css";

export function waveBars(peaks?: number[]): number[] {
    const values = (peaks ?? []).filter(Number.isFinite).map(Math.abs);
    if (!values.length)
        return Array.from(
            { length: 48 },
            (_, index) => 0.2 + Math.sin(index * 0.71) ** 2 * 0.6,
        );
    const maximum = Math.max(...values, 0.001);
    return Array.from({ length: 48 }, (_, index) => {
        const from = Math.floor((index * values.length) / 48);
        const to = Math.max(
            from + 1,
            Math.floor(((index + 1) * values.length) / 48),
        );
        return Math.max(
            0.12,
            Math.min(1, Math.max(...values.slice(from, to)) / maximum),
        );
    });
}

function clockTime(value: number) {
    const seconds = Math.max(0, Math.floor(Number.isFinite(value) ? value : 0));
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function TimelineSongWave({
    songId,
    title,
    seconds,
    peaks,
}: {
    songId: number;
    title: string;
    seconds?: number | null;
    peaks?: number[];
}) {
    const selected = usePlayerStore(
        (state) => state.currentSong?.id === songId,
    );
    const time =
        usePlayerStore((state) =>
            state.currentSong?.id === songId ? state.currentTime : 0,
        ) ?? 0;
    const actualDuration =
        usePlayerStore((state) =>
            state.currentSong?.id === songId ? state.duration : 0,
        ) ?? 0;
    const playing = usePlayerStore(
        (state) => state.currentSong?.id === songId && state.isPlaying,
    );
    const loading = usePlayerStore(
        (state) => state.currentSong?.id === songId && state.isLoading,
    );
    const seek = usePlayerStore((state) => state.seek);
    const duration =
        Number.isFinite(actualDuration) && actualDuration > 0
            ? actualDuration
            : Number.isFinite(seconds)
              ? Math.max(0, seconds ?? 0)
              : 0;
    const position = Math.min(duration, Math.max(0, time));
    const canSeek = selected && !loading && actualDuration > 0;
    const hasPeaks = (peaks ?? []).some(Number.isFinite);
    const bars = waveBars(peaks);
    return (
        <div
            className={s.songWave}
            data-playing={playing}
            data-visualizer={!hasPeaks}
        >
            <div className={s.waveTrack}>
                <svg
                    viewBox="0 0 288 48"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                >
                    {bars.map((amplitude, index) => (
                        <rect
                            key={index}
                            x={index * 6 + 1}
                            y={24 - amplitude * 21}
                            width="3.5"
                            height={amplitude * 42}
                            rx="1.75"
                            data-played={
                                selected &&
                                duration > 0 &&
                                index / 48 < position / duration
                            }
                            style={{ animationDelay: `${index * -0.055}s` }}
                        />
                    ))}
                </svg>
                <input
                    type="range"
                    min={0}
                    max={duration || 1}
                    step={1}
                    value={position}
                    disabled={!canSeek}
                    aria-label={`Seek ${title}`}
                    aria-valuetext={`${clockTime(position)} of ${clockTime(duration)}`}
                    onChange={(event) =>
                        seek(
                            Math.min(
                                duration,
                                Math.max(0, Number(event.target.value)),
                            ),
                        )
                    }
                />
            </div>
            <div className={s.waveTimes}>
                <span>{selected ? clockTime(position) : "Play to seek"}</span>
                <span>{hasPeaks ? "Waveform" : "Playback visualizer"}</span>
                <span>{clockTime(duration)}</span>
            </div>
        </div>
    );
}
