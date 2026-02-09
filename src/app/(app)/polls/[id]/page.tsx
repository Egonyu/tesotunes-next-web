'use client';

import { use, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ChevronLeft,
  Clock,
  Users,
  Share2,
  Flag,
  CheckCircle,
  MessageCircle,
  BarChart3,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePoll, useVotePoll, transformPoll } from '@/hooks/usePolls';

interface PollOption {
  id: number;
  text: string;
  votes: number;
  percentage: number;
}

interface Poll {
  id: number;
  question: string;
  description: string;
  options: PollOption[];
  totalVotes: number;
  category: string;
  creator: {
    id: number;
    name: string;
    avatar: string;
    isVerified: boolean;
  };
  createdAt: string;
  endsAt: string;
  hasVoted: boolean;
  votedOptionId?: number;
  status: 'active' | 'ended';
  comments: number;
}

export default function PollDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  // API hooks
  const { data: pollData, isLoading } = usePoll(id);
  const voteMutation = useVotePoll();
  
  // Mock data for fallback
  const mockPoll: Poll = {
    id: parseInt(id),
    question: 'Best Ugandan song of 2025?',
    description: 'Cast your vote for the most impactful Ugandan song released in 2025. This poll will help determine the TesoTunes Song of the Year award winner.',
    options: [
      { id: 1, text: 'Sitya Loss - Eddy Kenzo', votes: 2456, percentage: 35 },
      { id: 2, text: 'Gyenvude - Sheebah Karungi', votes: 1890, percentage: 27 },
      { id: 3, text: 'Tokigeza - Fik Fameica', votes: 1567, percentage: 22 },
      { id: 4, text: 'Mulembe - Gravity Omutujju', votes: 1123, percentage: 16 },
    ],
    totalVotes: 7036,
    category: 'Music',
    creator: { id: 1, name: 'TesoTunes', avatar: '/images/logo.png', isVerified: true },
    createdAt: '2026-01-15',
    endsAt: '2026-02-15',
    hasVoted: false,
    status: 'active',
    comments: 234,
  };
  
  // Transform API data
  const poll: Poll = useMemo(() => {
    if (pollData) {
      const transformed = transformPoll(pollData as Record<string, unknown>);
      return {
        ...transformed,
        creator: { ...transformed.creator, id: 1 },
        comments: (pollData as Record<string, unknown>).comments_count as number || 0,
      } as Poll;
    }
    return mockPoll;
  }, [pollData]);
  
  const getRemainingTime = () => {
    const end = new Date(poll.endsAt);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Poll has ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days} days, ${hours} hours remaining`;
    if (hours > 0) return `${hours} hours, ${minutes} minutes remaining`;
    return `${minutes} minutes remaining`;
  };
  
  const handleVote = () => {
    if (!selectedOption || poll.hasVoted) return;
    
    voteMutation.mutate({ pollId: id, optionId: selectedOption });
  };
  
  const showResults = poll.hasVoted || poll.status === 'ended' || voteMutation.isSuccess;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container py-8 max-w-3xl">
      {/* Back Link */}
      <Link 
        href="/polls"
        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Polls
      </Link>
      
      {/* Poll Card */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted overflow-hidden">
                <Image
                  src={poll.creator.avatar}
                  alt={poll.creator.name}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{poll.creator.name}</span>
                  {poll.creator.isVerified && (
                    <CheckCircle className="h-4 w-4 text-primary fill-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Created {new Date(poll.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded">
              {poll.category}
            </span>
          </div>
          
          <h1 className="text-2xl font-bold mb-2">{poll.question}</h1>
          <p className="text-muted-foreground">{poll.description}</p>
          
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {getRemainingTime()}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {poll.totalVotes.toLocaleString()} votes
            </span>
          </div>
        </div>
        
        {/* Options */}
        <div className="p-6">
          <div className="space-y-3">
            {poll.options.map((option) => {
              const isSelected = selectedOption === option.id || poll.votedOptionId === option.id;
              
              return (
                <button
                  key={option.id}
                  onClick={() => !showResults && setSelectedOption(option.id)}
                  disabled={showResults}
                  className={cn(
                    'w-full relative rounded-lg border transition-all text-left',
                    showResults
                      ? 'cursor-default'
                      : 'cursor-pointer hover:border-primary',
                    isSelected && !showResults && 'border-primary ring-2 ring-primary/20'
                  )}
                >
                  {showResults && (
                    <div 
                      className={cn(
                        'absolute inset-0 rounded-lg transition-all',
                        isSelected ? 'bg-primary/20' : 'bg-muted'
                      )}
                      style={{ width: `${option.percentage}%` }}
                    />
                  )}
                  <div className="relative flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      {!showResults && (
                        <div className={cn(
                          'h-5 w-5 rounded-full border-2 transition-colors',
                          isSelected
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground'
                        )}>
                          {isSelected && (
                            <div className="h-full w-full flex items-center justify-center">
                              <div className="h-2 w-2 rounded-full bg-white" />
                            </div>
                          )}
                        </div>
                      )}
                      <span className="font-medium">{option.text}</span>
                      {showResults && isSelected && (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    {showResults && (
                      <div className="text-right">
                        <span className="font-semibold">{option.percentage}%</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({option.votes.toLocaleString()})
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          
          {/* Vote Button */}
          {!showResults && poll.status === 'active' && (
            <button
              onClick={handleVote}
              disabled={!selectedOption || voteMutation.isPending}
              className={cn(
                'w-full mt-6 py-3 rounded-lg font-medium transition-colors',
                selectedOption && !voteMutation.isPending
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
            >
              {voteMutation.isPending ? 'Submitting Vote...' : 'Submit Vote'}
            </button>
          )}
          
          {showResults && (
            <div className="mt-6 p-4 rounded-lg bg-muted/50 text-center">
              <BarChart3 className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {poll.hasVoted || voteMutation.isSuccess
                  ? 'Thank you for voting!'
                  : 'This poll has ended'
                }
              </p>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-between p-4 border-t bg-muted/30">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <MessageCircle className="h-4 w-4" />
              {poll.comments} comments
            </button>
            <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>
          <button className="text-sm text-muted-foreground hover:text-foreground">
            <Flag className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
