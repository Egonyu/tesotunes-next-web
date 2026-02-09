'use client';

import { use, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft,
  Heart,
  Gift,
  Check,
  Smartphone,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCampaign, useDonate, transformCampaign } from '@/hooks/useCampaigns';

interface Reward {
  id: number;
  title: string;
  minAmount: number;
  description: string;
}

const paymentMethods = [
  { id: 'mtn', name: 'MTN MoMo', icon: '🟡' },
  { id: 'airtel', name: 'Airtel Money', icon: '🔴' },
  { id: 'card', name: 'Card', icon: '💳' },
];

export default function DonatePage({ 
  params 
}: { 
  params: Promise<{ campaignId: string }> 
}) {
  const { campaignId } = use(params);
  const router = useRouter();
  const [amount, setAmount] = useState<number>(25000);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedReward, setSelectedReward] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('mtn');
  const [phone, setPhone] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState('');
  
  // API hooks
  const { data: campaignData, isLoading } = useCampaign(campaignId);
  const donateMutation = useDonate();
  
  const presetAmounts = [10000, 25000, 50000, 100000, 250000, 500000];
  
  // Transform campaign data
  const campaign = useMemo(() => {
    if (campaignData) {
      const transformed = transformCampaign(campaignData as Record<string, unknown>);
      return {
        id: transformed.id,
        title: transformed.title,
        artist: transformed.artist.name,
        cover: transformed.cover,
      };
    }
    return {
      id: parseInt(campaignId),
      title: 'Help Me Record My Debut Album',
      artist: 'Sarah Nakato',
      cover: '/images/campaigns/album.jpg',
    };
  }, [campaignData, campaignId]);
  
  const rewards: Reward[] = [
    { id: 1, title: 'Early Bird Access', minAmount: 10000, description: 'Early access + shoutout' },
    { id: 2, title: 'Digital Album + Bonus Tracks', minAmount: 25000, description: 'Full album + 3 bonus tracks' },
    { id: 3, title: 'Signed Physical CD', minAmount: 50000, description: 'Signed CD shipped to you' },
    { id: 4, title: 'Private Virtual Concert', minAmount: 200000, description: 'Exclusive virtual concert' },
    { id: 5, title: 'Featured in Album Credits', minAmount: 500000, description: 'Your name in the credits' },
  ];
  
  const eligibleRewards = rewards.filter(r => r.minAmount <= (customAmount ? parseInt(customAmount) : amount));
  
  const handleAmountSelect = (value: number) => {
    setAmount(value);
    setCustomAmount('');
    // Auto-select highest eligible reward
    const eligible = rewards.filter(r => r.minAmount <= value);
    if (eligible.length > 0) {
      setSelectedReward(eligible[eligible.length - 1].id);
    }
  };
  
  const handleCustomAmount = (value: string) => {
    setCustomAmount(value);
    const numValue = parseInt(value) || 0;
    setAmount(numValue);
    // Auto-select highest eligible reward
    const eligible = rewards.filter(r => r.minAmount <= numValue);
    if (eligible.length > 0) {
      setSelectedReward(eligible[eligible.length - 1].id);
    } else {
      setSelectedReward(null);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    donateMutation.mutate(
      {
        campaignId,
        amount: finalAmount,
        paymentMethod,
        rewardId: selectedReward || undefined,
        isAnonymous,
        message: message || undefined,
      },
      {
        onSuccess: () => {
          router.push(`/ojokotau/campaigns/${campaignId}?donated=true`);
        },
      }
    );
  };
  
  const finalAmount = customAmount ? parseInt(customAmount) : amount;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container py-8 max-w-4xl">
      {/* Back Link */}
      <Link 
        href={`/ojokotau/campaigns/${campaignId}`}
        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Campaign
      </Link>
      
      {/* Campaign Info */}
      <div className="flex items-center gap-4 p-4 rounded-xl border bg-card mb-8">
        <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden">
          <Image
            src={campaign.cover}
            alt={campaign.title}
            width={64}
            height={64}
            className="object-cover"
          />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Supporting</p>
          <h2 className="font-semibold">{campaign.title}</h2>
          <p className="text-sm text-muted-foreground">by {campaign.artist}</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Main Form */}
          <div className="lg:col-span-3 space-y-8">
            {/* Amount Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Choose Amount</h3>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleAmountSelect(preset)}
                    className={cn(
                      'py-3 rounded-lg border font-medium transition-colors',
                      amount === preset && !customAmount
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'hover:border-foreground'
                    )}
                  >
                    UGX {preset.toLocaleString()}
                  </button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">UGX</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => handleCustomAmount(e.target.value)}
                  placeholder="Enter custom amount"
                  min={5000}
                  className="w-full pl-14 pr-4 py-3 rounded-lg border bg-background"
                />
              </div>
            </div>
            
            {/* Rewards */}
            {eligibleRewards.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Select Reward</h3>
                <div className="space-y-3">
                  {eligibleRewards.map((reward) => (
                    <div
                      key={reward.id}
                      onClick={() => setSelectedReward(reward.id)}
                      className={cn(
                        'p-4 rounded-lg border cursor-pointer transition-all',
                        selectedReward === reward.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-foreground'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'h-5 w-5 rounded-full border-2 flex items-center justify-center',
                            selectedReward === reward.id
                              ? 'border-primary bg-primary'
                              : 'border-muted-foreground'
                          )}>
                            {selectedReward === reward.id && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{reward.title}</p>
                            <p className="text-sm text-muted-foreground">{reward.description}</p>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {reward.minAmount.toLocaleString()}+
                        </span>
                      </div>
                    </div>
                  ))}
                  <div
                    onClick={() => setSelectedReward(null)}
                    className={cn(
                      'p-4 rounded-lg border cursor-pointer transition-all',
                      selectedReward === null
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-foreground'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'h-5 w-5 rounded-full border-2 flex items-center justify-center',
                        selectedReward === null
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground'
                      )}>
                        {selectedReward === null && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">No reward, just donate</p>
                        <p className="text-sm text-muted-foreground">I don't want a reward</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Payment Method */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={cn(
                      'py-3 rounded-lg border font-medium transition-colors flex items-center justify-center gap-2',
                      paymentMethod === method.id
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'hover:border-foreground'
                    )}
                  >
                    <span>{method.icon}</span>
                    {method.name}
                  </button>
                ))}
              </div>
              
              {(paymentMethod === 'mtn' || paymentMethod === 'airtel') && (
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number (e.g., 0770123456)"
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-lg border bg-background"
                  />
                </div>
              )}
            </div>
            
            {/* Options */}
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="h-4 w-4 rounded border-muted-foreground accent-primary"
                />
                <span>Make my donation anonymous</span>
              </label>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Leave a message (optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Say something nice to the artist..."
                  rows={3}
                  maxLength={280}
                  className="w-full px-4 py-3 rounded-lg border bg-background resize-none"
                />
              </div>
            </div>
          </div>
          
          {/* Summary Sidebar */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 p-6 rounded-xl border bg-card">
              <h3 className="font-semibold mb-4">Donation Summary</h3>
              
              <div className="space-y-3 pb-4 border-b">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Donation amount</span>
                  <span className="font-medium">UGX {finalAmount.toLocaleString()}</span>
                </div>
                {selectedReward && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reward</span>
                    <span className="font-medium text-right text-sm">
                      {rewards.find(r => r.id === selectedReward)?.title}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between py-4 text-lg font-bold">
                <span>Total</span>
                <span>UGX {finalAmount.toLocaleString()}</span>
              </div>
              
              <button
                type="submit"
                disabled={donateMutation.isPending || finalAmount < 5000}
                className={cn(
                  'w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2',
                  donateMutation.isPending || finalAmount < 5000
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                )}
              >
                <Heart className="h-5 w-5" />
                {donateMutation.isPending ? 'Processing...' : 'Complete Donation'}
              </button>
              
              <p className="text-xs text-center text-muted-foreground mt-4">
                By donating, you agree to our terms of service. 
                All donations are final and non-refundable.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
