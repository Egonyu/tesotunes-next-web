'use client';

import { use, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  Clock,
  Users,
  Share2,
  CheckCircle,
  BarChart3,
  Music,
  Mic2,
  Coins,
  Loader2,
  Trophy,
  ClipboardList,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import {
  usePoll,
  useVotePoll,
  useSubmitSurvey,
  transformPoll,
  type Poll,
  type PollOption,
  type PollQuestionData,
  type PollType,
} from '@/hooks/usePolls';

const TYPE_LABEL: Record<PollType, { label: string; icon: React.ElementType; className: string }> = {
  general:         { label: 'Poll',            icon: BarChart3,    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  song_battle:     { label: 'Song Battle',     icon: Music,        className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  artist_contest:  { label: 'Artist Contest',  icon: Mic2,         className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  research_survey: { label: 'Research Survey', icon: ClipboardList, className: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
};

export default function PollDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [localVote, setLocalVote] = useState<{ optionId: number; creditsEarned: number } | null>(null);

  const { data: pollData, isLoading, error } = usePoll(id);
  const voteMutation = useVotePoll();

  const poll: Poll | null = useMemo(() => {
    if (pollData) return transformPoll(pollData as Record<string, unknown>);
    return null;
  }, [pollData]);

  // Optimistically merge the local vote into the displayed poll
  const displayPoll: Poll | null = useMemo(() => {
    if (!poll || !localVote) return poll;

    const updatedOptions = poll.options.map((opt) => ({
      ...opt,
      votes: opt.id === localVote.optionId ? opt.votes + 1 : opt.votes,
    }));
    const newTotal = updatedOptions.reduce((sum, o) => sum + o.votes, 0);

    return {
      ...poll,
      options: updatedOptions.map((opt) => ({
        ...opt,
        percentage: newTotal > 0 ? Math.round((opt.votes / newTotal) * 100) : 0,
      })),
      totalVotes: newTotal,
      hasVoted: true,
      votedOptionId: localVote.optionId,
    };
  }, [poll, localVote]);

  const getRemainingTime = () => {
    if (!displayPoll?.endsAt) return '';
    const diff = new Date(displayPoll.endsAt).getTime() - Date.now();
    if (diff <= 0) return 'Poll has closed';
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes} minutes remaining`;
  };

  const handleVote = () => {
    if (!poll || !selectedOption || !poll.questionId || poll.hasVoted || localVote) return;

    voteMutation.mutate(
      { pollId: id, questionId: poll.questionId, optionId: selectedOption },
      {
        onSuccess: (data) => {
          const creditsEarned = (data as { credits_earned?: number })?.credits_earned ?? 0;
          setLocalVote({ optionId: selectedOption, creditsEarned });
        },
      }
    );
  };

  const showResults =
    !!localVote ||
    displayPoll?.hasVoted ||
    displayPoll?.status === 'closed' ||
    displayPoll?.showResultsBeforeCompletion;

  const typeMeta = displayPoll ? (TYPE_LABEL[displayPoll.poll_type] ?? TYPE_LABEL.general) : null;
  const winnerPercentage =
    showResults && displayPoll && displayPoll.options.length > 0
      ? Math.max(...displayPoll.options.map((o) => o.percentage))
      : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !displayPoll) {
    return (
      <div className="container py-8 max-w-3xl">
        <Link href="/polls" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6">
          <ChevronLeft className="h-4 w-4" />
          Back to Polls
        </Link>
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Poll not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-3xl">
      <Link href="/polls" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft className="h-4 w-4" />
        Back to Polls
      </Link>

      <div className="rounded-xl border bg-card overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted overflow-hidden flex items-center justify-center">
                <Image
                  src={displayPoll.creator.avatar}
                  alt={displayPoll.creator.name}
                  width={40}
                  height={40}
                  className="object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{displayPoll.creator.name}</span>
                  {displayPoll.creator.isVerified && (
                    <CheckCircle className="h-4 w-4 text-primary fill-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(displayPoll.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {typeMeta && (
              <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0', typeMeta.className)}>
                <typeMeta.icon className="h-3 w-3" />
                {typeMeta.label}
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold mb-2">{displayPoll.question}</h1>
          {displayPoll.description && (
            <p className="text-muted-foreground text-sm">{displayPoll.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {getRemainingTime()}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {displayPoll.totalVotes.toLocaleString()} responses
            </span>
            {!displayPoll.hasVoted && !localVote && displayPoll.credits_reward > 0 && (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                <Coins className="h-4 w-4" />
                Earn +{displayPoll.credits_reward} credits
              </span>
            )}
            {displayPoll.category_label && (
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                {displayPoll.category_label}
              </span>
            )}
          </div>
        </div>

        {/* Body — community polls vs research surveys */}
        {displayPoll.isMultiQuestion ? (
          <ResearchSurveyPanel poll={displayPoll} />
        ) : (
          <CommunityPollPanel
            poll={displayPoll}
            selectedOption={selectedOption}
            localVote={localVote}
            showResults={!!showResults}
            winnerPercentage={winnerPercentage}
            isPending={voteMutation.isPending}
            onSelect={setSelectedOption}
            onVote={handleVote}
          />
        )}

        {/* Actions */}
        <div className="flex items-center justify-between p-4 border-t bg-muted/30">
          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Community Poll (single-question choice) ────────────────────────────────

function CommunityPollPanel({
  poll,
  selectedOption,
  localVote,
  showResults,
  winnerPercentage,
  isPending,
  onSelect,
  onVote,
}: {
  poll: Poll;
  selectedOption: number | null;
  localVote: { optionId: number; creditsEarned: number } | null;
  showResults: boolean;
  winnerPercentage: number;
  isPending: boolean;
  onSelect: (id: number) => void;
  onVote: () => void;
}) {
  const questionLabel = poll.questionText && poll.questionText !== poll.question
    ? poll.questionText
    : null;

  return (
    <div className="p-6">
      {questionLabel && (
        <p className="text-sm text-muted-foreground mb-4 font-medium">{questionLabel}</p>
      )}

      <div className="space-y-3">
        {poll.options.map((option) => {
          const isSelected = selectedOption === option.id || poll.votedOptionId === option.id;
          const isWinner = showResults && option.percentage === winnerPercentage && winnerPercentage > 0;

          return (
            <OptionButton
              key={option.id}
              option={option}
              isSelected={isSelected}
              isWinner={isWinner}
              showResults={showResults}
              pollType={poll.poll_type}
              onClick={() => !showResults && onSelect(option.id)}
            />
          );
        })}

        {poll.options.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No options available.</p>
        )}
      </div>

      {/* Vote button */}
      {!showResults && poll.status === 'active' && (
        <button
          onClick={onVote}
          disabled={!selectedOption || isPending || !poll.questionId}
          className={cn(
            'w-full mt-6 py-3 rounded-lg font-medium transition-colors',
            selectedOption && !isPending
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          )}
        >
          {isPending ? 'Submitting…' : `Vote${selectedOption ? '' : ' — select an option'}`}
        </button>
      )}

      {/* Post-vote confirmation */}
      {showResults && (
        <div className="mt-6 p-4 rounded-lg bg-muted/50 text-center">
          <CheckCircle className="h-6 w-6 mx-auto mb-2 text-primary" />
          <p className="text-sm font-medium">
            {localVote
              ? 'Thank you for voting!'
              : poll.hasVoted
              ? 'You already voted'
              : 'This poll has closed'}
          </p>
          {localVote && localVote.creditsEarned > 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-semibold">
              +{localVote.creditsEarned} credits earned!
            </p>
          )}
          {localVote && localVote.creditsEarned === 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Daily credit limit reached — vote still counted!
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {poll.totalVotes.toLocaleString()} total responses
          </p>
        </div>
      )}
    </div>
  );
}

// ── Research Survey — multi-question form ────────────────────────────────

type SurveyAnswers = Record<number, {
  selectedOptionIds: number[];
  ratingValue?: number;
  answerText?: string;
}>;

function ResearchSurveyPanel({ poll }: { poll: Poll }) {
  const { data: session } = useSession();
  const submitMutation = useSubmitSurvey();
  const [answers, setAnswers] = useState<SurveyAnswers>({});
  const [submitted, setSubmitted] = useState(poll.hasVoted);
  const [creditsEarned, setCreditsEarned] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isAnswered = (q: PollQuestionData): boolean => {
    const ans = answers[q.id];
    if (!ans) return false;
    switch (q.question_type) {
      case 'multiple_choice':
      case 'ranking': return ans.selectedOptionIds.length > 0;
      case 'rating':
      case 'likert': return ans.ratingValue !== undefined;
      case 'free_text': return (ans.answerText ?? '').trim().length > 0;
      default: return false;
    }
  };

  const unansweredRequired = poll.questions.filter(q => q.is_required && !isAnswered(q));
  const canSubmit = unansweredRequired.length === 0 && poll.status === 'active' && !submitMutation.isPending;

  const handleSubmit = () => {
    if (!canSubmit) {
      setValidationError(`Please answer all required questions (${unansweredRequired.length} remaining).`);
      return;
    }
    setValidationError(null);

    const answersPayload = poll.questions
      .filter(q => isAnswered(q))
      .map(q => {
        const ans = answers[q.id];
        switch (q.question_type) {
          case 'multiple_choice':
          case 'ranking': return { question_id: q.id, option_ids: ans.selectedOptionIds };
          case 'rating':
          case 'likert': return { question_id: q.id, rating_value: ans.ratingValue };
          case 'free_text': return { question_id: q.id, answer_text: ans.answerText };
          default: return { question_id: q.id };
        }
      });

    submitMutation.mutate(
      { pollId: String(poll.id), answers: answersPayload },
      {
        onSuccess: (data) => {
          const earned = (data as { credits_earned?: number })?.credits_earned ?? 0;
          setCreditsEarned(earned);
          setSubmitted(true);
        },
        onError: () => setValidationError('Something went wrong. Please try again.'),
      }
    );
  };

  const updateAnswer = (questionId: number, update: Partial<SurveyAnswers[number]>) => {
    setAnswers(prev => {
      const existing = prev[questionId] ?? { selectedOptionIds: [] };
      return { ...prev, [questionId]: { ...existing, ...update } };
    });
  };

  if (submitted) {
    return (
      <div className="p-10 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Survey submitted!</h3>
        {creditsEarned !== null && creditsEarned > 0 ? (
          <p className="text-amber-600 dark:text-amber-400 font-semibold text-sm mt-2">
            +{creditsEarned} credits earned
          </p>
        ) : creditsEarned === 0 && !poll.hasVoted ? (
          <p className="text-xs text-muted-foreground mt-2">Daily limit reached — response still counted.</p>
        ) : null}
        <p className="text-sm text-muted-foreground mt-3">
          {poll.totalVotes.toLocaleString()} total responses collected.
        </p>
      </div>
    );
  }

  if (!session && !poll.allowGuestResponses) {
    return (
      <div className="p-10 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-muted mb-4">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold mb-1">Sign in to participate</h3>
        <p className="text-sm text-muted-foreground">This survey is for registered users only.</p>
      </div>
    );
  }

  return (
    <div className="p-6 divide-y">
      {poll.questions.map((q, index) => (
        <div key={q.id} className="py-6 first:pt-0 last:pb-0">
          <div className="flex items-start gap-2 mb-4">
            <span className="shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-muted text-xs font-bold text-muted-foreground">
              {index + 1}
            </span>
            <div>
              <p className="font-medium leading-snug">{q.question_text}</p>
              {!q.is_required && (
                <span className="text-xs text-muted-foreground">(optional)</span>
              )}
            </div>
          </div>
          <SurveyQuestion
            question={q}
            answer={answers[q.id] ?? { selectedOptionIds: [] }}
            onChange={(update) => updateAnswer(q.id, update)}
            disabled={poll.status !== 'active'}
          />
        </div>
      ))}

      {poll.status === 'active' && (
        <div className="pt-6">
          {validationError && (
            <div className="flex items-center gap-2 text-sm text-destructive mb-3">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {validationError}
            </div>
          )}
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              {unansweredRequired.length > 0
                ? `${unansweredRequired.length} required question${unansweredRequired.length > 1 ? 's' : ''} remaining`
                : 'All required questions answered'}
            </p>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={cn(
                'flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-colors',
                canSubmit
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
            >
              {submitMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Submitting…</>
              ) : (
                <><ClipboardList className="h-4 w-4" />Submit Survey</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SurveyQuestion({
  question,
  answer,
  onChange,
  disabled,
}: {
  question: PollQuestionData;
  answer: SurveyAnswers[number];
  onChange: (update: Partial<SurveyAnswers[number]>) => void;
  disabled: boolean;
}) {
  switch (question.question_type) {
    case 'multiple_choice':
    case 'ranking':
      return <ChoiceQuestion question={question} answer={answer} onChange={onChange} disabled={disabled} />;
    case 'rating':
    case 'likert':
      return <ScaleQuestion question={question} answer={answer} onChange={onChange} disabled={disabled} />;
    case 'free_text':
      return <FreeTextQuestion question={question} answer={answer} onChange={onChange} disabled={disabled} />;
    default:
      return null;
  }
}

function ChoiceQuestion({
  question, answer, onChange, disabled,
}: {
  question: PollQuestionData;
  answer: SurveyAnswers[number];
  onChange: (u: Partial<SurveyAnswers[number]>) => void;
  disabled: boolean;
}) {
  const toggle = (optionId: number) => {
    if (question.allow_multiple) {
      const already = answer.selectedOptionIds.includes(optionId);
      onChange({
        selectedOptionIds: already
          ? answer.selectedOptionIds.filter(id => id !== optionId)
          : [...answer.selectedOptionIds, optionId],
      });
    } else {
      onChange({ selectedOptionIds: [optionId] });
    }
  };

  return (
    <div className="space-y-2 ml-8">
      {question.allow_multiple && (
        <p className="text-xs text-muted-foreground -mt-2 mb-1">Select all that apply</p>
      )}
      {question.options.map(opt => {
        const selected = answer.selectedOptionIds.includes(opt.id);
        return (
          <button
            key={opt.id}
            type="button"
            disabled={disabled}
            onClick={() => toggle(opt.id)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm text-left transition-all',
              selected ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-border hover:border-primary/50',
              disabled && 'cursor-default opacity-70'
            )}
          >
            <div className={cn(
              'shrink-0 flex items-center justify-center border-2 transition-colors',
              question.allow_multiple ? 'h-4 w-4 rounded' : 'h-4 w-4 rounded-full',
              selected ? 'border-primary bg-primary' : 'border-muted-foreground'
            )}>
              {selected && <div className={cn('bg-white', question.allow_multiple ? 'h-2 w-2 rounded-sm' : 'h-1.5 w-1.5 rounded-full')} />}
            </div>
            {opt.text}
          </button>
        );
      })}
    </div>
  );
}

function ScaleQuestion({
  question, answer, onChange, disabled,
}: {
  question: PollQuestionData;
  answer: SurveyAnswers[number];
  onChange: (u: Partial<SurveyAnswers[number]>) => void;
  disabled: boolean;
}) {
  const min = question.settings?.scale_min ?? 1;
  const max = question.settings?.scale_max ?? (question.question_type === 'likert' ? 5 : 10);
  const minLabel = question.settings?.min_label ?? null;
  const maxLabel = question.settings?.max_label ?? null;
  const steps = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div className="ml-8">
      <div className="flex gap-2 flex-wrap">
        {steps.map(val => (
          <button
            key={val}
            type="button"
            disabled={disabled}
            onClick={() => onChange({ ratingValue: val })}
            className={cn(
              'h-10 w-10 rounded-lg border-2 text-sm font-semibold transition-all',
              answer.ratingValue === val
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border hover:border-primary/60',
              disabled && 'cursor-default opacity-70'
            )}
          >
            {val}
          </button>
        ))}
      </div>
      {(minLabel || maxLabel) && (
        <div className="flex justify-between mt-1.5">
          {minLabel && <span className="text-xs text-muted-foreground">{min} — {minLabel}</span>}
          {maxLabel && <span className="text-xs text-muted-foreground">{max} — {maxLabel}</span>}
        </div>
      )}
    </div>
  );
}

function FreeTextQuestion({
  question, answer, onChange, disabled,
}: {
  question: PollQuestionData;
  answer: SurveyAnswers[number];
  onChange: (u: Partial<SurveyAnswers[number]>) => void;
  disabled: boolean;
}) {
  void question;
  return (
    <div className="ml-8">
      <textarea
        disabled={disabled}
        value={answer.answerText ?? ''}
        onChange={e => onChange({ answerText: e.target.value })}
        rows={3}
        maxLength={1000}
        placeholder="Type your answer here…"
        className="w-full px-4 py-3 rounded-lg border bg-background text-sm resize-y focus:ring-2 focus:ring-primary focus:border-primary outline-none disabled:opacity-70"
      />
      <p className="text-xs text-muted-foreground text-right mt-1">
        {(answer.answerText ?? '').length}/1000
      </p>
    </div>
  );
}

// ── Option button ──────────────────────────────────────────────────────────

function OptionButton({
  option,
  isSelected,
  isWinner,
  showResults,
  pollType,
  onClick,
}: {
  option: PollOption;
  isSelected: boolean;
  isWinner: boolean;
  showResults: boolean;
  pollType: PollType;
  onClick: () => void;
}) {
  const thumbnail = option.song?.artwork_url ?? option.artist?.avatar_url ?? null;
  const isRound = pollType === 'artist_contest';

  return (
    <button
      onClick={onClick}
      disabled={showResults}
      className={cn(
        'w-full relative rounded-lg border transition-all text-left overflow-hidden',
        showResults ? 'cursor-default' : 'cursor-pointer hover:border-primary',
        isSelected && !showResults && 'border-primary ring-2 ring-primary/20',
        isWinner && showResults && 'border-primary/50'
      )}
    >
      {showResults && (
        <div
          className={cn(
            'absolute inset-0 transition-all duration-700 ease-out',
            isSelected ? 'bg-primary/15' : 'bg-muted/40'
          )}
          style={{ width: `${option.percentage}%` }}
        />
      )}

      <div className="relative flex items-center gap-3 p-4">
        {!showResults && (
          <div
            className={cn(
              'shrink-0 h-5 w-5 rounded-full border-2 transition-colors',
              isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
            )}
          >
            {isSelected && (
              <div className="h-full w-full flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-white" />
              </div>
            )}
          </div>
        )}

        {thumbnail && (
          <Image
            src={thumbnail}
            alt={option.text}
            width={40}
            height={40}
            className={cn('object-cover shrink-0', isRound ? 'rounded-full' : 'rounded')}
          />
        )}

        <div className="flex-1 min-w-0">
          <span className={cn('font-medium block truncate', isSelected && 'text-primary')}>
            {option.text}
          </span>
          {option.song?.artist_name && (
            <span className="text-xs text-muted-foreground truncate">{option.song.artist_name}</span>
          )}
          {option.artist?.stage_name && pollType === 'artist_contest' && (
            <span className="text-xs text-muted-foreground truncate">{option.artist.stage_name}</span>
          )}
        </div>

        {showResults && (
          <div className="shrink-0 flex items-center gap-2">
            {isWinner && <Trophy className="h-4 w-4 text-amber-500" />}
            {isSelected && <CheckCircle className="h-4 w-4 text-primary" />}
            <div className="text-right">
              <span className="font-semibold">{option.percentage}%</span>
              <span className="text-sm text-muted-foreground ml-1">({option.votes.toLocaleString()})</span>
            </div>
          </div>
        )}
      </div>
    </button>
  );
}
