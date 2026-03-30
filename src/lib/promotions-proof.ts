import type { PromotionPlatform, PromotionType } from "@/types/promotions";

type ProofGuide = {
  title: string;
  buyerPrompt: string;
  sellerPrompt: string;
  proofExamples: string[];
  checklist: string[];
};

const PLATFORM_GUIDES: Partial<Record<PromotionPlatform, ProofGuide>> = {
  tiktok: {
    title: "Short-form creator proof",
    buyerPrompt:
      "Ask for the post link, creator handle, posting time, and any relevant campaign hashtags or trend context.",
    sellerPrompt:
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
    buyerPrompt:
      "Expect a reel, feed, or story link plus screenshots for any story-based delivery that may expire.",
    sellerPrompt:
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
    buyerPrompt:
      "Ask for station evidence such as a spin log, studio confirmation, recorded segment, or schedule reference.",
    sellerPrompt:
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
    buyerPrompt:
      "Expect evidence of the live set context, venue, and where the track, drop, or shoutout was used.",
    sellerPrompt:
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
    buyerPrompt:
      "Ask for the published video link and timestamps showing where the artist or song is featured.",
    sellerPrompt:
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
    buyerPrompt:
      "Expect an episode link, timestamp, and enough context to verify the music mention or interview segment.",
    sellerPrompt:
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
    buyerPrompt:
      "Ask for a replay link or screenshots showing the stream, timing, and where the song or mention appeared.",
    sellerPrompt:
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
    buyerPrompt:
      "Expect the final asset link, post link if published, and any usage or reuse notes promised in the listing.",
    sellerPrompt:
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
      buyerPrompt:
        "Ask for a live link, visible evidence, and enough context to confirm the service happened as promised.",
      sellerPrompt:
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
