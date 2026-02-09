'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft,
  Plus,
  Trash2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCreatePoll } from '@/hooks/usePolls';

interface PollOption {
  id: string;
  text: string;
}

const categories = ['Music', 'Artists', 'Industry', 'Community', 'Fun'];

export default function CreatePollPage() {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Music');
  const [duration, setDuration] = useState(7);
  const [options, setOptions] = useState<PollOption[]>([
    { id: '1', text: '' },
    { id: '2', text: '' },
  ]);
  const [allowMultiple, setAllowMultiple] = useState(false);
  
  // API hook
  const createPollMutation = useCreatePoll();
  
  const addOption = () => {
    if (options.length >= 6) return;
    setOptions([...options, { id: Date.now().toString(), text: '' }]);
  };
  
  const removeOption = (id: string) => {
    if (options.length <= 2) return;
    setOptions(options.filter(o => o.id !== id));
  };
  
  const updateOption = (id: string, text: string) => {
    setOptions(options.map(o => o.id === id ? { ...o, text } : o));
  };
  
  const isValid = question.trim() && options.filter(o => o.text.trim()).length >= 2;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    
    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + duration);
    
    createPollMutation.mutate(
      {
        question,
        description: description || undefined,
        options: options.filter(o => o.text.trim()).map(o => o.text),
        category,
        endsAt: endsAt.toISOString(),
      },
      {
        onSuccess: () => {
          router.push('/polls');
        },
      }
    );
  };
  
  return (
    <div className="container py-8 max-w-2xl">
      {/* Back Link */}
      <Link 
        href="/polls"
        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Polls
      </Link>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create a Poll</h1>
        <p className="text-muted-foreground">
          Ask the community and gather opinions
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Question <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What would you like to ask?"
            maxLength={200}
            required
            className="w-full px-4 py-3 rounded-lg border bg-background"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {question.length}/200 characters
          </p>
        </div>
        
        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Description <span className="text-muted-foreground">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more context to your poll..."
            rows={3}
            maxLength={500}
            className="w-full px-4 py-3 rounded-lg border bg-background resize-none"
          />
        </div>
        
        {/* Options */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Options <span className="text-red-500">*</span>
            <span className="text-muted-foreground ml-1">(min 2, max 6)</span>
          </label>
          <div className="space-y-3">
            {options.map((option, index) => (
              <div key={option.id} className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => updateOption(option.id, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  maxLength={100}
                  className="flex-1 px-4 py-2 rounded-lg border bg-background"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(option.id)}
                    className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {options.length < 6 && (
            <button
              type="button"
              onClick={addOption}
              className="flex items-center gap-2 mt-3 text-sm text-primary hover:text-primary/80"
            >
              <Plus className="h-4 w-4" />
              Add Option
            </button>
          )}
        </div>
        
        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  category === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        {/* Duration */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <Calendar className="h-4 w-4 inline mr-1" />
            Poll Duration
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            className="w-full px-4 py-3 rounded-lg border bg-background"
          >
            <option value={1}>1 day</option>
            <option value={3}>3 days</option>
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
          </select>
        </div>
        
        {/* Settings */}
        <div className="p-4 rounded-lg bg-muted/50">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={allowMultiple}
              onChange={(e) => setAllowMultiple(e.target.checked)}
              className="h-4 w-4 rounded border-muted-foreground accent-primary"
            />
            <div>
              <p className="font-medium">Allow multiple selections</p>
              <p className="text-sm text-muted-foreground">
                Users can vote for more than one option
              </p>
            </div>
          </label>
        </div>
        
        {/* Info */}
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium">Poll Guidelines</p>
              <ul className="mt-1 space-y-1">
                <li>• Polls cannot be edited after creation</li>
                <li>• Your poll will be visible to all TesoTunes members</li>
                <li>• Inappropriate polls may be removed</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Submit */}
        <div className="flex gap-3">
          <Link
            href="/polls"
            className="px-6 py-3 border rounded-lg font-medium hover:bg-muted"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={!isValid || createPollMutation.isPending}
            className={cn(
              'flex-1 py-3 rounded-lg font-medium transition-colors',
              isValid && !createPollMutation.isPending
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
          >
            {createPollMutation.isPending ? 'Creating Poll...' : 'Create Poll'}
          </button>
        </div>
      </form>
    </div>
  );
}
