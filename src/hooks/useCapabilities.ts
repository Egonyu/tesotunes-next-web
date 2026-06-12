import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { apiGet, apiPost } from "@/lib/api";

export type CapabilityName = "artist" | "seller" | "organizer" | "promoter" | "label";

export type CapabilityStatus = "none" | "pending" | "granted" | "rejected" | "suspended" | "revoked";

export interface CapabilityPosture {
  capability: CapabilityName;
  label: string;
  status: CapabilityStatus;
  applied_at: string | null;
  granted_at: string | null;
  status_reason: string | null;
}

/** The account's posture across all capabilities (artist, seller, organizer, promoter, label). */
export function useCapabilities() {
  const { data: session, status } = useSession();
  const hasApiAccess = session?.user?.apiAuthorized ?? false;

  return useQuery({
    queryKey: ["capabilities"],
    queryFn: () => apiGet<{ data: CapabilityPosture[] }>("/capabilities").then((r) => r.data),
    staleTime: 60_000,
    enabled: status === "authenticated" && hasApiAccess,
  });
}

export interface OrganizerApplication {
  organization_name: string;
  phone: string;
  city?: string;
  experience_summary: string;
  website_url?: string;
  expected_events_per_year?: number;
}

export function useApplyOrganizer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (application: OrganizerApplication) =>
      apiPost<{ success: boolean; message: string; data: { status: string } }>(
        "/capabilities/organizer/apply",
        application,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["capabilities"] });
    },
  });
}
