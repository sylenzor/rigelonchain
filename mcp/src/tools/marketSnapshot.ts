/**
 * rigel_market_snapshot — "what is it doing RIGHT NOW?"
 *
 * Price, market cap, liquidity, volume, and short-term momentum
 * (buys vs sells, pace) via DexScreener's free public API.
 * Works for bonding-curve tokens and graduated ones alike.
 */
import { parsePubkey, fmt } from "../solana.js";

const DEX_API = process.env.DEXSCREENER_API ?? "https://api.dexscreener.com/latest/dex/tokens/";

type Pair = {
  dexId?: string; url?: string; pairCreatedAt?: number;
  priceUsd?: string; priceNative?: string;
  liquidity?: { usd?: number };
  fdv?: number; marketCap?: number;
  volume?: { m5?: number; h1?: number; h24?: number };
  txns?: { m5?: { buys: number; sells: number }; h1?: { buys: number; sells: number }; h24?: { buys: number; sells: number } };
  priceChange?: { m5?: number; h1?: number; h24?: number };
  baseToken?: { symbol?: string; name?: string };
};

export async function marketSnapshot(tokenAddress: string): Promise<string> {
  const mint = parsePubkey(tokenAddress, "token address");

  let pairs: Pair[] = [];
  try {
    const res = await fetch(DEX_API + mint.toBase58(), { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) throw new Error(`DexScreener returned ${res.status}`);
    const json: any = await res.json();
    pairs = json?.pairs ?? [];
  } catch (err) {
    throw new Error(
      `Market data unavailable: ${err instanceof Error ? err.message : err}. ` +
      `DexScreener may be rate-limiting or the token is not indexed yet.`
    );
  }

  if (!pairs.length) {
    return [
      `Market snapshot — ${mint.toBase58()}`,
      "",
      "No trading pairs indexed yet. The token is either minutes old, never traded,",
      "or not on a tracked venue. Try rigel_inspect_token_data for bonding-curve state.",
    ].join("\n");
  }

  const best = pairs.sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];
  const sym = best.baseToken?.symbol ?? "?";
  const price = Number(best.priceUsd ?? 0);
  const m5 = best.txns?.m5, h1 = best.txns?.h1;
  const v5 = best.volume?.m5 ?? 0, v1 = best.volume?.h1 ?? 0, v24 = best.volume?.h24 ?? 0;

  // momentum: recent pace vs the day's average pace
  const paceNow = v5 * 12;               // 5-min volume annualized to an hour
  const paceAvg = v24 / 24;              // average hourly volume today
  const paceRatio = paceAvg > 0 ? paceNow / paceAvg : null;
  const buyRatio5 = m5 && (m5.buys + m5.sells) > 0 ? m5.buys / (m5.buys + m5.sells) : null;

  let momentum = "quiet";
  if (paceRatio !== null) {
    if (paceRatio >= 3) momentum = "SURGING — trading far above today's pace";
    else if (paceRatio >= 1.3) momentum = "accelerating";
    else if (paceRatio >= 0.6) momentum = "steady";
    else momentum = "bleeding out — pace well below today's average";
  }

  const ageH = best.pairCreatedAt ? (Date.now() - best.pairCreatedAt) / 3.6e6 : null;
  const pc = best.priceChange ?? {};

  const lines: string[] = [];
  lines.push(`Market snapshot — ${sym} · ${mint.toBase58()}`);
  lines.push("");
  lines.push(`Venue: ${best.dexId ?? "unknown"}${ageH !== null ? ` · pair age ${ageH < 48 ? ageH.toFixed(1) + "h" : (ageH / 24).toFixed(1) + "d"}` : ""}`);
  lines.push(`Price: $${price < 0.001 ? price.toExponential(3) : fmt(price, 6)}  ·  Market cap: ${best.marketCap ? "$" + fmt(best.marketCap, 0) : best.fdv ? "$" + fmt(best.fdv, 0) + " (FDV)" : "—"}`);
  lines.push(`Liquidity: ${best.liquidity?.usd ? "$" + fmt(best.liquidity.usd, 0) : "—"}`);
  lines.push("");
  lines.push(`Volume: 5m $${fmt(v5, 0)} · 1h $${fmt(v1, 0)} · 24h $${fmt(v24, 0)}`);
  if (m5 || h1) {
    lines.push(`Flow: 5m ${m5 ? `${m5.buys} buys / ${m5.sells} sells` : "—"} · 1h ${h1 ? `${h1.buys} buys / ${h1.sells} sells` : "—"}${buyRatio5 !== null ? ` · ${Math.round(buyRatio5 * 100)}% of last-5m txns are buys` : ""}`);
  }
  lines.push(`Price change: 5m ${pc.m5 ?? 0}% · 1h ${pc.h1 ?? 0}% · 24h ${pc.h24 ?? 0}%`);
  lines.push("");
  lines.push(`Momentum: ${momentum}`);
  if (best.liquidity?.usd !== undefined && best.liquidity.usd < 10_000) {
    lines.push("⚠ Thin liquidity — even small sells move this price hard.");
  }
  lines.push("");
  lines.push("Source: DexScreener public API, best pair by liquidity. Numbers move fast; this is a snapshot, not advice.");
  return lines.join("\n");
}
