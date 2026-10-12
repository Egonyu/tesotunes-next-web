"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    ArrowUp,
    ArrowUpRight,
    Bookmark,
    CheckCircle2,
    Compass,
    Headphones,
    HeartHandshake,
    Leaf,
    Loader2,
    MessageCircle,
    Plus,
    RefreshCw,
    SlidersHorizontal,
    Users,
} from "lucide-react";
import { toast } from "sonner";
import { apiDelete, apiPost, apiPostForm } from "@/lib/api";
import type { FeedModule, Post } from "@/types/edula";
import { useEdulaTimeline, type TimelineView } from "@/hooks/useEdulaTimeline";
import { useEdulaPreferences } from "@/hooks/useEdulaPreferences";
import { TimelineActivityCard } from "@/components/edula/timeline-activity-card";
import { TimelinePostCard } from "@/components/edula/timeline-post-card";
import {
    ComposerDialog,
    InterestsDialog,
    SignInDialog,
    type ComposerSubmission,
} from "@/components/edula/timeline-dialogs";
import { TIMELINE_CATEGORIES } from "@/components/edula/timeline-model";
import s from "@/components/edula/edula.module.css";

const TABS: { key: TimelineView; label: string }[] = [
    { key: "for-you", label: "For You" },
    { key: "following", label: "Following" },
    { key: "latest", label: "Latest" },
    { key: "interests", label: "My interests" },
];

export default function EdulaPage() {
    const { data: session, status } = useSession();
    const authenticated = !!session?.user;
    const userId = session?.user?.id ?? "guest";
    const client = useQueryClient();
    const [view, setView] = useState<TimelineView>("for-you");
    const [module, setModule] = useState<FeedModule | "all">("all");
    const [dialog, setDialog] = useState<
        "interests" | "compose" | "signin" | null
    >(null);
    const prefs = useEdulaPreferences(
        userId,
        authenticated,
        status !== "loading",
    );
    const accountView = view === "following" || view === "saved";
    const feed = useEdulaTimeline({
        view,
        module,
        interests: prefs.state.interests,
        userId,
        enabled: prefs.ready && (!accountView || authenticated),
    });
    const more = useRef<HTMLButtonElement>(null);
    useEffect(() => {
        if (
            !more.current ||
            !feed.hasNextPage ||
            feed.isFetchingNextPage ||
            feed.isError ||
            typeof IntersectionObserver === "undefined"
        )
            return;
        const observer = new IntersectionObserver(
            (records) => {
                if (records.some((record) => record.isIntersecting))
                    void feed.fetchNextPage();
            },
            { rootMargin: "240px" },
        );
        observer.observe(more.current);
        return () => observer.disconnect();
    }, [
        feed.hasNextPage,
        feed.isFetchingNextPage,
        feed.isError,
        feed.fetchNextPage,
        view,
        module,
    ]);
    const entries = feed.entries.filter(
        (entry) =>
            !prefs.state.hidden.includes(
                entry.data.identity ??
                    (entry.source === "post"
                        ? `post:${entry.data.id}`
                        : `feed:${entry.data.uuid}`),
            ),
    );
    const signIn = () => setDialog("signin");
    const selectView = (next: TimelineView) => {
        setView(next);
        setModule("all");
    };
    const chooseIdentity = (identity: string | undefined) =>
        identity &&
        /^(feed:[a-f\d-]{36}|(?:song|episode|post):[1-9]\d*)$/i.test(identity)
            ? identity
            : null;
    const save = async (identity: string | undefined) => {
        if (!authenticated) {
            signIn();
            return;
        }
        const valid = chooseIdentity(identity);
        if (!valid || !prefs.canWrite || prefs.isPending) return;
        try {
            const saved = prefs.state.saved.includes(valid);
            await prefs.change({
                action: saved ? "unsave" : "save",
                identity: valid,
            });
            if (view === "saved") await feed.refresh();
            toast.success(
                saved ? "Removed from your saved items" : "Saved for later",
            );
        } catch {
            toast.error("Could not update your saved items. Please try again.");
        }
    };
    const hide = async (identity: string | undefined) => {
        if (!authenticated) {
            signIn();
            return;
        }
        const valid = chooseIdentity(identity);
        if (!valid || !prefs.canWrite || prefs.isPending) return;
        try {
            await prefs.change({ action: "hide", identity: valid });
            toast.info("Update hidden", {
                action: {
                    label: "Undo",
                    onClick: () => {
                        void prefs
                            .change({ action: "unhide", identity: valid })
                            .then(() => feed.refresh())
                            .catch(() =>
                                toast.error("Could not restore that update."),
                            );
                    },
                },
            });
        } catch {
            toast.error("Could not hide this update.");
        }
    };
    const like = useMutation({
        mutationFn: async (post: Post) => ({
            post,
            response: post.is_liked
                ? await apiDelete<{
                      data: { liked: boolean; likes_count: number };
                  }>(`/posts/${post.id}/like`)
                : await apiPost<{
                      data: { liked: boolean; likes_count: number };
                  }>(`/posts/${post.id}/like`, {}),
        }),
        onSuccess: ({ post, response }) =>
            feed.patchPost(post.id, {
                is_liked: response.data.liked,
                likes_count: response.data.likes_count,
            }),
        onError: () =>
            toast.error("Could not save your like. Please try again."),
    });
    const publish = useMutation({
        mutationFn: async (submission: ComposerSubmission) => {
            if (!submission.media.length)
                return apiPost("/posts", {
                    content: submission.content,
                    visibility: submission.visibility,
                });
            const form = new FormData();
            form.append("content", submission.content);
            form.append("visibility", submission.visibility);
            submission.media.forEach((file) => form.append("media[]", file));
            return apiPostForm("/posts", form);
        },
    });
    const onPublish = async (submission: ComposerSubmission) => {
        await publish.mutateAsync(submission);
        selectView("for-you");
        await client.resetQueries({ queryKey: ["edula-timeline", userId] });
        toast.success("Your voice is in the community");
    };
    const remove = useMutation({
        mutationFn: (id: number) => apiDelete(`/posts/${id}`),
        onSuccess: () => {
            void feed.refresh();
            toast.success("Post removed");
        },
        onError: () => toast.error("Could not delete this post."),
    });
    const deletePost = (post: Post) => {
        if (window.confirm("Remove this post from Edula?"))
            remove.mutate(post.id);
    };
    const busy = prefs.isPending || like.isPending || remove.isPending;
    const discoveryIndex = entries.findIndex(
        (entry) => entry.section === "discovery",
    );
    const event = entries.find(
        (entry) =>
            entry.source === "feed_item" &&
            entry.data.presentation?.kind === "event",
    );
    const eventPresentation =
        event?.source === "feed_item" ? event.data.presentation : null;
    const loading =
        status === "loading" ||
        !prefs.ready ||
        (feed.isLoading && (!accountView || authenticated));
    const filters =
        view === "interests"
            ? TIMELINE_CATEGORIES.filter((category) =>
                  prefs.state.interests.includes(category.key),
              )
            : TIMELINE_CATEGORIES;

    return (
        <div className={s.page}>
            <header className={s.masthead}>
                <div>
                    <p className={s.eyebrow}>The Teso community</p>
                    <h1 className={s.wordmark}>
                        Edula<span>.</span>
                    </h1>
                    <p className={s.tagline}>
                        Music, people, and everything in between.
                    </p>
                </div>
                <div className={s.headerActions}>
                    <button
                        id="edula-saved"
                        className={s.iconButton}
                        data-active={view === "saved"}
                        aria-label="Saved discoveries"
                        aria-pressed={view === "saved"}
                        onClick={() =>
                            selectView(view === "saved" ? "for-you" : "saved")
                        }
                    >
                        <Bookmark
                            size={17}
                            fill={view === "saved" ? "currentColor" : "none"}
                        />
                    </button>
                    <button
                        className={s.iconButton}
                        aria-label="Refresh feed"
                        disabled={feed.isFetching}
                        onClick={() => void feed.refresh()}
                    >
                        <RefreshCw
                            size={16}
                            className={feed.isFetching ? "animate-spin" : ""}
                        />
                    </button>
                    <button
                        className={s.primary}
                        onClick={() =>
                            authenticated ? setDialog("compose") : signIn()
                        }
                        aria-label="Start a post"
                    >
                        <Plus size={16} />
                        <span>Add your voice</span>
                    </button>
                </div>
            </header>
            <div className={s.grid}>
                <section className={s.main} aria-label="Edula feed">
                    <div className={s.controls}>
                        <div
                            role="tablist"
                            aria-label="Feed view"
                            className={s.tabs}
                        >
                            {TABS.map((tab) => (
                                <button
                                    role="tab"
                                    key={tab.key}
                                    id={`edula-${tab.key}`}
                                    aria-controls="edula-feed-panel"
                                    aria-selected={view === tab.key}
                                    onClick={() => selectView(tab.key)}
                                    onKeyDown={(event) => {
                                        const index = TABS.findIndex(
                                            (item) => item.key === view,
                                        );
                                        const next =
                                            event.key === "ArrowRight"
                                                ? (index + 1) % TABS.length
                                                : event.key === "ArrowLeft"
                                                  ? (index + TABS.length - 1) %
                                                    TABS.length
                                                  : event.key === "Home"
                                                    ? 0
                                                    : event.key === "End"
                                                      ? TABS.length - 1
                                                      : -1;
                                        if (next >= 0) {
                                            event.preventDefault();
                                            selectView(TABS[next].key);
                                            document
                                                .getElementById(
                                                    `edula-${TABS[next].key}`,
                                                )
                                                ?.focus();
                                        }
                                    }}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        {view !== "saved" && (
                            <div className={s.filterRow}>
                                <div
                                    className={s.filters}
                                    aria-label="Content filters"
                                >
                                    <button
                                        aria-pressed={module === "all"}
                                        onClick={() => setModule("all")}
                                    >
                                        {view === "interests"
                                            ? "Your whole mix"
                                            : "All activity"}
                                    </button>
                                    {filters.map((category) => (
                                        <button
                                            key={category.key}
                                            aria-pressed={
                                                module === category.key
                                            }
                                            onClick={() =>
                                                setModule(category.key)
                                            }
                                        >
                                            {category.label}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    className={s.filterEdit}
                                    aria-label="Edit interests"
                                    onClick={() => setDialog("interests")}
                                >
                                    <SlidersHorizontal size={15} />
                                    <span>Your mix</span>
                                </button>
                            </div>
                        )}
                    </div>
                    {view === "saved" ? (
                        <h2 className={s.savedHeading}>
                            <Bookmark size={18} />
                            Saved for a little later.
                        </h2>
                    ) : (
                        <div className={s.viewNote}>
                            <span>
                                {view === "for-you"
                                    ? "A mix of the community and your interests"
                                    : view === "following"
                                      ? "From the creators and people you follow"
                                      : view === "interests"
                                        ? "Only the categories you chose"
                                        : "Public activity · Last 30 days · Newest first"}
                            </span>
                            {view === "for-you" && <span>Fresh first</span>}
                        </div>
                    )}
                    {feed.hasUpdates && (
                        <button
                            className={s.updateButton}
                            onClick={() => void feed.refresh()}
                        >
                            <ArrowUp size={15} />
                            Feed updates available — tap to refresh
                        </button>
                    )}
                    {prefs.isError && (
                        <div className={s.prefsWarning}>
                            Your account preferences couldn’t be loaded. You can
                            still browse.
                            <button
                                className={s.textButton}
                                onClick={() => void prefs.retry()}
                            >
                                {" "}
                                Retry preferences
                            </button>
                        </div>
                    )}
                    {view !== "saved" && (
                        <button
                            className={s.composerLauncher}
                            onClick={() =>
                                authenticated ? setDialog("compose") : signIn()
                            }
                            aria-label="Share with the community"
                        >
                            <span className={s.avatar}>
                                {session?.user?.name?.charAt(0) ?? (
                                    <MessageCircle size={16} />
                                )}
                            </span>
                            <span>
                                {authenticated
                                    ? "A thought, a song, a little Teso…"
                                    : "Something worth sharing? Add your voice."}
                            </span>
                            <span className={s.composeHint}>
                                <Plus size={17} />
                            </span>
                        </button>
                    )}
                    <div
                        id="edula-feed-panel"
                        role="tabpanel"
                        aria-labelledby={
                            view === "saved" ? "edula-saved" : `edula-${view}`
                        }
                        aria-busy={loading}
                    >
                        {loading ? (
                            <div
                                className={s.feed}
                                role="status"
                                aria-label="Loading Edula"
                            >
                                <div className={s.skeleton} />
                                <div className={s.skeleton} />
                                <span className="sr-only">Loading Edula</span>
                            </div>
                        ) : accountView && !authenticated ? (
                            <div className={s.feed}>
                                <div className={s.quiet}>
                                    <div className={s.quietIcon}>
                                        {view === "saved" ? (
                                            <Bookmark size={19} />
                                        ) : (
                                            <Users size={20} />
                                        )}
                                    </div>
                                    <h2>
                                        {view === "saved"
                                            ? "Keep the things you love."
                                            : "Your people, in one place."}
                                    </h2>
                                    <p>
                                        {view === "saved"
                                            ? "Sign in to collect songs, episodes, and updates worth returning to."
                                            : "Sign in to see updates from the creators and people you follow."}
                                    </p>
                                    <div className={s.actions}>
                                        <button
                                            className={s.primary}
                                            onClick={signIn}
                                        >
                                            Sign in
                                        </button>
                                        <button
                                            className={s.secondary}
                                            onClick={() =>
                                                selectView("for-you")
                                            }
                                        >
                                            Explore For You
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : feed.isError && !feed.data ? (
                            <div className={s.feed}>
                                <div className={s.quiet} role="alert">
                                    <div className={s.quietIcon}>
                                        <RefreshCw size={19} />
                                    </div>
                                    <h2>We couldn’t load Edula.</h2>
                                    <p>
                                        Something interrupted the connection.
                                        This is not an empty feed.
                                    </p>
                                    <div className={s.actions}>
                                        <button
                                            className={s.secondary}
                                            onClick={() => void feed.refresh()}
                                        >
                                            Retry
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className={s.feed}>
                                    {entries.length === 0 ? (
                                        <div className={s.quiet}>
                                            <div className={s.quietIcon}>
                                                {view === "interests" &&
                                                prefs.state.interests.length ===
                                                    0 ? (
                                                    <SlidersHorizontal
                                                        size={20}
                                                    />
                                                ) : view === "saved" ? (
                                                    <Bookmark size={20} />
                                                ) : (
                                                    <Leaf
                                                        size={20}
                                                        strokeWidth={1.4}
                                                    />
                                                )}
                                            </div>
                                            <h2>
                                                {view === "interests" &&
                                                !prefs.state.interests.length
                                                    ? "Choose a few interests."
                                                    : view === "saved"
                                                      ? "Room for your next discovery."
                                                      : view === "following"
                                                        ? "A quiet moment from your people."
                                                        : "A quiet moment."}
                                            </h2>
                                            <p>
                                                {view === "interests"
                                                    ? prefs.state.interests
                                                          .length
                                                        ? "Nothing available in these categories right now. Your mix stays yours—we won’t fill it with other interests."
                                                        : "Pick the parts of TesoTunes you want to follow. Your selection can be as wide or as focused as you like."
                                                    : view === "saved"
                                                      ? "Tap Save on a feed card. Your collection will be waiting here when you return."
                                                      : view === "following"
                                                        ? "There are no available updates from the people you follow. Explore For You to find someone new."
                                                        : "No public updates in this view right now. Discover the catalogue while the community makes its next move."}
                                            </p>
                                            <div className={s.actions}>
                                                {view === "interests" ? (
                                                    <button
                                                        className={s.secondary}
                                                        onClick={() =>
                                                            setDialog(
                                                                "interests",
                                                            )
                                                        }
                                                    >
                                                        Choose interests
                                                    </button>
                                                ) : view === "saved" ||
                                                  view === "following" ? (
                                                    <button
                                                        className={s.secondary}
                                                        onClick={() =>
                                                            selectView(
                                                                "for-you",
                                                            )
                                                        }
                                                    >
                                                        Explore For You
                                                    </button>
                                                ) : (
                                                    <>
                                                        <Link
                                                            className={
                                                                s.secondary
                                                            }
                                                            href="/songs"
                                                        >
                                                            Explore music
                                                            <ArrowUpRight
                                                                size={13}
                                                            />
                                                        </Link>
                                                        <Link
                                                            className={
                                                                s.secondary
                                                            }
                                                            href="/podcasts"
                                                        >
                                                            Find a podcast
                                                            <ArrowUpRight
                                                                size={13}
                                                            />
                                                        </Link>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        entries.map((entry, index) => {
                                            const identity =
                                                entry.data.identity ??
                                                (entry.source === "post"
                                                    ? `post:${entry.data.id}`
                                                    : `feed:${entry.data.uuid}`);
                                            const saved =
                                                prefs.state.saved.includes(
                                                    identity,
                                                );
                                            return (
                                                <Fragment
                                                    key={`${entry.source}:${entry.data.uuid ?? entry.data.id}`}
                                                >
                                                    {index === discoveryIndex &&
                                                        entry.section ===
                                                            "discovery" && (
                                                            <>
                                                                <div
                                                                    className={
                                                                        s.caughtUp
                                                                    }
                                                                >
                                                                    <CheckCircle2
                                                                        size={
                                                                            19
                                                                        }
                                                                    />
                                                                    <div>
                                                                        You’re
                                                                        caught
                                                                        up.
                                                                        <small>
                                                                            That’s
                                                                            the
                                                                            recent
                                                                            activity
                                                                            in
                                                                            this
                                                                            view.
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                                <div
                                                                    className={
                                                                        s.sectionLine
                                                                    }
                                                                >
                                                                    Worth
                                                                    discovering
                                                                    · Earlier
                                                                    publications
                                                                </div>
                                                            </>
                                                        )}
                                                    {entry.source === "post" ? (
                                                        <TimelinePostCard
                                                            post={entry.data}
                                                            saved={saved}
                                                            owner={
                                                                String(
                                                                    entry.data
                                                                        .author
                                                                        .id,
                                                                ) === userId
                                                            }
                                                            busy={busy}
                                                            onLike={() =>
                                                                authenticated
                                                                    ? like.mutate(
                                                                          entry.data,
                                                                      )
                                                                    : signIn()
                                                            }
                                                            onSave={() =>
                                                                void save(
                                                                    identity,
                                                                )
                                                            }
                                                            onHide={() =>
                                                                void hide(
                                                                    identity,
                                                                )
                                                            }
                                                            onDelete={() =>
                                                                deletePost(
                                                                    entry.data,
                                                                )
                                                            }
                                                        />
                                                    ) : (
                                                        <TimelineActivityCard
                                                            item={entry.data}
                                                            reason={
                                                                view ===
                                                                "for-you"
                                                                    ? entry.reason
                                                                    : undefined
                                                            }
                                                            saved={saved}
                                                            authenticated={
                                                                authenticated
                                                            }
                                                            busy={
                                                                busy ||
                                                                (authenticated &&
                                                                    !prefs.canWrite)
                                                            }
                                                            onSave={() =>
                                                                void save(
                                                                    identity,
                                                                )
                                                            }
                                                            onHide={() =>
                                                                void hide(
                                                                    identity,
                                                                )
                                                            }
                                                            onSignIn={signIn}
                                                        />
                                                    )}
                                                </Fragment>
                                            );
                                        })
                                    )}
                                </div>
                                {feed.hasNextPage && (
                                    <button
                                        ref={more}
                                        className={s.loadMore}
                                        disabled={feed.isFetchingNextPage}
                                        onClick={() =>
                                            void feed.fetchNextPage()
                                        }
                                    >
                                        {feed.isFetchingNextPage ? (
                                            <>
                                                <Loader2
                                                    size={14}
                                                    className="inline animate-spin"
                                                />{" "}
                                                Loading…
                                            </>
                                        ) : (
                                            "Continue through the community"
                                        )}
                                    </button>
                                )}
                                {!feed.hasNextPage && entries.length > 0 && (
                                    <div className={s.endNote}>
                                        {view === "saved" ? (
                                            "Your collection ends here—for now."
                                        ) : discoveryIndex >= 0 ? (
                                            "That’s today’s discovery selection. More lives in the catalogue."
                                        ) : (
                                            <>
                                                <CheckCircle2
                                                    size={16}
                                                    className="mr-2 inline"
                                                />
                                                You’re caught up in this view.
                                            </>
                                        )}
                                    </div>
                                )}
                                {feed.isError && feed.data && (
                                    <div
                                        className={s.prefsWarning}
                                        role="alert"
                                    >
                                        We couldn’t load the next page, or this
                                        session expired.{" "}
                                        <button
                                            className={s.textButton}
                                            onClick={() => void feed.refresh()}
                                        >
                                            Refresh the feed
                                        </button>
                                    </div>
                                )}
                                {feed.meta?.window_limited && (
                                    <p className={s.endNote}>
                                        This is a bounded selection. Explore
                                        individual sections for more.
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </section>
                <aside className={s.rail} aria-label="Your Edula">
                    <section className={s.railSection}>
                        <h2 className={s.railHeading}>
                            Your corner of the community
                        </h2>
                        <p className={s.railCopy}>
                            {authenticated
                                ? "A mix you can make your own."
                                : "You don’t need to follow anyone to start discovering."}
                        </p>
                        <div className={s.railInterests}>
                            {prefs.state.interests.map((key) => (
                                <span key={key}>
                                    {
                                        TIMELINE_CATEGORIES.find(
                                            (category) => category.key === key,
                                        )?.label
                                    }
                                </span>
                            ))}
                        </div>
                        <button
                            className={s.textButton}
                            onClick={() => setDialog("interests")}
                        >
                            Shape your interests{" "}
                            <ArrowUpRight size={12} className="inline" />
                        </button>
                    </section>
                    {feed.pulse.length > 0 && (
                        <section className={s.railSection}>
                            <h2 className={s.railHeading}>
                                A little community movement
                            </h2>
                            <p className={s.railLabel}>
                                This week · Anonymous public activity
                            </p>
                            {feed.pulse.map((group) => (
                                <div className={s.pulseItem} key={group.type}>
                                    {group.type === "song_played" ? (
                                        <Headphones size={16} />
                                    ) : (
                                        <HeartHandshake size={16} />
                                    )}
                                    <p>
                                        <strong>{group.count}</strong> people{" "}
                                        {group.type === "song_played"
                                            ? "discovered music"
                                            : group.type === "ticket_purchased"
                                              ? "supported an event"
                                              : "supported community stores"}
                                    </p>
                                </div>
                            ))}
                        </section>
                    )}
                    {eventPresentation?.href && (
                        <section className={s.railSection}>
                            <h2 className={s.railHeading}>On the calendar</h2>
                            <p className={s.railCopy}>
                                {eventPresentation.title}
                            </p>
                            {eventPresentation.location && (
                                <p className={s.railLabel}>
                                    {eventPresentation.location}
                                </p>
                            )}
                            <Link
                                className={s.textButton}
                                href={eventPresentation.href}
                            >
                                Explore the event{" "}
                                <ArrowUpRight size={12} className="inline" />
                            </Link>
                        </section>
                    )}
                    <section className={s.railSection}>
                        <h2 className={s.railHeading}>
                            There’s more to discover
                        </h2>
                        <div className={s.railLinks}>
                            <Link className={s.railLink} href="/songs">
                                <Headphones size={15} />
                                Music from home
                                <ArrowUpRight size={12} />
                            </Link>
                            <Link className={s.railLink} href="/events">
                                <Compass size={15} />
                                Events & gatherings
                                <ArrowUpRight size={12} />
                            </Link>
                            <Link
                                className={s.railLink}
                                href="/promotions/requests"
                            >
                                <Users size={15} />
                                Open opportunities
                                <ArrowUpRight size={12} />
                            </Link>
                            <Link className={s.railLink} href="/contribute">
                                <MessageCircle size={15} />
                                Give Ateso a voice
                                <ArrowUpRight size={12} />
                            </Link>
                        </div>
                    </section>
                    <p className={s.railFoot}>
                        Fresh activity first. Earlier discoveries clearly dated.
                        <br />
                        Private activity stays private.
                    </p>
                </aside>
            </div>
            <InterestsDialog
                open={dialog === "interests"}
                onClose={() => setDialog(null)}
                interests={prefs.state.interests}
                synced={authenticated}
                busy={prefs.isPending}
                canWrite={prefs.canWrite}
                hiddenCount={prefs.state.hidden.length}
                onSave={async (choices) => {
                    await prefs.change({ interests: choices });
                }}
                onRestore={async () => {
                    await prefs.change({ action: "restore-hidden" });
                    await feed.refresh();
                }}
            />
            <SignInDialog
                open={dialog === "signin"}
                onClose={() => setDialog(null)}
            />
            <ComposerDialog
                open={dialog === "compose"}
                onClose={() => setDialog(null)}
                busy={publish.isPending}
                onSubmit={onPublish}
            />
        </div>
    );
}
