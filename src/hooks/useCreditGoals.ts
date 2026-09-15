import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";

/**
 * Credit goals — mirrors CreditMilestoneService::milestonesFor.
 *
 * Progress counts credits earned through activity only. Purchases, refunds
 * and transfers never move a member toward a goal.
 */

export type CreditGoalStatus = "locked" | "claimable" | "claimed";

export interface CreditGoal {
  id: number;
  key: string;
  name: string;
  description: string;
  credits_required: number;
  remaining: number;
  reward_type: string;
  reward_value: number;
  badge_name: string;
  badge_icon: string;
  badge_tier: string;
  status: CreditGoalStatus;
  claimed_at: string | null;
  progress: number;
}

/** The dashboard summary, sent as `wallet.goals` on /credits/dashboard. */
export interface CreditGoalsSummary {
  activity_credits: number;
  next: CreditGoal | null;
  claimable: number;
}

interface CreditGoalsResponse {
  success: boolean;
  data: {
    activity_credits: number;
    milestones: CreditGoal[];
  };
}

export function useCreditGoals() {
  return useQuery({
    queryKey: ["credits", "goals"],
    queryFn: () => apiGet<CreditGoalsResponse>("/credits/goals").then((res) => res.data),
  });
}

export function useClaimCreditGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (goalId: number) =>
      apiPost<{ success: boolean; message: string; data: { credits_awarded: number } }>(
        `/credits/goals/${goalId}/claim`
      ),
    onSuccess: () => {
      // Balance, dashboard summary and the goal list all change on a claim.
      queryClient.invalidateQueries({ queryKey: ["credits"] });
    },
  });
}
