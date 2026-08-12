/**
 * solana.ts — shared connection + helpers for the Rigel MCP server.
 *
 * Read-only by design: this module (and the whole server) never touches
 * private keys and contains no signing code.
 */
import { Connection, PublicKey } from "@solana/web3.js";

/** Console output goes to stderr so stdout stays clean for MCP traffic. */
export const log = (...args: unknown[]) => console.error("[rigel]", ...args);

const RPC_URL = process.env.SOLANA_RPC_URL ?? "https://api.mainnet-beta.solana.com";

let _conn: Connection | null = null;

/** Lazily-created shared connection. */
export function conn(): Connection {
  if (!_conn) {
    _conn = new Connection(RPC_URL, { commitment: "confirmed" });
    log(`RPC → ${RPC_URL}`);
  }
  return _conn;
}

/** Parse a base58 public key or throw a friendly error. */
export function parsePubkey(value: string, label: string): PublicKey {
  try {
    return new PublicKey(value.trim());
  } catch {
    throw new Error(`"${value}" is not a valid Solana ${label} (expected a base58 public key).`);
  }
}

/** Wrap an RPC call with a clearer error message on connection failures. */
export async function withRpc<T>(what: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/fetch|network|ECONN|timeout|429/i.test(msg)) {
      throw new Error(
        `RPC request failed while ${what} (${msg}). ` +
        `The public mainnet RPC rate-limits aggressively — consider setting SOLANA_RPC_URL to a free Helius/Triton endpoint.`
      );
    }
    throw new Error(`Failed while ${what}: ${msg}`);
  }
}

export const LAMPORTS_PER_SOL = 1_000_000_000;
export const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

/** pump.fun program + bonding-curve constants (mainnet). */
export const PUMP_PROGRAM_ID = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P");
/** Initial real token reserves of a fresh pump.fun bonding curve. */
export const PUMP_INITIAL_REAL_TOKEN_RESERVES = 793_100_000_000_000n;

/** Metaplex token-metadata program (for name/symbol lookups). */
export const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

/** Derive the pump.fun bonding-curve PDA for a mint. */
export function bondingCurvePda(mint: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("bonding-curve"), mint.toBuffer()],
    PUMP_PROGRAM_ID
  );
  return pda;
}

/** Derive the Metaplex metadata PDA for a mint. */
export function metadataPda(mint: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    METADATA_PROGRAM_ID
  );
  return pda;
}

/** Minimal manual parse of a Metaplex metadata account: name, symbol, uri. */
export function parseMetadata(data: Buffer): { name: string; symbol: string; uri: string } | null {
  try {
    // layout: key(1) + updateAuthority(32) + mint(32) + name(4+len) + symbol(4+len) + uri(4+len) ...
    let o = 1 + 32 + 32;
    const read = () => {
      const len = data.readUInt32LE(o);
      o += 4;
      const s = data.subarray(o, o + len).toString("utf8").replace(/\0+$/g, "").trim();
      o += len;
      return s;
    };
    const name = read();
    const symbol = read();
    const uri = read();
    return { name, symbol, uri };
  } catch {
    return null;
  }
}

/** Parse a pump.fun bonding-curve account. */
export function parseBondingCurve(data: Buffer): {
  virtualTokenReserves: bigint;
  virtualSolReserves: bigint;
  realTokenReserves: bigint;
  realSolReserves: bigint;
  tokenTotalSupply: bigint;
  complete: boolean;
} | null {
  try {
    // layout: discriminator(8) + 5×u64 + bool
    let o = 8;
    const u64 = () => {
      const v = data.readBigUInt64LE(o);
      o += 8;
      return v;
    };
    return {
      virtualTokenReserves: u64(),
      virtualSolReserves: u64(),
      realTokenReserves: u64(),
      realSolReserves: u64(),
      tokenTotalSupply: u64(),
      complete: data.readUInt8(o) === 1,
    };
  } catch {
    return null;
  }
}

/** Format a number with thousands separators and sensible decimals. */
export function fmt(n: number, dp = 4): string {
  if (!Number.isFinite(n)) return String(n);
  return n.toLocaleString("en-US", { maximumFractionDigits: dp });
}
