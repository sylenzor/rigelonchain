#!/usr/bin/env node
/**
 * Rigel Protocol — Solana MCP server
 * ----------------------------------
 * Bridges MCP clients (Claude Desktop, Claude Code, Cursor, …) to the
 * Solana blockchain and the pump.fun ecosystem.
 *
 * Read-only by design: no private keys, no signing, no custody.
 * Transport: stdio (stdout is reserved for MCP traffic; logs go to stderr).
 */
import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { log } from "./solana.js";
import { getWalletBalance } from "./tools/walletBalance.js";
import { inspectTokenData } from "./tools/inspectToken.js";
import { analyzeRugRisk } from "./tools/rugRisk.js";

const server = new McpServer({
  name: "rigel-solana-mcp",
  version: "1.0.0",
});

/** Wrap a tool handler with uniform error handling. */
function safe(fn: (arg: string) => Promise<string>) {
  return async (arg: string) => {
    try {
      const text = await fn(arg);
      return { content: [{ type: "text" as const, text }] };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log("tool error:", message);
      return {
        content: [{ type: "text" as const, text: `Error: ${message}` }],
        isError: true,
      };
    }
  };
}

server.registerTool(
  "rigel_get_wallet_balance",
  {
    title: "Get wallet balance",
    description:
      "Get the SOL balance and a summary of major SPL token holdings for any public Solana wallet address. Read-only.",
    inputSchema: {
      walletAddress: z.string().describe("Base58 Solana wallet address to inspect"),
    },
  },
  async ({ walletAddress }) => safe(getWalletBalance)(walletAddress)
);

server.registerTool(
  "rigel_inspect_token_data",
  {
    title: "Inspect token data",
    description:
      "Fetch metadata, supply stats, bonding-curve SOL, and estimated curve-completion percentage for a pump.fun token mint. Read-only.",
    inputSchema: {
      tokenAddress: z.string().describe("Base58 mint address of the token to inspect"),
    },
  },
  async ({ tokenAddress }) => safe(inspectTokenData)(tokenAddress)
);

server.registerTool(
  "rigel_analyze_rug_risk",
  {
    title: "Analyze rug risk",
    description:
      "Check basic on-chain safety metrics for a token — mint/freeze authority status and top-holder concentration — and return a formatted risk report. On-chain facts, not financial advice.",
    inputSchema: {
      tokenAddress: z.string().describe("Base58 mint address of the token to analyze"),
    },
  },
  async ({ tokenAddress }) => safe(analyzeRugRisk)(tokenAddress)
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  log("rigel-solana-mcp v1.0.0 ready (stdio) — 3 tools registered, read-only.");
}

main().catch((err) => {
  log("fatal:", err instanceof Error ? err.message : err);
  process.exit(1);
});
