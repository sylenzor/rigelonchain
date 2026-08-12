/**
 * rigel_full_audit — everything, in one call.
 *
 * Runs the complete Rigel battery — safety, bundle forensics, deployer
 * profile, bonding-curve state, live market — and returns one combined
 * report with an overall verdict and the top reasons behind it.
 * Sections that fail (rate limits, unindexed token) are reported as
 * unavailable rather than sinking the whole audit.
 */
import { parsePubkey } from "../solana.js";
import { analyzeRugRisk } from "./rugRisk.js";
import { checkFirstBuyers } from "./firstBuyers.js";
import { deployerHistory } from "./deployerHistory.js";
import { inspectTokenData } from "./inspectToken.js";
import { marketSnapshot } from "./marketSnapshot.js";

const SECTIONS: [string, (a: string) => Promise<string>][] = [
  ["SAFETY", analyzeRugRisk],
  ["BUNDLE CHECK", checkFirstBuyers],
  ["DEPLOYER", deployerHistory],
  ["TOKEN & CURVE", inspectTokenData],
  ["MARKET", marketSnapshot],
];

function grade(text: string): number {
  // pull severity out of section reports: 0 fine · 1 caution · 2 bad
  if (/LIKELY BUNDLED|Risk rating: HIGH|Deployer risk: HIGH/i.test(text)) return 2;
  if (/SUSPICIOUS|Risk rating: MEDIUM|Deployer risk: ELEVATED|bleeding out|Thin liquidity/i.test(text)) return 1;
  return 0;
}

function topFlags(text: string): string[] {
  const m = text.match(/Flags:\n([\s\S]*?)(\n\n|$)/);
  if (!m) return [];
  return m[1].split("\n").map((l) => l.replace(/^\s*•\s*/, "").trim()).filter(Boolean);
}

export async function fullAudit(tokenAddress: string): Promise<string> {
  parsePubkey(tokenAddress, "token address"); // validate once, fail fast

  const results = await Promise.allSettled(SECTIONS.map(([, fn]) => fn(tokenAddress)));

  let worst = 0;
  const reasons: string[] = [];
  const body: string[] = [];

  results.forEach((r, i) => {
    const name = SECTIONS[i][0];
    body.push(`━━ ${name} ${"━".repeat(Math.max(2, 30 - name.length))}`);
    if (r.status === "fulfilled") {
      worst = Math.max(worst, grade(r.value));
      reasons.push(...topFlags(r.value));
      body.push(r.value.trim());
    } else {
      body.push(`(unavailable: ${r.reason instanceof Error ? r.reason.message : r.reason})`);
    }
    body.push("");
  });

  const verdict = worst >= 2 ? "HIGH RISK" : worst === 1 ? "PROCEED WITH CAUTION" : "NO MAJOR FLAGS";
  const head: string[] = [];
  head.push(`✦ RIGEL FULL AUDIT — ${tokenAddress.trim()}`);
  head.push("");
  head.push(`OVERALL: ${verdict}`);
  if (reasons.length) {
    head.push("Top reasons:");
    for (const r of reasons.slice(0, 3)) head.push(`  • ${r}`);
  }
  head.push("");

  return head.join("\n") + body.join("\n") +
    "\nFive independent checks, public data only. Patterns, not proof — and never financial advice.";
}
