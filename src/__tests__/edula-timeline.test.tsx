import {
    render,
    screen,
    fireEvent,
    waitFor,
    cleanup,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import EdulaPage from "@/app/(app)/edula/page";
import { apiGet, apiPut, apiPost } from "@/lib/api";
import {
    timelineFingerprint,
    type TimelineResponse,
} from "@/hooks/useEdulaTimeline";

jest.mock("@/lib/api", () => ({
    apiGet: jest.fn(),
    apiPut: jest.fn(),
    apiPost: jest.fn(),
    apiDelete: jest.fn(),
    apiPostForm: jest.fn(),
}));
let mockSession: { user: { id: string; name: string } } | null = null;
jest.mock("next-auth/react", () => ({
    useSession: () => ({
        data: mockSession,
        status: mockSession ? "authenticated" : "unauthenticated",
    }),
}));
jest.mock("@/hooks/useFeed", () => {
    const mutation = () => ({
        mutate: jest.fn(),
        mutateAsync: jest.fn(),
        isPending: false,
    });
    return {
        useCreatePost: mutation,
        useLikePost: mutation,
        useUnlikePost: mutation,
        useBookmarkPost: mutation,
        useUnbookmarkPost: mutation,
        useRepost: mutation,
        useDeletePost: mutation,
    };
});
jest.mock("@/components/edula/create-post-composer", () => ({
    CreatePostComposer: () => null,
}));
jest.mock("@/components/edula/post-card", () => ({ PostCard: () => null }));
jest.mock("@/components/edula/timeline-activity-card", () => ({
    TimelineActivityCard: ({
        item,
        onSave,
        saved,
    }: {
        item: { title: string };
        onSave?: () => void;
        saved?: boolean;
    }) => (
        <article>
            {item.title}
            {onSave && (
                <button onClick={onSave}>{saved ? "Saved" : "Save"}</button>
            )}
        </article>
    ),
}));

const mockGet = apiGet as jest.Mock;
const clients: QueryClient[] = [];
function response(
    title?: string,
    section: "recent" | "discovery" = "recent",
): TimelineResponse {
    return {
        data: title
            ? [
                  {
                      id: 1,
                      uuid: title,
                      identity: "feed:00000000-0000-4000-8000-000000000001",
                      source: "feed_item",
                      module: "music",
                      title,
                      section,
                      reason: "Public update",
                  },
              ]
            : [],
        meta: {
            next_cursor: null,
            snapshot_at: "2026-10-11T00:00:00Z",
            recent_count: section === "recent" && title ? 1 : 0,
            discovery_count: section === "discovery" && title ? 1 : 0,
            fresh_hours: 48,
            window_days: 30,
            window_limited: false,
        },
        pulse: [],
    };
}
function mount() {
    const client = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });
    clients.push(client);
    return render(
        <QueryClientProvider client={client}>
            <EdulaPage />
        </QueryClientProvider>,
    );
}
beforeEach(() => {
    mockGet.mockReset();
    (apiPut as jest.Mock).mockReset();
    (apiPost as jest.Mock).mockReset();
    mockSession = null;
    localStorage.clear();
});
afterEach(() => {
    cleanup();
    clients.splice(0).forEach((client) => client.clear());
});

test("quiet days show dated discoveries and a finite end, without requiring follows", async () => {
    mockGet.mockResolvedValue(response("An earlier release", "discovery"));
    mount();
    expect(await screen.findByText("An earlier release")).toBeInTheDocument();
    expect(screen.getByText("You’re caught up.")).toBeInTheDocument();
    expect(screen.getByText(/Worth discovering/)).toBeInTheDocument();
    expect(screen.queryByText("Load more")).not.toBeInTheDocument();
    expect(
        screen.queryByText(/Follow artists and users/),
    ).not.toBeInTheDocument();
});

test("polling announces new activity without replacing the visible feed", async () => {
    mockGet
        .mockResolvedValueOnce(response("Original release"))
        .mockResolvedValue(response("New release"));
    mount();
    expect(await screen.findByText("Original release")).toBeInTheDocument();
    const refresh = await screen.findByRole("button", {
        name: /Feed updates available/,
    });
    expect(screen.queryByText("New release")).not.toBeInTheDocument();
    fireEvent.click(refresh);
    expect(await screen.findByText("New release")).toBeInTheDocument();
    expect(screen.queryByText("Original release")).not.toBeInTheDocument();
});

test("empty interests remain empty and are saved on this device", async () => {
    mockGet.mockResolvedValue(response());
    mount();
    await screen.findByRole("heading", { name: "A quiet moment." });
    fireEvent.click(screen.getByRole("tab", { name: "My interests" }));
    fireEvent.click(screen.getByRole("button", { name: "Edit interests" }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Music/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Podcasts/ }));
    fireEvent.click(screen.getByRole("button", { name: "Save interests" }));
    expect(
        await screen.findByText("Choose a few interests."),
    ).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("edula-interests:guest")!)).toEqual(
        [],
    );
    await waitFor(() =>
        expect(mockGet).toHaveBeenCalledWith(
            "/feed/timeline",
            expect.objectContaining({
                params: expect.objectContaining({
                    view: "interests",
                    interests: [],
                }),
            }),
        ),
    );
});

test("Latest requests chronological public history including old publications", async () => {
    mockGet.mockResolvedValue(response());
    mount();
    await screen.findByRole("heading", { name: "A quiet moment." });
    fireEvent.click(screen.getByRole("tab", { name: "Latest" }));
    expect(
        await screen.findByText(
            "Public activity · All publication dates · Newest first",
        ),
    ).toBeInTheDocument();
    await waitFor(() =>
        expect(mockGet).toHaveBeenCalledWith(
            "/feed/timeline",
            expect.objectContaining({
                params: expect.objectContaining({ view: "latest" }),
            }),
        ),
    );
});

test("an API failure is not presented as a quiet day", async () => {
    mockGet.mockRejectedValue(new Error("Unavailable"));
    mount();
    expect(
        await screen.findByText("We couldn’t load Edula."),
    ).toBeInTheDocument();
    expect(screen.queryByText("You’re caught up.")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
});

test("duplicate entries are rendered once", async () => {
    const duplicate = response("One release");
    duplicate.data.push(duplicate.data[0]);
    mockGet.mockResolvedValue(duplicate);
    mount();
    await screen.findByText("One release");
    expect(screen.getAllByText("One release")).toHaveLength(1);
});

test("update fingerprints ignore discovery-only changes", () => {
    expect(timelineFingerprint(response("Earlier one", "discovery"))).toBe(
        timelineFingerprint(response("Earlier two", "discovery")),
    );
    expect(timelineFingerprint(response("New one"))).not.toBe(
        timelineFingerprint(response("New two")),
    );
});

test("Following and Saved are gated for guests without requesting personal feeds", async () => {
    mockGet.mockResolvedValue(response());
    mount();
    await screen.findByRole("heading", { name: "A quiet moment." });
    fireEvent.click(screen.getByRole("tab", { name: "Following" }));
    expect(
        await screen.findByText("Your people, in one place."),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Saved discoveries" }));
    expect(
        await screen.findByText("Keep the things you love."),
    ).toBeInTheDocument();
    expect(
        mockGet.mock.calls.some(([, options]) =>
            ["saved", "following"].includes(options?.params?.view),
        ),
    ).toBe(false);
});

test("feed tabs support keyboard navigation", async () => {
    mockGet.mockResolvedValue(response());
    mount();
    await screen.findByRole("heading", { name: "A quiet moment." });
    const tab = screen.getByRole("tab", { name: "For You" });
    tab.focus();
    fireEvent.keyDown(tab, { key: "End" });
    expect(screen.getByRole("tab", { name: "My interests" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "My interests" })).toHaveAttribute(
        "aria-selected",
        "true",
    );
});

test("signed in saves use account preferences and update the visible control", async () => {
    mockSession = { user: { id: "99", name: "Tester" } };
    const identity = "feed:00000000-0000-4000-8000-000000000001";
    const preferences = { interests: ["music"], saved: [], hidden: [] };
    mockGet.mockImplementation((path: string) =>
        Promise.resolve(
            path === "/feed/timeline/preferences"
                ? { data: preferences }
                : response("A real release"),
        ),
    );
    (apiPut as jest.Mock).mockResolvedValue({
        data: { ...preferences, saved: [identity] },
    });
    mount();
    await screen.findByText("A real release");
    fireEvent.click(screen.getByRole("button", { name: "Save", exact: true }));
    await waitFor(() =>
        expect(apiPut).toHaveBeenCalledWith("/feed/timeline/preferences", {
            action: "save",
            identity,
        }),
    );
    expect(
        await screen.findByRole("button", { name: "Saved", exact: true }),
    ).toBeInTheDocument();
});

test("post likes use the confirmed server state rather than estimating the count", async () => {
    mockSession = { user: { id: "99", name: "Tester" } };
    const timeline = response();
    timeline.data = [
        {
            id: 7,
            uuid: "a-post",
            identity: "post:7",
            source: "post",
            section: "recent",
            reason: "A community conversation",
            author: {
                id: 8,
                name: "Community member",
                avatar_url: "",
                is_verified: false,
            },
            content: "A community thought",
            created_at: "2026-10-12T08:00:00Z",
            likes_count: 2,
            comments_count: 0,
            is_liked: false,
        },
    ];
    mockGet.mockImplementation((path: string) =>
        Promise.resolve(
            path === "/feed/timeline/preferences"
                ? { data: { interests: ["social"], saved: [], hidden: [] } }
                : timeline,
        ),
    );
    (apiPost as jest.Mock).mockResolvedValue({
        data: { liked: true, likes_count: 37 },
    });
    mount();
    await screen.findByText("A community thought");
    fireEvent.click(screen.getByRole("button", { name: "Like", exact: true }));
    expect(await screen.findByText("37 likes")).toBeInTheDocument();
    expect(
        screen.getByRole("button", { name: "Liked", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(apiPost).toHaveBeenCalledWith("/posts/7/like", {});
});

test("a failed post keeps its draft and a retry publishes to the selected audience", async () => {
    mockSession = { user: { id: "99", name: "Tester" } };
    mockGet.mockImplementation((path: string) =>
        Promise.resolve(
            path === "/feed/timeline/preferences"
                ? { data: { interests: ["music"], saved: [], hidden: [] } }
                : response(),
        ),
    );
    (apiPost as jest.Mock)
        .mockRejectedValueOnce(new Error("offline"))
        .mockResolvedValue({ data: { id: 7 } });
    mount();
    await screen.findByRole("heading", { name: "A quiet moment." });
    fireEvent.click(screen.getByRole("button", { name: "Start a post" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Post content" }), {
        target: { value: "A thought for the community" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "Post audience" }), {
        target: { value: "followers" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Publish post" }));
    expect(
        await screen.findByText(
            "Your post could not be published. Your draft is still here.",
        ),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Post content" })).toHaveValue(
        "A thought for the community",
    );
    fireEvent.click(screen.getByRole("button", { name: "Publish post" }));
    await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(apiPost).toHaveBeenLastCalledWith("/posts", {
        content: "A thought for the community",
        visibility: "followers",
    });
});
