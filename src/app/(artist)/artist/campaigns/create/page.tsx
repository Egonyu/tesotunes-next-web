'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  Upload,
  Plus,
  Minus,
  Image as ImageIcon,
  Target,
  FileText,
  Gift,
  Calendar,
  Loader2,
  X,
} from 'lucide-react';
import { useCreateCampaign } from '@/hooks/useCampaigns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface RewardTier {
  title: string;
  description: string;
  amount: number;
  limit?: number;
}

const CATEGORIES = [
  'Album Production',
  'Music Video',
  'Tour Funding',
  'Equipment',
  'Studio Time',
  'Merchandise',
  'Event',
  'Education',
  'Community',
  'Other',
];

export default function CreateCampaignPage() {
  const router = useRouter();
  const createCampaign = useCreateCampaign();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Campaign details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [story, setStory] = useState('');
  const [goal, setGoal] = useState('');
  const [category, setCategory] = useState('');
  const [endDate, setEndDate] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // Reward tiers
  const [rewards, setRewards] = useState<RewardTier[]>([]);

  // Form step
  const [step, setStep] = useState<'details' | 'story' | 'rewards' | 'preview'>('details');

  // Handle cover image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be under 5MB');
        return;
      }
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addReward = () => {
    setRewards([...rewards, { title: '', description: '', amount: 0 }]);
  };

  const removeReward = (index: number) => {
    setRewards(rewards.filter((_, i) => i !== index));
  };

  const updateReward = (index: number, field: keyof RewardTier, value: string | number) => {
    const updated = [...rewards];
    updated[index] = { ...updated[index], [field]: value };
    setRewards(updated);
  };

  // Validation
  const validateDetails = () => {
    if (!title.trim()) { toast.error('Campaign title is required'); return false; }
    if (!description.trim()) { toast.error('Description is required'); return false; }
    if (!goal || parseFloat(goal) < 10000) { toast.error('Goal must be at least UGX 10,000'); return false; }
    if (!category) { toast.error('Please select a category'); return false; }
    if (!endDate) { toast.error('End date is required'); return false; }
    
    const end = new Date(endDate);
    const now = new Date();
    if (end <= now) { toast.error('End date must be in the future'); return false; }
    
    const daysDiff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 90) { toast.error('Campaign can run for a maximum of 90 days'); return false; }
    
    return true;
  };

  const validateRewards = () => {
    for (const reward of rewards) {
      if (!reward.title.trim()) { toast.error('All reward tiers need a title'); return false; }
      if (reward.amount <= 0) { toast.error('Reward amount must be greater than 0'); return false; }
    }
    return true;
  };

  const handleNext = () => {
    if (step === 'details' && validateDetails()) setStep('story');
    else if (step === 'story') setStep('rewards');
    else if (step === 'rewards' && validateRewards()) setStep('preview');
  };

  const handleBack = () => {
    if (step === 'story') setStep('details');
    else if (step === 'rewards') setStep('story');
    else if (step === 'preview') setStep('rewards');
  };

  // Submit campaign
  const handleSubmit = async () => {
    if (!validateDetails() || !validateRewards()) return;

    try {
      await createCampaign.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        story: story.trim() || undefined,
        goal: parseFloat(goal),
        category,
        endDate,
        cover: coverImage || undefined,
        rewards: rewards.length > 0 ? rewards.map(r => ({
          title: r.title,
          description: r.description,
          amount: r.amount,
          limit: r.limit,
        })) : undefined,
      });

      toast.success('Campaign created successfully!');
      router.push('/artist/campaigns');
    } catch {
      toast.error('Failed to create campaign. Please try again.');
    }
  };

  // Calculate minimum end date (tomorrow)
  const minEndDate = new Date();
  minEndDate.setDate(minEndDate.getDate() + 1);
  const minEndDateStr = minEndDate.toISOString().split('T')[0];

  // Max end date (90 days from now)
  const maxEndDate = new Date();
  maxEndDate.setDate(maxEndDate.getDate() + 90);
  const maxEndDateStr = maxEndDate.toISOString().split('T')[0];

  const steps = ['details', 'story', 'rewards', 'preview'] as const;
  const stepIndex = steps.indexOf(step);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/artist/campaigns" className="p-2 hover:bg-muted rounded-lg">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create Campaign</h1>
          <p className="text-sm text-muted-foreground">Launch a new Ojokotau crowdfunding campaign</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0',
                i <= stepIndex ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}
            >
              {i + 1}
            </div>
            <span className={cn('text-xs hidden sm:block', i === stepIndex ? 'font-medium' : 'text-muted-foreground')}>
              {s === 'details' ? 'Details' : s === 'story' ? 'Story' : s === 'rewards' ? 'Rewards' : 'Preview'}
            </span>
            {i < steps.length - 1 && <div className="flex-1 h-px bg-border" />}
          </div>
        ))}
      </div>

      {/* Step 1: Campaign Details */}
      {step === 'details' && (
        <div className="space-y-6">
          {/* Cover Image */}
          <div className="bg-card rounded-xl border p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Cover Image
            </h2>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            {coverPreview ? (
              <div className="relative">
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={() => { setCoverImage(null); setCoverPreview(null); }}
                  className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Upload className="h-8 w-8" />
                <span className="text-sm font-medium">Upload cover image</span>
                <span className="text-xs">Recommended: 1200×630px, max 5MB</span>
              </button>
            )}
          </div>

          {/* Basic Info */}
          <div className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Campaign Details
            </h2>

            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Help me produce my debut album"
                className="w-full px-4 py-3 border rounded-lg bg-background"
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground mt-1">{title.length}/100</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Short Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe what your campaign is for..."
                rows={3}
                className="w-full px-4 py-3 border rounded-lg bg-background resize-none"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">{description.length}/500</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg bg-background"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Funding Goal (UGX) *</label>
                <div className="relative">
                  <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="number"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="500000"
                    className="w-full pl-10 pr-4 py-3 border rounded-lg bg-background"
                    min={10000}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">End Date *</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={minEndDateStr}
                  max={maxEndDateStr}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg bg-background"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Campaigns can run for up to 90 days</p>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Campaign Story */}
      {step === 'story' && (
        <div className="bg-card rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Your Story
          </h2>
          <p className="text-sm text-muted-foreground">
            Tell your fans why this campaign matters. Share your vision, what the funds will be used for,
            and why their support is important.
          </p>
          <textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder={`Share your story here...

For example:
- What inspired this project?
- How will the funds be used?
- What will backers get in return?
- Why should people support you?`}
            rows={15}
            className="w-full px-4 py-3 border rounded-lg bg-background resize-y"
          />
          <p className="text-xs text-muted-foreground">{story.length} characters</p>
        </div>
      )}

      {/* Step 3: Reward Tiers */}
      {step === 'rewards' && (
        <div className="space-y-6">
          <div className="bg-card rounded-xl border p-6">
            <h2 className="font-semibold mb-2 flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Reward Tiers
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Optional: Add reward tiers to incentivize higher donations. Backers who donate at or above a
              tier&apos;s amount will receive that reward.
            </p>

            {rewards.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <Gift className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-3">No reward tiers added yet</p>
                <button
                  onClick={addReward}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add Reward Tier
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {rewards.map((reward, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Tier {index + 1}</span>
                      <button
                        onClick={() => removeReward(index)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">Title *</label>
                        <input
                          type="text"
                          value={reward.title}
                          onChange={(e) => updateReward(index, 'title', e.target.value)}
                          placeholder="e.g., Shout-out"
                          className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Minimum Amount (UGX) *</label>
                        <input
                          type="number"
                          value={reward.amount || ''}
                          onChange={(e) => updateReward(index, 'amount', Number(e.target.value))}
                          placeholder="5000"
                          className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
                          min={1}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1">Description</label>
                      <textarea
                        value={reward.description}
                        onChange={(e) => updateReward(index, 'description', e.target.value)}
                        placeholder="What backers receive at this tier..."
                        rows={2}
                        className="w-full px-3 py-2 border rounded-lg bg-background text-sm resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1">Limit (optional)</label>
                      <input
                        type="number"
                        value={reward.limit || ''}
                        onChange={(e) => updateReward(index, 'limit', Number(e.target.value) || undefined as unknown as number)}
                        placeholder="Unlimited"
                        className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
                        min={1}
                      />
                    </div>
                  </div>
                ))}

                <button
                  onClick={addReward}
                  className="w-full py-2 border-2 border-dashed rounded-lg text-sm text-muted-foreground hover:border-primary hover:text-primary flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Another Tier
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 4: Preview */}
      {step === 'preview' && (
        <div className="space-y-6">
          <div className="bg-card rounded-xl border overflow-hidden">
            {/* Cover */}
            {coverPreview ? (
              <img src={coverPreview} alt={title} className="w-full h-56 object-cover" />
            ) : (
              <div className="w-full h-56 bg-muted flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
              </div>
            )}

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  {category}
                </span>
                <span className="text-sm text-muted-foreground">
                  Ends {new Date(endDate).toLocaleDateString()}
                </span>
              </div>

              <h2 className="text-2xl font-bold">{title || 'Campaign Title'}</h2>
              <p className="text-muted-foreground">{description || 'Campaign description...'}</p>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">UGX 0 raised</span>
                  <span className="text-muted-foreground">of UGX {Number(goal || 0).toLocaleString()}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div className="bg-primary h-3 rounded-full w-0" />
                </div>
                <div className="flex justify-between text-sm mt-1 text-muted-foreground">
                  <span>0 backers</span>
                  <span>{endDate ? `${Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000*60*60*24))} days left` : ''}</span>
                </div>
              </div>

              {/* Story preview */}
              {story && (
                <div>
                  <h3 className="font-semibold mb-2">Story</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-6">{story}</p>
                </div>
              )}

              {/* Rewards preview */}
              {rewards.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Reward Tiers</h3>
                  <div className="space-y-2">
                    {rewards.map((reward, i) => (
                      <div key={i} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm">{reward.title}</span>
                          <span className="text-sm text-primary font-semibold">
                            UGX {reward.amount.toLocaleString()}+
                          </span>
                        </div>
                        {reward.description && (
                          <p className="text-xs text-muted-foreground mt-1">{reward.description}</p>
                        )}
                        {reward.limit && (
                          <p className="text-xs text-muted-foreground mt-1">Limited to {reward.limit}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4">
        {step !== 'details' && (
          <button
            onClick={handleBack}
            className="flex-1 py-3 border rounded-lg hover:bg-muted font-medium transition-colors"
          >
            Back
          </button>
        )}
        {step !== 'preview' ? (
          <button
            onClick={handleNext}
            className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-medium transition-colors hover:bg-primary/90"
          >
            {step === 'rewards' ? 'Preview Campaign' : 'Continue'}
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={createCampaign.isPending}
            className={cn(
              'flex-1 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors',
              createCampaign.isPending
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            {createCampaign.isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating...
              </>
            ) : (
              'Launch Campaign'
            )}
          </button>
        )}
      </div>
    </div>
  );
}
