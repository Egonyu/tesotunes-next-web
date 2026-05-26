/**
 * Types for the rebuilt security console. These mirror the push-based read
 * API exposed under `/api/admin/observability/console/*`
 * (SecurityConsoleController + SecurityEventResource).
 */

export type SecurityDomain = 'auth' | 'payments' | 'api' | 'integrity' | 'system';
export type EventOutcome = 'success' | 'failed' | 'blocked' | 'suspicious';
export type EventSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus =
  | 'open'
  | 'investigating'
  | 'acknowledged'
  | 'resolved'
  | 'closed';

export interface SecurityEvent {
  id: number;
  event_key: string;
  occurred_at: string | null;
  domain: string;
  category: string;
  outcome: string;
  severity: string;
  title: string;
  summary: string | null;
  risk: { score: number; reasons: string[] };
  actor: { type: string | null; id: string | null; label: string | null };
  source: {
    ip: string | null;
    country: string | null;
    asn: string | null;
    user_agent: string | null;
  };
  target: {
    route: string | null;
    method: string | null;
    resource_type: string | null;
    resource_id: string | null;
  };
  attack: { technique: string | null; pattern: string | null };
  correlation: {
    request_id: string | null;
    trace_id: string | null;
    session_id: string | null;
    incident_key: string | null;
  };
  host: string | null;
  environment: string | null;
  event_type: string | null;
  details: Record<string, unknown>;
}

export interface RiskEntity {
  entity_key: string;
  entity_type: string;
  label: string;
  risk_score: number;
  last_seen_at: string | null;
}

export interface SecurityPosture {
  window: { from: string; to: string };
  kpis: {
    open_incidents: number;
    critical_incidents: number;
    events: number;
    high_risk_events: number;
    failed_logins: number;
    webhook_failures: number;
    blocked_api: number;
  };
  by_domain: Record<string, number>;
  by_severity: Record<string, number>;
  top_risk_entities: RiskEntity[];
}

export interface SecurityIncident {
  id: number;
  incident_key: string;
  title: string;
  status: IncidentStatus;
  severity: EventSeverity;
  summary: string | null;
  event_count: number;
  owner: { id: number; name: string } | null;
  detected_at: string | null;
  resolved_at: string | null;
  metadata: Record<string, unknown>;
}

export interface DomainSummary {
  domain: string;
  window: { from: string; to: string };
  total: number;
  by_outcome: Record<string, number>;
  by_category: Record<string, number>;
  top_sources: Array<{ ip: string; events: number; max_risk: number }>;
}

export interface FeedMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface FeedResponse {
  data: SecurityEvent[];
  meta: FeedMeta;
}

export interface FeedFilters {
  domain?: string;
  severity?: string;
  outcome?: string;
  min_risk?: number;
  search?: string;
  per_page?: number;
}
