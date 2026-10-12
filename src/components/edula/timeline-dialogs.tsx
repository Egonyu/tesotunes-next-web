"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ImagePlus, Loader2, LockKeyhole, X } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import type { FeedModule } from "@/types/edula";
import { TIMELINE_CATEGORIES } from "./timeline-model";
import s from "./edula.module.css";

function DialogHeader({
    title,
    description,
    onClose,
}: {
    title: string;
    description: string;
    onClose: () => void;
}) {
    return (
        <div className={s.modalHeader}>
            <div>
                <h2 id="edula-dialog-title">{title}</h2>
                <p>{description}</p>
            </div>
            <button
                className={s.iconButton}
                onClick={onClose}
                aria-label="Close dialog"
            >
                <X size={16} />
            </button>
        </div>
    );
}

export function InterestsDialog({
    open,
    onClose,
    interests,
    synced,
    busy,
    canWrite,
    hiddenCount,
    onRestore,
    onSave,
}: {
    open: boolean;
    onClose: () => void;
    interests: FeedModule[];
    synced: boolean;
    busy: boolean;
    canWrite: boolean;
    hiddenCount: number;
    onRestore: () => Promise<void>;
    onSave: (interests: FeedModule[]) => Promise<void>;
}) {
    const [draft, setDraft] = useState(interests);
    const [error, setError] = useState("");
    const wasOpen = useRef(false);
    useEffect(() => {
        if (open && !wasOpen.current) {
            setDraft(interests);
            setError("");
        }
        wasOpen.current = open;
    }, [open, interests]);
    const apply = async () => {
        setError("");
        try {
            await onSave(draft);
            onClose();
        } catch {
            setError("Your choices could not be saved. Please try again.");
        }
    };
    return (
        <Modal
            open={open}
            onClose={busy ? () => {} : onClose}
            className={s.modalPanel}
            labelledBy="edula-dialog-title"
        >
            <div className={s.dialog}>
                <DialogHeader
                    title="Make it your mix."
                    description="Choose the things you want to discover. My interests will show only these categories."
                    onClose={onClose}
                />
                <div className={s.modalBody}>
                    <div className={s.interestGrid}>
                        {TIMELINE_CATEGORIES.map((category) => (
                            <label className={s.interest} key={category.key}>
                                <input
                                    type="checkbox"
                                    checked={draft.includes(category.key)}
                                    onChange={() =>
                                        setDraft((current) =>
                                            current.includes(category.key)
                                                ? current.filter(
                                                      (item) =>
                                                          item !== category.key,
                                                  )
                                                : [...current, category.key],
                                        )
                                    }
                                />
                                <span>
                                    <strong>{category.label}</strong>
                                    <small>{category.description}</small>
                                </span>
                            </label>
                        ))}
                    </div>
                    {hiddenCount > 0 && (
                        <button
                            className={s.textButton}
                            disabled={busy || !canWrite}
                            style={{ marginTop: 20 }}
                            onClick={() =>
                                void onRestore().catch(() =>
                                    setError("Could not restore hidden items."),
                                )
                            }
                        >
                            Restore {hiddenCount} hidden{" "}
                            {hiddenCount === 1 ? "item" : "items"}
                        </button>
                    )}
                    {error && (
                        <p className={s.inlineError} role="alert">
                            {error}
                        </p>
                    )}
                </div>
                <div className={s.modalFooter}>
                    <small>
                        {synced
                            ? "Saved to your account"
                            : "Saved on this device"}
                    </small>
                    <button
                        className={s.primary}
                        disabled={busy || !canWrite}
                        onClick={() => void apply()}
                    >
                        {busy && <Loader2 size={14} className="animate-spin" />}
                        Save interests
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export function SignInDialog({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            className={s.modalPanel}
            labelledBy="edula-dialog-title"
        >
            <div className={s.dialog}>
                <DialogHeader
                    title="A little more community."
                    description="Everyone can browse Edula. Sign in to post, follow creators, and keep a collection of your discoveries."
                    onClose={onClose}
                />
                <div className={s.modalBody}>
                    <div className={s.guestPrompt}>
                        <LockKeyhole size={20} />
                        Your saved items and preferences stay with your
                        TesoTunes account.
                    </div>
                    <div className={s.actions}>
                        <Link
                            className={s.primary}
                            href="/login?callbackUrl=%2Fedula"
                        >
                            Sign in
                        </Link>
                        <Link className={s.secondary} href="/register">
                            Create an account
                        </Link>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

export interface ComposerSubmission {
    content: string;
    visibility: "public" | "followers" | "private";
    media: File[];
}

export function ComposerDialog({
    open,
    onClose,
    busy,
    onSubmit,
}: {
    open: boolean;
    onClose: () => void;
    busy: boolean;
    onSubmit: (submission: ComposerSubmission) => Promise<void>;
}) {
    const [content, setContent] = useState("");
    const [visibility, setVisibility] =
        useState<ComposerSubmission["visibility"]>("public");
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState("");
    const input = useRef<HTMLInputElement>(null);
    const submit = async () => {
        setError("");
        try {
            await onSubmit({
                content: content.trim(),
                visibility,
                media: files,
            });
            setContent("");
            setFiles([]);
            onClose();
        } catch {
            setError(
                "Your post could not be published. Your draft is still here.",
            );
        }
    };
    const attach = (selected: File[]) => {
        if (selected.some((file) => file.size > 50 * 1024 * 1024)) {
            setError("Each file must be 50 MB or smaller.");
            return;
        }
        if (selected.length + files.length > 4) {
            setError("You can attach up to four files.");
            return;
        }
        setError("");
        setFiles((current) => [...current, ...selected]);
    };
    return (
        <Modal
            open={open}
            onClose={busy ? () => {} : onClose}
            className={s.modalPanel}
            labelledBy="edula-dialog-title"
        >
            <div className={s.dialog}>
                <DialogHeader
                    title="Add your voice."
                    description="Share a thought, a moment, or something the community should hear."
                    onClose={busy ? () => {} : onClose}
                />
                <div className={s.modalBody}>
                    <textarea
                        className={s.composerText}
                        value={content}
                        onChange={(event) => setContent(event.target.value)}
                        maxLength={5000}
                        placeholder="What’s happening in your corner of Teso?"
                        aria-label="Post content"
                    />
                    <input
                        ref={input}
                        type="file"
                        multiple
                        hidden
                        accept="image/jpeg,image/png,image/gif,video/mp4,video/quicktime,video/webm"
                        onChange={(event) => {
                            attach(Array.from(event.target.files ?? []));
                            event.target.value = "";
                        }}
                    />
                    {files.length > 0 && (
                        <div className={s.fileList}>
                            {files.map((file, index) => (
                                <div key={`${file.name}-${index}`}>
                                    <ImagePlus size={14} />
                                    <span>{file.name}</span>
                                    <button
                                        aria-label={`Remove ${file.name}`}
                                        onClick={() =>
                                            setFiles((current) =>
                                                current.filter(
                                                    (_, position) =>
                                                        position !== index,
                                                ),
                                            )
                                        }
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className={s.composerTools}>
                        <button
                            className={s.secondary}
                            onClick={() => input.current?.click()}
                        >
                            <ImagePlus size={15} />
                            Photo or video
                        </button>
                        <label>
                            <span className="sr-only">Post audience</span>
                            <select
                                value={visibility}
                                onChange={(event) =>
                                    setVisibility(
                                        event.target
                                            .value as ComposerSubmission["visibility"],
                                    )
                                }
                            >
                                <option value="public">Everyone</option>
                                <option value="followers">Followers</option>
                                <option value="private">Only me</option>
                            </select>
                        </label>
                    </div>
                    {error && (
                        <p className={s.inlineError} role="alert">
                            {error}
                        </p>
                    )}
                </div>
                <div className={s.modalFooter}>
                    <small>
                        {content.length.toLocaleString()} / 5,000 · Up to 4
                        files
                    </small>
                    <button
                        className={s.primary}
                        disabled={
                            busy || (!content.trim() && files.length === 0)
                        }
                        onClick={() => void submit()}
                    >
                        {busy && <Loader2 size={14} className="animate-spin" />}
                        Publish post
                    </button>
                </div>
            </div>
        </Modal>
    );
}
