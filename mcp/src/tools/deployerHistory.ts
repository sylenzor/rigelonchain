/**
 * rigel_deployer_history — the deployer rap sheet.
 *
 * Finds who deployed a token (fee payer of the mint's oldest transaction),
 * then profiles that wallet: age, activity level, SOL balance, and whether
 * they're still holding a meaningful bag of the token they launched.
 *
 * Heuristic, read-only. A full launch-by-launch history needs an indexer;
 * this reports what raw RPC can prove.
 */
import { PublicKey, ConfirmedSignatureInfo } from "@solana/web3.js";
import { conn, parsePubkey, withRpc, fmt, LAMPORTS_PER_SOL, TOKEN_PROGRAM_ID } from "../solana.js";

const MAX_PAGES = 4; // × 1000 signatures

async function oldestSignature(addr: PublicKey): Promise<{ sig: ConfirmedSignatureInfo | null; total: number; capped: boolean }> {
  let before: string | undefined;
  let last: ConfirmedSignatureInfo | null = null;
  let total = 0;
  for (let page = 0; page < MAX_PAGES; page++) {
    const sigs = await withRpc("paging transaction history", () =>
      conn().getSignaturesForAddress(addr, { limit: 1000, before })
    );
    if (!sigs.length) break;
    total += sigs.length;
    last = sigs[sigs.length - 1];
    if (sigs.length < 1000) return { sig: last, total, capped: false };
    before = last.signature;
  }
  return { sig: last, total, capped: true };
}

const days = (unix: number) => (Date.now() / 1000 - unix) / 86400;

export async function deployerHistory(tokenAddress: string): Promise<string> {
  const mint = parsePubkey(tokenAddress, "token address");

  // 1. find the mint's oldest tx → fee payer = deployer
  const mintHist = await oldestSignature(mint);
  if (!mintHist.sig) throw new Error("No transaction history found for this mint.");
  const createTx = await withRpc("fetching the create transaction", () =>
    conn().getParsedTransaction(mintHist.sig!.signature, { maxSupportedTransactionVersion: 0 })
  );
  const keys: any[] = createTx?.transaction.message.accountKeys ?? [];
  const deployerKey = keys.find((k) => k.signer)?.pubkey?.toBase58?.() ?? keys[0]?.pubkey?.toBase58?.();
  if (!deployerKey) throw new Error("Could not resolve the deployer from the create transaction.");
  const deployer = new PublicKey(deployerKey);

  // 2. profile the deployer
  const [walletHist, lamports, tokenAccounts, supplyRes] = await Promise.all([
    oldestSignature(deployer),
    withRpc("fetching deployer balance", () => conn().getBalance(deployer)),
    withRpc("fetching deployer holdings", () =>
      conn().getParsedTokenAccountsByOwner(deployer, { programId: TOKEN_PROGRAM_ID })
    ),
    withRpc("fetching supply", () => conn().getTokenSupply(mint).catch(() => null)),
  ]);

  const walletAgeDays = walletHist.sig?.blockTime ? days(walletHist.sig.blockTime) : null;
  const launchAgeDays = mintHist.sig.blockTime ? days(mintHist.sig.blockTime) : null;
  const supply = Number(supplyRes?.value?.uiAmount ?? 0);

  const bag = tokenAccounts.value
    .map((a) => a.account.data.parsed?.info)
    .find((i) => i?.mint === mint.toBase58());
  const bagAmount = Number(bag?.tokenAmount?.uiAmount ?? 0);
  const bagPct = supply > 0 ? (bagAmount / supply) * 100 : null;
  const otherTokens = tokenAccounts.value.filter(
    (a) => Number(a.account.data.parsed?.info?.tokenAmount?.uiAmount ?? 0) > 0
  ).length;

  // verdict
  const flags: string[] = [];
  let score = 0;
  if (walletAgeDays !== null && walletAgeDays < 7 && !walletHist.capped) {
    score += 2; flags.push(`Deployer wallet is ${walletAgeDays.toFixed(1)} days old — burner-fresh.`);
  }
  if (bagPct !== null && bagPct >= 10) {
    score += 2; flags.push(`Deployer still holds ${bagPct.toFixed(1)}% of supply — one wallet can end this.`);
  } else if (bagPct !== null && bagPct >= 5) {
    score += 1; flags.push(`Deployer holds ${bagPct.toFixed(1)}% of supply.`);
  }
  if (walletHist.capped) {
    flags.push(`Very high-activity wallet (>${MAX_PAGES * 1000} txs) — serial operator or bot infrastructure.`);
    score += 1;
  }
  const rating = score >= 4 ? "HIGH" : score >= 2 ? "ELEVATED" : "LOW";

  const lines: string[] = [];
  lines.push(`Deployer rap sheet — token ${mint.toBase58()}`);
  lines.push("");
  lines.push(`Deployer: ${deployerKey}`);
  lines.push(`  • Token deployed: ${launchAgeDays !== null ? launchAgeDays.toFixed(1) + " days ago" : "unknown"}`);
  lines.push(`  • Wallet age: ${walletAgeDays !== null ? (walletHist.capped ? "≥" : "") + walletAgeDays.toFixed(1) + " days" : "unknown"} · lifetime txs: ${walletHist.capped ? `>${walletHist.total}` : walletHist.total}`);
  lines.push(`  • SOL balance: ${fmt(lamports / LAMPORTS_PER_SOL, 4)} SOL`);
  lines.push(`  • Still holding this token: ${bagAmount > 0 ? `${fmt(bagAmount)}${bagPct !== null ? ` (${bagPct.toFixed(1)}% of supply)` : ""}` : "no (fully exited or never held)"}`);
  lines.push(`  • Other token positions in wallet: ${otherTokens}`);
  lines.push("");
  lines.push(`Deployer risk: ${rating}`);
  if (flags.length) {
    lines.push("");
    lines.push("Flags:");
    for (const f of flags) lines.push(`  • ${f}`);
  }
  lines.push("");
  lines.push(
    "Notes: deployer = first signer of the mint's oldest on-chain transaction. Full launch-by-launch " +
    "history requires an indexer; this is what raw RPC proves. Patterns, not proof. Not financial advice."
  );
  return lines.join("\n");
}
