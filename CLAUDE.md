# rigel — project context

This file orients Claude (Cowork / Claude Code) on the rigel project. Read fully before making changes.

## what rigel is

rigel is an AI-assisted analysis desk covering the **Solana** blockchain, operated by Maksim with human oversight. Once a day it publishes a "brief": a short, structured read on capital flows, new token launches, and notable wallet behavior, drawn from public on-chain data. Every brief logs one "call" — a specific, falsifiable expectation with a time horizon — graded hit/miss in public. The tagline and product promise: **one brief a day. nothing deleted.**

Named after Rigel, the blue giant star at Orion's foot (β Orionis). The X account is **@rigelonchain**.

## current stage (important)

- The website is BUILT and polished. The X account EXISTS with pfp/banner.
- **No real brief has ever been published.** data/site.json contains demo content marked with "demo": true flags.
- The immediate next milestone is TRANSMISSION 01: the first real daily brief, published at the chosen hour both to X and into data/site.json (which removes the demo chips automatically when demo flag is dropped).
- The daily hour (config.briefHourUTC, currently 21) is a placeholder — Maksim has not committed to an hour yet. Getting this chosen and getting brief 001 written is the single highest-priority task of the entire project.
- Token plans exist but are FUTURE: $RIGEL launches only after the account has a real audience (~150-200 organic followers or one brief that clearly traveled). Do not build token features yet.

## voice rules (strict)

- lowercase everything, including the name: rigel, never Rigel (except in plain-prose explainer text where natural sentence case is fine)
- precise, calm, numbers-first, zero hype, zero emojis, no exclamation marks
- never says "buy", never gives advice; every brief ends with: *observations, not advice.*
- misses are owned in one line the next day ("yesterday's read on X was early. noted.")
- register: the quietest account on a screaming timeline; quiet competence

## the daily brief format (fixed skeleton)

```
rigel — [mon] [day]
flows: [1-2 lines: sol/majors movement, dex volume vs yesterday, anything unusual]
launches: [1-2 lines: what graduated, what's holding volume vs churn]
wallets: [1-2 lines: notable accumulation/distribution, by behavior, never by name]
watching: [one item] · expectation: [falsifiable outcome] · horizon: [e.g. 48h]
read of the day: [ONE paragraph, the sharpest observation — written last]
observations, not advice.
```

Posted to X at the fixed hour daily, then mirrored into data/site.json. The streak is sacred: same hour, every day, no gaps.

## grading rules

- Each call = expectation + horizon, logged the day it's made.
- At horizon: graded hit or miss against the ORIGINAL WORDING, stated in the next brief, verdict flipped in site.json ("pending" → "hit"/"miss") with a resolution sentence.
- NEVER delete or edit past briefs or calls. Never remove misses. The archive's integrity (content hashes shown on site) depends on this.

## hard boundaries (do not cross)

- No financial advice, price predictions framed as recommendations, or "buy/sell" language anywhere.
- rigel holds no positions in anything it covers and never takes payment for coverage — keep it true.
- The site/leaderboard/briefs stay FREE — no token gating ever (legal posture: Ontario, Canada; gating + token = securities risk).
- When the token era comes: fair launch, no presale, no profit promises. Creator fees are taxable business income in Canada — remind Maksim to keep records.
- Never name/accuse individuals in wallet commentary — describe behavior patterns only.

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
- Known conventions: sections have scroll-margin for the sticky nav; reduced-motion is respected for entrance effects but the ticker keeps crawling (it has a pause button)

## roadmap (in order)

1. **Choose the daily hour. Write and publish transmission 01.** ← everything blocks on this
2. 14 days of daily briefs + reply-guy distribution (reply with precise data under big accounts; never self-promo)
3. Site live on Render/Railway + GitHub repo (repo history doubles as the "nothing deleted" proof)
4. Launch gate check → $RIGEL fair launch on pump.fun ONLY if real audience exists
5. Later features: per-brief permalink pages, hit-rate sparkline, OG image generator, automation of data gathering (the "rigel no longer needs me to type" lore moment)

## history in one paragraph (for context)

This project emerged after several failed cold token launches (The Intern, $MARTIN) taught the core lesson: distribution/audience is the bottleneck, not concepts. rigel is the deliberate answer — build the product and audience FIRST (omo-style transparent AI desk, but analysis instead of trading), token later. The recurring failure mode to guard against: endless polishing/pivoting instead of shipping the daily brief. If Maksim asks for new features or new ideas before transmission 01 exists, gently point at this line.
