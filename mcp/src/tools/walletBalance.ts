/**
 * rigel_get_wallet_balance — SOL balance + major SPL token holdings.
 */
import {
  conn, parsePubkey, withRpc, fmt,
  LAMPORTS_PER_SOL, TOKEN_PROGRAM_ID,
} from "../solana.js";

export async function getWalletBalance(walletAddress: string): Promise<string> {
  const owner = parsePubkey(walletAddress, "wallet address");

  const [lamports, tokenAccounts] = await Promise.all([
    withRpc("fetching SOL balance", () => conn().getBalance(owner)),
    withRpc("fetching token accounts", () =>
      conn().getParsedTokenAccountsByOwner(owner, { programId: TOKEN_PROGRAM_ID })
    ),
  ]);

  const sol = lamports / LAMPORTS_PER_SOL;

  const holdings = tokenAccounts.value
    .map((a) => {
      const info = a.account.data.parsed?.info;
      return {
        mint: String(info?.mint ?? "unknown"),
        amount: Number(info?.tokenAmount?.uiAmount ?? 0),
        decimals: Number(info?.tokenAmount?.decimals ?? 0),
      };
    })
    .filter((h) => h.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const lines: string[] = [];
  lines.push(`Wallet: ${owner.toBase58()}`);
  lines.push(`SOL balance: ${fmt(sol, 6)} SOL`);
  lines.push("");

  if (holdings.length === 0) {
    lines.push("SPL tokens: none with a non-zero balance.");
  } else {
    const top = holdings.slice(0, 15);
    lines.push(`SPL tokens (${holdings.length} with balance, showing top ${top.length} by amount):`);
    for (const h of top) {
      lines.push(`  • ${fmt(h.amount)} — mint ${h.mint}`);
    }
    if (holdings.length > top.length) {
      lines.push(`  … and ${holdings.length - top.length} more.`);
    }
  }

  lines.push("");
  lines.push("Note: amounts are raw on-chain balances (no USD pricing). Read-only query.");
  return lines.join("\n");
}
