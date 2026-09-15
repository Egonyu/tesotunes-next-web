import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Gift, Music, Trophy, Users, Store, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { serverFetch } from '@/lib/api';

interface JoinPageProps {
  params: Promise<{ code: string }>;
}

/**
 * Mirrors GET /api/referrals/validate/{code}.
 *
 * This page used to read `referrer` and `bonus_credits`, fields the API never
 * sent, so it always fell back to a hardcoded "50 credits" — and on any error
 * it showed an invitation from "A Friend" for a code nobody owned.
 */
interface ReferrerData {
  valid: boolean;
  referrer_name: string | null;
  joiner_credits: number;
}

interface PublicStats {
  songs: number;
  artists: number;
  members: number;
}

async function getReferrer(code: string): Promise<ReferrerData | null> {
  try {
    const res = await serverFetch<{ data: ReferrerData }>(`/referrals/validate/${encodeURIComponent(code)}`);
    return res.data;
  } catch {
    // Unknown, not valid: never invent a referrer or a bonus.
    return null;
  }
}

async function getPublicStats(): Promise<PublicStats | null> {
  try {
    const res = await serverFetch<{ data: PublicStats | null }>('/public/stats');
    return res.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: JoinPageProps): Promise<Metadata> {
  const { code } = await params;
  const data = await getReferrer(code);
  const inviter = data?.referrer_name || 'A friend';
  const bonus = data?.joiner_credits ?? 0;

  return {
    title: `Join TesoTunes - Invited by ${inviter}`,
    description: bonus > 0
      ? `Stream and support Ugandan music on TesoTunes. Get ${bonus} free credits when you sign up.`
      : 'Stream and support Ugandan music on TesoTunes.',
    openGraph: {
      title: `${inviter} invited you to TesoTunes!`,
      description: 'Stream, discover, and support local artists.',
      images: ['/og-referral.png'],
    },
  };
}

export default async function JoinPage({ params }: JoinPageProps) {
  const { code } = await params;
  const [data, stats] = await Promise.all([getReferrer(code), getPublicStats()]);

  if (!data?.valid) {
    notFound();
  }

  const bonusCredits = data.joiner_credits;

  // Only features the platform has. "Exclusive content you won't find
  // anywhere else" and "thousands of songs" were claims, not features.
  const features = [
    { icon: Music, title: 'Stream Ugandan Music', description: 'Listen to local artists, new and established' },
    { icon: Users, title: 'Support Artists', description: 'Your streams directly support local musicians' },
    { icon: Trophy, title: 'Earn Rewards', description: 'Get credits for listening and engaging' },
    { icon: Calendar, title: 'Event Tickets', description: 'Buy tickets to concerts and shows' },
    { icon: Store, title: 'Artist Merch', description: 'Buy merchandise from artists\' stores' },
  ];

  const statItems = stats
    ? [
        { value: stats.songs, label: 'Songs' },
        { value: stats.artists, label: 'Artists' },
        { value: stats.members, label: 'Members' },
      ].filter((item) => item.value > 0)
    : [];

  return (
    <div className="min-h-screen bg-linear-to-b from-purple-900 via-zinc-900 to-black">
      {/* Hero Section */}
      <div className="container mx-auto py-12 text-center">
        {/* Referrer Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
          <Gift className="w-4 h-4 text-yellow-400" />
          <span className="text-white">
            <span className="font-semibold">{data.referrer_name || 'A friend'}</span> invited you
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          Welcome to <span className="text-purple-400">TesoTunes</span>
        </h1>
        <p className="text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
          Discover, stream, and support local artists.
        </p>

        {/* Bonus Card — only when a live welcome rate is configured */}
        {bonusCredits > 0 && (
          <Card className="bg-linear-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30 max-w-md mx-auto mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Gift className="w-8 h-8 text-black" />
                </div>
                <div className="text-left">
                  <p className="text-yellow-400 font-semibold">Welcome Bonus</p>
                  <p className="text-3xl font-bold text-white">{bonusCredits.toLocaleString()} Credits</p>
                  <p className="text-sm text-gray-400">Added when you sign up with this link</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href={`/register?ref=${code}`}>
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-6">
              <Users className="w-5 h-5 mr-2" />
              Create Free Account
            </Button>
          </Link>
          <Link href={`/login?ref=${code}`}>
            <Button size="lg" variant="outline" className="border-white/30 text-white text-lg px-8 py-6">
              Already have an account? Sign In
            </Button>
          </Link>
        </div>

        {/* Stats — real counts from /public/stats; hidden if unavailable.
            These were "50K+ users, 10K+ songs, 500+ artists, 100+ events". */}
        {statItems.length > 0 && (
          <div className="flex flex-wrap justify-center gap-8 mb-16">
            {statItems.map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-3xl font-bold text-white">{item.value.toLocaleString()}</p>
                <p className="text-gray-400">{item.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Features Grid */}
      <div className="container mx-auto pb-16">
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          Everything you need to enjoy Ugandan music
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="bg-zinc-900/50 border-zinc-800 hover:border-purple-500/50 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-purple-600 py-12">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to start streaming?
          </h2>
          <p className="text-purple-200 mb-6">
            {bonusCredits > 0
              ? `Join now and get your ${bonusCredits.toLocaleString()} free credits.`
              : 'Join now — it only takes a minute.'}
          </p>
          <Link href={`/register?ref=${code}`}>
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-6">
              Get Started - It's Free
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer Note */}
      <div className="container mx-auto py-8 text-center">
        <p className="text-gray-500 text-sm">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
