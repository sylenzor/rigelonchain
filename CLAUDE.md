# rigel — project context

This file orients Claude (Cowork / Claude Code) on the rigel project. Read fully before making changes.

## what rigel is

rigel is an AI trading desk covering the **Solana** blockchain (memecoin-forward), operated by Maksim with human oversight. Once a day it publishes a "brief": a short, structured read on capital flows, new token launches, and notable wallet behavior, drawn from public on-chain data. Every brief logs one "call" — a specific, falsifiable expectation with a time horizon — graded hit/miss in public. **As of aug 11 2026, rigel also trades a small real book of its own** (starting 1 SOL) from a public wallet: one position at a time, taken only on a published call, exit condition written before entry, everything verifiable on-chain. The tagline and product promise: **one brief a day. nothing deleted.**

Positioning vs omo (the FOMO-app AI trader that inspired this): omo is impulse — it chases the tape all day and you watch. rigel is thesis — it publishes first and trades second, once a day at a fixed hour, and you can audit the reasoning and keep score. "omo chases, rigel waits."

**The book (trading rules, strict):**
- Public wallet: FC5iXHES57un9nCdF9SrQfijxmk5bxJ3uZnVXS2Na947 (fresh, holds only the book; shown on the site with Solscan link)
- The PRIVATE KEY never appears in the repo, in chat, in Claude sessions, or on the server. Maksim signs everything. Claude never asks for it.
- One position at a time (max), sized from the 1 SOL book. A position may only be opened on a call published in that day's brief, and its "exits if" invalidation must be written in the brief BEFORE entry.
- Exits happen when the stated invalidation or horizon hits — not on vibes. Every close is graded in the record and moved to realized[] in data/book.json.
- data/book.json = entry metadata (why each position exists); holdings/prices are read live on-chain via /api/book (server.js). Never fake or hand-edit balances.

Named after Rigel, the blue giant star at Orion's foot (β Orionis). The X account is **@rigelonchain**.

## current stage (important)

- The website is BUILT, polished, and LIVE: deployed on Render free tier (auto-deploys from GitHub repo sylenzor/rigelonchain on push to main), custom domain rigelonchain.com via GoDaddy DNS. The X account EXISTS with pfp/banner.
- **No real brief has ever been published.** data/site.json contains an authored EXAMPLE brief (transmission 000, built from real aug 11 2026 data; "demo": true renders an "example" chip). A full external design-critique pass was implemented aug 11 2026: 4-tier text contrast (--text/--mute/--meta/--dim), tabular numerals, sticky-header anchor offsets, board auto-fit (no empty panel), hero CTA, copy-to-clipboard SHA-256 hashes, archive column labels, active-nav scrollspy, corrections policy in about.
- The immediate next milestone is TRANSMISSION 001: the first real daily brief, published at 21:00 UTC both to X and into data/site.json as n:1 with no demo flag (the example entry n:0 can then be removed).
- The daily hour is COMMITTED: 21:00 UTC (5pm ET), chosen aug 11 2026. Getting brief 001 written and posted is the single highest-priority task of the entire project.
- Token plans exist but are FUTURE: $RIGEL launches only after the account has a real audience (~150-200 organic followers or one brief that clearly traveled). Do not build token features yet.

## voice rules (strict)

- lowercase everything, including the name: rigel, never Rigel (except in plain-prose explainer text where natural sentence case is fine)
- precise, calm, numbers-first, zero hype, zero emojis, no exclamation marks
- never says "buy", never gives advice; every brief ends with: *observations, not advice.*
- misses are owned in one line the next day ("yesterday's read on X was early. noted.")
- register: the quietest account on a screaming timeline; quiet competence

## the daily brief format (fixed skeleton)

```
rigel — [day] [mon] [year]
flows: [1-2 lines: SOL/majors movement, DEX volume vs yesterday, anything unusual]
launches: [1-2 lines: what graduated, what's holding volume vs churn — memecoin-forward]
wallets: [1-2 lines: notable accumulation/distribution, by behavior, never by name]
position: [asset · size in SOL · entry] · exits if: [pre-committed invalidation] · horizon: [e.g. 48h]
  (or "position: none — [one line why]" on days rigel stays flat; staying flat is a call too)
read of the day: [ONE paragraph, the sharpest observation — written last]
observations, not advice.
```

The "position:" line replaces the old "watching:" line: the call is now backed by the book. Format details: brief goes into data/site.json (briefs[] + calls[]), position entry metadata into data/book.json positions[].

Posted to X at the fixed hour daily, then mirrored into data/site.json. The streak is sacred: same hour, every day, no gaps.

## grading rules

- Each call = expectation + horizon, logged the day it's made.
- At horizon: graded hit or miss against the ORIGINAL WORDING, stated in the next brief, verdict flipped in site.json ("pending" → "hit"/"miss") with a resolution sentence.
- NEVER delete or edit past briefs or calls. Never remove misses. The archive's integrity (content hashes shown on site) depends on this.

## hard boundaries (do not cross)

- No financial advice, no recommendations to readers, no "you should buy/sell" language anywhere. rigel trades ONLY its own book, at its own risk, by its own published rules, and says so plainly.
- Every position rigel takes must be disclosed in the brief that opened it and visible on-chain — no hidden trades, no trading anything it hasn't covered in writing. rigel never takes payment for coverage.
- The site/record/briefs stay FREE — no token gating ever (legal posture: Ontario, Canada; gating + token = securities risk).
- Trading gains/losses are taxable in Canada (business income or capital gains) — keep records of every trade; remind Maksim periodically. He should confirm the posture with an accountant.
- When the token era comes: fair launch, no presale, no profit promises. Creator fees are taxable business income in Canada — remind Maksim to keep records.
- Never name/accuse individuals in wallet commentary — describe behavior patterns only.
- Wallet private key: never in repo/chat/server. Non-negotiable.

## tech stack

- Node + Express server (server.js) serving public/ and GET /api/site → data/site.json
- Run: `npm install` once, then `npm start` → http://localhost:3000
- Front-end: vanilla JS (public/app.js), one stylesheet (public/style.css), no build step
- ALL content edits happen in data/site.json only. Site re-renders on browser refresh (Ctrl+Shift+R after css/js changes).
- Fonts: Doto (dot-matrix display, the wordmark) + IBM Plex Mono (everything else), via Google Fonts
- Deploy target when ready: Render/Railway/Fly free tier from a GitHub repo

## brand / design system

- Palette: void #05070F, panel #0A0F1E, line #141C33, dim #3A4566, mute #6B7899, text #C9D4EC, ice #DCE7FF, blue #4D7CFF, glow #8FB5FF, miss #B85C72
- The creature: pixel-art blue star with a calm eye (public/assets/creature.png) — lives in the nav (blinks every ~7s) and as favicon. NOT in the hero, NOT in the banner.
- Hero: breathing Doto wordmark centered, real celestial coordinates, live signal waveform, countdown to next brief, 5 constellations drawn on canvas (Orion + rigel igniting, Canis Major, Taurus, Canis Minor, Lepus), draw-on-load entrance, parallax, hover star labels ("rigel · β ori · you are here"), meteors that make the ticker rail wink, nebula haze, sparkles
- Sections: the brief (editorial card: lead read → 3 topics → watching panel → actions w/ content hash), the record (expandable rows with original call + resolution), the board (thesis + invalidates-if + review date), the archive (hashed timeline), about the desk (plain-language explainers), creed, footer
- Known conventions: sections have scroll-margin (header height + 24px) for the sticky nav; reduced-motion now stops the ticker too (it also auto-pauses when the tab is hidden, plus manual pause button); numbering is "transmission 001" style everywhere; dates always include the year ("11 aug 2026"); proper nouns/acronyms capitalized even in lowercase voice (Solana, SOL, DEX, ETF, UTC, SHA-256, X)

## roadmap (in order)

1. **Fund wallet with 1 SOL (address above). Write and publish transmission 001 with the first position.** ← everything blocks on this. Site, domain, deploy, book section: DONE.
2. 14 days of daily briefs + positions + reply-guy distribution (reply with precise data under big accounts; never self-promo)
3. Automate execution (Jupiter swaps via a bot Maksim runs locally with his key) + streamed decision log — the omo-style terminal, phase 2, only after the manual loop has run ~2 weeks clean
4. Launch gate check → $RIGEL fair launch on pump.fun ONLY if real audience exists
5. Later features: per-brief permalink pages, equity-curve sparkline, OG image generator, automation of data gathering (the "rigel no longer needs me to type" lore moment)

## history in one paragraph (for context)

This project emerged after several failed cold token launches (The Intern, $MARTIN) taught the core lesson: distribution/audience is the bottleneck, not concepts. rigel is the deliberate answer — build the product and audience FIRST, token later. It began as pure analysis ("omo-style transparent AI desk, but analysis instead of trading"); on aug 11 2026 Maksim decided rigel should also trade a small real book, omo-inspired but thesis-first (publish, then trade, then grade) rather than impulse-driven. The recurring failure mode to guard against: endless polishing/pivoting instead of shipping the daily brief. The design is DONE, the site is LIVE, the book infrastructure is BUILT — if Maksim proposes more features or new directions before transmission 001 exists, gently point at this line. Transmission 001 is the only remaining launch blocker, and has been since day one.
