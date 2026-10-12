"use client";

import Link from "next/link";
import {
    Bookmark,
    CheckCircle2,
    EyeOff,
    Heart,
    Lock,
    MessageCircle,
    MoreHorizontal,
    Share2,
    Trash2,
} from "lucide-react";
import type { Post } from "@/types/edula";
import { SafeImage } from "@/components/ui/safe-image";
import { RichText } from "./rich-text";
import { relativeDate } from "./timeline-model";
import { shareTimelineItem } from "./timeline-activity-card";
import s from "./edula.module.css";

export function TimelinePostCard({
    post,
    saved,
    busy,
    owner,
    onLike,
    onSave,
    onHide,
    onDelete,
}: {
    post: Post;
    saved: boolean;
    busy: boolean;
    owner: boolean;
    onLike: () => void;
    onSave: () => void;
    onHide: () => void;
    onDelete: () => void;
}) {
    const href = `/edula/${post.id}`;
    return (
        <article className={s.card} data-kind="post">
            <header className={s.cardHeader}>
                <div className={s.avatar}>
                    <SafeImage
                        src={post.author.avatar_url}
                        alt=""
                        width={36}
                        height={36}
                        fallback={<span>{post.author.name.charAt(0)}</span>}
                    />
                </div>
                <div className={s.byline}>
                    <p className={s.author}>
                        {post.author.name}
                        {post.author.is_verified && (
                            <CheckCircle2 size={13} aria-label="Verified" />
                        )}
                    </p>
                    <time className={s.timestamp} dateTime={post.created_at}>
                        {relativeDate(post.created_at)}
                    </time>
                </div>
                <span className={s.kind}>
                    {post.visibility === "private" ? (
                        <>
                            <Lock size={10} />
                            Only you
                        </>
                    ) : post.visibility === "followers" ? (
                        "For followers"
                    ) : (
                        "Community post"
                    )}
                </span>
                <details className={s.more}>
                    <summary
                        aria-label={`Options for post by ${post.author.name}`}
                    >
                        <MoreHorizontal size={18} />
                    </summary>
                    <div className={s.menu}>
                        <button onClick={onHide} disabled={busy}>
                            <EyeOff size={14} />
                            Hide this post
                        </button>
                        {owner && (
                            <button onClick={onDelete} disabled={busy}>
                                <Trash2 size={14} />
                                Delete post
                            </button>
                        )}
                    </div>
                </details>
            </header>
            <div className={s.content}>
                <div className={s.postText}>
                    <RichText text={post.content} />
                </div>
                {post.media?.type === "image" && (
                    <div className={s.postMedia}>
                        <SafeImage
                            src={post.media.url}
                            alt="Post attachment"
                            width={660}
                            height={410}
                        />
                    </div>
                )}
                {post.media?.type === "video" && (
                    <div className={s.postMedia}>
                        <video
                            src={post.media.url}
                            controls
                            preload="none"
                            poster={post.media.thumbnail_url}
                        />
                    </div>
                )}
                {post.media?.type === "song" && post.media.song_id && (
                    <div className={s.actions}>
                        <Link
                            href={`/songs/${post.media.song_id}`}
                            className={s.secondary}
                        >
                            {post.media.title ?? "Open shared song"}
                        </Link>
                    </div>
                )}
                {(post.likes_count > 0 || post.comments_count > 0) && (
                    <div className={s.postStats}>
                        {post.likes_count > 0 && (
                            <span>
                                {post.likes_count.toLocaleString()}{" "}
                                {post.likes_count === 1 ? "like" : "likes"}
                            </span>
                        )}
                        {post.comments_count > 0 && (
                            <span>
                                {post.comments_count.toLocaleString()}{" "}
                                {post.comments_count === 1
                                    ? "comment"
                                    : "comments"}
                            </span>
                        )}
                    </div>
                )}
            </div>
            <footer className={s.cardFooter}>
                <div className={s.footerActions}>
                    <button
                        className={s.footerLink}
                        aria-pressed={post.is_liked}
                        onClick={onLike}
                        disabled={busy}
                    >
                        <Heart
                            size={15}
                            fill={post.is_liked ? "currentColor" : "none"}
                        />
                        {post.is_liked ? "Liked" : "Like"}
                    </button>
                    <Link className={s.footerLink} href={href}>
                        <MessageCircle size={15} />
                        Discuss
                    </Link>
                </div>
                <div className={s.footerActions}>
                    <button
                        className={s.footerLink}
                        onClick={() =>
                            void shareTimelineItem(
                                href,
                                `A post by ${post.author.name}`,
                            )
                        }
                    >
                        <Share2 size={14} />
                        <span className="sr-only">Share post</span>
                    </button>
                    <button
                        className={s.footerLink}
                        onClick={onSave}
                        aria-pressed={saved}
                        disabled={busy}
                    >
                        <Bookmark
                            size={14}
                            fill={saved ? "currentColor" : "none"}
                        />
                        <span className="sr-only">
                            {saved ? "Unsave post" : "Save post"}
                        </span>
                    </button>
                </div>
            </footer>
        </article>
    );
}
