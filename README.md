# ✦ Rigel Protocol

**Give your AI agent eyes on Solana.**

This repository contains:

- [`mcp/`](mcp/) — **@rigel-protocol/solana-mcp**, the open-source MCP server. Seven read-only tools: wallet balances, token inspection, rug-risk analysis, bundle detection, deployer history, live market snapshots, and a one-call full audit. See [`mcp/README.md`](mcp/README.md) for install and usage.
- [`public/`](public/) + `server.js` — the landing page at [rigelonchain.com](https://rigelonchain.com).

## Quick start

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

Read-only by design — no private keys, no signing, no custody. MIT licensed. Not financial advice.
