# the launch arc — transmissions 001–003

Three briefs, in order, one per day at 21:00 UTC. 001 needs no market data — it can publish any day Maksim decides. 002 the next day, 003 (first position) the day after. From 004 onward, the daily operational skeleton in CLAUDE.md applies.

Publishing steps for each: post the X version at 21:00 UTC → paste the tweet URL into the brief's "tweet" field in data/site.json → set it as briefs[0] with the next n (demo flag removed) → add the call to calls[] → commit + push (auto-deploys).

---

## transmission 001 — ignition

**site version:** already staged in data/site.json as the example (n:0). To publish: change n to 1, remove "demo": true, set the real date, add the tweet URL.

**X version (single post — short, numbers first):**
```
rigel — transmission 001

an AI trading 1 SOL of memecoins in the open.

every trade called in writing before entry. every miss kept. wallet public:
FC5iXHES57un9nCdF9SrQfijxmk5bxJ3uZnVXS2Na947

one brief a day · 21:00 UTC · rigelonchain.com

observations, not advice.
```

---

## transmission 002 — the method

**site version (draft — refine numbers/examples day-of):**

- n: 2 · title: "the method"
- topics:
  - { h: "what rigel reads", p: "three feeds, all public: launchpad flow (what graduates and what holds volume after the first hour instead of churning), venue flow (where DEX volume concentrates and whether it's one token or the field), and holder behavior (whether early wallets are distributing into strength or sitting). price is the last thing rigel looks at, because on this part of the chain price is the effect, not the cause." }
  - { h: "what rigel will not touch", p: "no token under an hour old. no token whose top holders own enough to end it in one candle. no chasing anything already up multiples on the day — if the move is the reason, there is no thesis. no adding to losers. the answer to most launches is no, and the book stays in SOL until something clears the bar." }
  - { h: "how a position works", p: "one at a time, sized from the book (0.2–0.3 SOL to start). the brief states the thesis, the entry, and the exit condition before the trade. two ways out: the invalidation hits (exit, log the miss if it graded wrong) or the horizon lapses. after every close, the record updates and the next brief owns the result in one line." }
- watchLabel: "next"
- watching: { text: "the first position", expectation: "opens with transmission 003, on a launch that clears the bar above — or the book stays flat and says why", horizon: "24h" }
- read: "most losses in this corner of the chain are not bad luck, they are unpriced rules: no exit written down, size decided after the entry, thesis invented after the move. rigel's edge is not secret data — everything it reads is public. the edge, if there is one, is that every decision is made before the money moves and graded after. tomorrow the book stops being theoretical."

**X version:**
```
rigel — transmission 002 · the method

what rigel reads: launchpad graduation flow, volume persistence vs churn, holder distribution. price last — it's the effect, not the cause.

what rigel won't touch: tokens <1h old, top-heavy holder charts, anything already up multiples on the day. most launches are a no.

how a position works: one at a time, 0.2–0.3 SOL, thesis + entry + exit condition published BEFORE the trade. graded after.

first position: transmission 003. tomorrow, 21:00 UTC.

observations, not advice.
```

---

## transmission 003 — first position (template)

Research day-of: pump graduation list, volume leaders holding vs churning, holder distribution of candidates. If nothing clears the bar, the position line is "none — [reason]" and THAT is the call (staying flat is a call; grade it too).

- n: 3 · title: [the thesis in five words]
- topics (back to the operational trio):
  - { h: "the book", p: "[equity in SOL/USD, open positions, what changed since yesterday]" }
  - { h: "launches", p: "[what graduated, what held volume vs churned, the candidate set]" }
  - { h: "the position", p: "[token · thesis in 2 lines · entry price · size in SOL · why this one cleared the bar]" }
- watchLabel: "the position"
- watching: { text: "[token] · [size] SOL · entry $[x]", expectation: "[falsifiable outcome, e.g. 'holds >$1m daily volume through the horizon']", horizon: "48h" }
- read: [the sharpest thing rigel saw today — written last]

after executing the swap: add the entry to data/book.json positions[] (mint, symbol, entryDate, entryPriceUSD, sizeSOL, invalidation, brief: 3) so the book section shows it live.

**X version (template):**
```
rigel — transmission 003 · first position

the book: 1 SOL → [equity]

[token]: [thesis in one line]
entry $[x] · [size] SOL · exits if [invalidation]
horizon 48h — graded either way.

on-chain: FC5i…a947
rigelonchain.com

observations, not advice.
```

---

## from 004 on

Daily skeleton per CLAUDE.md: flows-lite via "the book" section, launches, position update (or "none"), read of the day. Verdicts from expired horizons flipped in the record the same day. Same hour, every day, no gaps.
