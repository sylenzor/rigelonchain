/* rigel desk server
   run: npm install && npm start  →  http://localhost:3000
   daily workflow: edit data/site.json (briefs, calls, board), refresh.
   the book: data/book.json holds entry metadata; holdings + prices are
   read live from the chain (public RPC) and Jupiter's price API. */
const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3000;

const RPC_URL = process.env.SOLANA_RPC || "https://api.mainnet-beta.solana.com";
const PRICE_URL = process.env.JUP_PRICE_URL || "https://lite-api.jup.ag/price/v3";
const SOL_MINT = "So11111111111111111111111111111111111111112";
const BOOK_TTL_MS = 60_000; // refresh on-chain state at most once a minute

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/site", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.sendFile(path.join(__dirname, "data", "site.json"));
});

/* ---------- the book ---------- */
let bookCache = { at: 0, payload: null };

async function rpc(method, params) {
  const r = await fetch(RPC_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error.message || "rpc error");
  return j.result;
}

async function prices(mints) {
  if (!mints.length) return {};
  const r = await fetch(PRICE_URL + "?ids=" + mints.join(","));
  return await r.json(); // { mint: { usdPrice, ... }, ... }
}

async function buildBook() {
  const meta = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "book.json"), "utf8"));
  const wallet = meta.wallet;

  const [balRes, tokRes] = await Promise.all([
    rpc("getBalance", [wallet]),
    rpc("getTokenAccountsByOwner", [wallet,
      { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
      { encoding: "jsonParsed" }]),
  ]);

  const sol = (balRes.value ?? balRes) / 1e9;
  const held = (tokRes.value || [])
    .map(a => a.account.data.parsed.info)
    .filter(i => Number(i.tokenAmount.uiAmount) > 0)
    .map(i => ({ mint: i.mint, amount: Number(i.tokenAmount.uiAmount) }));

  const px = await prices([SOL_MINT, ...held.map(h => h.mint)]).catch(() => ({}));
  const usd = m => Number(px[m]?.usdPrice ?? px[m]?.price ?? 0);
  const solPrice = usd(SOL_MINT);

  const positions = held.map(h => {
    const entry = (meta.positions || []).find(p => p.mint === h.mint) || {};
    const price = usd(h.mint);
    const valueUSD = h.amount * price;
    const pnlPct = entry.entryPriceUSD ? ((price / entry.entryPriceUSD) - 1) * 100 : null;
    return {
      mint: h.mint,
      symbol: entry.symbol || h.mint.slice(0, 4) + "…" + h.mint.slice(-4),
      amount: h.amount,
      priceUSD: price,
      valueUSD,
      entryPriceUSD: entry.entryPriceUSD ?? null,
      entryDate: entry.entryDate ?? null,
      sizeSOL: entry.sizeSOL ?? null,
      invalidation: entry.invalidation ?? null,
      brief: entry.brief ?? null,
      pnlPct,
    };
  });

  const positionsUSD = positions.reduce((s, p) => s + p.valueUSD, 0);
  return {
    wallet,
    startedSOL: meta.startedSOL ?? null,
    started: meta.started ?? null,
    sol,
    solPrice,
    solUSD: sol * solPrice,
    positions,
    positionsUSD,
    equityUSD: sol * solPrice + positionsUSD,
    equitySOL: solPrice ? sol + positionsUSD / solPrice : null,
    realized: meta.realized ?? [],
    updated: new Date().toISOString(),
  };
}

app.get("/api/book", async (req, res) => {
  res.set("Cache-Control", "no-store");
  const now = Date.now();
  if (bookCache.payload && now - bookCache.at < BOOK_TTL_MS) {
    return res.json(bookCache.payload);
  }
  try {
    const payload = await buildBook();
    bookCache = { at: now, payload };
    res.json(payload);
  } catch (e) {
    if (bookCache.payload) return res.json({ ...bookCache.payload, stale: true });
    res.status(200).json({ error: "book unavailable: " + e.message });
  }
});

app.listen(PORT, () => {
  console.log("");
  console.log("  ✦ rigel desk online");
  console.log("  → http://localhost:" + PORT);
  console.log("  edit data/site.json to publish · nothing deleted");
  console.log("");
});
