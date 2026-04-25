export type ObservabilityTab =
  | 'overview'
  | 'threats'
  | 'entry-points'
  | 'attackers'
  | 'bots'
  | 'auth-sessions'
  | 'payments-risk'
  | 'system-host'
  | 'database'
  | 'audit-trail'
  | 'changes'
  | 'incidents';

export interface ObservabilityFilters {
  from?: string;
  to?: string;
  severity: string[];
  domain: string[];
  category: string[];
  outcome: string[];
  route?: string;
  actor_type: string[];
  user_id?: string;
  admin_id?: string;
  ip?: string;
  asn?: string;
  country?: string;
  payment_reference?: string;
  host?: string;
  container?: string;
  incident_id?: string;
  search?: string;
}

export interface ObservabilityEvent {
  id: number;
  occurred_at: string | null;
  domain: string;
  category: string;
  outcome: string;
  severity: string;
  title: string;
  summary: string;
  source: {
    ip?: string | null;
    country?: string | null;
    asn?: string | null;
    user_agent?: string | null;
  };
  actor: {
    type?: string | null;
    id?: string | null;
    label?: string | null;
  };
  target: {
    route?: string | null;
    method?: string | null;
    resource_type?: string | null;
    resource_id?: string | null;
  };
  attack: {
    technique?: string | null;
    pattern?: string | null;
  };
  infra: {
    host?: string | null;
    environment?: string | null;
  };
  correlation: {
    request_id?: string | null;
    trace_id?: string | null;
    session_id?: string | null;
    incident_id?: string | null;
  };
  risk: {
    score: number;
    reasons: string[];
  };
  details: Record<string, unknown>;
  raw_ref: Record<string, unknown>;
}

export interface ObservabilityEventDetail {
  event: ObservabilityEvent;
  related_events: ObservabilityEvent[];
  entities: ObservabilityEntity[];
  raw: Record<string, unknown>;
  timeline: ObservabilityEvent[];
  pivot_targets: {
    attacker?: string | null;
    session_id?: string | null;
    payment_reference?: string | null;
    incident_id?: string | null;
  };
}

export interface ObservabilityEntity {
  id: number;
  entity_key: string;
  entity_type: string;
  label: string;
  risk_score: number;
  first_seen_at?: string | null;
  last_seen_at?: string | null;
  metadata: Record<string, unknown>;
}

export interface EntryPointRow {
  entry_key: string;
  label: string;
  subsystem: string;
  route_pattern: string;
  methods: string[];
  exposure_type: string;
  criticality: string;
  totals: {
    hits: number;
    unique_sources: number;
    blocked: number;
    failed: number;
    success: number;
    suspicious: number;
  };
  risk_score: number;
  last_seen_at?: string | null;
  metadata: Record<string, unknown>;
}

export interface AttackerRow extends ObservabilityEntity {
  first_seen?: string | null;
  last_seen?: string | null;
  attempts: number;
  blocked: number;
  successful: number;
  routes: string[];
}

export interface AttackerDetail {
  attacker: AttackerRow;
  events: ObservabilityEvent[];
}

export interface SessionDetail {
  session: {
    session_id: string;
    event_count: number;
    max_risk_score: number;
    first_seen_at?: string | null;
    last_seen_at?: string | null;
    source_ips: string[];
    actors: string[];
    outcomes: Record<string, number>;
  };
  events: ObservabilityEvent[];
}

export interface PaymentRiskDetail {
  payment_reference: string;
  payment?: Record<string, unknown> | null;
  issues: Array<Record<string, unknown>>;
  timeline: Array<Record<string, unknown>>;
  summary: {
    event_count: number;
    max_risk_score: number;
    source_ips: string[];
    outcomes: Record<string, number>;
    last_seen_at?: string | null;
  };
  events: ObservabilityEvent[];
}

export interface IncidentRow {
  id: number;
  incident_key: string;
  title: string;
  status: string;
  severity: string;
  summary?: string | null;
  notes?: string | null;
  owner?: {
    id: number;
    name: string;
    email: string;
  } | null;
  detected_at?: string | null;
  started_at?: string | null;
  resolved_at?: string | null;
  event_ids?: number[];
  note_count?: number;
  activity_count?: number;
  last_activity_at?: string | null;
  metadata: Record<string, unknown>;
}

export interface IncidentActivityEntry {
  action: string;
  performed_at?: string | null;
  performed_by?: {
    id?: number;
    name?: string;
    email?: string;
  } | null;
  context: Record<string, unknown>;
}

export interface IncidentNoteEntry {
  body: string;
  created_at?: string | null;
  created_by?: {
    id?: number;
    name?: string;
    email?: string;
  } | null;
}

export interface IncidentSuggestionRow {
  suggestion_key: string;
  title: string;
  summary: string;
  severity: string;
  status: string;
  event_ids: number[];
  event_count: number;
  risk_score: number;
  first_seen_at?: string | null;
  last_seen_at?: string | null;
  domains: string[];
  outcomes: Record<string, number>;
  source_ips: string[];
  top_routes: string[];
  top_attack_patterns: string[];
  top_actors: string[];
  sample_event: ObservabilityEvent;
}

export interface IncidentDetail {
  incident: IncidentRow;
  summary: {
    event_count: number;
    entity_count: number;
    max_risk_score: number;
    sources: string[];
    domains: Record<string, number>;
    outcomes: Record<string, number>;
  };
  events: ObservabilityEvent[];
  entities: ObservabilityEntity[];
  timeline: ObservabilityEvent[];
}

export interface StakeholderRiskRow {
  actor_id: string;
  actor_type: string;
  label: string;
  email?: string | null;
  last_login_at?: string | null;
  last_admin_login_at?: string | null;
  risk_score: number;
  total_events: number;
  payment_events: number;
  admin_events: number;
  successful_suspicious_events: number;
}

export interface StakeholderDetail {
  actor: StakeholderRiskRow;
  summary: {
    source_ips: string[];
    domains: Record<string, number>;
    outcomes: Record<string, number>;
    last_seen_at?: string | null;
  };
  events: ObservabilityEvent[];
}

export interface IntegrationProviderRow {
  provider: string;
  total_events: number;
  signature_failures: number;
  replays: number;
  missing_references: number;
  payment_not_found: number;
  successful_callbacks: number;
  max_risk_score: number;
  last_seen_at?: string | null;
}

export interface CollectorHostRow {
  host: string;
  events: number;
  domains: string[];
  streams: string[];
  max_risk_score: number;
  max_severity: string;
  status: 'healthy' | 'stale' | string;
  /** Presentational state derived server-side: 'ok' | 'stale' | 'down'. See rebuild plan §4 item 5. */
  state?: 'ok' | 'stale' | 'down' | string;
  last_seen_at?: string | null;
  /** Alias for `last_seen_at` — the preferred name going forward. */
  last_heartbeat_at?: string | null;
  coverage_score: number;
  missing_signals: string[];
}

export interface CollectorBreakdownRow {
  type: string;
  events: number;
  max_risk_score: number;
  last_seen_at?: string | null;
}

export interface CollectorStreamRow {
  stream: string;
  events: number;
  hosts: number;
  max_risk_score: number;
}

export interface SystemHostDetail {
  health: Record<string, unknown>;
  tests: unknown[];
  deployment: Record<string, unknown>;
  collector: {
    summary: {
      events: number;
      hosts: number;
      system_signals: number;
      db_signals: number;
      stale_sources: number;
      healthy_sources: number;
      reporting_streams: number;
      telemetry_gaps: number;
      critical_system_signals: number;
      uncovered_signal_classes: number;
      last_seen_at?: string | null;
      stale_after_minutes: number;
    };
    hosts: CollectorHostRow[];
    stream_summary: CollectorStreamRow[];
    system_breakdown: CollectorBreakdownRow[];
    uncovered_signals: string[];
    priority_alerts: ObservabilityEvent[];
    recent: ObservabilityEvent[];
  };
  rollups?: {
    domains: Array<{
      bucket_start?: string | null;
      dimension_key: string;
      total_events: number;
      suspicious_events: number;
      avg_risk_score: number;
    }>;
  };
  changes: ObservabilityEvent[];
}

export interface DatabaseCollectorBreakdownRow {
  type: string;
  events: number;
  max_risk_score: number;
  last_seen_at?: string | null;
}
