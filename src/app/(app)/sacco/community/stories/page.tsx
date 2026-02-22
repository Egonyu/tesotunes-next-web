'use client'

import { BookOpen, Heart, MessageCircle, TrendingUp, DollarSign, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSuccessStories } from '@/hooks/useSaccoAnalytics'
import { SaccoSkeleton, EmptyState } from '@/components/sacco/shared'
import type { SuccessStory } from '@/types/sacco'

function StoryCard({ story }: { story: SuccessStory }) {
  return (
    <div className="rounded-xl border p-5 space-y-4 hover:shadow-sm transition-shadow">
      {/* Artist Header */}
      <div className="flex items-center gap-3">
        {story.artist.avatar ? (
          <img src={story.artist.avatar} alt={story.artist.name} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-sm font-bold text-emerald-700">
            {story.artist.name?.charAt(0) ?? '?'}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold">{story.artist.name}</p>
          <p className="text-xs text-muted-foreground capitalize">
            {story.production.type.replace('_', ' ')} · {story.production.title}
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/10 p-2.5 text-center">
          <DollarSign className="h-3.5 w-3.5 mx-auto text-emerald-600 mb-0.5" />
          <p className="text-xs font-bold">{story.metrics.saved_amount.toLocaleString()}</p>
          <p className="text-[9px] text-muted-foreground">UGX Saved</p>
        </div>
        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/10 p-2.5 text-center">
          <Clock className="h-3.5 w-3.5 mx-auto text-blue-600 mb-0.5" />
          <p className="text-xs font-bold">{story.metrics.time_to_goal}</p>
          <p className="text-[9px] text-muted-foreground">Days</p>
        </div>
        <div className="rounded-lg bg-purple-50 dark:bg-purple-900/10 p-2.5 text-center">
          <TrendingUp className="h-3.5 w-3.5 mx-auto text-purple-600 mb-0.5" />
          <p className="text-xs font-bold">{story.metrics.roi}%</p>
          <p className="text-[9px] text-muted-foreground">ROI</p>
        </div>
      </div>

      {/* Story Content */}
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-0.5">Challenge</p>
          <p className="text-xs">{story.story.challenge_faced}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-0.5">How SACCO Helped</p>
          <p className="text-xs">{story.story.how_sacco_helped}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-0.5">Results</p>
          <p className="text-xs">{story.story.results}</p>
        </div>
        <div className="rounded-lg bg-amber-50 dark:bg-amber-900/10 p-3">
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-0.5">💡 Advice</p>
          <p className="text-xs italic">&ldquo;{story.story.advice}&rdquo;</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            {story.likes}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3 w-3" />
            {story.comments_count}
          </span>
        </div>
        <span>{new Date(story.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  )
}

export default function SuccessStoriesPage() {
  const { data, isLoading } = useSuccessStories()

  const stories: SuccessStory[] = data?.data ?? []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-blue-500" />
          Success Stories
        </h2>
        <p className="text-sm text-muted-foreground">Real stories from artists who funded their dreams through SACCO</p>
      </div>

      {isLoading ? (
        <SaccoSkeleton />
      ) : stories.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-10 w-10 text-blue-400" />}
          title="No stories yet"
          description="Be the first to share your SACCO success story!"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      )}
    </div>
  )
}
