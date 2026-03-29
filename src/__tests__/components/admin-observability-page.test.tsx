import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@/test/test-utils';

jest.mock('@/lib/api', () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPatch: jest.fn(),
}));

const replaceMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => '/admin/observability',
  useSearchParams: () => new URLSearchParams(),
}));

import ObservabilityPage from '@/app/(admin)/admin/observability/page';
import { apiGet, apiPatch, apiPost } from '@/lib/api';
import { useObservabilityStore } from '@/stores';

const mockApiGet = apiGet as jest.MockedFunction<typeof apiGet>;
const mockApiPost = apiPost as jest.MockedFunction<typeof apiPost>;
const mockApiPatch = apiPatch as jest.MockedFunction<typeof apiPatch>;

describe('Admin ObservabilityPage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    replaceMock.mockReset();
    useObservabilityStore.setState({
      activeTab: 'overview',
      filters: {
        severity: [],
        domain: [],
        category: [],
        outcome: [],
        actor_type: [],
      },
    });

    mockApiPost.mockResolvedValue({ data: { id: 33, title: 'Login Failed investigation', status: 'open', severity: 'high', metadata: {}, event_ids: [1] } } as never);
    mockApiPatch.mockResolvedValue({ data: { id: 21, title: 'Auth spike', status: 'resolved', severity: 'high', metadata: {}, event_ids: [] } } as never);

    mockApiGet.mockImplementation(async (url) => {
      if (url === '/admin/observability/overview') {
        return {
          data: {
            summary: {
              active_threats: 3,
              suspicious_successes: 1,
              bot_pressure: 7,
              unresolved_incidents: 2,
              collector_stale_sources: 1,
              collector_reporting_hosts: 2,
              collector_telemetry_gaps: 2,
              critical_system_signals: 1,
              db_auth_failures: 2,
              db_privileged_writes: 1,
              db_destructive_queries: 1,
            },
            top_attacked_endpoints: [{ route: '/api/login', total: 12 }],
            recent_events: [{
              id: 1,
              occurred_at: '2026-03-29T09:00:00Z',
              domain: 'auth',
              category: 'auth',
              outcome: 'failed',
              severity: 'high',
              title: 'Login Failed',
              summary: 'Credential attack',
              source: { ip: '198.51.100.42' },
              actor: { type: 'guest', label: 'Guest' },
              target: { route: '/api/login', method: 'POST' },
              attack: { technique: 'credential_stuffing', pattern: 'burst' },
              infra: {},
              correlation: {},
              risk: { score: 81, reasons: ['repeat-velocity'] },
              details: {},
              raw_ref: { table: 'audit_logs', id: 1 },
            }],
          },
        } as never;
      }

      if (url === '/admin/observability/events') {
        return {
          data: [{
            id: 1,
            occurred_at: '2026-03-29T09:00:00Z',
            domain: 'auth',
            category: 'auth',
            outcome: 'failed',
            severity: 'high',
            title: 'Login Failed',
            summary: 'Credential attack',
            source: { ip: '198.51.100.42' },
            actor: { type: 'guest', label: 'Guest' },
            target: { route: '/api/login', method: 'POST' },
            attack: { technique: 'credential_stuffing', pattern: 'burst' },
            infra: {},
            correlation: {},
            risk: { score: 81, reasons: ['repeat-velocity'] },
            details: {},
            raw_ref: { table: 'audit_logs', id: 1 },
          }],
          meta: { total: 1 },
        } as never;
      }

      if (url === '/admin/observability/entry-points') {
        return { data: [] } as never;
      }

      if (url === '/admin/observability/attackers') {
        return {
          data: [{
            id: 11,
            entity_key: 'ip:198.51.100.42',
            entity_type: 'ip',
            label: '198.51.100.42',
            risk_score: 88,
            metadata: {},
            attempts: 14,
            blocked: 10,
            successful: 1,
            routes: ['/api/login'],
          }],
        } as never;
      }

      if (url === '/admin/observability/attackers/11') {
        return {
          data: {
            attacker: {
              id: 11,
              entity_key: 'ip:198.51.100.42',
              entity_type: 'ip',
              label: '198.51.100.42',
              risk_score: 88,
              metadata: {},
              attempts: 14,
              blocked: 10,
              successful: 1,
              routes: ['/api/login'],
              first_seen: '2026-03-29T08:00:00Z',
              last_seen: '2026-03-29T09:00:00Z',
            },
            events: [{
              id: 1,
              occurred_at: '2026-03-29T09:00:00Z',
              domain: 'auth',
              category: 'auth',
              outcome: 'failed',
              severity: 'high',
              title: 'Login Failed',
              summary: 'Credential attack',
              source: { ip: '198.51.100.42' },
              actor: { type: 'guest', label: 'Guest' },
              target: { route: '/api/login', method: 'POST' },
              attack: { technique: 'credential_stuffing', pattern: 'burst' },
              infra: {},
              correlation: {},
              risk: { score: 81, reasons: ['repeat-velocity'] },
              details: {},
              raw_ref: { table: 'audit_logs', id: 1 },
            }],
          },
        } as never;
      }

      if (url === '/admin/observability/bots') {
        return { data: { summary: { events: 7, blocked: 5, successful: 1, top_404_scanners: 3 }, top_bots: [] } } as never;
      }

      if (url === '/admin/observability/auth-sessions') {
        return { data: { summary: { failed_logins: 9, successful_logins: 2, suspicious_successes: 1 }, recent: [] } } as never;
      }

      if (url === '/admin/observability/auth-sessions/sess-test-1') {
        return {
          data: {
            session: {
              session_id: 'sess-test-1',
              event_count: 1,
              max_risk_score: 81,
              first_seen_at: '2026-03-29T09:00:00Z',
              last_seen_at: '2026-03-29T09:00:00Z',
              source_ips: ['198.51.100.42'],
              actors: ['Guest'],
              outcomes: { failed: 1 },
            },
            events: [{
              id: 1,
              occurred_at: '2026-03-29T09:00:00Z',
              domain: 'auth',
              category: 'auth',
              outcome: 'failed',
              severity: 'high',
              title: 'Login Failed',
              summary: 'Credential attack',
              source: { ip: '198.51.100.42' },
              actor: { type: 'guest', label: 'Guest' },
              target: { route: '/api/login', method: 'POST' },
              attack: { technique: 'credential_stuffing', pattern: 'burst' },
              infra: {},
              correlation: { session_id: 'sess-test-1' },
              risk: { score: 81, reasons: ['repeat-velocity'] },
              details: {},
              raw_ref: { table: 'audit_logs', id: 1 },
            }],
          },
        } as never;
      }

      if (url === '/admin/observability/payments-risk') {
        return { data: { dashboard: { summary: { completed: 4, failed: 1, open_issues: 1, invalid_webhook_signatures: 1 } }, high_risk_events: [] } } as never;
      }

      if (url === '/admin/observability/payments-risk/OBS-RISK-001') {
        return {
          data: {
            payment_reference: 'OBS-RISK-001',
            payment: {
              id: 41,
              payment_reference: 'OBS-RISK-001',
              status: 'completed',
              amount: 25000,
            },
            issues: [{
              id: 91,
              issue_type: 'invalid_webhook_signature',
              severity: 'critical',
              status: 'open',
              title: 'Invalid webhook signature',
            }],
            timeline: [{
              id: 501,
              action: 'payment_webhook_signature_failed',
              created_at: '2026-03-29T09:00:00Z',
            }],
            summary: {
              event_count: 1,
              max_risk_score: 90,
              source_ips: ['203.0.113.99'],
              outcomes: { suspicious: 1 },
              last_seen_at: '2026-03-29T09:00:00Z',
            },
            events: [{
              id: 4,
              occurred_at: '2026-03-29T09:00:00Z',
              domain: 'payments',
              category: 'webhook',
              outcome: 'suspicious',
              severity: 'critical',
              title: 'Webhook signature failed',
              summary: 'Rejected suspicious payment callback',
              source: { ip: '203.0.113.99' },
              actor: { type: 'service', label: 'zengapay' },
              target: { route: '/api/webhooks/zengapay', method: 'POST' },
              attack: { pattern: 'invalid_signature' },
              infra: {},
              correlation: {},
              risk: { score: 90, reasons: ['webhook-signature-failed'] },
              details: { payment_reference: 'OBS-RISK-001' },
              raw_ref: { table: 'audit_logs', id: 4 },
            }],
          },
        } as never;
      }

      if (url === '/admin/observability/database') {
        return {
          data: {
            summary: { events: 3, auth_failures: 1, privileged_writes: 1, schema_changes: 0, destructive_queries: 1 },
            collector_breakdown: [{
              type: 'auth_failures',
              events: 1,
              max_risk_score: 93,
              last_seen_at: '2026-03-29T09:15:00Z',
            }, {
              type: 'privileged_writes',
              events: 1,
              max_risk_score: 88,
              last_seen_at: '2026-03-29T09:16:00Z',
            }, {
              type: 'destructive_queries',
              events: 1,
              max_risk_score: 97,
              last_seen_at: '2026-03-29T09:17:00Z',
            }],
            priority_alerts: [{
              id: 63,
              occurred_at: '2026-03-29T09:17:00Z',
              domain: 'db',
              category: 'db',
              outcome: 'suspicious',
              severity: 'critical',
              title: 'Destructive query detected',
              summary: 'Collector detected destructive query activity on prod DB.',
              source: { ip: '203.0.113.11' },
              actor: { type: 'service', label: 'collector-agent' },
              target: { route: 'postgres://prod-db-1', resource_id: 'prod-db-1' },
              attack: { pattern: 'destructive_query' },
              infra: { host: 'prod-db-1' },
              correlation: {},
              risk: { score: 97, reasons: ['collector-destructive-query'] },
              details: {},
              raw_ref: { source: 'collector', stream: 'database' },
            }],
            collector_recent: [{
              id: 61,
              occurred_at: '2026-03-29T09:14:00Z',
              domain: 'db',
              category: 'db',
              outcome: 'suspicious',
              severity: 'critical',
              title: 'Database auth failures',
              summary: 'Collector detected repeated database authentication failures.',
              source: { ip: '203.0.113.11' },
              actor: { type: 'service', label: 'collector-agent' },
              target: { route: 'postgres://prod-db-1', resource_id: 'prod-db-1' },
              attack: { pattern: 'auth_failure' },
              infra: { host: 'prod-db-1' },
              correlation: {},
              risk: { score: 93, reasons: ['collector-db-auth-failures'] },
              details: {},
              raw_ref: { source: 'collector', stream: 'database' },
            }, {
              id: 62,
              occurred_at: '2026-03-29T09:16:00Z',
              domain: 'db',
              category: 'db',
              outcome: 'suspicious',
              severity: 'high',
              title: 'Privileged write burst',
              summary: 'Collector detected unexpected privileged writes on prod DB.',
              source: { ip: '203.0.113.11' },
              actor: { type: 'service', label: 'collector-agent' },
              target: { route: 'postgres://prod-db-1', resource_id: 'prod-db-1' },
              attack: { pattern: 'privileged_write' },
              infra: { host: 'prod-db-1' },
              correlation: {},
              risk: { score: 88, reasons: ['collector-privileged-write'] },
              details: {},
              raw_ref: { source: 'collector', stream: 'database' },
            }, {
              id: 63,
              occurred_at: '2026-03-29T09:17:00Z',
              domain: 'db',
              category: 'db',
              outcome: 'suspicious',
              severity: 'critical',
              title: 'Destructive query detected',
              summary: 'Collector detected destructive query activity on prod DB.',
              source: { ip: '203.0.113.11' },
              actor: { type: 'service', label: 'collector-agent' },
              target: { route: 'postgres://prod-db-1', resource_id: 'prod-db-1' },
              attack: { pattern: 'destructive_query' },
              infra: { host: 'prod-db-1' },
              correlation: {},
              risk: { score: 97, reasons: ['collector-destructive-query'] },
              details: {},
              raw_ref: { source: 'collector', stream: 'database' },
            }],
            stats: { failed_auth: 1 },
            slow_queries: [{ query: 'select * from payments where status = ?', time: 420 }],
            recent: [{
              id: 6,
              occurred_at: '2026-03-29T09:15:00Z',
              domain: 'database',
              category: 'db',
              outcome: 'suspicious',
              severity: 'high',
              title: 'Suspicious payment query burst',
              summary: 'Elevated reads against payment records',
              source: { ip: '198.51.100.42' },
              actor: { type: 'admin', id: '7', label: 'Ops Lead' },
              target: { route: '/admin/payments', method: 'GET', resource_type: 'payment' },
              attack: { pattern: 'query_burst' },
              infra: {},
              correlation: { session_id: 'sess-test-1' },
              risk: { score: 78, reasons: ['db-query-burst'] },
              details: { payment_reference: 'OBS-RISK-001' },
              raw_ref: { table: 'slow_queries', id: 1 },
            }],
          },
        } as never;
      }

      if (url === '/admin/observability/system-host') {
        return {
          data: {
            health: { status: 'degraded' },
            deployment: { version: '2026.03.29' },
            rollups: {
              domains: [{
                bucket_start: '2026-03-29T09:00:00Z',
                dimension_key: 'system',
                total_events: 2,
                suspicious_events: 2,
                avg_risk_score: 79,
              }, {
                bucket_start: '2026-03-29T09:00:00Z',
                dimension_key: 'db',
                total_events: 1,
                suspicious_events: 1,
                avg_risk_score: 93,
              }],
            },
            collector: {
              summary: {
                events: 2,
                hosts: 2,
                system_signals: 1,
                db_signals: 1,
                stale_sources: 1,
                healthy_sources: 1,
                reporting_streams: 2,
                telemetry_gaps: 2,
                critical_system_signals: 1,
                uncovered_signal_classes: 3,
                last_seen_at: '2026-03-29T09:20:00Z',
                stale_after_minutes: 15,
              },
              stream_summary: [{
                stream: 'ssh',
                events: 1,
                hosts: 1,
                max_risk_score: 84,
              }, {
                stream: 'database',
                events: 1,
                hosts: 1,
                max_risk_score: 93,
              }],
              system_breakdown: [{
                type: 'ssh',
                events: 1,
                max_risk_score: 84,
                last_seen_at: '2026-03-29T09:20:00Z',
              }],
              uncovered_signals: ['sudo', 'process_execution', 'firewall'],
              hosts: [{
                host: 'prod-web-1',
                events: 1,
                domains: ['system'],
                streams: ['ssh'],
                max_risk_score: 84,
                max_severity: 'high',
                status: 'stale',
                last_seen_at: '2026-03-29T09:20:00Z',
                coverage_score: 25,
                missing_signals: ['sudo', 'process_execution', 'firewall'],
              }, {
                host: 'prod-db-1',
                events: 1,
                domains: ['db'],
                streams: ['database'],
                max_risk_score: 93,
                max_severity: 'critical',
                status: 'healthy',
                last_seen_at: '2026-03-29T09:21:00Z',
                coverage_score: 0,
                missing_signals: ['ssh', 'sudo', 'process_execution', 'firewall'],
              }],
              priority_alerts: [{
                id: 71,
                occurred_at: '2026-03-29T09:20:00Z',
                domain: 'system',
                category: 'system',
                outcome: 'suspicious',
                severity: 'high',
                title: 'SSH failure burst',
                summary: 'Collector detected repeated SSH failures on prod host.',
                source: { ip: '203.0.113.11' },
                actor: { type: 'service', label: 'collector-agent' },
                target: { route: 'ssh://prod-web-1', resource_id: 'prod-web-1' },
                attack: { pattern: 'ssh_failures' },
                infra: { host: 'prod-web-1' },
                correlation: {},
                risk: { score: 84, reasons: ['collector-ssh-failures'] },
                details: {},
                raw_ref: { source: 'collector', stream: 'ssh' },
              }],
              recent: [{
                id: 71,
                occurred_at: '2026-03-29T09:20:00Z',
                domain: 'system',
                category: 'system',
                outcome: 'suspicious',
                severity: 'high',
                title: 'SSH failure burst',
                summary: 'Collector detected repeated SSH failures on prod host.',
                source: { ip: '203.0.113.11' },
                actor: { type: 'service', label: 'collector-agent' },
                target: { route: 'ssh://prod-web-1', resource_id: 'prod-web-1' },
                attack: { pattern: 'ssh_failures' },
                infra: { host: 'prod-web-1' },
                correlation: {},
                risk: { score: 84, reasons: ['collector-ssh-failures'] },
                details: {},
                raw_ref: { source: 'collector', stream: 'ssh' },
              }],
            },
            changes: [{
              id: 7,
              occurred_at: '2026-03-29T09:20:00Z',
              domain: 'system',
              category: 'system',
              outcome: 'suspicious',
              severity: 'high',
              title: 'Service restart after webhook pressure',
              summary: 'Worker service restarted during elevated payment risk',
              source: { ip: '198.51.100.42' },
              actor: { type: 'service', label: 'systemd' },
              target: { route: '/workers/payments' },
              attack: {},
              infra: { host: 'prod-web-1' },
              correlation: { session_id: 'sess-test-1' },
              risk: { score: 74, reasons: ['service-restart-during-incident'] },
              details: { payment_reference: 'OBS-RISK-001' },
              raw_ref: { table: 'system_changes', id: 7 },
            }],
          },
        } as never;
      }

      if (url === '/admin/observability/changes') {
        return {
          data: {
            integrity_snapshots: [{ path: '.env', status: 'changed' }],
            recent: [{
              id: 8,
              occurred_at: '2026-03-29T09:25:00Z',
              domain: 'system',
              category: 'system',
              outcome: 'suspicious',
              severity: 'critical',
              title: 'Sensitive config changed',
              summary: 'Integrity monitor detected a sensitive path change',
              source: { ip: '198.51.100.42' },
              actor: { type: 'service', label: 'integrity-monitor' },
              target: { route: '.env' },
              attack: {},
              infra: { host: 'prod-web-1' },
              correlation: { session_id: 'sess-test-1' },
              risk: { score: 92, reasons: ['sensitive-config-change'] },
              details: { payment_reference: 'OBS-RISK-001' },
              raw_ref: { table: 'integrity_snapshots', id: 8 },
            }],
          },
        } as never;
      }

      if (url === '/admin/observability/events/6') {
        return {
          data: {
            event: {
              id: 6,
              occurred_at: '2026-03-29T09:15:00Z',
              domain: 'database',
              category: 'db',
              outcome: 'suspicious',
              severity: 'high',
              title: 'Suspicious payment query burst',
              summary: 'Elevated reads against payment records',
              source: { ip: '198.51.100.42' },
              actor: { type: 'admin', id: '7', label: 'Ops Lead' },
              target: { route: '/admin/payments', method: 'GET', resource_type: 'payment' },
              attack: { pattern: 'query_burst' },
              infra: {},
              correlation: { session_id: 'sess-test-1' },
              risk: { score: 78, reasons: ['db-query-burst'] },
              details: { payment_reference: 'OBS-RISK-001' },
              raw_ref: { table: 'slow_queries', id: 1 },
            },
            related_events: [{
              id: 4,
              occurred_at: '2026-03-29T09:00:00Z',
              domain: 'payments',
              category: 'webhook',
              outcome: 'suspicious',
              severity: 'critical',
              title: 'Webhook signature failed',
              summary: 'Rejected suspicious payment callback',
              source: { ip: '198.51.100.42' },
              actor: { type: 'service', label: 'zengapay' },
              target: { route: '/api/webhooks/zengapay', method: 'POST' },
              attack: { pattern: 'invalid_signature' },
              infra: {},
              correlation: { session_id: 'sess-test-1' },
              risk: { score: 90, reasons: ['webhook-signature-failed'] },
              details: { payment_reference: 'OBS-RISK-001' },
              raw_ref: { table: 'audit_logs', id: 4 },
            }],
            entities: [{
              id: 11,
              entity_key: 'ip:198.51.100.42',
              entity_type: 'ip',
              label: '198.51.100.42',
              risk_score: 88,
              metadata: {},
            }],
            raw: { table: 'slow_queries', id: 1 },
            timeline: [],
            pivot_targets: {
              attacker: '198.51.100.42',
              session_id: 'sess-test-1',
              payment_reference: 'OBS-RISK-001',
            },
          },
        } as never;
      }

      if (url === '/admin/observability/events/8') {
        return {
          data: {
            event: {
              id: 8,
              occurred_at: '2026-03-29T09:25:00Z',
              domain: 'system',
              category: 'system',
              outcome: 'suspicious',
              severity: 'critical',
              title: 'Sensitive config changed',
              summary: 'Integrity monitor detected a sensitive path change',
              source: { ip: '198.51.100.42' },
              actor: { type: 'service', label: 'integrity-monitor' },
              target: { route: '.env' },
              attack: {},
              infra: { host: 'prod-web-1' },
              correlation: { session_id: 'sess-test-1' },
              risk: { score: 92, reasons: ['sensitive-config-change'] },
              details: { payment_reference: 'OBS-RISK-001' },
              raw_ref: { table: 'integrity_snapshots', id: 8 },
            },
            related_events: [{
              id: 7,
              occurred_at: '2026-03-29T09:20:00Z',
              domain: 'system',
              category: 'system',
              outcome: 'suspicious',
              severity: 'high',
              title: 'Service restart after webhook pressure',
              summary: 'Worker service restarted during elevated payment risk',
              source: { ip: '198.51.100.42' },
              actor: { type: 'service', label: 'systemd' },
              target: { route: '/workers/payments' },
              attack: {},
              infra: { host: 'prod-web-1' },
              correlation: { session_id: 'sess-test-1' },
              risk: { score: 74, reasons: ['service-restart-during-incident'] },
              details: { payment_reference: 'OBS-RISK-001' },
              raw_ref: { table: 'system_changes', id: 7 },
            }],
            entities: [{
              id: 11,
              entity_key: 'ip:198.51.100.42',
              entity_type: 'ip',
              label: '198.51.100.42',
              risk_score: 88,
              metadata: {},
            }],
            raw: { table: 'integrity_snapshots', id: 8 },
            timeline: [],
            pivot_targets: {
              attacker: '198.51.100.42',
              session_id: 'sess-test-1',
              payment_reference: 'OBS-RISK-001',
            },
          },
        } as never;
      }

      if (url === '/admin/observability/incidents') {
        return {
          data: [{
            id: 21,
            incident_key: 'inc_test',
            title: 'Auth spike',
            status: 'open',
            severity: 'high',
            owner: { id: 9, name: 'Ops Lead', email: 'ops@tesotunes.com' },
            note_count: 1,
            activity_count: 2,
            last_activity_at: '2026-03-29T09:10:00Z',
            metadata: {},
          }],
        } as never;
      }

      if (url === '/admin/observability/incidents/21') {
        return {
          data: {
            incident: {
              id: 21,
              incident_key: 'inc_test',
              title: 'Auth spike',
              status: 'open',
              severity: 'high',
              event_ids: [1],
              note_count: 1,
              activity_count: 2,
              last_activity_at: '2026-03-29T09:10:00Z',
              metadata: {
                note_entries: [{
                  body: 'Reviewed auth spike',
                  created_at: '2026-03-29T09:10:00Z',
                  created_by: { id: 9, name: 'Ops Lead', email: 'ops@tesotunes.com' },
                }],
                activity: [
                  {
                    action: 'created',
                    performed_at: '2026-03-29T09:00:00Z',
                    performed_by: { id: 9, name: 'Ops Lead', email: 'ops@tesotunes.com' },
                    context: { event_ids: [1] },
                  },
                  {
                    action: 'updated',
                    performed_at: '2026-03-29T09:10:00Z',
                    performed_by: { id: 9, name: 'Ops Lead', email: 'ops@tesotunes.com' },
                    context: {
                      changes: {
                        status: { from: 'open', to: 'investigating' },
                        notes: { from: 'empty', to: 'Reviewed auth spike' },
                      },
                    },
                  },
                ],
              },
            },
            summary: {
              event_count: 2,
              entity_count: 1,
              max_risk_score: 81,
              sources: ['198.51.100.42'],
              domains: { auth: 2 },
              outcomes: { failed: 2 },
            },
            events: [{
              id: 1,
              occurred_at: '2026-03-29T09:00:00Z',
              domain: 'auth',
              category: 'auth',
              outcome: 'failed',
              severity: 'high',
              title: 'Login Failed',
              summary: 'Credential attack',
              source: { ip: '198.51.100.42' },
              actor: { type: 'guest', label: 'Guest' },
              target: { route: '/api/login', method: 'POST' },
              attack: { technique: 'credential_stuffing', pattern: 'burst' },
              infra: {},
              correlation: {},
              risk: { score: 81, reasons: ['repeat-velocity'] },
              details: {},
              raw_ref: { table: 'audit_logs', id: 1 },
            }],
            entities: [{
              id: 11,
              entity_key: 'ip:198.51.100.42',
              entity_type: 'ip',
              label: '198.51.100.42',
              risk_score: 88,
              metadata: {},
            }, {
              id: 12,
              entity_key: 'session:sess-test-1',
              entity_type: 'session',
              label: 'sess-test-1',
              risk_score: 77,
              metadata: {},
            }, {
              id: 13,
              entity_key: 'payment_reference:OBS-RISK-001',
              entity_type: 'payment_reference',
              label: 'OBS-RISK-001',
              risk_score: 90,
              metadata: {},
            }],
            timeline: [],
          },
        } as never;
      }

      if (url === '/admin/observability/incidents/suggestions') {
        return {
          data: [{
            suggestion_key: 'sugg_auth_1',
            title: 'Auth attack cluster on /api/login',
            summary: '3 related auth/auth events from 198.51.100.42',
            severity: 'high',
            status: 'suggested',
            event_ids: [1, 2, 3],
            event_count: 3,
            risk_score: 82,
            first_seen_at: '2026-03-29T08:00:00Z',
            last_seen_at: '2026-03-29T09:00:00Z',
            domains: ['auth'],
            outcomes: { failed: 3 },
            source_ips: ['198.51.100.42'],
            top_routes: ['/api/login'],
            top_attack_patterns: ['burst'],
            top_actors: [],
            sample_event: {
              id: 1,
              occurred_at: '2026-03-29T09:00:00Z',
              domain: 'auth',
              category: 'auth',
              outcome: 'failed',
              severity: 'high',
              title: 'Login Failed',
              summary: 'Credential attack',
              source: { ip: '198.51.100.42' },
              actor: { type: 'guest', label: 'Guest' },
              target: { route: '/api/login', method: 'POST' },
              attack: { technique: 'credential_stuffing', pattern: 'burst' },
              infra: {},
              correlation: {},
              risk: { score: 81, reasons: ['repeat-velocity'] },
              details: {},
              raw_ref: { table: 'audit_logs', id: 1 },
            },
          }],
        } as never;
      }

      if (url === '/admin/observability/stakeholder-risk') {
        return {
          data: {
            summary: { high_risk_stakeholders: 1, admin_actors: 1, payment_touches: 2 },
            actors: [{
              actor_id: '7',
              actor_type: 'admin',
              label: 'Ops Lead',
              email: 'ops@tesotunes.com',
              risk_score: 76,
              total_events: 5,
              payment_events: 2,
              admin_events: 3,
              successful_suspicious_events: 1,
            }],
          },
        } as never;
      }

      if (url === '/admin/observability/stakeholder-risk/admin/7') {
        return {
          data: {
            actor: {
              actor_id: '7',
              actor_type: 'admin',
              label: 'Ops Lead',
              email: 'ops@tesotunes.com',
              risk_score: 76,
              total_events: 5,
              payment_events: 2,
              admin_events: 3,
              successful_suspicious_events: 1,
            },
            summary: {
              source_ips: ['198.51.100.42'],
              domains: { admin: 3, payments: 2 },
              outcomes: { success: 3, suspicious: 2 },
              last_seen_at: '2026-03-29T09:00:00Z',
            },
            events: [{
              id: 5,
              occurred_at: '2026-03-29T09:00:00Z',
              domain: 'payments',
              category: 'payment',
              outcome: 'success',
              severity: 'medium',
              title: 'Payout config reviewed',
              summary: 'Admin reviewed payout configuration after webhook anomaly',
              source: { ip: '198.51.100.42' },
              actor: { type: 'admin', id: '7', label: 'Ops Lead' },
              target: { route: '/admin/payments', method: 'GET' },
              attack: {},
              infra: {},
              correlation: { session_id: 'sess-test-1' },
              risk: { score: 76, reasons: ['payment-touch-after-risk'] },
              details: { payment_reference: 'OBS-RISK-001' },
              raw_ref: { table: 'audit_logs', id: 5 },
            }],
          },
        } as never;
      }

      if (url === '/admin/observability/integrations') {
        return {
          data: {
            summary: { webhook_events: 6, providers: 1, signature_failures: 2, replays: 1 },
            providers: [{
              provider: 'zengapay',
              total_events: 6,
              signature_failures: 2,
              replays: 1,
              missing_references: 1,
              payment_not_found: 1,
              successful_callbacks: 2,
              max_risk_score: 90,
              last_seen_at: '2026-03-29T09:00:00Z',
            }],
            recent: [],
          },
        } as never;
      }

      return { data: { recent: [], summary: { events: 0 }, health: {}, changes: [] } } as never;
    });
  });

  it('renders overview metrics and supports threat drill-down tab', async () => {
    const user = userEvent.setup();

    render(<ObservabilityPage />);

    expect(await screen.findByText(/Security operations and cross-system investigation console/i)).toBeInTheDocument();
    expect(await screen.findByText(/Active threats/i)).toBeInTheDocument();
    expect(await screen.findAllByText('198.51.100.42')).not.toHaveLength(0);
    expect((await screen.findAllByText('Ops Lead')).length).toBeGreaterThan(0);
    expect(await screen.findByText(/zengapay/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Threats' }));

    await waitFor(() => {
      expect(screen.getAllByText(/Login Failed/i).length).toBeGreaterThan(0);
    });
  });

  it('creates an incident from the selected event', async () => {
    const user = userEvent.setup();

    render(<ObservabilityPage />);

    await screen.findByText(/Observability/i);
    await user.click(screen.getByRole('button', { name: 'Threats' }));
    await waitFor(() => {
      expect(screen.getAllByText(/Login Failed/i).length).toBeGreaterThan(0);
    });
    await user.click(screen.getAllByText(/Login Failed/i)[0]);

    await user.click(screen.getByRole('button', { name: 'Incidents' }));
    await user.click(screen.getByRole('button', { name: /Create from selected event/i }));

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalled();
    });
  });

  it('creates an incident from a suggested cluster', async () => {
    const user = userEvent.setup();

    render(<ObservabilityPage />);

    await screen.findByText(/Observability/i);
    await user.click(screen.getByRole('button', { name: 'Incidents' }));
    await screen.findByText(/Suggested Incidents/i);
    await user.click(screen.getByRole('button', { name: /^Create incident$/i }));

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith(
        '/admin/observability/incidents',
        expect.objectContaining({
          title: 'Auth attack cluster on /api/login',
          event_ids: [1, 2, 3],
        })
      );
    });
  });

  it('loads incident detail for the selected incident', async () => {
    const user = userEvent.setup();

    render(<ObservabilityPage />);

    await screen.findByText(/Observability/i);
    await user.click(screen.getByRole('button', { name: 'Incidents' }));
    expect(await screen.findByText(/Incident Detail/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledWith('/admin/observability/incidents/21');
    });

    expect(await screen.findByText(/Max Risk/i)).toBeInTheDocument();
    expect(await screen.findByText(/Case Activity/i)).toBeInTheDocument();
    expect(await screen.findByText(/Updated status, notes/i)).toBeInTheDocument();
  });

  it('assigns the selected incident to the current responder', async () => {
    const user = userEvent.setup();

    render(<ObservabilityPage />);

    await screen.findByText(/Observability/i);
    await user.click(screen.getByRole('button', { name: 'Incidents' }));
    await screen.findByText(/Incident Detail/i);
    await user.click(screen.getByRole('button', { name: /Assign to me/i }));

    await waitFor(() => {
      expect(mockApiPatch).toHaveBeenCalledWith('/admin/observability/incidents/21/assign');
    });
  });

  it('marks an incident as contained from quick status actions', async () => {
    const user = userEvent.setup();

    render(<ObservabilityPage />);

    await screen.findByText(/Observability/i);
    await user.click(screen.getByRole('button', { name: 'Incidents' }));
    await screen.findByText(/Incident Detail/i);
    await user.click(screen.getByRole('button', { name: /Mark contained/i }));

    await waitFor(() => {
      expect(mockApiPatch).toHaveBeenCalledWith('/admin/observability/incidents/21', { status: 'contained' });
    });
  });

  it('releases incident ownership from the detail panel', async () => {
    const user = userEvent.setup();

    render(<ObservabilityPage />);

    await screen.findByText(/Observability/i);
    await user.click(screen.getByRole('button', { name: 'Incidents' }));
    await screen.findByText(/Incident Detail/i);
    await user.click(screen.getByRole('button', { name: /Release ownership/i }));

    await waitFor(() => {
      expect(mockApiPatch).toHaveBeenCalledWith('/admin/observability/incidents/21/release');
    });
  });

  it('appends a case note from the incident detail panel', async () => {
    const user = userEvent.setup();

    render(<ObservabilityPage />);

    await screen.findByText(/Observability/i);
    await user.click(screen.getByRole('button', { name: 'Incidents' }));
    await screen.findByText(/Case Notes/i);
    await user.type(screen.getByPlaceholderText(/Append a new case note/i), 'Escalated to payments operations');
    await user.click(screen.getByRole('button', { name: /Append case note/i }));

    await waitFor(() => {
      expect(mockApiPatch).toHaveBeenCalledWith('/admin/observability/incidents/21', { append_note: 'Escalated to payments operations' });
    });
  });

  it('detaches the selected event when it is already linked to the incident', async () => {
    const user = userEvent.setup();

    render(<ObservabilityPage />);

    await screen.findByText(/Observability/i);
    await user.click(screen.getByRole('button', { name: 'Threats' }));
    await waitFor(() => {
      expect(screen.getAllByText(/Login Failed/i).length).toBeGreaterThan(0);
    });
    await user.click(screen.getAllByText(/Login Failed/i)[0]);

    await user.click(screen.getByRole('button', { name: 'Incidents' }));
    await screen.findByText(/already linked to this incident/i);
    await user.click(screen.getByRole('button', { name: /Detach selected event/i }));

    await waitFor(() => {
      expect(mockApiPatch).toHaveBeenCalledWith(
        '/admin/observability/incidents/21',
        expect.objectContaining({ event_ids: [] })
      );
    });
  });

  it('pivots from an incident entity into attacker context', async () => {
    const user = userEvent.setup();

    render(<ObservabilityPage />);

    await screen.findByText(/Observability/i);
    await user.click(screen.getByRole('button', { name: 'Incidents' }));
    await screen.findByText(/Linked Entities/i);
    await user.click(screen.getByRole('button', { name: /Open attacker view/i }));

    await waitFor(() => {
      expect(useObservabilityStore.getState().activeTab).toBe('attackers');
    });
  });

  it('loads attacker detail when an attacker is selected', async () => {
    const user = userEvent.setup();

    render(<ObservabilityPage />);

    await screen.findByText(/Observability/i);
    await user.click(screen.getByRole('button', { name: 'Attackers' }));
    await user.click(screen.getAllByText('198.51.100.42')[0]);

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledWith('/admin/observability/attackers/11');
    });

    expect(await screen.findByText(/Recent linked events/i)).toBeInTheDocument();
  });

  it('pivots from an incident entity into session context', async () => {
    const user = userEvent.setup();

    render(<ObservabilityPage />);

    await screen.findByText(/Observability/i);
    await user.click(screen.getByRole('button', { name: 'Incidents' }));
    await screen.findByText(/Linked Entities/i);
    await user.click(screen.getByRole('button', { name: /Open auth session view/i }));

    await waitFor(() => {
      expect(useObservabilityStore.getState().activeTab).toBe('auth-sessions');
      expect(mockApiGet).toHaveBeenCalledWith('/admin/observability/auth-sessions/sess-test-1');
    });

    expect(await screen.findByText(/Session Detail/i)).toBeInTheDocument();
  });

  it('pivots from an incident entity into payment context', async () => {
    const user = userEvent.setup();

    render(<ObservabilityPage />);

    await screen.findByText(/Observability/i);
    await user.click(screen.getByRole('button', { name: 'Incidents' }));
    await screen.findByText(/Linked Entities/i);
    await user.click(screen.getByRole('button', { name: /Open payment risk view/i }));

    await waitFor(() => {
      expect(useObservabilityStore.getState().activeTab).toBe('payments-risk');
      expect(mockApiGet).toHaveBeenCalledWith('/admin/observability/payments-risk/OBS-RISK-001');
    });

    expect(await screen.findByText(/Payment Detail/i)).toBeInTheDocument();
  });

  it('loads stakeholder detail when a risk row is selected', async () => {
    const user = userEvent.setup();

    render(<ObservabilityPage />);

    await screen.findByText(/Observability/i);
    await user.click(await screen.findByRole('button', { name: /Open stakeholder Ops Lead/i }));

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledWith('/admin/observability/stakeholder-risk/admin/7');
    });

    expect(await screen.findByText(/Stakeholder Detail/i)).toBeInTheDocument();
    expect(await screen.findByText(/Payout config reviewed/i)).toBeInTheDocument();
  });

  it('pivots from stakeholder detail into payment context', async () => {
    const user = userEvent.setup();

    render(<ObservabilityPage />);

    await screen.findByText(/Observability/i);
    await user.click(await screen.findByRole('button', { name: /Open stakeholder Ops Lead/i }));
    await screen.findByText(/Stakeholder Detail/i);
    await user.click(screen.getByRole('button', { name: /Open payment risk view/i }));

    await waitFor(() => {
      expect(useObservabilityStore.getState().activeTab).toBe('payments-risk');
      expect(mockApiGet).toHaveBeenCalledWith('/admin/observability/payments-risk/OBS-RISK-001');
    });
  });

  it('pivots from database event detail into payment context', async () => {
    const user = userEvent.setup();

    render(<ObservabilityPage />);

    await screen.findByText(/Observability/i);
    await user.click(screen.getByRole('button', { name: 'Database & Data Access' }));
    await screen.findByText(/Suspicious payment query burst/i);
    await user.click(screen.getAllByText(/Suspicious payment query burst/i)[0]);

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledWith('/admin/observability/events/6');
    });

    await user.click(screen.getByRole('button', { name: /Open payment risk view/i }));

    await waitFor(() => {
      expect(useObservabilityStore.getState().activeTab).toBe('payments-risk');
      expect(mockApiGet).toHaveBeenCalledWith('/admin/observability/payments-risk/OBS-RISK-001');
    });
  });

  it('pivots from integrity event detail into attacker context', async () => {
    const user = userEvent.setup();

    render(<ObservabilityPage />);

    await screen.findByText(/Observability/i);
    await user.click(screen.getByRole('button', { name: 'Changes / Integrity' }));
    await screen.findByText(/Sensitive config changed/i);
    await user.click(screen.getAllByText(/Sensitive config changed/i)[0]);

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledWith('/admin/observability/events/8');
    });

    await user.click(screen.getByRole('button', { name: /Open attacker view/i }));

    await waitFor(() => {
      expect(useObservabilityStore.getState().activeTab).toBe('attackers');
    });
  });

  it('shows collector coverage in the system-host tab', async () => {
    const user = userEvent.setup();

    render(<ObservabilityPage />);

    await screen.findByText(/Observability/i);
    await user.click(screen.getByRole('button', { name: 'System & Host' }));

    expect(await screen.findByText(/Collector Coverage/i)).toBeInTheDocument();
    expect(await screen.findByText('prod-web-1')).toBeInTheDocument();
    expect(await screen.findByText('prod-db-1')).toBeInTheDocument();
    expect(await screen.findByText(/DB signals/i)).toBeInTheDocument();
    expect(await screen.findByText(/Stale sources/i)).toBeInTheDocument();
    expect(await screen.findByText(/Reporting streams/i)).toBeInTheDocument();
    expect(await screen.findByText(/Telemetry gaps/i)).toBeInTheDocument();
    expect(await screen.findByText(/Uncovered classes/i)).toBeInTheDocument();
    expect(await screen.findByText(/System Signal Classes/i)).toBeInTheDocument();
    expect(await screen.findByText(/Collector Streams/i)).toBeInTheDocument();
    expect(await screen.findByText(/Missing Signal Classes/i)).toBeInTheDocument();
    expect(await screen.findByText(/Priority Collector Alerts/i)).toBeInTheDocument();
    expect(await screen.findByText(/Recent Domain Rollups/i)).toBeInTheDocument();
    expect(await screen.findByText(/Recent Collector Events/i)).toBeInTheDocument();
    expect((await screen.findAllByText(/SSH failure burst/i)).length).toBeGreaterThan(0);
  });

  it('pivots collector hosts into shared host filters', async () => {
    const user = userEvent.setup();

    render(<ObservabilityPage />);

    await screen.findByText(/Observability/i);
    await user.click(screen.getByRole('button', { name: 'System & Host' }));
    await user.click(await screen.findByRole('button', { name: 'prod-web-1' }));

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith(expect.stringContaining('host=prod-web-1'), { scroll: false });
      expect(replaceMock).toHaveBeenCalledWith(expect.stringContaining('search=prod-web-1'), { scroll: false });
    });
  });

  it('shows collector-driven database classifications', async () => {
    const user = userEvent.setup();

    render(<ObservabilityPage />);

    await screen.findByText(/Observability/i);
    await user.click(screen.getByRole('button', { name: 'Database & Data Access' }));

    expect(await screen.findByText(/Collector DB Signals/i)).toBeInTheDocument();
    expect((await screen.findAllByText(/auth failures/i)).length).toBeGreaterThan(0);
    expect((await screen.findAllByText(/Destructive queries/i)).length).toBeGreaterThan(0);
    expect(await screen.findByText(/Priority Collector DB Alerts/i)).toBeInTheDocument();
    expect(await screen.findByText(/Recent Collector DB Events/i)).toBeInTheDocument();
  });
});
