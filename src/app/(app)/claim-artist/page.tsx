'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Search, Loader2, UserRound, ShieldCheck, ArrowRight, Clock3, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useArtist, useClaimableArtistsSearch, useMyCatalogClaims, useSubmitCatalogClaim } from '@/hooks/api';
import type { Artist } from '@/types';

export default function ClaimArtistPage() {
  const searchParams = useSearchParams();
  const preselectedArtistId = searchParams.get('artist');
  const { data: session, status } = useSession();

  const [query, setQuery] = useState('');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [evidenceText, setEvidenceText] = useState('');
  const [submittedArtistId, setSubmittedArtistId] = useState<number | null>(null);

  const { data: claimableArtists = [], isLoading: isSearching } = useClaimableArtistsSearch(query);
  const { data: prefetchedArtist } = useArtist(preselectedArtistId || '');
  const { data: myClaims = [], isLoading: loadingMyClaims } = useMyCatalogClaims();

  useEffect(() => {
    if (!selectedArtist && prefetchedArtist?.is_placeholder && prefetchedArtist.claim_status === 'unclaimed') {
      setSelectedArtist(prefetchedArtist);
      if (!message.trim()) {
        setMessage(`I am requesting ownership of the artist profile for ${prefetchedArtist.name}.`);
      }
    }
  }, [prefetchedArtist, selectedArtist, message]);

  const visibleArtists = useMemo(() => {
    if (selectedArtist) {
      return claimableArtists.some((artist) => artist.id === selectedArtist.id)
        ? claimableArtists
        : [selectedArtist, ...claimableArtists];
    }

    return claimableArtists;
  }, [claimableArtists, selectedArtist]);

  const claimMutation = useSubmitCatalogClaim();

  const callbackUrl = selectedArtist
    ? `/claim-artist?artist=${selectedArtist.id}`
    : '/claim-artist';

  const activeClaimForSelectedArtist = selectedArtist
    ? myClaims.find((claim) => claim.artist?.id === selectedArtist.id && ['pending', 'under_review'].includes(claim.status))
    : undefined;

  const handleSelectArtist = (artist: Artist) => {
    setSelectedArtist(artist);
    if (!message.trim()) {
      setMessage(`I am requesting ownership of the artist profile for ${artist.name}.`);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedArtist) {
      toast.error('Select the artist profile you want to claim first.');
      return;
    }

    if (!message.trim()) {
      toast.error('Please explain why this artist profile belongs to you.');
      return;
    }

    try {
      const evidence = evidenceText
        .split('\n')
        .map((entry) => entry.trim())
        .filter(Boolean);

      const response = await claimMutation.mutateAsync({
        artist_id: selectedArtist.id,
        phone_number: phoneNumber.trim() || undefined,
        message: message.trim(),
        evidence: evidence.length > 0 ? evidence : undefined,
      });

      toast.success(response.message || 'Claim request submitted successfully.');
      setSubmittedArtistId(selectedArtist.id);
      setPhoneNumber('');
      setEvidenceText('');
      setMessage(`I am requesting ownership of the artist profile for ${selectedArtist.name}.`);
    } catch (error) {
      const message =
        typeof error === 'object' &&
        error &&
        'response' in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : error instanceof Error
            ? error.message
            : 'Failed to submit claim request.';

      toast.error(message);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 max-w-3xl">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-primary">Artist Claims</p>
        <h1 className="text-4xl font-bold tracking-tight">Claim music that was uploaded for you</h1>
        <p className="mt-3 text-muted-foreground">
          Search for your placeholder artist profile, confirm it is yours, and submit a claim for admin review.
        </p>
      </div>

      {status === 'authenticated' ? (
        <section className="mb-6 rounded-2xl border bg-card p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Your claim activity</h2>
              <p className="text-sm text-muted-foreground">Track submitted claims and their review status.</p>
            </div>
          </div>
          {loadingMyClaims ? (
            <div className="flex items-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading your claims...
            </div>
          ) : myClaims.length === 0 ? (
            <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
              You have not submitted any artist claims yet.
            </div>
          ) : (
            <div className="space-y-3">
              {myClaims.slice(0, 3).map((claim) => (
                <div key={claim.id} className="rounded-xl border bg-muted/20 p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium">{claim.artist?.name || 'Unknown artist'}</p>
                      <p className="text-sm text-muted-foreground">
                        Submitted {claim.created_at ? new Date(claim.created_at).toLocaleString() : 'recently'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {claim.status === 'approved' ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : claim.status === 'rejected' ? (
                        <XCircle className="h-4 w-4 text-rose-600" />
                      ) : (
                        <Clock3 className="h-4 w-4 text-amber-600" />
                      )}
                      <span className="capitalize">{claim.status.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                  {claim.status === 'rejected' && claim.rejection_reason ? (
                    <p className="mt-2 text-sm text-rose-600">{claim.rejection_reason}</p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <section className="rounded-2xl border bg-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <Search className="h-5 w-5 text-primary" />
            <div>
              <h2 className="font-semibold">Find your profile</h2>
              <p className="text-sm text-muted-foreground">Search among claimable placeholder artists.</p>
            </div>
          </div>

          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by artist name..."
              className="w-full rounded-xl border bg-background py-3 pl-10 pr-4"
            />
          </div>

          {preselectedArtistId && !selectedArtist ? (
            <div className="mb-4 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm text-foreground/80">
              This page was opened from a specific artist profile. Search for that artist name below and select it to continue.
            </div>
          ) : null}

          {query.trim().length < 2 ? (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              Start typing at least 2 characters to search claimable artists.
            </div>
          ) : isSearching ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Searching artists...
            </div>
          ) : visibleArtists.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              No claimable placeholder artist matched your search.
            </div>
          ) : (
            <div className="space-y-3">
              {visibleArtists.map((artist) => {
                const active = selectedArtist?.id === artist.id;
                return (
                  <button
                    key={artist.id}
                    type="button"
                    onClick={() => handleSelectArtist(artist)}
                    className={`w-full rounded-xl border p-4 text-left transition-colors ${
                      active ? 'border-primary bg-primary/5' : 'hover:bg-muted/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate font-semibold">{artist.name}</h3>
                          {artist.is_placeholder ? (
                            <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                              Claimable
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">@{artist.slug}</p>
                        {artist.bio ? (
                          <p className="mt-2 line-clamp-2 text-sm text-foreground/75">{artist.bio}</p>
                        ) : null}
                      </div>
                      <div className="shrink-0 text-right text-xs text-muted-foreground">
                        <div>{artist.total_songs || artist.song_count || 0} songs</div>
                        <div className="mt-1 capitalize">{artist.claim_status || 'unclaimed'}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-2xl border bg-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <div>
              <h2 className="font-semibold">Submit your claim</h2>
              <p className="text-sm text-muted-foreground">Claims are reviewed manually before ownership is transferred.</p>
            </div>
          </div>

          {!selectedArtist ? (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              Select a claimable artist profile to continue.
            </div>
          ) : status !== 'authenticated' || !session?.user ? (
            <div className="space-y-4 rounded-xl border bg-muted/30 p-5">
              <div className="flex items-center gap-3">
                <UserRound className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Sign in to submit this claim</p>
                  <p className="text-sm text-muted-foreground">
                    We need a user account so the approved artist profile can be transferred to you later.
                  </p>
                </div>
              </div>
              <Link
                href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Sign in and continue
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : activeClaimForSelectedArtist ? (
            <div className="space-y-4 rounded-xl border bg-amber-50/70 p-5 dark:bg-amber-950/20">
              <div className="flex items-start gap-3">
                <Clock3 className="mt-0.5 h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium">This artist already has a pending claim from you</p>
                  <p className="text-sm text-muted-foreground">
                    Your request is under review. You do not need to submit it again unless support asks for more detail.
                  </p>
                </div>
              </div>
              <div className="rounded-xl border bg-background/70 p-4 text-sm">
                <p className="font-medium">{selectedArtist.name}</p>
                <p className="mt-1 text-muted-foreground capitalize">Status: {activeClaimForSelectedArtist.status.replace(/_/g, ' ')}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {submittedArtistId === selectedArtist.id ? (
                <div className="rounded-xl border border-emerald-300 bg-emerald-50/80 p-4 text-sm text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300">
                  Claim submitted successfully. It will stay pending until an admin reviews and verifies ownership.
                </div>
              ) : null}

              <div className="rounded-xl border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Selected artist</p>
                <p className="mt-1 text-lg font-semibold">{selectedArtist.name}</p>
                <p className="text-sm text-muted-foreground">@{selectedArtist.slug}</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Phone number</label>
                <input
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  placeholder="Optional but helpful for review"
                  className="w-full rounded-xl border bg-background px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Why does this profile belong to you?</label>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="w-full rounded-xl border bg-background px-4 py-3"
                  placeholder="Explain your connection to this artist profile..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Evidence or references</label>
                <textarea
                  rows={4}
                  value={evidenceText}
                  onChange={(event) => setEvidenceText(event.target.value)}
                  className="w-full rounded-xl border bg-background px-4 py-3"
                  placeholder="One item per line: phone number, manager name, social page, release proof..."
                />
              </div>

              <button
                type="submit"
                disabled={claimMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {claimMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting claim...
                  </>
                ) : (
                  'Submit claim request'
                )}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
