import { fireEvent, render, screen, waitFor } from "@/test/test-utils";
import CreditsPage from "@/app/(app)/credits/page";

// Renders the credits page against the exact payloads production returns for
// an account with history, to catch a render throw that only shows up as
// "Something went wrong" behind the (app) error boundary.

jest.mock("next-auth/react", () => ({
  ...jest.requireActual("next-auth/react"),
  useSession: () => ({ status: "authenticated", data: { user: { name: "T" } } }),
}));

const dashboard = {
  wallet: {
    available_credits: 2656,
    total_earned: 3856,
    total_spent: 1200,
    earned_today: 1000,
    spent_today: 1000,
    earning_potential_remaining: 0,
    login_streak: 0,
    // Goals measure credits earned through activity, not the balance above.
    goals: {
      activity_credits: 5156,
      claimable: 0,
      next: {
        id: 5,
        key: "tesotunes_ambassador",
        name: "TesoTunes Ambassador",
        description: "Earn 10,000 credits through activity.",
        credits_required: 10000,
        remaining: 4844,
        reward_type: "credits",
        reward_value: 500,
        badge_name: "TesoTunes Ambassador",
        badge_icon: "\u{1F451}",
        badge_tier: "diamond",
        status: "locked",
        claimed_at: null,
        progress: 51,
      },
    },
    recent_transactions: [
      {
        type: "earned",
        amount: "+1,000 credits",
        description: "Purchased 1000 credits from wallet",
        source: "Wallet purchase",
        date: "1 hour ago",
        icon: "\u{1F4B0}",
      },
      {
        type: "spent",
        amount: "-1,000 credits",
        description: "Converted 1000 credits to wallet balance",
        source: "Wallet cashout",
        date: "1 hour ago",
        icon: "\u{1F4B8}",
      },
    ],
  },
  earning_promotionRequests: [
    {
      title: "Listen to Music",
      description: "Earn credits by listening to songs",
      potential_credits: "0.5 - 1 credit per song",
      daily_limit: "50 credits",
      remaining_today: 0,
      action: "Start listening",
      icon: "\u{1F3B5}",
    },
  ],
  promotion_promotionRequests: [],
  daily_challenges: [
    {
      title: "Music Explorer",
      description: "Listen to 5 different artists today",
      progress: 0,
      target: 5,
      reward: "10 bonus credits",
      completed: false,
    },
  ],
};

const balance = {
  credits: 2656,
  wallet_balance: 1000,
  currency: "UGX",
  exchange_rate: { credits_per_ugx: 1, ugx_per_credit: 1 },
};

const goalsList = {
  activity_credits: 5156,
  milestones: [
    {
      ...dashboard.wallet.goals.next,
      id: 1,
      key: "first_hundred",
      name: "First 100",
      credits_required: 100,
      remaining: 0,
      reward_value: 10,
      badge_name: "Rising Fan",
      badge_icon: "\u{1F331}",
      status: "claimed",
      claimed_at: "2026-09-01T10:00:00+03:00",
      progress: 100,
    },
    {
      ...dashboard.wallet.goals.next,
      id: 4,
      key: "five_thousand",
      name: "Superfan",
      credits_required: 5000,
      remaining: 0,
      reward_value: 200,
      badge_name: "Superfan",
      status: "claimable",
      progress: 100,
    },
    dashboard.wallet.goals.next,
  ],
};

const mockApiPost = jest.fn((..._args: unknown[]) =>
  Promise.resolve({ success: true, message: "Superfan claimed. 200 credits added." }),
);

jest.mock("@/lib/api", () => ({
  ...jest.requireActual("@/lib/api"),
  apiGet: jest.fn((url: string) => {
    if (url.includes("/credits/goals")) {
      return Promise.resolve({ success: true, data: goalsList });
    }
    if (url.includes("/credits/dashboard")) {
      return Promise.resolve({ success: true, data: dashboard });
    }
    if (url.includes("/credits/balance")) {
      return Promise.resolve({ success: true, data: balance });
    }
    if (url.includes("/credits/transactions")) {
      return Promise.resolve({ success: true, transactions: { data: [] } });
    }
    return Promise.resolve({});
  }),
  apiPost: (...args: unknown[]) => mockApiPost(...args),
}));

describe("CreditsPage", () => {
  it("renders an account that holds credits without throwing", async () => {
    render(<CreditsPage />);

    await waitFor(() => expect(screen.getByText("Credits")).toBeInTheDocument());

    // The balance a person actually holds, not a zero.
    await waitFor(() => expect(screen.getByText("2.7K")).toBeInTheDocument());

    // The sign comes from the API and must not be doubled.
    expect(screen.getByText("+1,000 credits")).toBeInTheDocument();
    expect(screen.getByText("-1,000 credits")).toBeInTheDocument();
    expect(screen.queryByText("-+1,000 credits")).not.toBeInTheDocument();
  });

  it("labels goal progress as activity credits, not the balance", async () => {
    render(<CreditsPage />);

    await waitFor(() => expect(screen.getByText("Earned from activity")).toBeInTheDocument());
    expect(screen.getByText("5,156")).toBeInTheDocument();
    expect(screen.getByText("4,844")).toBeInTheDocument();
    expect(screen.getAllByText("TesoTunes Ambassador").length).toBeGreaterThan(0);
    expect(screen.queryByText(/Platform ambassador/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/verification/i)).not.toBeInTheDocument();
  });

  it("lists goals with their real state and claims a reached one", async () => {
    mockApiPost.mockClear();
    render(<CreditsPage />);

    await waitFor(() => expect(screen.getByText("Goals")).toBeInTheDocument());
    expect(screen.getByText(/Bought credits don.t count/)).toBeInTheDocument();
    expect(screen.getByText(/Rising Fan ✓/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Claim" }));

    await waitFor(() => expect(mockApiPost).toHaveBeenCalledWith("/credits/goals/4/claim"));
  });
});
