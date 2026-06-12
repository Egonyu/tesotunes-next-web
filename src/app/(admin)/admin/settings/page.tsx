"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Building2,
  CreditCard,
  DollarSign,
  FileText,
  Globe,
  HardDrive,
  Loader2,
  type LucideIcon,
  Palette,
  Search,
  Settings as SettingsIcon,
  ShieldCheck,
  Smartphone,
  X,
  Zap,
} from "lucide-react";
import {
  GROUP_LABELS,
  SUBGROUP_LABELS,
  type SettingDefinition,
  type SettingValue,
  fetchSettingsSchema,
  fetchSettingsValues,
  groupDefinitions,
  subgroupsOf,
} from "@/lib/admin-settings";
import { SettingField } from "@/components/admin/settings/SettingField";
import { HistoryDrawer } from "@/components/admin/settings/HistoryDrawer";
import { cn } from "@/lib/utils";

const GROUP_ICONS: Record<string, { Icon: LucideIcon; bg: string; fg: string }> = {
  platform:      { Icon: Globe,       bg: "bg-blue-100 dark:bg-blue-950/40",     fg: "text-blue-600 dark:text-blue-300" },
  branding:      { Icon: Palette,     bg: "bg-purple-100 dark:bg-purple-950/40", fg: "text-purple-600 dark:text-purple-300" },
  features:      { Icon: Zap,         bg: "bg-amber-100 dark:bg-amber-950/40",   fg: "text-amber-500 dark:text-amber-300" },
  access_auth:   { Icon: ShieldCheck, bg: "bg-rose-100 dark:bg-rose-950/40",     fg: "text-rose-600 dark:text-rose-300" },
  content_rules: { Icon: FileText,    bg: "bg-green-100 dark:bg-green-950/40",   fg: "text-green-600 dark:text-green-300" },
  commerce:      { Icon: DollarSign,  bg: "bg-yellow-100 dark:bg-yellow-950/40", fg: "text-yellow-600 dark:text-yellow-300" },
  payments:      { Icon: CreditCard,  bg: "bg-indigo-100 dark:bg-indigo-950/40", fg: "text-indigo-600 dark:text-indigo-300" },
  notifications: { Icon: Bell,        bg: "bg-red-100 dark:bg-red-950/40",       fg: "text-red-500 dark:text-red-300" },
  mobile:        { Icon: Smartphone,  bg: "bg-sky-100 dark:bg-sky-950/40",       fg: "text-sky-600 dark:text-sky-300" },
  storage:       { Icon: HardDrive,   bg: "bg-orange-100 dark:bg-orange-950/40", fg: "text-orange-600 dark:text-orange-300" },
  sacco:         { Icon: Building2,   bg: "bg-emerald-100 dark:bg-emerald-950/40", fg: "text-emerald-600 dark:text-emerald-300" },
};

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [historyKey, setHistoryKey] = useState<string | null>(null);

  const schemaQuery = useQuery({
    queryKey: ["setting-schema"],
    queryFn: fetchSettingsSchema,
    staleTime: 10 * 60 * 1000,
  });

  const valuesQuery = useQuery({
    queryKey: ["setting-values"],
    queryFn: fetchSettingsValues,
    staleTime: 60 * 1000,
  });

  const grouped = useMemo(
    () => (schemaQuery.data ? groupDefinitions(schemaQuery.data) : {}),
    [schemaQuery.data]
  );

  const valuesByKey = useMemo(() => {
    const out: Record<string, SettingValue> = {};
    for (const v of valuesQuery.data ?? []) out[v.key] = v;
    return out;
  }, [valuesQuery.data]);

  const filteredGroups = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return grouped;
    const out: Record<string, SettingDefinition[]> = {};
    for (const [g, defs] of Object.entries(grouped)) {
      const matched = defs.filter(
        (d) =>
          d.key.toLowerCase().includes(query) ||
          d.label.toLowerCase().includes(query) ||
          (d.help ?? "").toLowerCase().includes(query)
      );
      if (matched.length > 0) out[g] = matched;
    }
    return out;
  }, [grouped, search]);

  const visibleGroup =
    activeGroup && filteredGroups[activeGroup]
      ? activeGroup
      : Object.keys(filteredGroups)[0] ?? null;

  function handleSaved(next: SettingValue) {
    queryClient.setQueryData<SettingValue[]>(["setting-values"], (prev) => {
      if (!prev) return [next];
      const idx = prev.findIndex((v) => v.key === next.key);
      if (idx === -1) return [...prev, next];
      const copy = [...prev];
      copy[idx] = next;
      return copy;
    });
  }

  if (schemaQuery.isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading settings…
      </div>
    );
  }

  if (schemaQuery.error) {
    return (
      <div className="p-8 text-red-600">
        Could not load settings schema. Try refreshing the page.
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0a0a0c]">
      <Sidebar
        groups={Object.keys(filteredGroups)}
        active={visibleGroup}
        onSelect={setActiveGroup}
        search={search}
        onSearch={setSearch}
      />

      <main className="flex-1 px-6 py-8 lg:px-10">
        {visibleGroup ? (
          <GroupPanel
            group={visibleGroup}
            definitions={filteredGroups[visibleGroup]}
            valuesByKey={valuesByKey}
            valuesLoading={valuesQuery.isLoading}
            onSaved={handleSaved}
            onOpenHistory={setHistoryKey}
          />
        ) : (
          <EmptyState />
        )}
      </main>

      <HistoryDrawer settingKey={historyKey} onClose={() => setHistoryKey(null)} />
    </div>
  );
}

function Sidebar({
  groups,
  active,
  onSelect,
  search,
  onSearch,
}: {
  groups: string[];
  active: string | null;
  onSelect: (g: string) => void;
  search: string;
  onSearch: (s: string) => void;
}) {
  // Chrome autofills when it detects password fields on the page (Payments section).
  // readOnly inputs are immune to autofill. We flip to editable after the autofill
  // window passes, and immediately on user focus so typing is never blocked.
  const [searchEditable, setSearchEditable] = useState(false);
  useEffect(() => {
    setSearchEditable(false);
    const t = setTimeout(() => setSearchEditable(true), 400);
    return () => clearTimeout(t);
  }, [active]);

  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white px-4 py-6 lg:block dark:border-slate-800 dark:bg-[#101012]">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
          <SettingsIcon className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-100">Settings</div>
          <div className="text-xs text-slate-500">Platform configuration</div>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          autoComplete="new-password"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          data-1p-ignore
          data-lpignore="true"
          data-form-type="other"
          readOnly={!searchEditable}
          onFocus={() => setSearchEditable(true)}
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search settings"
          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-9 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-900"
        />
        {search ? (
          <button
            type="button"
            onClick={() => onSearch("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      <nav className="space-y-1">
        {groups.map((g) => {
          const meta = GROUP_LABELS[g] ?? { label: g, subtitle: "" };
          const icon = GROUP_ICONS[g];
          const isActive = active === g;
          return (
            <button
              key={g}
              type="button"
              onClick={() => onSelect(g)}
              className={cn(
                "w-full rounded-xl px-3 py-2.5 text-left transition-all",
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              )}
            >
              <div className="flex items-center gap-2.5">
                {icon ? (
                  <div
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors",
                      isActive ? "bg-white/20" : icon.bg
                    )}
                  >
                    <icon.Icon
                      className={cn("h-3.5 w-3.5", isActive ? "text-white" : icon.fg)}
                    />
                  </div>
                ) : null}
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{meta.label}</div>
                  <div
                    className={cn(
                      "truncate text-xs",
                      isActive ? "text-white/70" : "text-slate-500"
                    )}
                  >
                    {meta.subtitle}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

function GroupPanel({
  group,
  definitions,
  valuesByKey,
  valuesLoading,
  onSaved,
  onOpenHistory,
}: {
  group: string;
  definitions: SettingDefinition[];
  valuesByKey: Record<string, SettingValue>;
  valuesLoading: boolean;
  onSaved: (v: SettingValue) => void;
  onOpenHistory: (key: string) => void;
}) {
  const meta = GROUP_LABELS[group] ?? { label: group, subtitle: "" };
  const icon = GROUP_ICONS[group];
  const subgroups = subgroupsOf(definitions);
  const subgroupKeys = Object.keys(subgroups);
  const [activeTab, setActiveTab] = useState(subgroupKeys[0] ?? "_default");

  // Reset to first tab whenever group changes
  useEffect(() => {
    setActiveTab(subgroupKeys[0] ?? "_default");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group]);

  const activeDefs = subgroups[activeTab] ?? [];
  const showTabs = subgroupKeys.length > 1;

  return (
    <div className="mx-auto max-w-4xl">
      {/* Group header */}
      <header className="mb-6 flex items-center gap-3">
        {icon ? (
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              icon.bg
            )}
          >
            <icon.Icon className={cn("h-5 w-5", icon.fg)} />
          </div>
        ) : null}
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {meta.label}
          </h1>
          <p className="text-sm text-slate-500">{meta.subtitle}</p>
        </div>
      </header>

      {/* Subgroup tabs */}
      {showTabs ? (
        <div className="mb-5 flex gap-1 overflow-x-auto border-b border-slate-200 pb-px dark:border-slate-800">
          {subgroupKeys.map((sg) => (
            <button
              key={sg}
              type="button"
              onClick={() => setActiveTab(sg)}
              className={cn(
                "shrink-0 rounded-t-lg px-4 py-2 text-sm font-medium transition-colors",
                activeTab === sg
                  ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              )}
            >
              {SUBGROUP_LABELS[sg] ?? sg}
            </button>
          ))}
        </div>
      ) : null}

      {valuesLoading ? (
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-[#101012]">
          Loading current values…
        </div>
      ) : null}

      {/* Active subgroup card */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#101012]">
        {!showTabs ? (
          <div className="border-b border-slate-100 px-5 py-3 dark:border-slate-800">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {SUBGROUP_LABELS[activeTab] ?? activeTab !== "_default" ? (SUBGROUP_LABELS[activeTab] ?? activeTab) : meta.label}
            </h2>
          </div>
        ) : null}
        <div className="px-5">
          {activeDefs.map((def) => (
            <SettingField
              key={def.key}
              definition={def}
              value={valuesByKey[def.key]}
              onSaved={onSaved}
              onOpenHistory={onOpenHistory}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto max-w-md py-24 text-center text-slate-500">
      <SettingsIcon className="mx-auto mb-3 h-10 w-10 text-slate-300" />
      <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
        No matching settings
      </div>
      <p className="mt-1 text-xs">Adjust the search above to see results.</p>
    </div>
  );
}
