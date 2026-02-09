'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { 
  PiggyBank, 
  TrendingUp, 
  ArrowDownRight, 
  ArrowUpRight,
  Calendar,
  Target,
  Plus,
  X,
  Wallet,
  CreditCard,
  Phone,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useSaccoSavings,
  useSaccoTransactions,
  useSaccoDeposit,
  useSaccoWithdraw
} from '@/hooks/useSacco';

// Additional interfaces for this page
interface SavingsGoal {
  id: number;
  name: string;
  target: number;
  current: number;
  deadline: string;
}

export default function SavingsPage() {
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [depositMethod, setDepositMethod] = useState<'mtn_momo' | 'airtel_money'>('mtn_momo');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<'mtn_momo' | 'airtel_money'>('mtn_momo');

  // Use the new SACCO hooks
  const { data: savingsData, isLoading, error } = useSaccoSavings();
  const { data: transactionsData } = useSaccoTransactions({ limit: 10 });
  const depositMutation = useSaccoDeposit();
  const withdrawMutation = useSaccoWithdraw();
  
  // Handle deposit
  const handleDeposit = async () => {
    if (!depositAmount || !phoneNumber) return;
    try {
      await depositMutation.mutateAsync({
        amount: Number(depositAmount),
        phone_number: phoneNumber,
        payment_method: depositMethod,
      });
      setShowDepositModal(false);
      setDepositAmount('');
      setPhoneNumber('');
      toast.success('Deposit submitted successfully!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Deposit failed';
      toast.error(message);
    }
  };
  
  // Handle withdraw
  const handleWithdraw = async () => {
    if (!withdrawAmount || !phoneNumber) return;
    try {
      await withdrawMutation.mutateAsync({
        amount: Number(withdrawAmount),
        phone_number: phoneNumber,
        payment_method: depositMethod,
      });
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setPhoneNumber('');
      toast.success('Withdrawal request submitted!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Withdrawal failed';
      toast.error(message);
    }
  };
  
  // Use data from hooks with safe defaults
  const balance = savingsData?.balance ?? 0;
  const interestEarned = savingsData?.interest_earned ?? 0;
  const interestRate = savingsData?.interest_rate ?? 8;
  const minimumBalance = 50000;
  const monthlyTarget = 500000;
  const thisMonth = savingsData?.this_month ?? 0;
  
  const savingsGoals: SavingsGoal[] = savingsData?.goals || [];
  
  const transactions = transactionsData?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Unable to load savings</h2>
        <p className="text-muted-foreground mb-4">Please check your connection and try again.</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Retry</button>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Savings</h2>
          <p className="text-muted-foreground">
            Manage your SACCO savings account
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowDepositModal(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
          >
            Deposit
          </button>
          <button 
            onClick={() => setShowWithdrawModal(true)}
            className="px-4 py-2 border rounded-lg font-medium hover:bg-muted"
          >
            Withdraw
          </button>
        </div>
      </div>
      
      {/* Balance Card */}
      <div className="p-6 rounded-xl bg-linear-to-br from-emerald-600 to-teal-600 text-white">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-emerald-100">Total Savings Balance</p>
            <p className="text-4xl font-bold mt-1">
              UGX {balance.toLocaleString()}
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
            <PiggyBank className="h-6 w-6" />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
          <div>
            <p className="text-emerald-100 text-sm">Interest Rate</p>
            <p className="text-xl font-semibold">{interestRate}% p.a.</p>
          </div>
          <div>
            <p className="text-emerald-100 text-sm">Interest Earned</p>
            <p className="text-xl font-semibold">UGX {interestEarned.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-emerald-100 text-sm">This Month</p>
            <p className="text-xl font-semibold">+UGX {thisMonth.toLocaleString()}</p>
          </div>
        </div>
      </div>
      
      {/* Monthly Target Progress */}
      <div className="p-6 rounded-xl border bg-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Monthly Target</h3>
          <span className="text-sm text-muted-foreground">
            {Math.round((thisMonth / monthlyTarget) * 100)}% complete
          </span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all"
            style={{ width: `${Math.min((thisMonth / monthlyTarget) * 100, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span>UGX {thisMonth.toLocaleString()}</span>
          <span className="text-muted-foreground">UGX {monthlyTarget.toLocaleString()}</span>
        </div>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Savings Goals */}
        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">Savings Goals</h3>
            <button className="flex items-center gap-1 text-sm text-primary">
              <Plus className="h-4 w-4" /> Add Goal
            </button>
          </div>
          <div className="p-4 space-y-4">
            {savingsGoals.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <Target className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No savings goals yet</p>
                <p className="text-sm">Set a goal to track your progress</p>
              </div>
            ) : savingsGoals.map((goal) => {
              const progress = (goal.current / goal.target) * 100;
              
              return (
                <div key={goal.id} className="p-4 rounded-lg border">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium">{goal.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Due: {new Date(goal.deadline).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  
                  <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                    <div 
                      className="h-full bg-emerald-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>UGX {goal.current.toLocaleString()}</span>
                    <span className="text-muted-foreground">UGX {goal.target.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Transaction History */}
        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">Transaction History</h3>
            <button className="text-sm text-primary">View all</button>
          </div>
          <div className="divide-y">
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No transactions yet</div>
            ) : transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'h-10 w-10 rounded-full flex items-center justify-center',
                    tx.type === 'deposit' || tx.type === 'dividend'
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : 'bg-red-100 dark:bg-red-900/30'
                  )}>
                    {tx.type === 'deposit' || tx.type === 'dividend' ? (
                      <ArrowDownRight className="h-5 w-5 text-green-600" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    'font-semibold',
                    tx.type === 'deposit' || tx.type === 'dividend' ? 'text-green-600' : 'text-red-600'
                  )}>
                    {tx.type === 'deposit' || tx.type === 'dividend' ? '+' : '-'}
                    UGX {tx.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {tx.type.replace('_', ' ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Info Card */}
      <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30">
        <div className="flex items-start gap-3">
          <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100">Interest Policy</p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Earn competitive annual interest on your savings, calculated monthly. 
              Maintain regular deposits to maximize your earnings.
            </p>
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold">Deposit to Savings</h3>
              <button 
                onClick={() => {
                  setShowDepositModal(false);
                  setDepositAmount('');
                }}
                className="p-2 hover:bg-muted rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Current Balance */}
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="text-2xl font-bold">UGX {savingsData?.balance.toLocaleString() || '0'}</p>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium mb-2">Amount to Deposit</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">UGX</span>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="0"
                    min={10000}
                    className="w-full pl-14 pr-4 py-3 border rounded-lg bg-background text-lg"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-1">Minimum deposit: UGX 10,000</p>
              </div>

              {/* Quick Amounts */}
              <div className="grid grid-cols-4 gap-2">
                {[50000, 100000, 250000, 500000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(amt.toString())}
                    className={cn(
                      'py-2 text-sm rounded-lg border transition-colors',
                      depositAmount === amt.toString()
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'hover:border-foreground'
                    )}
                  >
                    {(amt / 1000).toFixed(0)}K
                  </button>
                ))}
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium mb-2">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDepositMethod('mtn_momo')}
                    className={cn(
                      'p-3 rounded-lg border flex flex-col items-center gap-2',
                      depositMethod === 'mtn_momo'
                        ? 'bg-emerald-50 border-emerald-500 dark:bg-emerald-900/20'
                        : 'hover:border-foreground'
                    )}
                  >
                    <Phone className="h-5 w-5 text-yellow-500" />
                    <span className="text-xs">MTN MoMo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepositMethod('airtel_money')}
                    className={cn(
                      'p-3 rounded-lg border flex flex-col items-center gap-2',
                      depositMethod === 'airtel_money'
                        ? 'bg-emerald-50 border-emerald-500 dark:bg-emerald-900/20'
                        : 'hover:border-foreground'
                    )}
                  >
                    <Phone className="h-5 w-5 text-red-500" />
                    <span className="text-xs">Airtel Money</span>
                  </button>
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 0771234567"
                  className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Submit */}
              <button
                disabled={!depositAmount || parseInt(depositAmount) < 10000 || !phoneNumber || depositMutation.isPending}
                onClick={() => {
                  depositMutation.mutate({ 
                    amount: parseInt(depositAmount), 
                    phone_number: phoneNumber,
                    payment_method: depositMethod 
                  });
                }}
                className={cn(
                  'w-full py-3 rounded-lg font-medium transition-colors',
                  !depositAmount || parseInt(depositAmount) < 10000 || !phoneNumber || depositMutation.isPending
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                )}
              >
                {depositMutation.isPending ? 'Processing...' : `Deposit UGX ${parseInt(depositAmount || '0').toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold">Withdraw from Savings</h3>
              <button 
                onClick={() => {
                  setShowWithdrawModal(false);
                  setWithdrawAmount('');
                }}
                className="p-2 hover:bg-muted rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Available Balance */}
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Available Balance</p>
                    <p className="text-2xl font-bold">UGX {(savingsData?.balance || 0).toLocaleString()}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-muted-foreground">Minimum Balance</p>
                    <p className="font-medium">UGX 10,000</p>
                  </div>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium mb-2">Amount to Withdraw</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">UGX</span>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0"
                    max={(savingsData?.balance || 0) - 10000}
                    className="w-full pl-14 pr-4 py-3 border rounded-lg bg-background text-lg"
                  />
                </div>
              </div>

              {/* Quick Amounts */}
              <div className="grid grid-cols-4 gap-2">
                {[100000, 250000, 500000, 1000000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    disabled={amt > (savingsData?.balance || 0) - 10000}
                    onClick={() => setWithdrawAmount(amt.toString())}
                    className={cn(
                      'py-2 text-sm rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                      withdrawAmount === amt.toString()
                        ? 'bg-orange-600 text-white border-orange-600'
                        : 'hover:border-foreground'
                    )}
                  >
                    {amt >= 1000000 ? `${amt / 1000000}M` : `${amt / 1000}K`}
                  </button>
                ))}
              </div>

              {/* Withdrawal Notice */}
              <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/30">
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Withdrawals are processed within 24-48 hours. A minimum balance of UGX 10,000 must be maintained.
                </p>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium mb-2">Receive Via</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWithdrawMethod('mtn_momo')}
                    className={cn(
                      'p-3 rounded-lg border flex flex-col items-center gap-2',
                      withdrawMethod === 'mtn_momo'
                        ? 'bg-orange-50 border-orange-500 dark:bg-orange-900/20'
                        : 'hover:border-foreground'
                    )}
                  >
                    <Phone className="h-5 w-5 text-yellow-500" />
                    <span className="text-xs">MTN MoMo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawMethod('airtel_money')}
                    className={cn(
                      'p-3 rounded-lg border flex flex-col items-center gap-2',
                      withdrawMethod === 'airtel_money'
                        ? 'bg-orange-50 border-orange-500 dark:bg-orange-900/20'
                        : 'hover:border-foreground'
                    )}
                  >
                    <Phone className="h-5 w-5 text-red-500" />
                    <span className="text-xs">Airtel Money</span>
                  </button>
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 0771234567"
                  className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Submit */}
              <button
                disabled={
                  !withdrawAmount || 
                  parseInt(withdrawAmount) < 10000 || 
                  parseInt(withdrawAmount) > (savingsData?.balance || 0) - 10000 ||
                  !phoneNumber ||
                  withdrawMutation.isPending
                }
                onClick={() => {
                  withdrawMutation.mutate({ amount: parseInt(withdrawAmount), phone_number: phoneNumber, payment_method: withdrawMethod });
                }}
                className={cn(
                  'w-full py-3 rounded-lg font-medium transition-colors',
                  !withdrawAmount || 
                  parseInt(withdrawAmount) < 10000 || 
                  parseInt(withdrawAmount) > (savingsData?.balance || 0) - 10000 ||
                  !phoneNumber ||
                  withdrawMutation.isPending
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-orange-600 text-white hover:bg-orange-700'
                )}
              >
                {withdrawMutation.isPending ? 'Processing...' : `Withdraw UGX ${parseInt(withdrawAmount || '0').toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
