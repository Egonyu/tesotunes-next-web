'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCreateGoal } from '@/hooks/useSaccoGoals'
import type { GoalType, GoalCurrency, GoalVisibility, CreateGoalData } from '@/types/sacco'

const goalTypes: { value: GoalType; label: string; icon: string; description: string }[] = [
  { value: 'music_video', label: 'Music Video', icon: '🎬', description: 'Fund your next visual masterpiece' },
  { value: 'album_production', label: 'Album Production', icon: '💿', description: 'Record, mix & master your album' },
  { value: 'concert', label: 'Concert / Show', icon: '🎤', description: 'Finance your live performance' },
  { value: 'equipment', label: 'Equipment', icon: '🎸', description: 'Buy or rent production gear' },
  { value: 'tour', label: 'Tour', icon: '🚌', description: 'Fund a multi-city tour' },
  { value: 'custom', label: 'Custom Goal', icon: '✨', description: 'Set your own savings target' },
]

const currencyOptions: { value: GoalCurrency; label: string; description: string }[] = [
  { value: 'ugx', label: 'UGX (Cash)', description: 'Save in Ugandan Shillings' },
  { value: 'credits', label: 'Credits', description: 'Save platform credits' },
  { value: 'hybrid', label: 'Hybrid', description: 'Mix of cash and credits' },
]

const visibilityOptions: { value: GoalVisibility; label: string; icon: string }[] = [
  { value: 'private', label: 'Private', icon: '🔒' },
  { value: 'friends', label: 'Friends Only', icon: '👥' },
  { value: 'public', label: 'Public', icon: '🌍' },
]

export default function CreateGoalPage() {
  const router = useRouter()
  const createGoal = useCreateGoal()
  const [step, setStep] = useState(1)
  const totalSteps = 3

  const [formData, setFormData] = useState<Partial<CreateGoalData>>({
    type: undefined,
    title: '',
    description: '',
    target_amount: 0,
    currency: 'ugx',
    deadline: '',
    visibility: 'private',
    monthly_target: 0,
    auto_deposit: false,
    auto_deposit_percentage: 20,
    credit_conversion_enabled: true,
  })

  const update = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!formData.type
      case 2:
        return !!formData.title && (formData.target_amount ?? 0) > 0
      case 3:
        return true
      default:
        return false
    }
  }

  const handleSubmit = async () => {
    try {
      await createGoal.mutateAsync(formData as CreateGoalData)
      router.push('/sacco/savings/goals')
    } catch {
      // Error handled by mutation
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/sacco/savings/goals" className="p-2 hover:bg-muted rounded-lg">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold">Create Savings Goal</h2>
          <p className="text-sm text-muted-foreground">Step {step} of {totalSteps}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-2">
        {[...Array(totalSteps)].map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 rounded-full flex-1 transition-colors',
              i < step ? 'bg-emerald-500' : 'bg-muted'
            )}
          />
        ))}
      </div>

      {/* Step 1: Goal Type */}
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">What are you saving for?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {goalTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => update('type', type.value)}
                className={cn(
                  'flex items-start gap-3 p-4 rounded-xl border text-left transition-all',
                  formData.type === type.value
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 ring-2 ring-emerald-500/20'
                    : 'hover:border-emerald-200 dark:hover:border-emerald-800'
                )}
              >
                <span className="text-2xl">{type.icon}</span>
                <div>
                  <p className="font-semibold">{type.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{type.description}</p>
                </div>
                {formData.type === type.value && (
                  <Check className="h-5 w-5 text-emerald-600 ml-auto shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Goal Details */}
      {step === 2 && (
        <div className="space-y-5">
          <h3 className="text-lg font-semibold">Goal Details</h3>

          <div>
            <label className="block text-sm font-medium mb-1.5">Goal Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="e.g., My First Music Video"
              className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Description (optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Describe what you're saving for..."
              rows={3}
              className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Currency</label>
            <div className="grid grid-cols-3 gap-2">
              {currencyOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => update('currency', opt.value)}
                  className={cn(
                    'p-3 rounded-lg border text-center text-sm transition-colors',
                    formData.currency === opt.value
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'hover:border-emerald-200'
                  )}
                >
                  <p className="font-medium">{opt.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{opt.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Target Amount ({formData.currency === 'credits' ? 'Credits' : 'UGX'})
            </label>
            <input
              type="number"
              value={formData.target_amount || ''}
              onChange={(e) => update('target_amount', Number(e.target.value))}
              placeholder="e.g., 3000000"
              min={0}
              className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {formData.currency !== 'credits' && (formData.target_amount ?? 0) > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                ≈ {((formData.target_amount ?? 0) * 100).toLocaleString()} credits equivalent
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Target Date (optional)</label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => update('deadline', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Visibility</label>
            <div className="flex gap-2">
              {visibilityOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => update('visibility', opt.value)}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm transition-colors',
                    formData.visibility === opt.value
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'hover:border-emerald-200'
                  )}
                >
                  <span>{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Savings Strategy */}
      {step === 3 && (
        <div className="space-y-5">
          <h3 className="text-lg font-semibold">Savings Strategy</h3>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Monthly Savings Target ({formData.currency === 'credits' ? 'Credits' : 'UGX'})
            </label>
            <input
              type="number"
              value={formData.monthly_target || ''}
              onChange={(e) => update('monthly_target', Number(e.target.value))}
              placeholder="e.g., 300000"
              min={0}
              className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {(formData.monthly_target ?? 0) > 0 && (formData.target_amount ?? 0) > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Estimated completion: ~{Math.ceil((formData.target_amount ?? 0) / (formData.monthly_target ?? 1))} months
              </p>
            )}
          </div>

          <div className="rounded-xl border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Auto-Save from Royalties</p>
                <p className="text-xs text-muted-foreground">Automatically save a % of your earnings</p>
              </div>
              <button
                onClick={() => update('auto_deposit', !formData.auto_deposit)}
                className={cn(
                  'relative w-11 h-6 rounded-full transition-colors',
                  formData.auto_deposit ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
                )}
              >
                <span className={cn(
                  'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
                  formData.auto_deposit && 'translate-x-5'
                )} />
              </button>
            </div>

            {formData.auto_deposit && (
              <div>
                <label className="block text-xs font-medium mb-1">Percentage of earnings</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={5}
                    max={50}
                    step={5}
                    value={formData.auto_deposit_percentage}
                    onChange={(e) => update('auto_deposit_percentage', Number(e.target.value))}
                    className="flex-1 accent-emerald-600"
                  />
                  <span className="text-sm font-bold w-12 text-right">{formData.auto_deposit_percentage}%</span>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Credit Conversion</p>
                <p className="text-xs text-muted-foreground">Convert streaming credits to savings</p>
              </div>
              <button
                onClick={() => update('credit_conversion_enabled', !formData.credit_conversion_enabled)}
                className={cn(
                  'relative w-11 h-6 rounded-full transition-colors',
                  formData.credit_conversion_enabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
                )}
              >
                <span className={cn(
                  'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
                  formData.credit_conversion_enabled && 'translate-x-5'
                )} />
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 p-5">
            <h4 className="font-semibold text-sm mb-3">Goal Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">
                  {goalTypes.find((t) => t.value === formData.type)?.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Target</span>
                <span className="font-medium">
                  {(formData.target_amount ?? 0).toLocaleString()} {formData.currency?.toUpperCase()}
                </span>
              </div>
              {formData.monthly_target && formData.monthly_target > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Target</span>
                  <span className="font-medium">{formData.monthly_target.toLocaleString()}</span>
                </div>
              )}
              {formData.deadline && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deadline</span>
                  <span className="font-medium">{new Date(formData.deadline).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Auto-Save</span>
                <span className="font-medium">{formData.auto_deposit ? `${formData.auto_deposit_percentage}% of earnings` : 'Off'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t">
        <button
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg border hover:bg-muted disabled:opacity-40 disabled:pointer-events-none"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        {step < totalSteps ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:pointer-events-none"
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={createGoal.isPending}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {createGoal.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Create Goal
              </>
            )}
          </button>
        )}
      </div>

      {createGoal.isError && (
        <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-900/10 border border-rose-200 text-sm text-rose-700 dark:text-rose-400">
          Failed to create goal. Please try again.
        </div>
      )}
    </div>
  )
}
