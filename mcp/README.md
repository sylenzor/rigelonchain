# ✦ Rigel — Solana MCP server

**Give your AI agent eyes on Solana.** Rigel is an open-source [MCP](https://modelcontextprotocol.io) server that connects Claude Desktop, Claude Code, Cursor, and any stdio MCP client to the Solana blockchain and the pump.fun ecosystem.

**Read-only by design.** No private keys, no signing, no custody — the only configuration is which RPC to read from.

## Tools

| Tool | Input | Returns |
|---|---|---|
| `rigel_get_wallet_balance` | `walletAddress` | SOL balance + major SPL token holdings |
| `rigel_inspect_token_data` | `tokenAddress` | Metadata, supply, bonding-curve SOL, curve completion % |
| `rigel_analyze_rug_risk` | `tokenAddress` | Mint/freeze authority status, top-holder concentration, risk rating |
| `rigel_check_first_buyers` | `tokenAddress` | Bundle detection: fresh-wallet holders, shared funding wallets, supply concentration |
| `rigel_deployer_history` | `tokenAddress` | Deployer rap sheet: who launched it, wallet age, activity, remaining bag |
| `rigel_market_snapshot` | `tokenAddress` | Live price, market cap, liquidity, volume, buys/sells flow, momentum read |
| `rigel_full_audit` | `tokenAddress` | The whole battery in one call, with a combined verdict and top reasons |

## Quick start (Claude Desktop)

Paste into `claude_desktop_config.json` and restart Claude:

```json
{
  "mcpServers": {
    "rigel-solana": {
      "command": "npx",
      "args": ["-y", "@rigel-protocol/solana-mcp"],
      "env": { "SOLANA_RPC_URL": "https://api.mainnet-beta.solana.com" }
    }
  }
}
```

Then ask your agent things like:

- *"What's in this wallet? `FC5i…`"*
- *"Inspect this pump.fun token: `7xKq…`"*
- *"Is this token a rug?"*

## Build from source

```bash
npm install
npm run build
node dist/index.js   # speaks MCP over stdio
```

## Configuration

| Env var | Default | Purpose |
|---|---|---|
| `SOLANA_RPC_URL` | `https://api.mainnet-beta.solana.com` | Any Solana RPC — public, Helius, Triton, or your own node |

The public mainnet RPC rate-limits aggressively; a free Helius key is recommended for heavy use.

## Security posture

- No private keys, seed phrases, or signing code anywhere in this codebase.
- Local stdio transport — queries go from your machine to your RPC, nothing in between.
- Logs go to **stderr**; stdout is reserved for MCP protocol traffic.
- Zod-validated inputs; friendly errors for invalid public keys and RPC failures.

## Disclaimer

Rigel reports on-chain facts. The rug-risk rating is a heuristic over public data (authority status, holder concentration) — it cannot detect every risk, and **nothing it outputs is financial advice**.

## License

MIT
