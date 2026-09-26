import { getReferralOfferCopy } from '@/lib/referral-copy';

describe('getReferralOfferCopy', () => {
  it('states both live rewards consistently', () => {
    const copy = getReferralOfferCopy(500, 200);

    expect(copy.summary).toBe(
      'You earn 500 credits for each signup, and your friend starts with 200 welcome credits.',
    );
    expect(copy.joinerStep).toContain('200 welcome credits');
    expect(copy.referrerStep).toContain('500 credits');
  });

  it('does not promise a welcome bonus when only the referrer reward is live', () => {
    const copy = getReferralOfferCopy(500, 0);

    expect(copy.summary).toContain('500 credits');
    expect(copy.joinerStep).not.toContain('0');
    expect(copy.joinerStep).toBe('They create their TesoTunes account');
  });

  it('does not promise referrer credits when only the welcome reward is live', () => {
    const copy = getReferralOfferCopy(0, 200);

    expect(copy.summary).toContain('200 welcome credits');
    expect(copy.referrerStep).toContain('milestone');
    expect(copy.referrerStep).not.toContain('0');
  });

  it('uses milestone language when no per-signup credits are live', () => {
    const copy = getReferralOfferCopy(0, 0);

    expect(copy.summary).toBe(
      'Invite friends to TesoTunes and unlock milestone rewards as they join.',
    );
    expect(copy.joinerStep).not.toContain('0');
    expect(copy.referrerStep).toContain('milestone');
  });
});
