export interface ReferralOfferCopy {
  summary: string;
  joinerStep: string;
  referrerStep: string;
}

export function getReferralOfferCopy(
  referrerCredits: number,
  joinerCredits: number,
): ReferralOfferCopy {
  const formattedReferrerCredits = referrerCredits.toLocaleString();
  const formattedJoinerCredits = joinerCredits.toLocaleString();

  if (referrerCredits > 0 && joinerCredits > 0) {
    return {
      summary: `You earn ${formattedReferrerCredits} credits for each signup, and your friend starts with ${formattedJoinerCredits} welcome credits.`,
      joinerStep: `They start with ${formattedJoinerCredits} welcome credits`,
      referrerStep: `You earn ${formattedReferrerCredits} credits for their signup`,
    };
  }

  if (referrerCredits > 0) {
    return {
      summary: `You earn ${formattedReferrerCredits} credits for each friend who signs up with your link.`,
      joinerStep: 'They create their TesoTunes account',
      referrerStep: `You earn ${formattedReferrerCredits} credits for their signup`,
    };
  }

  if (joinerCredits > 0) {
    return {
      summary: `Your friend starts with ${formattedJoinerCredits} welcome credits, and each signup moves you closer to milestone rewards.`,
      joinerStep: `They start with ${formattedJoinerCredits} welcome credits`,
      referrerStep: 'Their signup moves you closer to your next milestone',
    };
  }

  return {
    summary: 'Invite friends to TesoTunes and unlock milestone rewards as they join.',
    joinerStep: 'They create their TesoTunes account',
    referrerStep: 'Their signup moves you closer to your next milestone',
  };
}
