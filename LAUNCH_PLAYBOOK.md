# Rigel — Launch Playbook (deep-research synthesis)

*Researched from ~25 comparable AI-agent tokens, Solana dev tools, and safety tools, 2024–2026. Every claim below traces to a source listed at the bottom. One honest caveat first: **nobody can guarantee a launch succeeds** — most fail regardless of prep. What this does is stack the odds by copying exactly what the winners did and avoiding what killed the rest.*

---

## The single most important finding

Your closest analog isn't a memecoin — it's **RugCheck.xyz** and **Bubblemaps**. Both are token-safety tools. Both won their category. And the pattern is identical across every durable project studied:

> **Free useful tool → get embedded where users already are → manufacture viral "investigations" on X → own a vocabulary → token LAST (or never).**

RugCheck became the category default (it's a *verb* — "does it pass RugCheck?") **with no token for years**. Bubblemaps built a $100M+ brand mostly on **public on-chain investigations** (they exposed the LIBRA/MELANIA insider link and got covered by Decrypt, DL News, etc.), then tokenized *after* the brand existed. You are structurally in their lane — and you have a better distribution surface than they did (MCP embeds into Claude/Cursor, not just websites).

---

## What separated the winners from the dumps

Across aixbt, Clanker, ai16z/Eliza, Truth Terminal/GOAT, Griffain, Zerebro, Freysa, Virtuals:

**Winners (sustained) shared 6 traits:**
1. **A tool people used independent of the token** — aixbt's daily alpha, Clanker's deployments, Eliza's repo. The dumps (GOAT, Zerebro) were personas with thin utility.
2. **Product shipped before/with the token, and kept shipping.**
3. **Value tied to usage, not attention** — Clanker's usage→fee→buyback survived the 2025 crash; reflexive memecoins didn't.
4. **ONE credible, screenshot-able ignition event** — always an *earned* endorsement or a viral demo, never ads. (ai16z = Andreessen shoutout; GOAT = Andreessen $50k + the AI's own tweet; Griffain = Solana-insider association; Freysa = the viral jailbreak win.)
5. **Native distribution** — they lived where their users already were (X, Farcaster, existing communities).
6. **Open source as a trust moat** — Eliza and Freysa published code; that legitimacy drew builders and press.

**What killed projects:**
- **Going quiet after launch** — "most projects didn't collapse from bad tech… no one maintained awareness." Launch is day 1, not the peak.
- **Attention without conviction** — GOAT had massive attention, no reason to hold, down ~98%.
- **Founder torching trust** — Zerebro had a real product; the founder *faked his own death* and it imploded. (Anonymity was fine — aixbt, Clanker's proxystudio, Bankr's @0xDeployer all anon and fine. *Behavior* is what matters.)
- **Bought/fake metrics getting caught** — trivially detected, instant credibility death. For a *safety tool*, this is fatal: your credibility IS the product.

---

## The timing is genuinely in your favor

The **Solana AI Agent Hackathon** (SendAI + Colosseum, late 2024) minted the builder cohort: 400+ projects, 21 winners, and 102 of them later launched tokens totaling ~$743M. That audience of agent-builders now exists and is looking for tools.

And here's the gap: **every notable Solana MCP server is transactional/write-capable** (create tokens, trade, deploy — they hold your private key). There is **no dominant read-only safety MCP.** You are the *safe* option — read-only, no keys — in a field of scary ones, at the exact moment the audience arrived. That's the differentiation, and it directly kills the #1 objection to installing any crypto MCP ("will it drain my wallet?").

---

## THE RIGEL PLAYBOOK — concrete, ordered

### Phase 0 — Ship the gate (before anything else)
- **Publish to npm.** The download counter becomes your real proof-of-use (this is the metric that actually converts devs, per Jupiter/Axiom/RugCheck).
- **List on every MCP registry, in this order:** Official MCP Registry (`registry.modelcontextprotocol.io` — feeds everything downstream) → Smithery → Glama (claim it for "verified") → mcp.so → PulseMCP → Cursor Directory → PRs to the "awesome-mcp-servers" GitHub lists. **Registries are the embedding surface for MCPs** — the equivalent of RugCheck getting embedded in Photon/BullX.
- Lead the README with a **20-second GIF of the owl catching a rug inside Claude.**

### Phase 1 — The owl becomes a character (weeks 0–6)
- Give the owl **ONE sharp trait**: the *skeptical night-watchman* — dry, deadpan, sees in the dark, calls out rugs. (Maps to aixbt's "always watching" + a mascot's charm.)
- **Make @rigelonchain an in-feed utility:** people tag it with a token address → the owl replies with a real rug/bundle/deployer verdict, in character. This is Clanker's growth engine (*become a verb*) fused with a real backend you already built. Every reply is a live ad with the owl's face on it.
- **Coin a named output** — a letter-grade "Audit Score" or a "bundle fingerprint" — and use it relentlessly so people quote it. (Vocabulary ownership is how RugCheck and Bubblemaps won.)

### Phase 2 — The reply-guy grind (your #1 growth engine as a solo builder)
The highest-ROI channel, and you have an unfair edge:
- Build a list of **50–100 accounts (50k+ followers)**: Solana devs (@0xMert_, @aeyakovenko, @heliuslabs), CT rug-warning traders, AI-agent builders. Post notifications ON.
- **Reply within 5–10 minutes** of their posts (early replies ride the impression wave). **20–50 replies/day, every day, no gaps.**
- Your edge: when someone posts *"is this a rug?"* you reply with the **owl's actual output as an image.** That's value, not promo — it demonstrates the product in the exact moment of need. Expect traction in 2–4 weeks, real momentum at 2–3 months.

### Phase 3 — Manufacture investigations (the Bubblemaps playbook)
- Use your own bundle-detection + deployer-history tools to **publicly expose a live scam token with receipts** — screenshots of the Claude session. Run it as a **recurring series**: "🦉 This week's rug, caught in one prompt."
- This is the single cheapest, highest-ROI marketing in this niche. Bubblemaps built a nine-figure brand largely on this exact move.

### Phase 4 — Technical content (the Helius move)
- Publish deep write-ups: *"how bundle detection actually works on-chain," "3 deployer patterns that signal a rug."* Helius won the entire Solana dev audience this way. These become the canonical references LLMs and devs cite.

### The launch thread (when you fire it)
- **8–12 tweets.** First tweet does 40% of the work — must stand alone with a hook + problem + one-line solution.
- **Hook tweet = the live rug-catch video, NOT a mission statement.** (aixbt, Clanker, Truth Terminal all *demonstrated*, never "introduced.")
- CTA at the end points to **ONE action** (GitHub/install). Fire at ~9am ET. Simultaneously post **Show HN** (`Show HN: Open-source Solana MCP for rug/bundle/deployer checks`) and Product Hunt/DevHunt.
- **Then don't go quiet.** That's what kills projects.

### The token question — settled by the research
Every winner tokenized **last or never**. RugCheck won with **no token**. Jupiter and Bubblemaps tokenized only *after* becoming infrastructure, and rewarded **historical usage via airdrop** — never gated the free tool. If $RIGEL ever happens: keep the MCP permanently free, make the token governance/upside for people who already rely on it, reward past users, never gate access. The research is unanimous that gating a dev tool "makes it look like a cash-grab and repels the developer audience you want first."

---

## Sources
- **Analogs:** RugCheck ([Solana Compass](https://solanacompass.com/projects/rugcheck)), Bubblemaps ([OneKey](https://onekey.so/blog/ecosystem/bmt-deep-dive-report-token-development-and-future-trajectory/), [Daily Hodl LIBRA/MELANIA](https://dailyhodl.com/2025/02/18/argentina-memecoin-libra-created-by-same-team-behind-first-ladys-melania-bubblemaps/))
- **AI agents:** aixbt ([Decrypt](https://decrypt.co/299393/what-is-aixbt-ai-crypto-influencer), [Forbes](https://www.forbes.com/sites/digital-assets/2025/01/06/how-ai-agent-aixbt-is-transforming-crypto-twitter-and-trend-analysis/)), ai16z/Eliza ([The Block](https://www.theblock.co/post/323192/marc-andreesen-shoutouts-help-ai-powered-vc-fund-ai16z-to-nearly-100-million-market-cap), [Decrypt "dead"](https://decrypt.co/374958/eliza-ai-token-dead-shuts-down-foundation-lawsuit)), Truth Terminal/GOAT ([samshev post-mortem](https://www.samshev.com/blog/truth-terminal-goat-marketing-lessons), [TechCrunch](https://techcrunch.com/2024/12/19/the-promise-and-warning-of-truth-terminal-the-ai-bot-that-secured-50000-in-bitcoin-from-marc-andreessen/)), Clanker ([The Defiant](https://thedefiant.io/news/nfts-and-web3/farcaster-acquires-clanker-tokenbot)), Zerebro ([Decrypt](https://decrypt.co/350928/faking-death-zerebro-founder-unveils-ai-manifesto-solana-coin)), Freysa ([The Block](https://www.theblock.co/post/328747/human-player-outwits-freysa-ai-agent-in-47000-crypto-challenge))
- **Infra/dev growth:** Jupiter ([OAK](https://oakresearch.io/en/analyses/fundamentals/jupiter-jup-from-solana-aggregator-to-omnichain-defi-super-app)), Axiom ([SolanaFloor](https://solanafloor.com/news/solana-trading-bot-axiom-becomes-the-fastest-application-to-reach-200-m-in-revenue)), Helius ([Series A](https://www.businesswire.com/news/home/20240221967627/en/Helius-Raises-9.5M-in-Series-A-Funding-to-Enhance-the-Developer-Experience-on-Solana))
- **MCP wave:** [sendaifun/solana-mcp](https://github.com/sendaifun/solana-mcp), [Solana Agent Kit](https://github.com/sendaifun/solana-agent-kit), [Hackathon winners](https://solanafloor.com/news/from-ideas-to-impact-meet-the-hackathon-winners-powering-solana-s-ai-revolution), [Colosseum](https://colosseum.com/agent-hackathon/)
- **Growth tactics:** [reply-guy method](https://indieradar.app/blog/reply-guy-method-grow-x-twitter-zero-followers), [crypto thread anatomy](https://www.lunarstrategy.com/article/optimal-guide-to-twitter-threads-for-your-crypto-project), [MCP registry listing](https://tallyfy.com/how-to-list-mcp-server-registry-smithery-glama-pulsemcp/), [marketing red flags](https://coinpedia.org/information/perfect-crypto-marketing-strategy-7-red-flags-we-spot-in-every-campaign/amp/)
