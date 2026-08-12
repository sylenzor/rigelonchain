/**
 * rigel_analyze_rug_risk — basic on-chain safety metrics for a token:
 * mint/freeze authority status and top-holder concentration,
 * folded into a formatted risk report.
 *
 * This reports on-chain FACTS with a simple heuristic rating.
 * It is not financial advice and cannot detect every risk.
 */
import { conn, parsePubkey, withRpc, fmt } from "../solana.js";

export async function analyzeRugRisk(tokenAddress: string): Promise<string> {
  const mint = parsePubkey(tokenAddress, "token address");

  const [mintInfo, largest, supplyRes] = await Promise.all([
    withRpc("fetching mint account", () => conn().getParsedAccountInfo(mint)),
    withRpc("fetching largest holders", () => conn().getTokenLargestAccounts(mint).catch(() => null)),
    withRpc("fetching token supply", () => conn().getTokenSupply(mint).catch(() => null)),
  ]);

  const parsed: any = mintInfo.value?.data;
  if (!parsed || parsed.program !== "spl-token" || parsed.parsed?.type !== "mint") {
    throw new Error(`${mint.toBase58()} is not an SPL token mint account.`);
  }

  const info = parsed.parsed.info;
  const mintAuthority: string | null = info.mintAuthority ?? null;
  const freezeAuthority: string | null = info.freezeAuthority ?? null;

  const supply = Number(supplyRes?.value?.uiAmount ?? 0);
  const holders = (largest?.value ?? []).map((h) => Number(h.uiAmount ?? 0));
  const top10 = holders.slice(0, 10).reduce((s, v) => s + v, 0);
  const top10Pct = supply > 0 ? (top10 / supply) * 100 : null;

  // ---- scoring ----
  let score = 0;
  const flags: string[] = [];

  if (mintAuthority) {
    score += 2;
    flags.push("Mint authority is ACTIVE — supply can be inflated at will.");
  }
  if (freezeAuthority) {
    score += 2;
    flags.push("Freeze authority is ACTIVE — individual wallets can be frozen out of selling.");
  }
  if (top10Pct !== null) {
    if (top10Pct >= 60) {
      score += 2;
      flags.push(`Top-10 holders control ${top10Pct.toFixed(1)}% of supply — extreme concentration.`);
    } else if (top10Pct >= 30) {
      score += 1;
      flags.push(`Top-10 holders control ${top10Pct.toFixed(1)}% of supply — concentrated.`);
    }
  } else {
    flags.push("Holder concentration could not be computed (supply unavailable).");
  }

  const rating = score >= 4 ? "HIGH" : score >= 2 ? "MEDIUM" : "LOW";

  const mark = (ok: boolean) => (ok ? "✓" : "⚠");
  const lines: string[] = [];
  lines.push(`Rug-risk report — ${mint.toBase58()}`);
  lines.push("");
  lines.push(`${mark(!mintAuthority)} Mint authority: ${mintAuthority ? `ACTIVE (${mintAuthority})` : "revoked · safe"}`);
  lines.push(`${mark(!freezeAuthority)} Freeze authority: ${freezeAuthority ? `ACTIVE (${freezeAuthority})` : "none · safe"}`);
  if (top10Pct !== null) {
    lines.push(`${mark(top10Pct < 30)} Top-10 holder concentration: ${top10Pct.toFixed(1)}% of ${fmt(supply)} supply`);
  }
  lines.push("");
  lines.push(`Risk rating: ${rating}`);
  if (flags.length) {
    lines.push("");
    lines.push("Flags:");
    for (const f of flags) lines.push(`  • ${f}`);
  }
  lines.push("");
  lines.push(
    "Notes: heuristic based on public on-chain data only. Large holders may be exchanges, " +
    "lockers, or the bonding curve itself. A LOW rating is not a recommendation to buy — " +
    "this is information, not financial advice."
  );
  return lines.join("\n");
}
