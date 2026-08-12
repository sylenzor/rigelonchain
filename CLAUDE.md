# rigel protocol — project context

This file orients Claude (Cowork / Claude Code) on the project. Read fully before making changes.

## what this is (current, as of aug 11 2026 evening)

**Rigel Protocol** — an open-source MCP (Model Context Protocol) server, `@rigel-protocol/solana-mcp`, that bridges local AI clients (Claude Desktop, Cursor, any stdio MCP client) to the Solana blockchain and the pump.fun ecosystem. TypeScript, ESM, built on `@modelcontextprotocol/sdk` + `@solana/web3.js`.

Three MCP tools (Zod-validated inputs):
1. `rigel_get_wallet_balance(walletAddress)` — SOL balance + major SPL holdings via RPC
2. `rigel_inspect_token_data(tokenAddress)` — pump.fun token metadata, bonding-curve SOL, supply, curve completion %
3. `rigel_analyze_rug_risk(tokenAddress)` — mint/freeze authority status, top-holder concentration → formatted risk report

Key posture: **read-only** — no private keys, no signing, no custody, runs locally over stdio, RPC configurable via `SOLANA_RPC_URL` env. MIT license. Console logs go to stderr (stdout is reserved for MCP protocol traffic).

## project history (one paragraph — for context only)

This repo was previously "rigel" — first a daily Solana analysis desk, then briefly an AI trading desk with a public 1 SOL wallet (FC5iXHES57un9nCdF9SrQfijxmk5bxJ3uZnVXS2Na947 — still Maksim's; unused by the protocol). On aug 11 2026 Maksim scrapped that direction entirely ("scratch everything, the vibe motto everything") and pivoted to the MCP server. All prior work (desk site, book section, brief system) lives in git history. Old files data/site.json, data/book.json, public/style.css, public/app.js are LEGACY — unused by the new landing page, kept only for history; don't extend them.

## current state

- **Landing page: BUILT** — public/index.html, self-contained (GrokBotfun-inspired restyle + full 70-item critique pass): near-black, Space Grotesk display + Inter + JetBrains Mono, canvas starfield + aurora, chat-window demo ("simulated demo" labeled), 2×2 feature grid with spec panels, steps with copy buttons, config block with filename header + security callout, FAQ accordion, two container widths (1040/720).
- **MCP server: BUILT at mcp/** — TypeScript ESM on @modelcontextprotocol/sdk + @solana/web3.js. 3 tools (rigel_get_wallet_balance, rigel_inspect_token_data, rigel_analyze_rug_risk), Zod inputs, StdioServerTransport, stderr-only logging, friendly pubkey/RPC errors, pump.fun bonding-curve + Metaplex metadata parsing. Verified: tsc clean, MCP initialize handshake + tools/list + error path tested over stdio. `npm run build` → dist/.
- Repo cleaned aug 12: legacy desk-era files (data/, public/style.css, public/app.js, TRANSFER.md, TRANSMISSIONS.md, creature.png) removed via git rm; root README + LICENSE (MIT) + .gitignore added; server.js reduced to a static file server; root package.json renamed rigel-protocol-site.
- Deploy: Render web service (auto-deploys sylenzor/rigelonchain main branch), domain rigelonchain.com via GoDaddy.
- npm package `@rigel-protocol/solana-mcp` is NOT PUBLISHED yet — to publish: create npm account + org "rigel-protocol", then `cd mcp && npm publish --access public`. The landing's npx command works only after this.

## conventions

- Landing page stays a single self-contained index.html (no build step for the site).
- The MCP server lives in its own directory (suggest /mcp or separate repo) with its own package.json — do not tangle it with the Express site server.
- Never put private keys anywhere in the repo. The protocol is read-only by design — keep it that way; adding signing/trading tools would change the security posture the landing promises.
- GitHub: github.com/sylenzor/rigelonchain (repo may be renamed to rigel-protocol later; update links in index.html footer/nav when that happens).
- Domain rigelonchain.com may also be replaced to match the new brand — pending Maksim.

## guardrails that survived the pivot

- No financial advice; the rug-risk tool reports on-chain facts, not "buy/sell" recommendations. Keep "not financial advice" in the footer.
- Open source honesty: don't claim features on the landing that the server doesn't have yet.
- Ontario, Canada legal posture; any future token remains gated behind real adoption (same lesson as before: distribution first).
