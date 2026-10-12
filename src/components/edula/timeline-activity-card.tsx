"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ArrowUpRight,
    Bookmark,
    CalendarDays,
    Check,
    CheckCircle2,
    EyeOff,
    Headphones,
    Loader2,
    MapPin,
    MessageCircle,
    Mic2,
    MoreHorizontal,
    Music2,
    Pause,
    Play,
    Share2,
    ShoppingBag,
    Sparkles,
    Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { apiGet } from "@/lib/api";
import { usePlayerStore } from "@/stores/player";
import { usePoll, useVotePoll, transformPoll } from "@/hooks/usePolls";
import { SafeImage } from "@/components/ui/safe-image";
import { RichText } from "./rich-text";
import { TimelineSongWave } from "./timeline-song-wave";
import type { Song } from "@/types";
import type { FeedItem } from "@/types/edula";
import {
    presentationFor,
    durationLabel,
    moneyLabel,
    relativeDate,
    safeTimelineLink,
    type TimelinePresentation,
} from "./timeline-model";
import s from "./edula.module.css";

export { safeTimelineLink } from "./timeline-model";

export async function shareTimelineItem(href: string, title: string) {
    if (!safeTimelineLink(href)) return;
    const url = new URL(href, window.location.origin).href;
    try {
        if (navigator.share) await navigator.share({ title, url });
        else {
            await navigator.clipboard.writeText(url);
            toast.success("Link copied");
        }
    } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError"))
            toast.error("Could not share this link.");
    }
}

function PollBody({
    presentation,
    authenticated,
    onSignIn,
}: {
    presentation: TimelinePresentation;
    authenticated: boolean;
    onSignIn?: () => void;
}) {
    const pollId = presentation.poll_id;
    const query = usePoll(pollId ? String(pollId) : "");
    const vote = useVotePoll();
    const [selection, setSelection] = useState<number | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");
    const poll = query.data
        ? transformPoll(query.data as Record<string, unknown>)
        : null;
    const singleChoice =
        poll &&
        !poll.isMultiQuestion &&
        poll.questions.length === 1 &&
        poll.questions[0].question_type === "multiple_choice" &&
        !poll.questions[0].allow_multiple;
    const rawEnd = (query.data as Record<string, unknown> | undefined)?.ends_at;
    const end =
        presentation.ends_at ?? (typeof rawEnd === "string" ? rawEnd : null);
    const closed =
        presentation.state === "closed" ||
        poll?.status === "closed" ||
        (!!end &&
            Number.isFinite(Date.parse(end)) &&
            Date.parse(end) <= Date.now());
    const canVote =
        singleChoice &&
        poll.status === "active" &&
        !closed &&
        !poll.hasVoted &&
        !submitted;
    const showResults =
        poll &&
        (poll.hasVoted ||
            poll.showResultsBeforeCompletion ||
            poll.status === "closed");
    const href =
        presentation.href && safeTimelineLink(presentation.href)
            ? presentation.href
            : pollId
              ? `/polls/${pollId}`
              : "/polls";
    const submit = async () => {
        if (!pollId || !poll?.questionId || !selection || vote.isPending)
            return;
        if (!authenticated && !poll.allowGuestResponses) {
            onSignIn?.();
            return;
        }
        setError("");
        try {
            await vote.mutateAsync({
                pollId: String(pollId),
                questionId: poll.questionId,
                optionId: selection,
            });
            setSubmitted(true);
        } catch {
            setError(
                "Your vote was not confirmed. Try again or open the full poll.",
            );
        }
    };
    return (
        <>
            <h3 className={s.cardTitle}>{presentation.title}</h3>
            {query.isLoading && pollId ? (
                <p className={s.subtitle} role="status">
                    Loading the poll…
                </p>
            ) : singleChoice ? (
                <>
                    <fieldset
                        className={s.pollOptions}
                        disabled={vote.isPending || !canVote}
                    >
                        <legend className="sr-only">
                            {poll.questionText ?? presentation.title}
                        </legend>
                        {poll.options.map((option) => (
                            <label key={option.id} className={s.pollOption}>
                                {showResults && (
                                    <i
                                        className={s.pollFill}
                                        style={{
                                            width: `${Math.max(0, Math.min(100, option.percentage))}%`,
                                        }}
                                    />
                                )}
                                {canVote && (
                                    <input
                                        type="radio"
                                        name={`edula-poll-${pollId}`}
                                        value={option.id}
                                        checked={selection === option.id}
                                        onChange={() => setSelection(option.id)}
                                    />
                                )}
                                <span>{option.text}</span>
                                {showResults && (
                                    <small>
                                        {Math.round(option.percentage)}%
                                    </small>
                                )}
                            </label>
                        ))}
                    </fieldset>
                    {canVote && (
                        <button
                            className={s.primary}
                            disabled={!selection || vote.isPending}
                            onClick={() => void submit()}
                        >
                            {vote.isPending ? (
                                <Loader2 size={15} className="animate-spin" />
                            ) : (
                                <Check size={15} />
                            )}
                            Vote
                        </button>
                    )}
                    {(submitted || poll.hasVoted) && (
                        <p className={s.subtitle} role="status">
                            Your vote is recorded. Thank you for taking part.
                        </p>
                    )}
                    <div className={s.pollMeta}>
                        <span>
                            {poll.totalVotes} responses
                            {closed
                                ? " · Voting closed"
                                : presentation.ends_at
                                  ? ` · Closes ${relativeDate(presentation.ends_at)}`
                                  : ""}
                        </span>
                        <Link href={href}>
                            Open poll{" "}
                            <ArrowUpRight size={12} className="inline" />
                        </Link>
                    </div>
                </>
            ) : (
                <div className={s.actions}>
                    <Link href={href} className={s.secondary}>
                        {poll?.isMultiQuestion
                            ? "Open the full survey"
                            : "Open poll"}
                        <ArrowUpRight size={14} />
                    </Link>
                </div>
            )}
            {query.isError && (
                <p className={s.subtitle}>
                    Poll options are unavailable here. You can still open the
                    full poll.
                </p>
            )}
            {error && (
                <p className={s.inlineError} role="alert">
                    {error}
                </p>
            )}
        </>
    );
}

interface Props {
    item: FeedItem;
    reason?: string;
    saved?: boolean;
    busy?: boolean;
    authenticated?: boolean;
    onSave?: () => void;
    onHide?: () => void;
    onSignIn?: () => void;
}

export function TimelineActivityCard({
    item,
    reason,
    saved = false,
    busy = false,
    authenticated = false,
    onSave,
    onHide,
    onSignIn,
}: Props) {
    const play = usePlayerStore((state) => state.play);
    const toggle = usePlayerStore((state) => state.toggle);
    const currentSong = usePlayerStore((state) => state.currentSong);
    const isPlaying = usePlayerStore((state) => state.isPlaying);
    const [loading, setLoading] = useState(false);
    const [playError, setPlayError] = useState("");
    const p = presentationFor(item);
    const href =
        p.href && safeTimelineLink(p.href)
            ? p.href
            : item.actions?.find((action) => safeTimelineLink(action.url))?.url;
    const selected = !!p.song_id && currentSong?.id === p.song_id;
    const songPlayback = async () => {
        if (!p.song_id || loading) return;
        if (selected && toggle) {
            toggle();
            return;
        }
        setLoading(true);
        setPlayError("");
        try {
            const result = await apiGet<{ data: Song }>(`/songs/${p.song_id}`);
            play(result.data);
        } catch {
            setPlayError("Could not start playback. Please try the song page.");
        } finally {
            setLoading(false);
        }
    };
    const names = {
        song: "Music release",
        podcast: "Podcast",
        poll: "Community poll",
        event: "Event",
        product: "Marketplace",
        promotion: "Open brief",
        service: "Promotion service",
        corpus: "Ateso corpus",
        translation: "Ateso project",
        update: "Community update",
    };
    const labels = {
        song: "Open song",
        podcast: "Listen to episode",
        poll: "Open poll",
        event: "View event",
        product: "View product",
        promotion: "View brief",
        service: "View service",
        corpus: "Help translate",
        translation: "Try a translation",
        update: "Explore",
    };
    const actorHref =
        item.actor &&
        "href" in item.actor &&
        typeof item.actor.href === "string" &&
        safeTimelineLink(item.actor.href)
            ? item.actor.href
            : null;
    const duration = durationLabel(
        p.duration_seconds ?? item.media?.duration_seconds,
    );
    const date =
        p.starts_at && Number.isFinite(Date.parse(p.starts_at))
            ? new Date(p.starts_at)
            : null;
    const price = moneyLabel(p.price_ugx);
    const budgetMin = moneyLabel(p.budget_min_ugx),
        budgetMax = moneyLabel(p.budget_max_ugx);
    const budget =
        budgetMin && budgetMax
            ? `${budgetMin} – ${budgetMax.replace("UGX ", "")}`
            : budgetMax
              ? `Up to ${budgetMax}`
              : budgetMin
                ? `From ${budgetMin}`
                : null;
    const fallback = (
        <div className={s.coverFallback}>
            <Music2 size={28} strokeWidth={1.2} />
        </div>
    );
    return (
        <article className={s.card} data-kind={p.kind}>
            <header className={s.cardHeader}>
                <div className={s.avatar}>
                    <SafeImage
                        src={item.actor?.avatar_url}
                        alt=""
                        width={36}
                        height={36}
                        fallback={
                            <span>{(item.actor?.name ?? "T").charAt(0)}</span>
                        }
                    />
                </div>
                <div className={s.byline}>
                    <div className={s.author}>
                        {actorHref ? (
                            <Link href={actorHref}>{item.actor?.name}</Link>
                        ) : (
                            (item.actor?.name ?? "TesoTunes")
                        )}
                        {item.actor?.verified && (
                            <CheckCircle2 size={13} aria-label="Verified" />
                        )}
                    </div>
                    <time className={s.timestamp} dateTime={item.published_at}>
                        {typeof item.extras?.date_label === "string"
                            ? `${item.extras.date_label} · `
                            : ""}
                        {relativeDate(item.published_at)}
                    </time>
                </div>
                <span className={s.kind}>{names[p.kind]}</span>
                {onHide && (
                    <details className={s.more}>
                        <summary aria-label={`More options for ${p.title}`}>
                            <MoreHorizontal size={18} />
                        </summary>
                        <div className={s.menu}>
                            <button onClick={onHide} disabled={busy}>
                                <EyeOff size={14} />
                                Hide this update
                            </button>
                        </div>
                    </details>
                )}
            </header>
            <div className={s.content}>
                {p.kind === "song" ? (
                    <div className={s.mediaRow}>
                        <div className={s.cover}>
                            <SafeImage
                                src={p.image}
                                alt={`${p.title} artwork`}
                                width={132}
                                height={132}
                                fallback={fallback}
                            />
                        </div>
                        <div className={s.musicDetails}>
                            <h3 className={s.mediaTitle}>{p.title}</h3>
                            <p className={s.subtitle}>
                                {p.subtitle ?? item.actor?.name}
                            </p>
                            <div className={s.facts}>
                                {p.genre && <span>{p.genre}</span>}
                                {duration && <span>{duration}</span>}
                            </div>
                            {p.song_id ? (
                                <div className={s.playRow}>
                                    <button
                                        aria-label={
                                            selected
                                                ? isPlaying
                                                    ? "Pause song"
                                                    : "Resume song"
                                                : "Play song"
                                        }
                                        onClick={() => void songPlayback()}
                                        disabled={loading}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 9,
                                            padding: 0,
                                            border: 0,
                                            background: "none",
                                        }}
                                    >
                                        <span className={s.roundPlay}>
                                            {loading ? (
                                                <Loader2
                                                    size={16}
                                                    className="animate-spin"
                                                />
                                            ) : selected && isPlaying ? (
                                                <Pause
                                                    size={15}
                                                    fill="currentColor"
                                                />
                                            ) : (
                                                <Play
                                                    size={15}
                                                    fill="currentColor"
                                                />
                                            )}
                                        </span>
                                        <span className={s.playLabel}>
                                            {selected
                                                ? isPlaying
                                                    ? "Pause"
                                                    : "Resume"
                                                : "Play song"}
                                        </span>
                                    </button>
                                </div>
                            ) : (
                                href && (
                                    <div className={s.actions}>
                                        <Link
                                            className={s.secondary}
                                            href={href}
                                        >
                                            Open release
                                            <ArrowUpRight size={13} />
                                        </Link>
                                    </div>
                                )
                            )}
                            {p.song_id && (
                                <TimelineSongWave
                                    songId={p.song_id}
                                    title={p.title}
                                    seconds={
                                        p.duration_seconds ??
                                        item.media?.duration_seconds
                                    }
                                    peaks={p.waveform}
                                />
                            )}
                        </div>
                    </div>
                ) : p.kind === "podcast" ? (
                    <div className={s.podcastBlock}>
                        <div className={s.podcastCover}>
                            <SafeImage
                                src={p.image}
                                alt=""
                                width={94}
                                height={112}
                                fallback={
                                    <div className={s.podcastFallback}>
                                        <Mic2 size={31} strokeWidth={1.2} />
                                    </div>
                                }
                            />
                        </div>
                        <div className={s.musicDetails}>
                            <p className={s.episodeLabel}>
                                {p.episode_number
                                    ? `Episode ${p.episode_number}`
                                    : "Podcast episode"}
                                {duration ? ` · ${duration}` : ""}
                            </p>
                            <h3 className={s.podcastTitle}>{p.title}</h3>
                            {p.subtitle && (
                                <p className={s.subtitle}>{p.subtitle}</p>
                            )}
                            {href && (
                                <div className={s.actions}>
                                    <Link className={s.secondary} href={href}>
                                        <Headphones size={14} />
                                        Listen to episode
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                ) : p.kind === "poll" ? (
                    <PollBody
                        presentation={p}
                        authenticated={authenticated}
                        onSignIn={onSignIn}
                    />
                ) : p.kind === "event" ? (
                    <>
                        <div className={s.eventVisual}>
                            <SafeImage
                                src={p.image}
                                alt=""
                                width={660}
                                height={280}
                                fallback={
                                    <div className={s.eventFallback}>
                                        <CalendarDays
                                            size={44}
                                            strokeWidth={1}
                                        />
                                    </div>
                                }
                            />
                            {date && (
                                <div className={s.dateTile}>
                                    <span>
                                        {new Intl.DateTimeFormat("en-GB", {
                                            month: "short",
                                            timeZone: "Africa/Kampala",
                                        }).format(date)}
                                    </span>
                                    <strong>
                                        {new Intl.DateTimeFormat("en-GB", {
                                            day: "numeric",
                                            timeZone: "Africa/Kampala",
                                        }).format(date)}
                                    </strong>
                                </div>
                            )}
                        </div>
                        <h3 className={s.cardTitle}>{p.title}</h3>
                        {p.state === "ended" && (
                            <span className={s.contentState}>
                                Past event · Explore the event page
                            </span>
                        )}
                        <div className={s.detailRows}>
                            {date && (
                                <span>
                                    <CalendarDays size={14} />
                                    {new Intl.DateTimeFormat("en-GB", {
                                        weekday: "short",
                                        day: "numeric",
                                        month: "long",
                                        hour: "numeric",
                                        minute: "2-digit",
                                        timeZone: "Africa/Kampala",
                                    }).format(date)}
                                </span>
                            )}
                            {p.location && (
                                <span>
                                    <MapPin size={14} />
                                    {p.location}
                                </span>
                            )}
                        </div>
                        {href && (
                            <div className={s.actions}>
                                <Link href={href} className={s.secondary}>
                                    View event
                                    <ArrowUpRight size={14} />
                                </Link>
                            </div>
                        )}
                    </>
                ) : p.kind === "product" || p.kind === "service" ? (
                    <div className={s.productRow}>
                        <div className={s.productImage}>
                            <SafeImage
                                src={p.image}
                                alt={p.title}
                                width={128}
                                height={140}
                                fallback={
                                    <div className={s.eventFallback}>
                                        <ShoppingBag
                                            size={33}
                                            strokeWidth={1}
                                        />
                                    </div>
                                }
                            />
                        </div>
                        <div className={s.musicDetails}>
                            <h3 className={s.cardTitle}>{p.title}</h3>
                            {p.subtitle && (
                                <p className={s.subtitle}>{p.subtitle}</p>
                            )}
                            {price && <p className={s.price}>{price}</p>}
                            {p.price_credits != null && (
                                <p className={s.subtitle}>
                                    {p.price_credits.toLocaleString()} credits
                                </p>
                            )}
                            {p.kind === "service" && p.platforms?.length ? (
                                <div className={s.tags}>
                                    {p.platforms.map((platform) => (
                                        <span key={platform}>{platform}</span>
                                    ))}
                                </div>
                            ) : null}
                            {p.kind === "service" && p.delivery_days ? (
                                <p className={s.subtitle}>
                                    Delivery within {p.delivery_days} days
                                </p>
                            ) : null}
                            {href && (
                                <div className={s.actions}>
                                    <Link href={href} className={s.secondary}>
                                        {p.kind === "service"
                                            ? "View promotion service"
                                            : "View product"}
                                        <ArrowUpRight size={14} />
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                ) : p.kind === "promotion" ? (
                    <>
                        <div className={s.brief}>
                            <p className={s.episodeLabel}>
                                An opportunity in the community
                            </p>
                            <h3 className={s.cardTitle}>{p.title}</h3>
                            {p.state === "closed" && (
                                <span className={s.contentState}>
                                    Applications closed · Past opportunity
                                </span>
                            )}
                            {budget && (
                                <p className={s.budget}>
                                    <Wallet size={15} />
                                    {budget}
                                </p>
                            )}
                            {p.platforms?.length ? (
                                <div className={s.tags}>
                                    {p.platforms.map((platform) => (
                                        <span key={platform}>{platform}</span>
                                    ))}
                                </div>
                            ) : null}
                            {p.deadline_at && p.state !== "closed" && (
                                <p className={s.subtitle}>
                                    Applications close{" "}
                                    {relativeDate(p.deadline_at)}
                                </p>
                            )}
                        </div>
                        {href && (
                            <div className={s.actions}>
                                <Link href={href} className={s.secondary}>
                                    View brief
                                    <ArrowUpRight size={14} />
                                </Link>
                            </div>
                        )}
                    </>
                ) : p.kind === "corpus" ? (
                    <>
                        <h3 className={s.cardTitle}>{p.title}</h3>
                        <div className={s.corpusPair}>
                            <div>
                                <small>Ateso</small>
                                <p lang="teo">{p.ateso_text}</p>
                            </div>
                            <div>
                                <small>English</small>
                                <p lang="en">{p.english_text}</p>
                            </div>
                        </div>
                        {p.dialect && (
                            <div className={s.tags}>
                                <span>{p.dialect}</span>
                                <span>Accepted community translation</span>
                            </div>
                        )}
                        <p className={s.corpusCredit}>
                            TesoTunes / Iteso community · {p.license} · Pair{" "}
                            {p.pair_uuid?.slice(0, 8)} · Wording may vary by
                            dialect.
                        </p>
                        {href && (
                            <div className={s.actions}>
                                <Link href={href} className={s.secondary}>
                                    Add your own words
                                    <ArrowUpRight size={14} />
                                </Link>
                            </div>
                        )}
                    </>
                ) : p.kind === "translation" ? (
                    <>
                        <h3 className={s.cardTitle}>{p.title}</h3>
                        <p className={s.subtitle}>
                            Try the translator, judge its answer, or help grow
                            the community corpus. Every accepted pair adds
                            something real.
                        </p>
                        <div className={s.projectStats}>
                            <div>
                                <strong>
                                    {(p.accepted_pairs ?? 0).toLocaleString()}
                                </strong>
                                <span>Accepted pairs</span>
                            </div>
                            <div>
                                <strong>
                                    {(p.open_tasks ?? 0).toLocaleString()}
                                </strong>
                                <span>Open translation tasks</span>
                            </div>
                        </div>
                        {href && (
                            <div className={s.actions}>
                                <Link href={href} className={s.primary}>
                                    Try a translation
                                    <ArrowUpRight size={14} />
                                </Link>
                            </div>
                        )}
                        <p className={s.corpusCredit}>
                            Corrections enter review. Credits apply to accepted
                            work, not instant model answers.
                        </p>
                    </>
                ) : (
                    <>
                        <h3 className={s.cardTitle}>{p.title}</h3>
                        {p.image && (
                            <div className={s.postMedia}>
                                <SafeImage
                                    src={p.image}
                                    alt=""
                                    width={660}
                                    height={350}
                                />
                            </div>
                        )}
                        {item.body && (
                            <div className={s.body}>
                                <RichText
                                    text={
                                        item.body.length > 500
                                            ? `${item.body.slice(0, 500)}…`
                                            : item.body
                                    }
                                />
                            </div>
                        )}
                        {href && (
                            <div className={s.actions}>
                                <Link href={href} className={s.secondary}>
                                    Explore
                                    <ArrowUpRight size={14} />
                                </Link>
                            </div>
                        )}
                    </>
                )}
                {playError && (
                    <p className={s.inlineError} role="alert">
                        {playError}
                    </p>
                )}
            </div>
            <footer className={s.cardFooter}>
                {href ? (
                    <Link className={s.footerLink} href={href}>
                        {labels[p.kind]}
                        <ArrowUpRight size={12} />
                    </Link>
                ) : (
                    <span className={s.footerLink}>
                        Public community update
                    </span>
                )}
                <div className={s.footerActions}>
                    {href && (
                        <button
                            className={s.footerLink}
                            onClick={() =>
                                void shareTimelineItem(href, p.title)
                            }
                            aria-label={`Share ${p.title}`}
                        >
                            <Share2 size={14} />
                            Share
                        </button>
                    )}
                    {onSave && (
                        <button
                            className={s.footerLink}
                            aria-pressed={saved}
                            disabled={busy}
                            onClick={onSave}
                        >
                            <Bookmark
                                size={14}
                                fill={saved ? "currentColor" : "none"}
                            />
                            {saved ? "Saved" : "Save"}
                        </button>
                    )}
                </div>
            </footer>
            {reason && (
                <p className={s.reason}>
                    <Sparkles size={12} />
                    {reason}
                </p>
            )}
        </article>
    );
}
