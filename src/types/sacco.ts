// ============================================================================
// SACCO Types - Artist Production Finance Platform
// ============================================================================

// ---- Core Member Types ----

export interface SaccoMember {
  id: number
  member_number: string
  user_id: number
  status: 'active' | 'suspended' | 'pending'
  joined_at: string
  savings_balance: number
  shares_count: number
  shares_value: number
  credit_score?: number
}

export interface SaccoMemberDashboard {
  member_number: string
  member_since: string
  status: 'active' | 'pending' | 'suspended'
  savings: {
    balance: number
    change: number
    this_month: number
    total_credits?: number
  }
  shares: {
    count: number
    value: number
    change: number
  }
  loans: {
    active: number
    total_borrowed: number
    total_paid: number
    balance: number
  }
  dividends: {
    last_year: number
    pending: number
  }
  goals?: {
    active: number
    completed: number
    list: SavingsGoal[]
  }
  streak?: SavingsStreak
  recommendations?: SavingsRecommendation[]
  achievements?: {
    total: number
    recent: Achievement[]
  }
}

// ---- Savings Goals ----

export type GoalType = 'music_video' | 'album_production' | 'concert' | 'equipment' | 'tour' | 'custom'
export type GoalCurrency = 'ugx' | 'credits' | 'hybrid'
export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled'
export type GoalVisibility = 'private' | 'friends' | 'public'

export interface SavingsGoal {
  id: number
  uuid: string
  type: GoalType
  title: string
  description: string | null
  target_amount: number
  current_amount: number
  currency: GoalCurrency
  deadline: string | null
  status: GoalStatus
  visibility: GoalVisibility

  // Production Details
  production_details: ProductionDetails | null

  // Savings Strategy
  strategy: SavingsStrategy

  // Progress
  progress: GoalProgress

  // Funding Options
  funding_options: FundingOptions

  created_at: string
  updated_at: string
}

export interface ProductionDetails {
  estimated_cost: ProductionCost
  milestones: Milestone[]
  platform_resources_needed?: PlatformResourceRef[]
}

export interface ProductionCost {
  item: string
  base_price: number
  breakdown: {
    pre_production: number
    production: number
    post_production: number
    distribution: number
  }
  platform_discount: number
  final_cost: number
}

export interface Milestone {
  id: string
  name: string
  description: string
  amount_needed: number
  amount_saved: number
  due_date?: string
  completed: boolean
  completed_at?: string
  reward?: {
    type: 'credits' | 'badge' | 'discount'
    value: number | string
  }
}

export interface PlatformResourceRef {
  type: ResourceType
  name: string
  value_ugx: number
}

export interface SavingsStrategy {
  monthly_target: number
  auto_deposit: boolean
  auto_deposit_percentage: number
  credit_conversion_enabled: boolean
}

export interface GoalProgress {
  percentage: number
  milestones_completed: number
  days_remaining: number | null
  on_track: boolean
  projected_completion: string | null
}

export interface FundingOptions {
  loan_eligible: boolean
  loan_amount: number
  co_funding_available: boolean
  crowdfunding_enabled: boolean
  current_tier: FundingTier | null
  next_tier: FundingTier | null
}

export interface FundingTier {
  name: string
  savings_required: number
  savings_percentage: number
  unlocks: {
    loan_amount: number
    loan_interest_rate: number
    platform_resources: string[]
    co_funding_eligible: boolean
    revenue_share_model?: RevenueShareModel
  }
  completed: boolean
}

export interface RevenueShareModel {
  platform_share: number
  duration: number
  cap: number
  artist_minimum?: number
}

export interface CreateGoalData {
  type: GoalType
  title: string
  description?: string
  target_amount: number
  currency: GoalCurrency
  deadline?: string
  visibility?: GoalVisibility
  monthly_target?: number
  auto_deposit?: boolean
  auto_deposit_percentage?: number
  credit_conversion_enabled?: boolean
  production_details?: Partial<ProductionDetails>
}

export interface UpdateGoalData extends Partial<CreateGoalData> {
  status?: GoalStatus
}

// ---- Transactions ----

export interface SaccoTransaction {
  id: number
  type: 'deposit' | 'withdrawal' | 'loan_payment' | 'dividend' | 'share_purchase' | 'credit_conversion' | 'goal_deposit' | 'auto_save'
  amount: number
  description: string
  date: string
  status: 'completed' | 'pending' | 'failed'
  reference?: string
  goal_id?: number
}

// ---- Loans ----

export interface SaccoLoanProduct {
  id: number
  name: string
  code: string
  description: string
  min_amount: number
  max_amount: number
  interest_rate: number
  term_months: number[]
  requirements: string[]
  processing_fee: number
  target_stage?: string[]
  repayment_options?: {
    fixed_monthly: boolean
    revenue_share: boolean
    royalty_deduction: boolean
    hybrid: boolean
  }
  features?: {
    grace_period: number
    early_repayment_discount: number
    production_support: boolean
    mentorship_included: boolean
    marketing_budget?: number
  }
  collateral?: {
    type: 'savings' | 'revenue_share' | 'asset' | 'guarantor'
    percentage: number
  }
}

export interface SaccoLoan {
  id: number
  amount: number
  balance: number
  interest_rate: number
  term_months: number
  monthly_payment: number
  next_payment: number
  due_date: string
  status: 'active' | 'overdue' | 'paid_off' | 'pending' | 'rejected' | 'disbursed'
  product: string
  product_code?: string
  disbursed_at: string | null
  goal_id?: number
  repayment_type?: 'fixed_monthly' | 'revenue_share' | 'royalty_deduction' | 'hybrid'
  revenue_share_percentage?: number
  payments: LoanPayment[]
}

export interface LoanPayment {
  id: number
  amount: number
  date: string
  principal: number
  interest: number
}

export interface LoanApplicationData {
  product_id: number
  amount: number
  term_months: number
  purpose: string
  phone_number: string
  payment_method?: 'mtn_momo' | 'airtel_money'
  goal_id?: number
  repayment_type?: string
}

// ---- Shares ----

export interface SaccoShare {
  total_shares: number
  share_value: number
  total_value: number
  purchases: Array<{
    id: number
    quantity: number
    amount: number
    date: string
  }>
}

export interface SaccoDividend {
  id: number
  year: number
  amount: number
  rate: number
  status: 'paid' | 'pending'
  paid_at: string | null
}

// ---- Platform Resources ----

export type ResourceType = 'studio' | 'equipment' | 'venue' | 'crew' | 'service'
export type ResourceStatus = 'available' | 'booked' | 'maintenance' | 'retired'

export interface PlatformResource {
  id: number
  uuid: string
  type: ResourceType
  name: string
  description: string
  location: string | null
  features: string[]
  photos: string[]
  category?: string

  pricing: {
    hourly_rate: number | null
    daily_rate: number | null
    weekly_rate?: number | null
    monthly_rate: number | null
    replacement_value: number | null
    member_discount_percent: number
  }

  loan_terms: ResourceLoanTerms

  status: ResourceStatus
  available_from: string | null

  // Display extras
  success_stories?: ResourceSuccessStory[]
  condition?: 'excellent' | 'good' | 'fair'
}

export interface ResourceLoanTerms {
  eligibility: {
    min_savings: number
    min_credit_score: number
    min_membership_months: number
    requires_training?: boolean
  }
  loan: {
    max_value: number
    interest_rate: number
    repayment_months: number
    collateral: 'savings' | 'revenue_share' | 'both'
    revenue_share_percent?: number
  }
}

export interface ResourceSuccessStory {
  artist: string
  project: string
  outcome: string
}

export interface ResourceBookingData {
  resource_id: number
  start_date: string
  end_date: string
  purpose: string
  goal_id?: number
  notes?: string
}

export interface ResourceLoan {
  id: number
  uuid: string
  loan_number: string
  resource: PlatformResource
  resource_value: number
  security_deposit: number
  interest_rate: number
  tenure_months: number
  repayment_type: 'fixed_monthly' | 'revenue_share' | 'royalty_deduction' | 'hybrid'
  monthly_payment: number
  amount_paid: number
  balance_remaining: number
  start_date: string
  end_date: string
  status: 'pending' | 'approved' | 'active' | 'completed' | 'defaulted' | 'cancelled'
}

// ---- Productions ----

export type ProductionType = 'music_video' | 'album' | 'concert' | 'tour' | 'other'
export type ProductionStatus = 'planning' | 'in_progress' | 'completed' | 'released' | 'archived'

export interface Production {
  id: number
  uuid: string
  type: ProductionType
  title: string
  description: string | null
  status: ProductionStatus

  budget: {
    total: number
    breakdown: Record<string, number>
    artist_savings: number
    platform_loan: number
    co_funding: number
  }

  performance?: ProductionPerformance

  loan?: ProductionLoan

  timeline: {
    savings_started: string | null
    goal_reached: string | null
    production_started: string | null
    production_completed: string | null
    released: string | null
  }
}

export interface ProductionPerformance {
  views: number
  streams: number
  revenue: {
    ads: number
    streaming: number
    downloads: number
    merchandise: number
    total: number
  }
  roi: {
    percentage: number
    break_even_date: string | null
    total_profit: number
  }
  engagement: {
    likes: number
    comments: number
    shares: number
    saves_to_playlist: number
  }
}

export interface ProductionLoan {
  principal_amount: number
  interest_rate: number
  total_owed: number
  amount_paid: number
  remaining_balance: number
  monthly_payment: number
  revenue_share_owed: number
  on_track: boolean
}

export interface ProductionAnalytics {
  total_productions: number
  total_invested: number
  total_revenue: number
  average_roi: number
  success_rate: {
    break_even: number
    profitable: number
    viral: number
  }
  best_roi: Production | null
  most_viewed: Production | null
  highest_revenue: Production | null
  industry_average: {
    music_video_roi: number
    album_roi: number
    concert_roi: number
  }
  your_average: {
    music_video_roi: number
    album_roi: number
    concert_roi: number
  }
  roi_over_time: Array<{ month: string; roi: number; revenue: number }>
  revenue_breakdown: Array<{ source: string; amount: number; percentage: number }>
  productions: Production[]
}

export interface ProductionForecast {
  next_production: {
    type: string
    estimated_budget: number
    projected_revenue: number
    estimated_roi: number
    confidence: number
  }
  savings_projection: {
    current_rate: number
    estimated_months_to_goal: number
    recommended_monthly_target: number
    fast_track_option: {
      increase_by: number
      reach_goal_by: string
    }
  }
}

// ---- Gamification ----

export type AchievementCategory = 'savings' | 'production' | 'roi' | 'consistency' | 'community'

export interface Achievement {
  id: number
  code: string
  title: string
  description: string
  category: AchievementCategory
  icon: string
  criteria: {
    type: 'amount_saved' | 'goals_completed' | 'roi_achieved' | 'days_streak'
    threshold: number
  }
  reward: {
    credits: number
    badge: string
    perk_unlocked?: string
  }
  progress: {
    current: number
    target: number
    percentage: number
  }
  points: number
  unlocked_at?: string
}

export interface SavingsStreak {
  current_streak: number
  longest_streak: number
  multiplier: number
  next_milestone: {
    days: number
    reward: string
  }
}

export interface LeaderboardEntry {
  rank: number
  artist: {
    id: number
    name: string
    avatar: string | null
    tier: string
  }
  value: number
  badge?: string
  trending: 'up' | 'down' | 'stable'
}

export interface Leaderboard {
  period: 'daily' | 'weekly' | 'monthly' | 'all_time'
  category: 'total_saved' | 'goals_completed' | 'best_roi' | 'fastest_saver'
  rankings: LeaderboardEntry[]
}

export interface Challenge {
  id: number
  title: string
  description: string
  type: 'solo' | 'community' | 'competitive'
  goal: {
    target: number
    metric: 'credits_saved' | 'goals_completed' | 'roi_percentage'
    timeframe: number
  }
  reward: {
    credits: number
    exclusive_perks: string[]
    badge: string
  }
  participants: number
  ends_at: string
  status: 'active' | 'completed' | 'expired'
  my_progress?: {
    current: number
    percentage: number
    joined: boolean
  }
}

export interface SaccoLevel {
  current: number
  title: string
  xp: number
  next_level: {
    xp_needed: number
    title: string
    perks: string[]
  }
}

// ---- Recommendations ----

export interface SavingsRecommendation {
  id: string
  title: string
  description: string
  type: 'strategy' | 'opportunity' | 'warning' | 'milestone'
  priority: 'high' | 'medium' | 'low'
  action: {
    type: 'auto_save' | 'convert_credits' | 'adjust_goal' | 'apply_loan'
    details: Record<string, unknown>
    impact: {
      monthly_savings: number
      time_to_goal: number
      risk_level: 'low' | 'medium' | 'high'
    }
  }
  reasoning: string
}

// ---- Community ----

export interface SuccessStory {
  id: number
  artist: {
    id: number
    name: string
    avatar: string | null
  }
  production: {
    type: ProductionType
    title: string
  }
  story: {
    challenge_faced: string
    how_sacco_helped: string
    results: string
    advice: string
  }
  metrics: {
    saved_amount: number
    time_to_goal: number
    roi: number
  }
  likes: number
  comments_count: number
  created_at: string
}

export interface GroupGoal {
  id: number
  uuid: string
  title: string
  description: string
  type: 'concert' | 'compilation_album' | 'tour' | 'festival'
  participants: Array<{
    artist: {
      id: number
      name: string
      avatar: string | null
    }
    contributed: number
    role: 'organizer' | 'contributor'
  }>
  budget: {
    target: number
    raised: number
    breakdown: Record<string, number>
  }
  revenue_share: {
    model: 'equal' | 'proportional' | 'custom'
    splits: Record<string, number>
  }
  timeline: {
    deadline: string
    event_date?: string
  }
  status: 'fundraising' | 'funded' | 'in_production' | 'completed'
}

// ---- Credit Savings ----

export interface CreditSavingsSystem {
  earning: {
    sources: CreditSource[]
    monthly_average: number
    projected_annual: number
  }
  auto_save: {
    enabled: boolean
    rules: AutoSaveRule[]
    total_saved_this_month: number
  }
  conversion: {
    exchange_rate: number
    daily_limit: number
    monthly_limit: number
    fee_percentage: number
    minimum_conversion: number
  }
  incentives: {
    savings_bonus: number
    streak_multiplier: number
  }
}

export interface CreditSource {
  type: 'streaming' | 'downloads' | 'tips' | 'store_sales' | 'referrals' | 'events'
  monthly_earnings: number
  trend: 'increasing' | 'stable' | 'decreasing'
  growth_rate: number
}

export interface AutoSaveRule {
  id: string
  name: string
  trigger: 'streaming_credits' | 'tip_received' | 'milestone' | 'daily'
  condition: string
  action: {
    save_percentage?: number
    save_amount?: number
    allocate_to_goal?: string
  }
  active: boolean
}

// ---- API Response Wrappers ----

export interface SaccoApiResponse<T> {
  data: T
  message?: string
}

export interface SaccoPaginatedResponse<T> {
  data: T[]
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}
