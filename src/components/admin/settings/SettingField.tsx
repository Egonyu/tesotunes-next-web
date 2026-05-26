"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Check, History, Loader2, RotateCcw, ShieldAlert, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  type SettingDefinition,
  type SettingValue,
  patchSetting,
} from "@/lib/admin-settings";
import { apiPostForm } from "@/lib/api";
import { cn } from "@/lib/utils";

interface SettingFieldProps {
  definition: SettingDefinition;
  value: SettingValue | undefined;
  onSaved: (next: SettingValue) => void;
  onOpenHistory: (key: string) => void;
}

type SaveState = "idle" | "saving" | "saved" | "error";

const SAVED_FLASH_MS = 1500;

export function SettingField({ definition, value, onSaved, onOpenHistory }: SettingFieldProps) {
  const [local, setLocal] = useState<unknown>(currentValue(definition, value));
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const flashTimer = useRef<number | null>(null);

  useEffect(() => {
    setLocal(currentValue(definition, value));
  }, [definition, value]);

  useEffect(
    () => () => {
      if (flashTimer.current) window.clearTimeout(flashTimer.current);
    },
    []
  );

  const isDirty = !valuesEqual(local, currentValue(definition, value));

  async function commit(next: unknown) {
    setSaveState("saving");
    setErrorMessage(null);
    try {
      const result = await patchSetting(definition.key, next, value?.version);
      onSaved({
        key: result.key,
        value: result.value,
        configured: result.configured,
        version: result.version,
        last_updated_by: value?.last_updated_by ?? null,
        updated_at: new Date().toISOString(),
      });
      setSaveState("saved");
      if (flashTimer.current) window.clearTimeout(flashTimer.current);
      flashTimer.current = window.setTimeout(() => setSaveState("idle"), SAVED_FLASH_MS);
    } catch (err) {
      setSaveState("error");
      const message = extractErrorMessage(err);
      setErrorMessage(message);
      toast.error(`${definition.label}: ${message}`);
    }
  }

  function handleBlurCommit() {
    if (isDirty && saveState !== "saving") {
      void commit(local);
    }
  }

  function handleToggle(next: boolean) {
    setLocal(next);
    void commit(next);
  }

  return (
    <div className="grid grid-cols-1 gap-3 border-b border-slate-100 py-4 last:border-b-0 lg:grid-cols-[1fr_minmax(0,360px)] dark:border-slate-800">
      <div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-100">
            {definition.label}
          </label>
          {definition.secret ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              <ShieldAlert className="h-3 w-3" />
              secret
            </span>
          ) : null}
          {definition.requires_restart ? (
            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700 dark:bg-orange-950/40 dark:text-orange-300">
              restart required
            </span>
          ) : null}
          <code className="ml-auto text-[10px] text-slate-400">{definition.key}</code>
        </div>
        {definition.help ? (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{definition.help}</p>
        ) : null}
        <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400">
          <span>v{value?.version ?? 0}</span>
          {value?.configured ? <span>configured</span> : <span>using default</span>}
          <button
            type="button"
            onClick={() => onOpenHistory(definition.key)}
            className="ml-auto inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
          >
            <History className="h-3 w-3" />
            history
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {renderControl({
          definition,
          local,
          onLocalChange: setLocal,
          onCommit: commit,
          onToggle: handleToggle,
          onBlurCommit: handleBlurCommit,
        })}
        <StatusLine
          state={saveState}
          isDirty={isDirty}
          errorMessage={errorMessage}
          onResetLocal={() => setLocal(currentValue(definition, value))}
        />
      </div>
    </div>
  );
}

function renderControl({
  definition,
  local,
  onLocalChange,
  onCommit,
  onToggle,
  onBlurCommit,
}: {
  definition: SettingDefinition;
  local: unknown;
  onLocalChange: (next: unknown) => void;
  onCommit: (next: unknown) => Promise<void>;
  onToggle: (next: boolean) => void;
  onBlurCommit: () => void;
}) {
  if (definition.type === "boolean") {
    return (
      <Toggle checked={Boolean(local)} onChange={(next) => onToggle(next)} />
    );
  }

  if (definition.type === "enum" && definition.options) {
    return (
      <Select
        value={String(local ?? "")}
        onChange={(next) => {
          onLocalChange(next);
          void onCommit(next);
        }}
        options={definition.options}
      />
    );
  }

  if (definition.type === "integer" || definition.type === "float") {
    const numericType = definition.type;
    return (
      <Input
        type="number"
        autoComplete="off"
        value={local == null ? "" : String(local)}
        onChange={(e) => onLocalChange(coerceNumber(e.target.value, numericType))}
        onBlur={onBlurCommit}
      />
    );
  }

  if (definition.type === "encrypted") {
    return (
      <SecretInput
        value={typeof local === "string" ? local : ""}
        onChange={(next) => onLocalChange(next)}
        onCommit={() => onCommit(local)}
      />
    );
  }

  if (definition.type === "image") {
    return (
      <ImageUploadInput
        value={typeof local === "string" ? local : ""}
        onChange={(url) => {
          onLocalChange(url);
          void onCommit(url);
        }}
      />
    );
  }

  // string, email, url, json fall through to a text input
  return (
    <Input
      type="text"
      autoComplete="off"
      value={local == null ? "" : String(local)}
      onChange={(e) => onLocalChange(e.target.value)}
      onBlur={onBlurCommit}
      placeholder={String(definition.default ?? "")}
    />
  );
}

function StatusLine({
  state,
  isDirty,
  errorMessage,
  onResetLocal,
}: {
  state: SaveState;
  isDirty: boolean;
  errorMessage: string | null;
  onResetLocal: () => void;
}) {
  if (state === "saving") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
        <Loader2 className="h-3 w-3 animate-spin" /> saving
      </span>
    );
  }
  if (state === "saved") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
        <Check className="h-3 w-3" /> saved
      </span>
    );
  }
  if (state === "error") {
    return (
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-red-600">{errorMessage}</span>
        <button
          type="button"
          onClick={onResetLocal}
          className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
        >
          <RotateCcw className="h-3 w-3" /> revert
        </button>
      </div>
    );
  }
  if (isDirty) {
    return <span className="text-xs text-slate-400">unsaved · blur to save</span>;
  }
  return null;
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        checked ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-1"
        )}
      />
    </button>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
        "dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100",
        props.className
      )}
    />
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (next: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

function SecretInput({
  value,
  onChange,
  onCommit,
}: {
  value: string;
  onChange: (next: string) => void;
  onCommit: () => Promise<void>;
}) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="password"
        autoComplete="new-password"
        data-1p-ignore
        data-lpignore="true"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="enter to rotate · leave blank to keep"
      />
      <button
        type="button"
        disabled={value.length === 0}
        onClick={() => void onCommit()}
        className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-medium text-white disabled:bg-slate-300 dark:disabled:bg-slate-700"
      >
        rotate
      </button>
    </div>
  );
}

function ImageUploadInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("type", "branding");
      fd.append("resize", "0");
      const resp = await apiPostForm<{ success: boolean; data: { url: string } }>("/uploads/image", fd);
      if (!resp.data?.url) throw new Error("Upload response missing URL");
      onChange(resp.data.url);
    } catch (err) {
      const axiosMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(axiosMsg ?? "Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative h-16 w-32 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
          <Image src={value} alt="preview" fill className="object-contain p-1" unoptimized />
        </div>
      ) : (
        <div className="flex h-16 w-32 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 text-xs text-slate-400 dark:border-slate-700">
          No image
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
      >
        {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
        {uploading ? "Uploading…" : value ? "Replace" : "Upload"}
      </button>
    </div>
  );
}

function currentValue(def: SettingDefinition, v: SettingValue | undefined): unknown {
  if (def.secret) return "";
  if (v == null) return def.default;
  return v.value ?? def.default;
}

function valuesEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  return String(a) === String(b);
}

function coerceNumber(raw: string, type: "integer" | "float"): number | null {
  if (raw === "") return null;
  const n = type === "integer" ? Number.parseInt(raw, 10) : Number.parseFloat(raw);
  return Number.isFinite(n) ? n : null;
}

function extractErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const r = (err as { response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } } }).response;
    if (r?.status === 409) {
      return "Saved by someone else — refresh to see the new value.";
    }
    const firstFieldErr = r?.data?.errors ? Object.values(r.data.errors)[0]?.[0] : undefined;
    return firstFieldErr ?? r?.data?.message ?? "Save failed";
  }
  return "Save failed";
}
