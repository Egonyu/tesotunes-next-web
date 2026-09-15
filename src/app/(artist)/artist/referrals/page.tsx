import { redirect } from 'next/navigation';

/**
 * Retired "Fan Referrals" page.
 *
 * It advertised a 5% commission on every purchase by referred fans, a
 * commission history, and generated promo graphics. None of it existed: every
 * /artist/referrals endpoint returned hardcoded zeros or a placeholder, and the
 * link it handed out used the artist's slug — not a referral code — so a fan
 * following it reached a 404 and nobody was credited.
 *
 * Artists are members, and the member referral programme is real: a working
 * link, live credit rates, and claimable milestones. They go there instead.
 */
export default function RetiredArtistReferralsPage() {
  redirect('/referrals');
}
