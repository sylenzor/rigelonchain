# ✦ Rigel Protocol

**Give your AI agent eyes on Solana.**

This repository contains:

- [`mcp/`](mcp/) — **@rigel-protocol/solana-mcp**, the open-source MCP server. Five read-only tools: wallet balances, pump.fun token inspection, rug-risk analysis, bundle detection, and deployer history. See [`mcp/README.md`](mcp/README.md) for install and usage.
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
