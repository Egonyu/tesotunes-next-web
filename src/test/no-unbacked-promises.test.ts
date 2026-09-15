import { readdirSync, readFileSync, statSync } from "fs";
import { join, relative } from "path";

/**
 * Guard: user-facing pages must not state figures or rewards the backend
 * doesn't produce.
 *
 * Every pattern below shipped once (September 2026 audit) and misled people:
 * a fee the checkout didn't charge, prizes nobody paid, a commission that did
 * not exist, catalogue sizes many times the real one. A figure shown to a user
 * must come from the API — see "No unbacked promises" in .claude/CLAUDE.md.
 *
 * Comments are stripped before matching, so explaining what was removed is fine.
 */

const SRC = join(__dirname, "..");
const SCANNED_DIRS = ["app", "components", "stores"];

const FORBIDDEN: Array<{ pattern: RegExp; why: string }> = [
  {
    pattern: /\b\d[\d,.]*\s*[KkMm]?\+\s*(songs|users|artists|listeners|members|fans|monthly listeners)\b/i,
    why: "Invented scale. Read real counts from GET /api/public/stats.",
  },
  {
    // A bare rounded-up count as its own string or element: "10K+", >2,500+<
    // (badge caps like '99+' / '9+' are a display idiom, not a claim)
    pattern: /["'`>]\s*(?!9+\+)\d[\d,.]*[KkMm]?\+\s*["'`<]/,
    why: "Invented scale. Read real counts from GET /api/public/stats.",
  },
  {
    pattern: /\b(millions|thousands) of (songs|artists|users|listeners|ugandan songs|african songs)\b/i,
    why: "Invented scale. Read real counts from GET /api/public/stats.",
  },
  {
    pattern: /["'`>]\s*[^"'`<]*\d+(\.\d+)?%\s*(commission|revenue share)/i,
    why: "A rate must come from settings (e.g. artist_revenue_share), never typed in.",
  },
  {
    pattern: /(fee|Fee|commission|Commission)\w*\s*=\s*[^;\n]*Math\.round\([^)]*\*\s*0\.\d+\s*\)/,
    why: "Client-side fee guesses. Fees come from POST /tickets/quote.",
  },
  {
    pattern: /money[- ]back guarantee/i,
    why: "No such guarantee exists; tickets are non-refundable unless cancelled.",
  },
  {
    pattern: /(Monthly Prizes|Exclusive Merch|Contest resets)/,
    why: "No referral contest is run. Real rewards are referral milestones.",
  },
  {
    pattern: /#1 music/i,
    why: "Unverifiable ranking claim.",
  },
  {
    pattern: /(earn|get|receive)\s+\d[\d,]*\s+(bonus\s+)?(credits|points)\b/i,
    why: "Reward amounts are operator-editable; render the live rate from the API.",
  },
  {
    pattern: /Approved within \d+ hours/i,
    why: "No review SLA is tracked or enforced.",
  },
];

function stripComments(source: string): string {
  return source
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "") // JSX {/* ... */}
    .replace(/\/\*[\s\S]*?\*\//g, "") // /* ... */
    .replace(/(^|[^:"'`])\/\/.*$/gm, "$1"); // // ... (not inside URLs)
}

function listFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return listFiles(full);
    return /\.(tsx?|jsx?)$/.test(entry) ? [full] : [];
  });
}

describe("user-facing copy makes no unbacked promises", () => {
  // Read and strip each file once; every rule runs over the same text.
  const sources = SCANNED_DIRS.flatMap((dir) => listFiles(join(SRC, dir)))
    .filter((file) => !/[\\/](admin)[\\/]/.test(file)) // operator-only guidance
    .map((file) => ({ file: relative(SRC, file), code: stripComments(readFileSync(file, "utf8")) }));

  it("scans a meaningful number of files", () => {
    expect(sources.length).toBeGreaterThan(100);
  });

  it.each(FORBIDDEN.map((rule) => [rule.pattern.source, rule] as const))(
    "nothing matches %s",
    (_source, rule) => {
      const offenders = sources.filter(({ code }) => rule.pattern.test(code)).map(({ file }) => file);

      if (offenders.length > 0) {
        throw new Error(`${rule.why}\nFound in:\n  ${offenders.join("\n  ")}`);
      }
    },
  );
});
