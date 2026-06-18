"use client";

import Link from "next/link";
import { Vote, Languages, ArrowRight } from "lucide-react";
import { CommunityPoll } from "./community-poll";
import { useContributionsStatus } from "@/hooks/useContributions";

/**
 * "Get involved" — the participate-while-you-listen block: vote in a community
 * poll and (when enabled) help build the Ateso corpus. Browsing activities
 * (events, store, awards) live in the "While you listen" row instead.
 */
export function DiscoverSections() {
  const { data: contributions } = useContributionsStatus();
  const corpusEnabled = !!contributions?.enabled;

  return (
    <div className={`grid grid-cols-1 gap-5 ${corpusEnabled ? "lg:grid-cols-2" : ""}`}>
      {/* Community Poll */}
      <div className="flex flex-col">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <Vote className="h-4 w-4" />
          Community Poll
        </h3>
        <CommunityPoll />
      </div>

      {/* Ateso Corpus */}
      {corpusEnabled && (
        <div className="flex flex-col">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <Languages className="h-4 w-4" />
            Ateso Corpus
          </h3>
          <div className="flex h-full flex-col overflow-hidden rounded-xl border bg-card">
            <div className="bg-gradient-to-br from-emerald-600/10 to-teal-600/10 p-5 dark:from-emerald-600/20 dark:to-teal-600/20">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                  <Languages className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-bold">Help build the Ateso corpus</h4>
                  <p className="text-xs text-muted-foreground">Translate a line, earn credits</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Translate short lines of Ateso and English, review others&apos; work, and earn credits
                for accepted contributions — all while you listen.
              </p>
            </div>
            <div className="mt-auto p-4">
              <Link
                href="/contribute"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
              >
                Start contributing
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
