import { apiGet, apiPatch, apiPost } from "./api";

export type SettingType =
  | "string"
  | "boolean"
  | "integer"
  | "float"
  | "json"
  | "enum"
  | "url"
  | "email"
  | "encrypted"
  | "image";

export type SettingVisibility = "public" | "authenticated" | "admin" | "super_admin";

export interface SettingDefinition {
  key: string;
  group: string;
  subgroup: string | null;
  type: SettingType;
  default: unknown;
  rules: string[];
  options: string[] | null;
  visibility: SettingVisibility;
  editable_by: string[];
  requires_restart: boolean;
  secret: boolean;
  label: string;
  help: string | null;
  audit_category: string;
  deprecated_in_favor_of: string | null;
}

export interface SettingValue {
  key: string;
  value: unknown;
  configured: boolean;
  version: number;
  last_updated_by: number | null;
  updated_at: string | null;
}

export interface SettingAuditRow {
  id: number;
  setting_key: string;
  group: string;
  audit_category: string | null;
  old_value: string | null;
  new_value: string | null;
  old_version: number | null;
  new_version: number;
  actor_user_id: number | null;
  actor_ip: string | null;
  actor_role: string | null;
  reason: string | null;
  was_secret: boolean;
  reverted_from: number | null;
  changed_at: string;
  actor?: { id: number; name: string | null; email: string | null } | null;
}

export interface PatchResult {
  key: string;
  value: unknown;
  configured: boolean;
  version: number;
}

export async function fetchSettingsSchema(): Promise<SettingDefinition[]> {
  const resp = await apiGet<{ data: SettingDefinition[] }>("/admin/settings/schema");
  return resp.data;
}

export async function fetchSettingsValues(): Promise<SettingValue[]> {
  const resp = await apiGet<{ data: SettingValue[] }>("/admin/settings/values");
  return resp.data;
}

export async function patchSetting(
  key: string,
  value: unknown,
  expectedVersion?: number,
  reason?: string
): Promise<PatchResult> {
  const body: Record<string, unknown> = { value };
  if (typeof expectedVersion === "number") body.expected_version = expectedVersion;
  if (reason) body.reason = reason;

  const resp = await apiPatch<{ data: PatchResult }, typeof body>(
    `/admin/settings/${key}`,
    body
  );
  return resp.data;
}

export async function fetchSettingHistory(
  key: string,
  page = 1,
  perPage = 25
): Promise<{ rows: SettingAuditRow[]; total: number; lastPage: number }> {
  const resp = await apiGet<{
    data: SettingAuditRow[];
    meta: { total: number; per_page: number; current_page: number; last_page: number };
  }>(`/admin/settings/${key}/history?page=${page}&per_page=${perPage}`);
  return { rows: resp.data, total: resp.meta.total, lastPage: resp.meta.last_page };
}

export async function revertSetting(key: string, auditId: number): Promise<PatchResult> {
  const resp = await apiPost<{ data: PatchResult }>(
    `/admin/settings/${key}/revert/${auditId}`,
    {}
  );
  return resp.data;
}

export function groupDefinitions(defs: SettingDefinition[]): Record<string, SettingDefinition[]> {
  const out: Record<string, SettingDefinition[]> = {};
  for (const def of defs) {
    if (def.deprecated_in_favor_of) continue;
    if (!out[def.group]) out[def.group] = [];
    out[def.group].push(def);
  }
  return out;
}

export function subgroupsOf(defs: SettingDefinition[]): Record<string, SettingDefinition[]> {
  const out: Record<string, SettingDefinition[]> = {};
  for (const def of defs) {
    const sg = def.subgroup ?? "_default";
    if (!out[sg]) out[sg] = [];
    out[sg].push(def);
  }
  return out;
}

export const GROUP_LABELS: Record<string, { label: string; subtitle: string }> = {
  platform: { label: "Platform", subtitle: "Identity, localization, operations" },
  branding: { label: "Branding", subtitle: "Logos, colors, login experience" },
  features: { label: "Features", subtitle: "Module kill switches" },
  access_auth: { label: "Access & Auth", subtitle: "Registration, password, sessions, social" },
  content_rules: { label: "Content Rules", subtitle: "Uploads, limits, moderation" },
  commerce: { label: "Commerce", subtitle: "Credits, revenue, packages" },
  payments: { label: "Payments", subtitle: "Providers and payout policy" },
  notifications: { label: "Notifications", subtitle: "Channels and event triggers" },
  mobile: { label: "Mobile Verification", subtitle: "SMS verification policy" },
  storage: { label: "Storage & Media", subtitle: "Driver and upload limits" },
  sacco: { label: "SACCO", subtitle: "Finance configuration and copy" },
};

export const SUBGROUP_LABELS: Record<string, string> = {
  identity: "Identity",
  contact: "Contact",
  localization: "Localization",
  operations: "Operations",
  brand: "Brand",
  admin_identity: "Admin identity",
  login_experience: "Login experience",
  layout: "Layout",
  toggles: "Toggles",
  registration: "Registration",
  password: "Password policy",
  session: "Session & lockout",
  logging: "Logging",
  social_login: "Social login",
  permissions: "Permissions",
  limits: "Limits",
  moderation: "Moderation",
  credits: "Credits",
  revenue: "Revenue split",
  packages: "Packages",
  mtn: "MTN MoMo",
  airtel: "Airtel Money",
  zengapay: "ZengaPay",
  payouts: "Payouts",
  channels: "Channels",
  email: "Email / SMTP",
  events: "Event triggers",
  policy: "Policy",
  provider: "Provider",
  codes: "Verification codes",
  storage: "Storage",
  finance: "Finance",
  rates: "Rates",
  copy: "Copy",
};
