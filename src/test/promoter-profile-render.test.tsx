import { render, waitFor } from "@/test/test-utils";
import PromoterProfilePage from "@/app/(app)/promoters/[username]/page";

/**
 * This page could not reach a successful render.
 *
 * useQueries, useMutation and useMemo sat after the loading and error early
 * returns, so the hook count changed between the loading render and the
 * loaded one and React threw "rendered more hooks than during the previous
 * render". A test that only asserted the loading state would have passed —
 * the failure is on the transition, which is why this one waits for content.
 *
 * The payload below is the shape GET /promoters/{slug} actually returns.
 * The page was previously typed against the studio editor's profile instead,
 * so it read display_name as `name`, service_types that do not exist, and a
 * promotions array the endpoint never sent.
 */

jest.mock("next/navigation", () => ({
  ...jest.requireActual("next/navigation"),
  useParams: () => ({ username: "simon" }),
}));

const profile = {
  id: 3,
  slug: "simon",
  display_name: "Simon Promotions",
  username: "Simon",
  avatar_url: "https://api.tesotunes.com/avatars/simon.jpg",
  banner_url: null,
  location: "Soroti, Uganda",
  bio: "Teso-region TikTok reach.",
  tier: "starter",
  is_verified: true,
  platforms: ["tiktok"],
  niches: ["afrobeats", "gospel"],
  audience_regions: ["Soroti", "Kampala"],
  audience_summary: "Mostly 18-30 across Teso and the diaspora.",
  response_time_hours: 6,
  proof_points: ["12 campaigns delivered"],
  campaign_highlights: [],
  portfolio_items: [],
  social_links: { tiktok_url: "https://tiktok.com/@simon" },
  average_rating: 4.6,
  review_count: 9,
  completed_orders: 12,
  onboarded_at: "2026-06-18T04:55:25+00:00",
  promotions: [
    {
      id: 1,
      slug: "tiktok-boost",
      title: "Tiktok Boost",
      short_description: "Live stream mention plus a story post",
      type: "live_stream_promotion",
      platform: "tiktok",
      price_credits: 500,
      price_ugx: 5000,
      accepts_credits: true,
      accepts_ugx: true,
      accepts_hybrid: true,
      estimated_reach: 1000,
      audience_niches: ["afrobeats"],
      audience_regions: ["Soroti"],
      content_formats: ["live_stream"],
      delivery_days_min: 1,
      delivery_days_max: 5,
      platform_specifics: {},
      rating_average: 0,
      rating_count: 0,
      total_orders: 1,
      completed_orders: 0,
      is_featured: false,
      is_top_rated: false,
      promoter: {
        id: 13,
        name: "Simon Promotions",
        username: "simon",
        avatar_url: null,
        is_verified: true,
        follower_count: 0,
      },
      featured_image_url: null,
      status: "active",
      created_at: "2026-07-01T14:19:14+00:00",
    },
  ],
};

jest.mock("@/lib/api", () => ({
  ...jest.requireActual("@/lib/api"),
  apiGet: jest.fn((url: string) => {
    if (url.startsWith("/promoters/")) {
      return Promise.resolve({ data: profile });
    }
    if (url.includes("/reviews/")) {
      return Promise.resolve({ data: { data: [] } });
    }
    return Promise.resolve({});
  }),
  apiPost: jest.fn(() => Promise.resolve({})),
}));

describe("PromoterProfilePage", () => {
  it("renders the storefront without a hook-order error", async () => {
    const { container } = render(<PromoterProfilePage />);

    // Reaching the loaded render at all is the assertion: the hook-order
    // throw happened on this exact transition. Queried against textContent
    // because the headings interleave icons and spans.
    await waitFor(() => expect(container.textContent).toContain("Simon Promotions"));

    expect(container.textContent).not.toContain("Promoter Not Found");
  });

  it("shows the promoter's live listings, which are the point of the page", async () => {
    const { container } = render(<PromoterProfilePage />);

    await waitFor(() => expect(container.textContent).toContain("Tiktok Boost"));
  });

  it("shows delivered campaigns rather than a follower count the profile has no field for", async () => {
    const { container } = render(<PromoterProfilePage />);

    await waitFor(() => expect(container.textContent).toContain("campaigns delivered"));
  });
});
