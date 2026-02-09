import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Gift, Music, Trophy, Users, Store, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface JoinPageProps {
  params: Promise<{ code: string }>;
}

interface ReferrerData {
  valid: boolean;
  referrer: {
    name: string;
    avatar: string | null;
    is_artist: boolean;
  } | null;
  bonus_credits: number;
  message?: string;
}

// Fetch referrer data from API
async function getReferrer(code: string): Promise<ReferrerData> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://beta.test/api';
    const response = await fetch(`${apiUrl}/referrals/validate/${code}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return {
        valid: false,
        referrer: null,
        bonus_credits: 0,
        message: 'Invalid referral code',
      };
    }

    const data = await response.json();
    return {
      valid: data.valid ?? true,
      referrer: data.referrer ?? null,
      bonus_credits: data.bonus_credits ?? 50,
      message: data.message,
    };
  } catch (error) {
    console.error('Error validating referral code:', error);
    // Return fallback data on error to still show the page
    return {
      valid: true,
      referrer: {
        name: 'A Friend',
        avatar: null,
        is_artist: false,
      },
      bonus_credits: 50,
    };
  }
}

export async function generateMetadata({ params }: JoinPageProps): Promise<Metadata> {
  const { code } = await params;
  const data = await getReferrer(code);
  
  return {
    title: `Join TesoTunes - Invited by ${data.referrer?.name || 'a friend'}`,
    description: 'Join Uganda\'s #1 music streaming platform. Get 50 free credits when you sign up!',
    openGraph: {
      title: `${data.referrer?.name || 'A friend'} invited you to TesoTunes!`,
      description: 'Join Uganda\'s #1 music streaming platform. Stream, discover, and support local artists.',
      images: ['/og-referral.png'],
    },
  };
}

export default async function JoinPage({ params }: JoinPageProps) {
  const { code } = await params;
  const data = await getReferrer(code);

  if (!data.valid) {
    notFound();
  }

  const features = [
    { icon: Music, title: 'Unlimited Streaming', description: 'Access thousands of Ugandan songs' },
    { icon: Users, title: 'Support Artists', description: 'Your streams directly support local musicians' },
    { icon: Trophy, title: 'Earn Rewards', description: 'Get credits for listening and engaging' },
    { icon: Calendar, title: 'Event Tickets', description: 'Get tickets to exclusive concerts' },
    { icon: Store, title: 'Artist Merch', description: 'Buy official merchandise from your favorites' },
    { icon: Gift, title: 'Exclusive Content', description: 'Access content you won\'t find anywhere else' },
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-purple-900 via-zinc-900 to-black">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 text-center">
        {/* Referrer Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
          <Gift className="w-4 h-4 text-yellow-400" />
          <span className="text-white">
            <span className="font-semibold">{data.referrer?.name || 'A friend'}</span> invited you
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          Welcome to <span className="text-purple-400">TesoTunes</span>
        </h1>
        <p className="text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
          Uganda's #1 music streaming platform. Discover, stream, and support local artists.
        </p>

        {/* Bonus Card */}
        <Card className="bg-linear-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30 max-w-md mx-auto mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center">
                <Gift className="w-8 h-8 text-black" />
              </div>
              <div className="text-left">
                <p className="text-yellow-400 font-semibold">Welcome Bonus</p>
                <p className="text-3xl font-bold text-white">{data.bonus_credits} Credits</p>
                <p className="text-sm text-gray-400">Free when you sign up!</p>
              </div>
            </div>
          </CardContent>
        </Card>

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

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 mb-16">
          <div className="text-center">
            <p className="text-3xl font-bold text-white">50K+</p>
            <p className="text-gray-400">Active Users</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white">10K+</p>
            <p className="text-gray-400">Songs</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white">500+</p>
            <p className="text-gray-400">Artists</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white">100+</p>
            <p className="text-gray-400">Events/Year</p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 pb-16">
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
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to start streaming?
          </h2>
          <p className="text-purple-200 mb-6">
            Join now and claim your {data.bonus_credits} free credits!
          </p>
          <Link href={`/register?ref=${code}`}>
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-6">
              Get Started - It's Free
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer Note */}
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-500 text-sm">
          By signing up, you agree to our Terms of Service and Privacy Policy.
          <br />
          Referral bonus credits will be added to your wallet after account verification.
        </p>
      </div>
    </div>
  );
}
