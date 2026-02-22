import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type {
  EventFilters,
  CartItem,
  EventTicketTier,
  PaymentMethod,
  HybridPaymentCalculation,
  GroupBooking,
  GroupMember,
} from '@/types/events'

// ============================================================================
// Cart & Checkout Store
// ============================================================================

interface EventCartState {
  // Cart
  items: CartItem[]
  eventId: number | null

  // Payment
  paymentMethod: PaymentMethod
  discountCode: string
  discountAmount: number

  // Hybrid Payment
  hybridCalculation: HybridPaymentCalculation | null
  creditsToUse: number

  // Computed
  subtotal: number
  platformFee: number
  total: number

  // Actions
  addToCart: (tier: EventTicketTier, quantity: number) => void
  removeFromCart: (tierId: number) => void
  updateQuantity: (tierId: number, quantity: number) => void
  clearCart: () => void
  setEventId: (eventId: number) => void
  setPaymentMethod: (method: PaymentMethod) => void
  setDiscountCode: (code: string) => void
  applyDiscount: (amount: number) => void
  setCreditsToUse: (credits: number) => void
  setHybridCalculation: (calc: HybridPaymentCalculation | null) => void
}

function calculateTotals(items: CartItem[], discountAmount: number) {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
  const platformFee = Math.round(subtotal * 0.05) // 5% platform fee
  const total = Math.max(0, subtotal + platformFee - discountAmount)
  return { subtotal, platformFee, total }
}

export const useEventCartStore = create<EventCartState>()(
  devtools(
    (set, get) => ({
      items: [],
      eventId: null,
      paymentMethod: 'ugx',
      discountCode: '',
      discountAmount: 0,
      hybridCalculation: null,
      creditsToUse: 0,
      subtotal: 0,
      platformFee: 0,
      total: 0,

      addToCart: (tier, quantity) => {
        const state = get()
        const existing = state.items.find(item => item.ticket_tier_id === tier.id)

        let newItems: CartItem[]
        if (existing) {
          newItems = state.items.map(item =>
            item.ticket_tier_id === tier.id
              ? {
                ...item,
                quantity: Math.min(quantity, tier.max_per_order),
                subtotal: Math.min(quantity, tier.max_per_order) * item.unit_price,
              }
              : item
          )
        } else {
          newItems = [
            ...state.items,
            {
              ticket_tier_id: tier.id,
              ticket_tier: tier,
              quantity: Math.min(quantity, tier.max_per_order),
              unit_price: tier.price,
              subtotal: Math.min(quantity, tier.max_per_order) * tier.price,
            },
          ]
        }

        const totals = calculateTotals(newItems, state.discountAmount)
        set({ items: newItems, ...totals })
      },

      removeFromCart: (tierId) => {
        const state = get()
        const newItems = state.items.filter(item => item.ticket_tier_id !== tierId)
        const totals = calculateTotals(newItems, state.discountAmount)
        set({ items: newItems, ...totals })
      },

      updateQuantity: (tierId, quantity) => {
        const state = get()
        const newItems = state.items.map(item =>
          item.ticket_tier_id === tierId
            ? {
              ...item,
              quantity,
              subtotal: quantity * item.unit_price,
            }
            : item
        )
        const totals = calculateTotals(newItems, state.discountAmount)
        set({ items: newItems, ...totals })
      },

      clearCart: () =>
        set({
          items: [],
          eventId: null,
          paymentMethod: 'ugx',
          discountCode: '',
          discountAmount: 0,
          hybridCalculation: null,
          creditsToUse: 0,
          subtotal: 0,
          platformFee: 0,
          total: 0,
        }),

      setEventId: (eventId) => set({ eventId }),
      setPaymentMethod: (method) => set({ paymentMethod: method }),
      setDiscountCode: (code) => set({ discountCode: code }),
      applyDiscount: (amount) => {
        const state = get()
        const totals = calculateTotals(state.items, amount)
        set({ discountAmount: amount, ...totals })
      },
      setCreditsToUse: (credits) => set({ creditsToUse: credits }),
      setHybridCalculation: (calc) => set({ hybridCalculation: calc }),
    }),
    { name: 'event-cart' }
  )
)

// ============================================================================
// Event Filters Store
// ============================================================================

interface EventFiltersState {
  filters: EventFilters
  view: 'grid' | 'list' | 'map'
  setFilter: <K extends keyof EventFilters>(key: K, value: EventFilters[K]) => void
  setFilters: (filters: Partial<EventFilters>) => void
  resetFilters: () => void
  setView: (view: 'grid' | 'list' | 'map') => void
}

const defaultFilters: EventFilters = {
  sort: 'date_asc',
}

export const useEventFiltersStore = create<EventFiltersState>()(
  devtools(
    (set) => ({
      filters: defaultFilters,
      view: 'grid',

      setFilter: (key, value) =>
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        })),

      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),

      resetFilters: () => set({ filters: defaultFilters }),

      setView: (view) => set({ view }),
    }),
    { name: 'event-filters' }
  )
)

// ============================================================================
// Group Booking Store
// ============================================================================

interface GroupBookingState {
  activeGroup: GroupBooking | null
  members: GroupMember[]
  inviteLink: string | null

  setActiveGroup: (group: GroupBooking | null) => void
  setMembers: (members: GroupMember[]) => void
  addMember: (member: GroupMember) => void
  removeMember: (memberId: number) => void
  updateMemberStatus: (memberId: number, status: GroupMember['status']) => void
  setInviteLink: (link: string | null) => void
  reset: () => void
}

export const useGroupBookingStore = create<GroupBookingState>()(
  devtools(
    (set) => ({
      activeGroup: null,
      members: [],
      inviteLink: null,

      setActiveGroup: (group) => set({ activeGroup: group }),
      setMembers: (members) => set({ members }),
      addMember: (member) =>
        set((state) => ({ members: [...state.members, member] })),
      removeMember: (memberId) =>
        set((state) => ({
          members: state.members.filter(m => m.id !== memberId),
        })),
      updateMemberStatus: (memberId, status) =>
        set((state) => ({
          members: state.members.map(m =>
            m.id === memberId ? { ...m, status } : m
          ),
        })),
      setInviteLink: (link) => set({ inviteLink: link }),
      reset: () =>
        set({ activeGroup: null, members: [], inviteLink: null }),
    }),
    { name: 'group-booking' }
  )
)
