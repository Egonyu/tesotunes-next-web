import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
    TimelineActivityCard,
    safeTimelineLink,
} from "@/components/edula/timeline-activity-card";
import { apiGet } from "@/lib/api";
import type { FeedItem } from "@/types/edula";

const mockPlay = jest.fn();
jest.mock("@/lib/api", () => ({ apiGet: jest.fn() }));
jest.mock("@/stores/player", () => ({
    usePlayerStore: (selector: (state: unknown) => unknown) =>
        selector({ play: mockPlay }),
}));
jest.mock("@/components/edula/post-card", () => ({
    formatTimeAgo: () => "4 days ago",
}));
jest.mock("@/components/edula/rich-text", () => ({
    RichText: ({ text }: { text: string }) => <>{text}</>,
}));

test("song actions fetch a real song and use the shared player", async () => {
    const song = { id: 42, title: "A real song" };
    (apiGet as jest.Mock).mockResolvedValue({ data: song });
    const item = {
        id: 1,
        uuid: "release",
        module: "music",
        type: "song_release",
        title: "New release",
        actor: { name: "Artist" },
        published_at: "2026-10-07",
        extras: { song_id: 42 },
        actions: [{ type: "play", label: "Play", url: "/songs/song-slug" }],
    } as unknown as FeedItem;
    render(<TimelineActivityCard item={item} reason="Earlier publication" />);
    fireEvent.click(screen.getByRole("button", { name: "Play song" }));
    await waitFor(() => expect(mockPlay).toHaveBeenCalledWith(song));
    expect(apiGet).toHaveBeenCalledWith("/songs/42");
    expect(screen.getByRole("link", { name: "Open song" })).toHaveAttribute(
        "href",
        "/songs/song-slug",
    );
    expect(document.querySelector("time")).toHaveAttribute(
        "datetime",
        "2026-10-07",
    );
});

test("only local navigation targets are accepted", () => {
    expect(safeTimelineLink("/polls/42")).toBe(true);
    expect(safeTimelineLink("//external.example")).toBe(false);
    expect(safeTimelineLink("javascript:alert(1)")).toBe(false);
    expect(safeTimelineLink("/\\external.example")).toBe(false);
});
