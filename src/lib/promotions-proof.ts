import type { PromotionPlatform, PromotionType } from "@/types/promotions";

type ProofGuide = {
  title: string;
  promoterPrompt: string;
  buyerPrompt: string;
  proofExamples: string[];
  checklist: string[];
};

const PLATFORM_GUIDES: Partial<Record<PromotionPlatform, ProofGuide>> = {
  tiktok: {
    title: "Short-form creator proof",
    promoterPrompt:
      "Share the post link, the account handle, when it went live, and any campaign hashtags or sound you used.",
    buyerPrompt:
      "Verify the live post, confirm the account and caption match the order, and check that the content stayed up as promised.",
    proofExamples: [
      "Live TikTok URL to the posted content",
      "Screenshot of account handle, views, and caption",
      "Campaign hashtag or sound usage confirmation",
    ],
    checklist: [
      "Handle and post belong to the promised creator account",
      "Caption, song, or trend context matches the listing scope",
      "Evidence clearly shows the content went live",
    ],
  },
  instagram: {
    title: "Instagram placement proof",
    promoterPrompt:
      "Share the reel or feed link. For stories, add screenshots before they expire.",
    buyerPrompt:
      "Confirm the placement type, posting window, and whether story content was captured before expiry.",
    proofExamples: [
      "Public reel or feed post URL",
      "Story screenshots with timestamp and account handle",
      "Reach or insights screenshot when promised",
    ],
    checklist: [
      "Delivery format matches the listing",
      "Account handle and posting context are visible",
      "Any expiring story content is documented with screenshots",
    ],
  },
  radio: {
    title: "Radio airplay proof",
    promoterPrompt:
      "Share station evidence: a spin log, a recorded clip, or a presenter confirmation with the airtime.",
    buyerPrompt:
      "Verify station identity, time band, and that the proof shows the track or mention actually aired.",
    proofExamples: [
      "Recorded clip of the spin or mention",
      "Station playlist or spin log screenshot",
      "Presenter or station confirmation with airtime reference",
    ],
    checklist: [
      "Station or show identity is visible",
      "Airtime or time band is documented",
      "Proof clearly ties the song or mention to the order",
    ],
  },
  club: {
    title: "DJ and venue proof",
    promoterPrompt:
      "Show the venue or event, and where the track, drop or shoutout was used.",
    buyerPrompt:
      "Check that the venue or event context is clear and that the proof shows the promised play, shoutout, or slot.",
    proofExamples: [
      "Video clip from the set or venue",
      "Set list, cue sheet, or event flyer reference",
      "DJ confirmation with timing notes",
    ],
    checklist: [
      "Venue, event, or set context is visible",
      "Track play or shoutout is clearly identifiable",
      "Timing and performance context align with the offer",
    ],
  },
  youtube: {
    title: "Long-form video proof",
    promoterPrompt:
      "Share the published video link and the timestamps where the artist or song is featured.",
    buyerPrompt:
      "Verify the published video, timestamped segment, and that the feature matches the purchased placement.",
    proofExamples: [
      "Video URL and publish time",
      "Timestamp note for the feature",
      "Screenshot of title, channel, and visible mention",
    ],
    checklist: [
      "Published content is accessible",
      "Feature timestamp is provided",
      "Channel and video match the promised creator",
    ],
  },
  podcast: {
    title: "Podcast feature proof",
    promoterPrompt:
      "Share the episode link and the timestamp of the mention or interview.",
    buyerPrompt:
      "Confirm the episode, timestamp, and that the mention or feature matches the commercial promise.",
    proofExamples: [
      "Episode link or stream URL",
      "Timestamp for the feature segment",
      "Episode artwork or description screenshot",
    ],
    checklist: [
      "Episode identity is visible",
      "Timestamp or segment reference is included",
      "Feature content aligns with the purchased service",
    ],
  },
};

const TYPE_FALLBACKS: Partial<Record<PromotionType, ProofGuide>> = {
  radio_mention: PLATFORM_GUIDES.radio,
  dj_shoutout: PLATFORM_GUIDES.club,
  live_stream_promotion: {
    title: "Live stream proof",
    promoterPrompt:
      "Share a replay link or screenshots showing the stream, its time, and where the song or mention appeared.",
    buyerPrompt:
      "Confirm the live session happened, the feature point is visible, and the replay or screenshots are sufficient for verification.",
    proofExamples: [
      "Replay link or VOD reference",
      "Screenshots showing stream title and timestamp",
      "Chat or highlight reference if relevant",
    ],
    checklist: [
      "Stream identity and timing are visible",
      "Feature happened within the promised session",
      "Evidence is accessible after the live moment",
    ],
  },
  content_creation: {
    title: "Created-content proof",
    promoterPrompt:
      "Share the final asset link, the post link if you published it, and any usage notes from your listing.",
    buyerPrompt:
      "Verify the delivered asset matches the agreed content format and includes any publishing evidence if required.",
    proofExamples: [
      "Delivered asset link",
      "Published post URL if applicable",
      "Screenshot or export proving final delivery",
    ],
    checklist: [
      "Asset format matches the offer",
      "Publishing evidence exists when promised",
      "Final output is accessible for buyer review",
    ],
  },
};

export function getPromotionProofGuide(
  platform: PromotionPlatform,
  type: PromotionType
): ProofGuide {
  return (
    PLATFORM_GUIDES[platform] ??
    TYPE_FALLBACKS[type] ?? {
      title: "Promotion proof expectations",
      promoterPrompt:
        "Share a live link and enough context for the buyer to confirm the service happened as promised.",
      buyerPrompt:
        "Verify that the proof clearly ties the delivered promotion to the purchased listing and timing.",
      proofExamples: [
        "Public link to the delivered placement",
        "Screenshots showing timing, account, or channel context",
        "Any supporting notes needed to confirm delivery",
      ],
      checklist: [
        "Proof is accessible",
        "Timing and context match the order",
        "Evidence supports the exact service promised",
      ],
    }
  );
}

/**
 * The escrow auto-release window as words ("7 days", "36 hours"), from the
 * API's escrow_release_hours. Returns null when the API didn't send it, so
 * callers hide the sentence rather than invent a number.
 */
export function describeReleaseWindow(hours: number | null | undefined): string | null {
  if (!hours || hours <= 0) return null;
  if (hours % 24 === 0) {
    const days = hours / 24;
    return `${days} day${days === 1 ? "" : "s"}`;
  }
  return `${hours} hours`;
}
