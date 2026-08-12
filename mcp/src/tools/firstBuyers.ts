/**
 * rigel_check_first_buyers — bundle detection via holder forensics.
 *
 * Looks at the top token accounts and asks the questions a human sleuth would:
 * are these wallets brand new? were they all funded around the same time?
 * were several of them funded BY THE SAME WALLET? A launch whose "organic
 * demand" is twenty fresh wallets with one common funder is one person.
 *
 * Heuristic, read-only, public data. Cannot prove innocence — only flag patterns.
 */
import { PublicKey } from "@solana/web3.js";
import { conn, parsePubkey, withRpc, fmt, bondingCurvePda } from "../solana.js";

const FRESH_TX_THRESHOLD = 60;      // a wallet with fewer lifetime txs than this is "fresh"
const TOP_ACCOUNTS = 15;

type HolderIntel = {
  owner: string;
  amount: number;
  txCount: number;
  txCountCapped: boolean;
  firstSeen: number | null;   // unix
  fresh: boolean;
  funder: string | null;
};

export async function checkFirstBuyers(tokenAddress: string): Promise<string> {
  const mint = parsePubkey(tokenAddress, "token address");
  const curve = bondingCurvePda(mint).toBase58();

  const [largest, supplyRes] = await Promise.all([
    withRpc("fetching largest holders", () => conn().getTokenLargestAccounts(mint)),
    withRpc("fetching supply", () => conn().getTokenSupply(mint).catch(() => null)),
  ]);
  const supply = Number(supplyRes?.value?.uiAmount ?? 0);
  const accounts = (largest?.value ?? []).slice(0, TOP_ACCOUNTS);
  if (!accounts.length) throw new Error("No token accounts found for this mint.");

  // resolve owners of the top token accounts
  const owners: { owner: string; amount: number }[] = [];
  for (const a of accounts) {
    const info = await withRpc("resolving token account owner", () =>
      conn().getParsedAccountInfo(new PublicKey(a.address))
    );
    const parsed: any = info.value?.data;
    const owner = parsed?.parsed?.info?.owner;
    if (owner) owners.push({ owner, amount: Number(a.uiAmount ?? 0) });
  }

  // profile each owner (skip the bonding curve / obvious program vaults)
  const intel: HolderIntel[] = [];
  for (const { owner, amount } of owners) {
    if (owner === curve) { continue; } // the curve's own inventory is not a "buyer"
    const sigs = await withRpc("reading wallet history", () =>
      conn().getSignaturesForAddress(new PublicKey(owner), { limit: 1000 })
    );
    const capped = sigs.length >= 1000;
    const oldest = sigs[sigs.length - 1];
    const fresh = !capped && sigs.length <= FRESH_TX_THRESHOLD;

    let funder: string | null = null;
    if (fresh && oldest) {
      try {
        const tx = await conn().getParsedTransaction(oldest.signature, {
          maxSupportedTransactionVersion: 0,
        });
        for (const ix of tx?.transaction.message.instructions ?? []) {
          const p: any = (ix as any).parsed;
          if (p?.type === "transfer" && p.info?.destination === owner && p.info?.source) {
            funder = p.info.source;
            break;
          }
        }
      } catch { /* funder unknown — fine */ }
    }

    intel.push({
      owner,
      amount,
      txCount: sigs.length,
      txCountCapped: capped,
      firstSeen: oldest?.blockTime ?? null,
      fresh,
      funder,
    });
  }

  // cluster: common funders among fresh wallets
  const funderGroups = new Map<string, HolderIntel[]>();
  for (const h of intel) {
    if (h.fresh && h.funder) {
      const g = funderGroups.get(h.funder) ?? [];
      g.push(h);
      funderGroups.set(h.funder, g);
    }
  }
  const biggestCluster = [...funderGroups.entries()].sort((a, b) => b[1].length - a[1].length)[0];

  const freshOnes = intel.filter((h) => h.fresh);
  const freshSupplyPct = supply > 0
    ? (freshOnes.reduce((s, h) => s + h.amount, 0) / supply) * 100
    : null;

  // verdict
  let verdict = "CLEAN-ISH";
  const flags: string[] = [];
  if (biggestCluster && biggestCluster[1].length >= 3) {
    verdict = "LIKELY BUNDLED";
    flags.push(
      `${biggestCluster[1].length} of the top holders are fresh wallets funded by the SAME wallet: ${biggestCluster[0]}`
    );
  } else if (freshSupplyPct !== null && freshSupplyPct >= 25) {
    verdict = "SUSPICIOUS";
    flags.push(`Fresh wallets (≤${FRESH_TX_THRESHOLD} lifetime txs) hold ${freshSupplyPct.toFixed(1)}% of supply.`);
  }
  if (freshOnes.length >= 2) {
    const times = freshOnes.map((h) => h.firstSeen).filter((t): t is number => t !== null).sort((a, b) => a - b);
    if (times.length >= 2 && times[times.length - 1] - times[0] < 600) {
      flags.push(`${times.length} fresh holder wallets all became active within a 10-minute window.`);
      if (verdict === "CLEAN-ISH") verdict = "SUSPICIOUS";
    }
  }

  const lines: string[] = [];
  lines.push(`First-buyer / bundle check — ${mint.toBase58()}`);
  lines.push("");
  lines.push(`Top ${intel.length} holder wallets examined (excluding the bonding curve):`);
  lines.push(`  • Fresh wallets (≤${FRESH_TX_THRESHOLD} txs): ${freshOnes.length}${freshSupplyPct !== null ? ` — holding ${freshSupplyPct.toFixed(1)}% of supply` : ""}`);
  lines.push(`  • Distinct funders identified among fresh wallets: ${funderGroups.size}`);
  if (biggestCluster) {
    lines.push(`  • Largest same-funder cluster: ${biggestCluster[1].length} wallets ← ${biggestCluster[0]}`);
  }
  lines.push("");
  lines.push(`Verdict: ${verdict}`);
  if (flags.length) {
    lines.push("");
    lines.push("Flags:");
    for (const f of flags) lines.push(`  • ${f}`);
  }
  lines.push("");
  lines.push(
    "Notes: heuristic over public RPC data. Fresh wallets can be innocent (new users, CEX withdrawals); " +
    "a shared funder can be an exchange hot wallet. Patterns, not proof. Not financial advice."
  );
  return lines.join("\n");
}
