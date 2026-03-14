'use client'

import { PlannedFeatureState } from '@/components/sacco/shared'

export default function SaccoWithdrawalsPage() {
  return (
    <PlannedFeatureState
      title="Withdrawal Requests"
      description="Formal withdrawal-request workflows still need approval rules and backend support before they can go live."
      phase="Needs workflow design"
    />
  )
}
