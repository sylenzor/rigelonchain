/**
 * rigel_inspect_token_data — metadata, bonding-curve state, supply stats,
 * and curve-completion estimate for pump.fun tokens.
 */
import {
  conn, parsePubkey, withRpc, fmt,
  LAMPORTS_PER_SOL, PUMP_INITIAL_REAL_TOKEN_RESERVES,
  bondingCurvePda, metadataPda, parseMetadata, parseBondingCurve,
} from "../solana.js";

export async function inspectTokenData(tokenAddress: string): Promise<string> {
  const mint = parsePubkey(tokenAddress, "token address");

  const curvePda = bondingCurvePda(mint);
  const metaPda = metadataPda(mint);

  const [supplyRes, curveInfo, metaInfo] = await Promise.all([
    withRpc("fetching token supply", () => conn().getTokenSupply(mint).catch(() => null)),
    withRpc("fetching bonding curve account", () => conn().getAccountInfo(curvePda)),
    withRpc("fetching token metadata", () => conn().getAccountInfo(metaPda)),
  ]);

  const lines: string[] = [];
  lines.push(`Token: ${mint.toBase58()}`);

  const meta = metaInfo?.data ? parseMetadata(Buffer.from(metaInfo.data)) : null;
  if (meta) {
    lines.push(`Name: ${meta.name || "(unnamed)"}  ·  Symbol: ${meta.symbol || "—"}`);
    if (meta.uri) lines.push(`Metadata URI: ${meta.uri}`);
  } else {
    lines.push("Name/symbol: no Metaplex metadata found for this mint.");
  }

  if (supplyRes?.value) {
    lines.push(`Total supply: ${fmt(Number(supplyRes.value.uiAmount ?? 0))} (decimals: ${supplyRes.value.decimals})`);
  }

  lines.push("");

  if (!curveInfo) {
    lines.push("pump.fun bonding curve: no curve account found for this mint.");
    lines.push("Either this is not a pump.fun token, or it has fully migrated off the curve.");
    return lines.join("\n");
  }

  const curve = parseBondingCurve(Buffer.from(curveInfo.data));
  if (!curve) {
    lines.push("pump.fun bonding curve: account exists but could not be parsed (layout mismatch).");
    return lines.join("\n");
  }

  const curveSol = Number(curve.realSolReserves) / LAMPORTS_PER_SOL;
  const completion = curve.complete
    ? 100
    : Math.min(
        100,
        Math.max(
          0,
          (1 - Number(curve.realTokenReserves) / Number(PUMP_INITIAL_REAL_TOKEN_RESERVES)) * 100
        )
      );

  lines.push("pump.fun bonding curve:");
  lines.push(`  • Curve account: ${curvePda.toBase58()}`);
  lines.push(`  • SOL in curve: ${fmt(curveSol, 4)} SOL`);
  lines.push(`  • Completion: ${curve.complete ? "100% — complete (migrated)" : `~${completion.toFixed(1)}%`}`);
  lines.push(`  • Virtual reserves: ${curve.virtualSolReserves} lamports / ${curve.virtualTokenReserves} tokens`);
  lines.push(`  • Real reserves: ${curve.realSolReserves} lamports / ${curve.realTokenReserves} tokens`);

  lines.push("");
  lines.push("Read-only on-chain facts — not financial advice.");
  return lines.join("\n");
}
