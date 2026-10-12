import {
    render,
    screen,
    fireEvent,
    waitFor,
    cleanup,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";
import { TimelineActivityCard } from "@/components/edula/timeline-activity-card";
import type { FeedItem } from "@/types/edula";

jest.mock("@/lib/api", () => ({ apiGet: jest.fn(), apiPost: jest.fn() }));
jest.mock("@/stores/player", () => ({
    usePlayerStore: (selector: (state: unknown) => unknown) =>
        selector({
            currentSong: null,
            isPlaying: false,
            play: jest.fn(),
            toggle: jest.fn(),
        }),
}));

const mockGet = apiGet as jest.Mock,
    mockPost = apiPost as jest.Mock;
const clients: QueryClient[] = [];
const item = {
    id: 1,
    uuid: "poll",
    module: "forum",
    type: "poll_created",
    title: "Your favourite local sound?",
    body: null,
    published_at: "2026-10-12",
    actor: { name: "Community" },
    extras: {},
    actions: [],
    presentation: {
        kind: "poll",
        title: "Your favourite local sound?",
        poll_id: 42,
        href: "/polls/42",
    },
} as unknown as FeedItem;
function data(overrides: Record<string, unknown> = {}) {
    return {
        data: {
            id: 42,
            title: "Your favourite local sound?",
            status: "active",
            has_responded: false,
            allow_guest_responses: true,
            show_results_before_completion: false,
            total_responses: 12,
            questions: [
                {
                    id: 7,
                    question_text: "Choose a sound",
                    question_type: "multiple_choice",
                    allow_multiple: false,
                    options: [
                        {
                            id: 31,
                            text: "Traditional",
                            percentage: 70,
                            response_count: 8,
                        },
                        {
                            id: 32,
                            text: "Contemporary",
                            percentage: 30,
                            response_count: 4,
                        },
                    ],
                },
            ],
            ...overrides,
        },
    };
}
function mount(authenticated = true, onSignIn = jest.fn()) {
    const client = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });
    clients.push(client);
    return render(
        <QueryClientProvider client={client}>
            <TimelineActivityCard
                item={item}
                authenticated={authenticated}
                onSignIn={onSignIn}
            />
        </QueryClientProvider>,
    );
}
beforeEach(() => {
    mockGet.mockReset();
    mockPost.mockReset();
});
afterEach(() => {
    cleanup();
    clients.splice(0).forEach((client) => client.clear());
});

test("single choice votes use the real response endpoint and question identity", async () => {
    mockGet.mockResolvedValue(data());
    mockPost.mockResolvedValue({ data: {} });
    mount();
    fireEvent.click(await screen.findByRole("radio", { name: "Traditional" }));
    fireEvent.click(screen.getByRole("button", { name: "Vote", exact: true }));
    await waitFor(() =>
        expect(mockPost).toHaveBeenCalledWith("/polls/42/respond", {
            answers: [{ question_id: 7, option_ids: [31] }],
        }),
    );
    expect(
        await screen.findByText(
            "Your vote is recorded. Thank you for taking part.",
        ),
    ).toBeInTheDocument();
});

test("a closed poll is readable but never offers a vote or claims a future closing time", async () => {
    mockGet.mockResolvedValue(
        data({ status: "closed", ends_at: "2020-01-01" }),
    );
    mount();
    expect(
        await screen.findByText("Voting closed", { exact: false }),
    ).toBeInTheDocument();
    expect(
        screen.queryByRole("button", { name: "Vote", exact: true }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    expect(screen.getByText("70%")).toBeInTheDocument();
});

test("an expired active poll cannot be voted on and does not reveal hidden results", async () => {
    mockGet.mockResolvedValue(
        data({ ends_at: "2020-01-01", show_results_before_completion: false }),
    );
    mount();
    await screen.findByText("Traditional");
    expect(
        screen.queryByRole("button", { name: "Vote", exact: true }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("70%")).not.toBeInTheDocument();
});

test("restricted results are not shown before a response", async () => {
    mockGet.mockResolvedValue(data());
    mount();
    await screen.findByRole("radio", { name: "Traditional" });
    expect(screen.queryByText("70%")).not.toBeInTheDocument();
});

test("guest restrictions request sign in without sending a vote", async () => {
    const signIn = jest.fn();
    mockGet.mockResolvedValue(data({ allow_guest_responses: false }));
    mount(false, signIn);
    fireEvent.click(await screen.findByRole("radio", { name: "Traditional" }));
    fireEvent.click(screen.getByRole("button", { name: "Vote", exact: true }));
    expect(signIn).toHaveBeenCalled();
    expect(mockPost).not.toHaveBeenCalled();
});

test("multi-question surveys open the full flow instead of submitting a partial vote", async () => {
    const payload = data();
    const questions = payload.data.questions;
    mockGet.mockResolvedValue(
        data({ questions: [...questions, { ...questions[0], id: 8 }] }),
    );
    mount();
    expect(
        await screen.findByRole("link", { name: "Open the full survey" }),
    ).toHaveAttribute("href", "/polls/42");
    expect(
        screen.queryByRole("button", { name: "Vote", exact: true }),
    ).not.toBeInTheDocument();
});
