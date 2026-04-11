"use client";

import { useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Pause, Play, Radio as RadioIcon, Volume2 } from "lucide-react";
import {
  fetchRadioStationTracks,
  useRadioStations,
  type RadioStation,
} from "@/hooks/useRadio";
import { SafeImage, InitialsAvatar } from "@/components/ui/safe-image";
import { usePlayerStore } from "@/stores";
import { cn, formatNumber } from "@/lib/utils";
import type { Song } from "@/types";

const radioPalettes = [
  {
    card: "bg-[#d9ff58] text-black",
    muted: "text-black/75",
    ring: "ring-black/10",
  },
  {
    card: "bg-[#ff6c63] text-black",
    muted: "text-black/75",
    ring: "ring-black/10",
  },
  {
    card: "bg-[#de87c7] text-black",
    muted: "text-black/75",
    ring: "ring-black/10",
  },
  {
    card: "bg-[#7eb0ea] text-black",
    muted: "text-black/75",
    ring: "ring-black/10",
  },
  {
    card: "bg-[#92e5d7] text-black",
    muted: "text-black/75",
    ring: "ring-black/10",
  },
  {
    card: "bg-[#f8d684] text-black",
    muted: "text-black/75",
    ring: "ring-black/10",
  },
  {
    card: "bg-[#b1aff2] text-black",
    muted: "text-black/75",
    ring: "ring-black/10",
  },
];

function getStationSubtitle(station: RadioStation) {
  const parts = [
    station.curator ? `With ${station.curator}` : null,
    station.songsCount && station.songsCount > 0 ? `${station.songsCount} songs` : null,
    station.genre || null,
  ].filter(Boolean);

  if (parts.length === 0) {
    return "Lean-back listening and more";
  }

  return `${parts.join(", ")} and more`;
}

function getStationArtNames(station: RadioStation) {
  return [
    station.curator || station.name,
    station.name,
    station.genre || "Radio",
  ];
}

function RadioCard({
  station,
  index,
  isPlaying,
  onPlay,
}: {
  station: RadioStation;
  index: number;
  isPlaying: boolean;
  onPlay: () => void;
}) {
  const palette = radioPalettes[index % radioPalettes.length];
  const [leftName, centerName, rightName] = getStationArtNames(station);

  return (
    <article className="group">
      <div
        className={cn(
          "relative overflow-hidden rounded-lg p-3 shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-transform duration-200 group-hover:-translate-y-1",
          palette.card
        )}
      >
        <Link href={station.href} className="block">
          <div className="mb-6 flex items-center justify-between text-[0.7rem] font-black tracking-[0.22em]">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/90 text-white">
                <RadioIcon className="h-3 w-3" />
              </span>
            </div>
            <span>RADIO</span>
          </div>

          <div className="mb-5 flex items-end justify-center gap-2">
            <div className="relative h-18 w-18 overflow-hidden rounded-full ring-4 ring-white/30">
              {station.image ? (
                <SafeImage
                  src={station.image}
                  alt={station.name}
                  fill
                  className="object-cover"
                  fallback={
                    <InitialsAvatar
                      name={leftName}
                      className="h-full w-full bg-black/10 text-black"
                      textClassName="text-lg"
                      icon="music"
                    />
                  }
                  sizes="80px"
                />
              ) : (
                <InitialsAvatar
                  name={leftName}
                  className="h-full w-full bg-black/10 text-black"
                  textClassName="text-lg"
                  icon="music"
                />
              )}
            </div>

            <div className={cn("relative h-28 w-28 overflow-hidden rounded-full ring-4 ring-white/40", palette.ring)}>
              {station.image ? (
                <SafeImage
                  src={station.image}
                  alt={station.name}
                  fill
                  className="object-cover"
                  fallback={
                    <InitialsAvatar
                      name={centerName}
                      className="h-full w-full bg-black/10 text-black"
                      textClassName="text-2xl"
                      icon="music"
                    />
                  }
                  sizes="112px"
                />
              ) : (
                <InitialsAvatar
                  name={centerName}
                  className="h-full w-full bg-black/10 text-black"
                  textClassName="text-2xl"
                  icon="music"
                />
              )}
            </div>

            <div className="relative h-18 w-18 overflow-hidden rounded-full ring-4 ring-white/30">
              <InitialsAvatar
                name={rightName}
                className="h-full w-full bg-black/10 text-black"
                textClassName="text-lg"
                icon="music"
              />
            </div>
          </div>

          <h2 className="truncate text-[1.05rem] font-black leading-none sm:text-[1.15rem]">
            {station.name.replace(/\s+radio$/i, "")}
          </h2>
        </Link>

        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onPlay();
          }}
          className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-black text-white opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 translate-y-1"
          aria-label={isPlaying ? `Pause ${station.name}` : `Play ${station.name}`}
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
        </button>
      </div>

      <div className="px-0.5 pt-3">
        <p className="line-clamp-2 text-[0.95rem] font-semibold text-white/90">
          {getStationSubtitle(station)}
        </p>
        <div className="mt-1 flex items-center gap-2 text-xs text-white/45">
          <Volume2 className="h-3.5 w-3.5" />
          <span>{formatNumber(station.listeners)} listeners</span>
        </div>
      </div>
    </article>
  );
}

export default function RadioPage() {
  const [activeStationId, setActiveStationId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { data: stations = [], isLoading, isError } = useRadioStations();
  const { currentSong, isPlaying, play, pause, resume } = usePlayerStore();

  const handlePlay = async (station: RadioStation) => {
    const tracks = await queryClient.fetchQuery({
      queryKey: ["radio", "station", station.id, "tracks"],
      queryFn: () => fetchRadioStationTracks(station.id),
      staleTime: 2 * 60 * 1000,
    });

    if (!tracks.length) {
      return;
    }

    const isCurrentStation = tracks.some((track: Song) => track.id === currentSong?.id);

    if (isCurrentStation) {
      setActiveStationId(station.id);
      if (isPlaying) {
        pause();
      } else {
        resume();
      }
      return;
    }

    setActiveStationId(station.id);
    play(tracks[0], tracks);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/70" />
      </div>
    );
  }

  if (stations.length === 0) {
    return (
      <div className="py-8">
        <div className="rounded-2xl border border-white/10 bg-[#121212] p-10 text-center text-white">
          <RadioIcon className="mx-auto mb-4 h-12 w-12 text-white/35" />
          <h1 className="text-2xl font-bold">Popular radio</h1>
          <p className="mt-2 text-sm text-white/60">
            No radio stations are available yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-3">
      <section className="rounded-2xl bg-[#121212] px-5 py-8 sm:px-7">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Popular radio
            </h1>
            <p className="mt-2 text-sm text-white/55">
              Artist-led stations and always-on mixes from across the catalog.
            </p>
          </div>
        </div>

        {isError ? (
          <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Radio loaded with fallback data only, so some live metadata may be missing.
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
          {stations.map((station, index) => (
            <RadioCard
              key={station.id}
              station={station}
              index={index}
              isPlaying={activeStationId === station.id && isPlaying}
              onPlay={() => {
                void handlePlay(station);
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
