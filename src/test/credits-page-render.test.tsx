import { render, screen, waitFor } from "@/test/test-utils";
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
    next_milestone: null,
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
  earning_opportunities: [
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
  promotion_opportunities: [],
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

jest.mock("@/lib/api", () => ({
  ...jest.requireActual("@/lib/api"),
  apiGet: jest.fn((url: string) => {
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
  apiPost: jest.fn(() => Promise.resolve({})),
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
});
