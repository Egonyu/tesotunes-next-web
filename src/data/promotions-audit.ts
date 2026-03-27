export type DeliveryStatus = "live" | "mock-backed" | "partial" | "blocked";

export type AuditTask = {
  title: string;
  description: string;
  status: "completed" | "todo";
  owner: "web" | "api" | "shared";
};

export type IntegrationSurface = {
  label: string;
  href: string;
  status: DeliveryStatus;
  summary: string;
};

export type AuditFinding = {
  title: string;
  status: DeliveryStatus;
  detail: string;
};

export type DocumentationSource = {
  title: string;
  path: string;
  summary: string;
};

export const promotionsAuditTasks: AuditTask[] = [
  {
    title: "Marketplace browse page",
    description: "Public promotions browse route with filters, pagination, and event-context handoff is already wired.",
    status: "completed",
    owner: "web",
  },
  {
    title: "Buyer, seller, and admin page shells",
    description: "Artist and admin promotions screens already exist in the app and can be used as delivery targets.",
    status: "completed",
    owner: "web",
  },
  {
    title: "Promotions audit tracker on /promotions",
    description: "This page now exposes live status, blockers, integrations, and mock operating context for local development.",
    status: "completed",
    owner: "web",
  },
  {
    title: "Public promotions API parity",
    description: "Laravel browse/detail endpoints need resource shaping, filters, reviews, platforms, and promoter profile support.",
    status: "todo",
    owner: "api",
  },
  {
    title: "Buyer purchase and verification workflow",
    description: "Purchase, purchases list, proof submission, disputes, and reviews are defined in frontend hooks but still incomplete on the backend.",
    status: "todo",
    owner: "api",
  },
  {
    title: "Seller promotion CRUD and queue",
    description: "Seller analytics and management tables exist in web, but Laravel seller endpoints currently return placeholder payloads.",
    status: "todo",
    owner: "api",
  },
  {
    title: "Commission and escrow logic",
    description: "Promotion fees, payout release, refunds, and hybrid payment settlement still need a canonical implementation shared with Store.",
    status: "todo",
    owner: "shared",
  },
  {
    title: "SACCO and store campaign handoff",
    description: "Loans, goals, wallet funding, and store product/promotion bridges need normalized contracts instead of scattered roadmap notes.",
    status: "todo",
    owner: "shared",
  },
];

export const promotionsIntegrations: IntegrationSurface[] = [
  {
    label: "Artist seller studio",
    href: "/artist/promotions",
    status: "partial",
    summary: "UI is ready for listings, analytics, and edit actions, but it still depends on missing seller API responses.",
  },
  {
    label: "Verification queue",
    href: "/artist/promotions/orders",
    status: "partial",
    summary: "Queue screens are built for proof review and payout release, yet backend verification/rejection logic is not finished.",
  },
  {
    label: "Admin moderation",
    href: "/admin/promotions",
    status: "partial",
    summary: "Approval, rejection, disputes, and analytics pages exist, while moderation APIs need richer data and actions.",
  },
  {
    label: "Storefront bridge",
    href: "/artist/store",
    status: "live",
    summary: "Storefront product management is live and already supports product types, making it the closest real bridge for promotion products.",
  },
  {
    label: "SACCO funding",
    href: "/sacco",
    status: "mock-backed",
    summary: "Docs position SACCO as the financing path for campaign loans and goals, but promotion-specific integration is still roadmap-level.",
  },
  {
    label: "Wallet top-up",
    href: "/artist/wallet/topup",
    status: "live",
    summary: "Wallet funding is already productized and can be presented as the practical path for local-dev promotion spend simulations.",
  },
];

export const promotionsOfferLanes: AuditFinding[] = [
  {
    title: "Influencers",
    status: "mock-backed",
    detail: "Use as the highest-volume lane for TikTok, Instagram, and short-form creator offers with reach, follower count, and turnaround data.",
  },
  {
    title: "DJs",
    status: "mock-backed",
    detail: "Model shoutouts, club spins, host mentions, and event intros as fast-delivery offers that tie cleanly into verification and commission release.",
  },
  {
    title: "Radio",
    status: "mock-backed",
    detail: "Represent radio play, interview plugs, and request-hour slots with scheduled delivery windows and stronger proof requirements.",
  },
  {
    title: "Artists as promoters",
    status: "partial",
    detail: "The seller dashboards already imply artist-owned promotion listings, but role rules and backend publishing controls need completion.",
  },
];

export const promotionsKeyFindings: AuditFinding[] = [
  {
    title: "Frontend contract outruns backend reality",
    status: "blocked",
    detail: "React Query hooks and page types expect a full marketplace, while Laravel controllers currently provide browse/detail plus placeholder seller and buyer responses.",
  },
  {
    title: "Store promotion model is overloaded",
    status: "partial",
    detail: "The backend mixes store discount campaigns and artist promotion marketplace concepts under similar naming, which increases response-shape drift.",
  },
  {
    title: "Cross-module strategy is documented but not operationalized",
    status: "mock-backed",
    detail: "SACCO, wallet, Edula, analytics, and commission stories are strong in docs, but only a subset is represented in real APIs and pages today.",
  },
  {
    title: "Local login lockout comes from IP-only throttling",
    status: "live",
    detail: "The auth API rate limiter is keyed by IP and was strict enough to interrupt local testing after repeated failed attempts.",
  },
];

export const promotionsDocumentationSources: DocumentationSource[] = [
  {
    title: "Promotions rebuild blueprint",
    path: "C:\\Users\\egony\\Project\\tesotunes-next-web\\PROMOTIONS_SYSTEM_NEXTJS_REBUILD.md",
    summary: "Defines the ideal marketplace, route map, roles, payment model, and implementation phases.",
  },
  {
    title: "Promotions ecosystem integration",
    path: "C:\\Users\\egony\\Project\\tesotunes-next-web\\PROMOTIONS_ECOSYSTEM_INTEGRATION.md",
    summary: "Maps promotions to credits, store, Edula, SACCO, analytics, and revenue strategy.",
  },
  {
    title: "Promotions API checklist",
    path: "C:\\Users\\egony\\Project\\tesotunes-next-web\\PROMOTIONS_API_CHECKLIST.md",
    summary: "Lists the backend routes, models, jobs, policies, and tests needed for contract completeness.",
  },
  {
    title: "SACCO capability tracker",
    path: "C:\\Users\\egony\\Project\\tesotunes-api\\docs\\sacco-capability-tracker.md",
    summary: "Shows which SACCO surfaces are real, partial, or roadmap-only, which matters for campaign financing integration.",
  },
];

export const promotionsMockMetrics = {
  activePromoterLanes: 4,
  liveIntegrationSurfaces: promotionsIntegrations.filter((item) => item.status === "live").length,
  blockedWorkstreams: promotionsKeyFindings.filter((item) => item.status === "blocked").length,
  completedTasks: promotionsAuditTasks.filter((item) => item.status === "completed").length,
  todoTasks: promotionsAuditTasks.filter((item) => item.status === "todo").length,
  commissionSplit: {
    promoter: 82,
    platform: 18,
  },
};
