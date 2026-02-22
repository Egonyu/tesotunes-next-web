'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Loader2,
  Pause,
  Play,
  Trash2,
  Wallet,
  Coins,
  Settings,
  Check,
  Clock,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProgressRing, EmptyState, SaccoSkeleton } from '@/components/sacco/shared'
import {
  useSaccoGoal,
  useGoalDeposit,
  useGoalConvertCredits,
  useUpdateAutoSave,
  useGoalTransactions,
  useGoalFundingOptions,
  useUpdateGoal,
  useDeleteGoal,
} from '@/hooks/useSaccoGoals'
import type { Milestone } from '@/types/sacco'

const goalTypeLabels: Record<string, string> = {
  music_video: '🎬 Music Video',
  album_production: '💿 Album Production',
  concert: '🎤 Concert',
  equipment: '🎸 Equipment',
  tour: '🚌 Tour',
  custom: '✨ Custom',
}

export default function GoalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const goalId = Number(params.id)

  const { data: goal, isLoading, isError } = useSaccoGoal(goalId)
  const { data: funding } = useGoalFundingOptions(goalId)
  const { data: txData } = useGoalTransactions(goalId)
  const updateGoal = useUpdateGoal()
  const deleteGoal = useDeleteGoal()
  const depositMutation = useGoalDeposit()
  const convertCreditsMutation = useGoalConvertCredits()
  const updateAutoSave = useUpdateAutoSave()

  const [showDeposit, setShowDeposit] = useState(false)
  const [showConvert, setShowConvert] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')
  const [depositPhone, setDepositPhone] = useState('')
  const [depositMethod, setDepositMethod] = useState<'mtn_momo' | 'airtel_money'>('mtn_momo')
  const [convertAmount, setConvertAmount] = useState('')
  const [showSettings, setShowSettings] = useState(false)

  if (isLoading) return <SaccoSkeleton />
  if (isError || !goal) {
    return (
      <EmptyState
        icon={<AlertTriangle className="h-10 w-10 text-amber-500" />}
        title="Goal not found"
        description="This savings goal doesn't exist or you don't have access."
        action={
          <Link href="/sacco/savings/goals" className="text-sm text-emerald-600 hover:underline">
            ← Back to Goals
          </Link>
        }
      />
    )
  }

  const goalData = goal
  const progress = goalData.progress
  const strategy = goalData.strategy
  const milestones = goalData.production_details?.milestones ?? []
  const transactions = txData?.data ?? []
  const fundingData = funding

  const handleDeposit = async () => {
    if (!depositAmount || !depositPhone) return
    await depositMutation.mutateAsync({
      goalId,
      data: {
        amount: Number(depositAmount),
        phone_number: depositPhone,
        payment_method: depositMethod,
      },
    })
    setShowDeposit(false)
    setDepositAmount('')
    setDepositPhone('')
  }

  const handleConvert = async () => {
    if (!convertAmount) return
    await convertCreditsMutation.mutateAsync({
      goalId,
      data: { amount: Number(convertAmount) },
    })
    setShowConvert(false)
    setConvertAmount('')
  }

  const togglePause = async () => {
    await updateGoal.mutateAsync({
      id: goalId,
      data: { status: goalData.status === 'paused' ? 'active' : 'paused' },
    })
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this goal? This cannot be undone.')) return
    await deleteGoal.mutateAsync(goalId)
    router.push('/sacco/savings/goals')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href="/sacco/savings/goals" className="p-2 hover:bg-muted rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold">{goalData.title}</h2>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <span>{goalTypeLabels[goalData.type] ?? goalData.type}</span>
              <span>·</span>
              <span className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium',
                goalData.status === 'active' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                goalData.status === 'completed' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                goalData.status === 'paused' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
              )}>
                {goalData.status}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setShowSettings(!showSettings)} className="p-2 hover:bg-muted rounded-lg" title="Settings">
            <Settings className="h-4 w-4" />
          </button>
          <button onClick={togglePause} className="p-2 hover:bg-muted rounded-lg" title={goalData.status === 'paused' ? 'Resume' : 'Pause'}>
            {goalData.status === 'paused' ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
          <button onClick={handleDelete} className="p-2 hover:bg-rose-100 dark:hover:bg-rose-900/20 text-rose-600 rounded-lg" title="Delete">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 flex items-center justify-center rounded-xl border p-6">
          <ProgressRing
            percentage={progress?.percentage ?? 0}
            size={140}
            label={`${(goalData.current_amount ?? 0).toLocaleString()} / ${(goalData.target_amount ?? 0).toLocaleString()}`}
          />
        </div>
        <div className="md:col-span-2 grid grid-cols-2 gap-3">
          <div className="rounded-xl border p-4">
            <p className="text-xs text-muted-foreground">Saved</p>
            <p className="text-xl font-bold mt-1">{(goalData.current_amount ?? 0).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{goalData.currency?.toUpperCase()}</p>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-xs text-muted-foreground">Remaining</p>
            <p className="text-xl font-bold mt-1">{((goalData.target_amount ?? 0) - (goalData.current_amount ?? 0)).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{goalData.currency?.toUpperCase()}</p>
          </div>
          <div className="rounded-xl border p-4">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Days Left</p>
            </div>
            <p className="text-xl font-bold mt-1">{progress?.days_remaining ?? '∞'}</p>
          </div>
          <div className="rounded-xl border p-4">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Track Status</p>
            </div>
            <p className={cn(
              'text-lg font-bold mt-1',
              progress?.on_track ? 'text-emerald-600' : 'text-amber-600'
            )}>
              {progress?.on_track ? 'On Track' : 'Behind'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowDeposit(!showDeposit)}
          className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-700"
        >
          <Wallet className="h-4 w-4" />
          Deposit
        </button>
        <button
          onClick={() => setShowConvert(!showConvert)}
          className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl border font-medium text-sm hover:bg-muted"
        >
          <Coins className="h-4 w-4" />
          Convert Credits
        </button>
      </div>

      {/* Deposit Form */}
      {showDeposit && (
        <div className="rounded-xl border p-5 space-y-4">
          <h4 className="font-semibold text-sm">Make a Deposit</h4>
          <div>
            <label className="block text-xs font-medium mb-1">Amount (UGX)</label>
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="e.g., 100000"
              className="w-full rounded-lg border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Phone Number</label>
            <input
              type="tel"
              value={depositPhone}
              onChange={(e) => setDepositPhone(e.target.value)}
              placeholder="e.g., 0771234567"
              className="w-full rounded-lg border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setDepositMethod('mtn_momo')}
              className={cn(
                'flex-1 py-2 rounded-lg border text-sm font-medium',
                depositMethod === 'mtn_momo' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : ''
              )}
            >
              MTN MoMo
            </button>
            <button
              onClick={() => setDepositMethod('airtel_money')}
              className={cn(
                'flex-1 py-2 rounded-lg border text-sm font-medium',
                depositMethod === 'airtel_money' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''
              )}
            >
              Airtel Money
            </button>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setShowDeposit(false)}
              className="flex-1 py-2 rounded-lg border text-sm hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleDeposit}
              disabled={depositMutation.isPending || !depositAmount || !depositPhone}
              className="flex-1 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
            >
              {depositMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Confirm Deposit'}
            </button>
          </div>
        </div>
      )}

      {/* Convert Credits Form */}
      {showConvert && (
        <div className="rounded-xl border p-5 space-y-4">
          <h4 className="font-semibold text-sm">Convert Credits to Savings</h4>
          <div>
            <label className="block text-xs font-medium mb-1">Credits to Convert</label>
            <input
              type="number"
              value={convertAmount}
              onChange={(e) => setConvertAmount(e.target.value)}
              placeholder="e.g., 5000"
              className="w-full rounded-lg border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setShowConvert(false)} className="flex-1 py-2 rounded-lg border text-sm hover:bg-muted">Cancel</button>
            <button
              onClick={handleConvert}
              disabled={convertCreditsMutation.isPending || !convertAmount}
              className="flex-1 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
            >
              {convertCreditsMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Convert'}
            </button>
          </div>
        </div>
      )}

      {/* Auto-Save Settings */}
      {showSettings && (
        <div className="rounded-xl border p-5 space-y-4">
          <h4 className="font-semibold text-sm">Auto-Save Settings</h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Auto-Save from Royalties</p>
              <p className="text-xs text-muted-foreground">Percentage of earnings auto-deposited</p>
            </div>
            <button
              onClick={() => {
                updateAutoSave.mutate({
                  goalId,
                  data: { auto_deposit: !strategy?.auto_deposit },
                })
              }}
              className={cn(
                'relative w-11 h-6 rounded-full transition-colors',
                strategy?.auto_deposit ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
              )}
            >
              <span className={cn(
                'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
                strategy?.auto_deposit && 'translate-x-5'
              )} />
            </button>
          </div>
          {strategy?.auto_deposit && (
            <p className="text-sm text-muted-foreground">
              Currently saving <span className="font-bold text-foreground">{strategy.auto_deposit_percentage}%</span> of earnings
            </p>
          )}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Credit Conversion</p>
              <p className="text-xs text-muted-foreground">Auto-convert streaming credits</p>
            </div>
            <button
              onClick={() => {
                updateAutoSave.mutate({
                  goalId,
                  data: { auto_deposit: strategy?.auto_deposit ?? false, credit_conversion_enabled: !strategy?.credit_conversion_enabled },
                })
              }}
              className={cn(
                'relative w-11 h-6 rounded-full transition-colors',
                strategy?.credit_conversion_enabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
              )}
            >
              <span className={cn(
                'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
                strategy?.credit_conversion_enabled && 'translate-x-5'
              )} />
            </button>
          </div>
        </div>
      )}

      {/* Milestones */}
      {milestones.length > 0 && (
        <div className="rounded-xl border p-5">
          <h4 className="font-semibold text-sm mb-4">Milestones</h4>
          <div className="space-y-3">
            {milestones.map((ms: Milestone, idx: number) => (
              <div key={ms.id} className="flex items-start gap-3">
                {/* Step indicator */}
                <div className="flex flex-col items-center">
                  <div className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                    ms.completed
                      ? 'bg-emerald-500 text-white'
                      : 'border-2 border-muted-foreground/30 text-muted-foreground'
                  )}>
                    {ms.completed ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                  </div>
                  {idx < milestones.length - 1 && (
                    <div className={cn(
                      'w-0.5 h-8 my-1',
                      ms.completed ? 'bg-emerald-500' : 'bg-muted'
                    )} />
                  )}
                </div>
                <div className="flex-1 pt-0.5">
                  <p className={cn('text-sm font-medium', ms.completed && 'line-through text-muted-foreground')}>
                    {ms.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {(ms.amount_saved ?? 0).toLocaleString()} / {ms.amount_needed.toLocaleString()} UGX
                  </p>
                  {ms.reward && (
                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-full">
                      🎁 {ms.reward.type}: {ms.reward.value}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Funding Options */}
      {fundingData && (
        <div className="rounded-xl border p-5 space-y-4">
          <h4 className="font-semibold text-sm">Funding Options</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Loan Eligible</p>
              <p className="font-bold mt-0.5">{fundingData.loan_eligible ? 'Yes' : 'No'}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Max Loan</p>
              <p className="font-bold mt-0.5">{(fundingData.loan_amount ?? 0).toLocaleString()} UGX</p>
            </div>
          </div>
          {fundingData.current_tier && (
            <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/10 p-3">
              <p className="text-xs text-muted-foreground">Current Tier</p>
              <p className="font-semibold text-sm mt-0.5">{fundingData.current_tier.name}</p>
            </div>
          )}
          {fundingData.next_tier && (
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Next Tier</p>
              <p className="font-semibold text-sm mt-0.5">{fundingData.next_tier.name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Save {fundingData.next_tier.savings_required.toLocaleString()} UGX to unlock
              </p>
            </div>
          )}
        </div>
      )}

      {/* Transaction History */}
      <div className="rounded-xl border p-5">
        <h4 className="font-semibold text-sm mb-4">Recent Transactions</h4>
        {Array.isArray(transactions) && transactions.length > 0 ? (
          <div className="divide-y">
            {transactions.slice(0, 10).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className={cn(
                    'text-sm font-bold',
                    tx.type === 'deposit' || tx.type === 'goal_deposit' || tx.type === 'credit_conversion' || tx.type === 'auto_save'
                      ? 'text-emerald-600'
                      : 'text-rose-600'
                  )}>
                    {tx.type === 'withdrawal' ? '-' : '+'}{tx.amount.toLocaleString()}
                  </p>
                  <p className={cn(
                    'text-[10px]',
                    tx.status === 'completed' ? 'text-emerald-600' : tx.status === 'failed' ? 'text-rose-600' : 'text-amber-600'
                  )}>
                    {tx.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No transactions yet</p>
        )}
      </div>
    </div>
  )
}
