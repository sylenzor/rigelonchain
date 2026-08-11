/* ================================================================
   rigel — front-end
   data comes from /api/site (edit data/site.json, refresh)
================================================================ */
const $ = id => document.getElementById(id);
const pad = n => String(n).padStart(2, "0");
const pad3 = n => String(n).padStart(3, "0");
const MONTHS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
const fmtDate = iso => { const [y,m,d] = iso.split("-").map(Number); return d+" "+MONTHS[m-1]+" "+y; };
const clamp01 = v => Math.max(0, Math.min(1, v));
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* horizon "48h" + logged date → exact resolution stamp */
function resolveStamp(iso, horizon){
  const m = /^(\d+)\s*h$/.exec(horizon || "");
  if(!m || !SITE) return null;
  const [y,mo,d] = iso.split("-").map(Number);
  const t = new Date(Date.UTC(y, mo-1, d, SITE.config.briefHourUTC, 0, 0) + Number(m[1])*3600*1000);
  return t.getUTCDate()+" "+MONTHS[t.getUTCMonth()]+" "+t.getUTCFullYear()+", "+pad(t.getUTCHours())+":00 UTC";
}

async function copyText(btn, text){
  try{
    await navigator.clipboard.writeText(text);
    const old = btn.textContent;
    btn.classList.add("copied"); btn.textContent = "copied ✓";
    setTimeout(() => { btn.classList.remove("copied"); btn.textContent = old; }, 1400);
  }catch(e){
    btn.textContent = "copy failed — select manually";
  }
}

let SITE = null;

fetch("/api/site").then(r => r.json()).then(data => {
  SITE = data;
  wire();
  renderBrief();
  renderRecord();
  renderBoard();
  renderArchive();
  buildTicker();
  renderBook();
}).catch(() => {
  document.body.insertAdjacentHTML("beforeend",
    '<div style="position:fixed;inset:auto 20px 20px;color:#B85C72;font-size:12px">could not reach /api/site — is the server running? (npm start)</div>');
});

/* ---------- wiring ---------- */
function wire(){
  const x = "https://x.com/" + SITE.config.xHandle;
  $("xLink").href = x;
  $("xLinkFoot").href = x;
  const xa = $("xLinkAbout"); if(xa) xa.href = x;
  const tk = document.querySelector(".ticker");
  const btn = $("tickerPause");
  btn.setAttribute("aria-pressed", "false");
  btn.addEventListener("click", () => {
    const paused = tk.classList.toggle("paused");
    btn.textContent = paused ? "▶" : "⏸";
    btn.setAttribute("aria-label", paused ? "resume ticker" : "pause ticker");
    btn.setAttribute("aria-pressed", String(paused));
  });
  /* stop the crawl when the tab is hidden */
  document.addEventListener("visibilitychange", () => {
    tk.classList.toggle("tab-hidden", document.hidden);
    document.querySelector(".ticker-track").style.animationPlayState =
      document.hidden ? "paused" : "";
  });
}

/* active section marker in the nav */
(function(){
  const links = [...document.querySelectorAll(".nav-right a[href^='#']")];
  const map = new Map(links.map(a => [a.getAttribute("href").slice(1), a]));
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if(en.isIntersecting){
        links.forEach(a => a.classList.remove("active"));
        const a = map.get(en.target.id);
        if(a) a.classList.add("active");
      }
    });
  }, { rootMargin:"-30% 0px -60% 0px" });
  ["brief","book","record","board","archive","about"].forEach(id => {
    const el = document.getElementById(id); if(el) io.observe(el);
  });
})();

/* ---------- clock + countdown ---------- */
function tick(){
  const now = new Date();
  $("utcClock").textContent = pad(now.getUTCHours())+":"+pad(now.getUTCMinutes())+":"+pad(now.getUTCSeconds())+" UTC";
  if(!SITE) return;
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), SITE.config.briefHourUTC, 0, 0));
  if(next <= now) next.setUTCDate(next.getUTCDate() + 1);
  const s = Math.max(0, Math.floor((next - now)/1000));
  /* within 10 min of the hour just passed → publication window, not a fresh 24h count */
  const sincePub = 86400 - s;
  $("countdown").textContent = (sincePub >= 0 && sincePub < 600)
    ? "publishing…"
    : pad(Math.floor(s/3600))+":"+pad(Math.floor(s%3600/60))+":"+pad(s%60);
}
tick(); setInterval(tick, 1000);

/* ---------- ticker ---------- */
function buildTicker(){
  const items = SITE.ticker.map(x => x.replace("{HOUR}", pad(SITE.config.briefHourUTC)));
  const seg = items.map(x => x + '<span class="sep">✦</span>').join("");
  $("tickerTrack").innerHTML = seg + seg;
}

/* ---------- brief ---------- */
function renderBrief(){
  const b = SITE.briefs[0];
  if(!b) return;
  $("briefStamp").textContent = "transmission "+pad3(b.n)+" · "+fmtDate(b.date);
  $("txCount").textContent = SITE.briefs.filter(x => !x.demo).length;
  const w = b.watching;
  const status = b.demo ? '<span class="demo-chip">example</span>' : '<span class="live">latest</span>';
  const tweet = b.tweet ? `<a href="${b.tweet}" target="_blank" rel="noopener" aria-label="posted copy on X, opens in new tab">posted copy on X ↗</a>` : "";
  const resolves = resolveStamp(b.date, w.horizon);
  $("briefCard").innerHTML = `
    <div class="brief-head">
      <span class="tx">transmission ${pad3(b.n)}</span>
      <time datetime="${b.date}T${pad(SITE.config.briefHourUTC)}:00Z">${fmtDate(b.date)} · ${pad(SITE.config.briefHourUTC)}:00 UTC</time>
      <span class="status">${status}</span>
    </div>
    <h3 class="brief-title">${b.title || "daily brief"}</h3>
    <div class="brief-lead"><span class="lk">the read</span><p>${b.read}</p></div>
    <div class="brief-topics">
      ${(b.topics || [
        { h: "flows", p: b.flows },
        { h: "launches", p: b.launches },
        { h: "wallets", p: b.wallets },
      ]).map(t => `<div class="topic"><h4>${t.h}</h4><p>${t.p}</p></div>`).join("")}
    </div>
    <div class="watch-panel">
      <div class="wk">${b.watchLabel || "currently watching"}</div>
      <div class="wt">${w.text}</div>
      <div class="we">expectation: <b>“${w.expectation}”</b><span class="sep-dot">·</span>horizon ${w.horizon}${resolves ? `<span class="sep-dot">·</span>resolves ${resolves}` : ""}</div>
    </div>
    <div class="brief-actions">
      <span>observations, not advice</span>
      ${tweet}
      <button class="hash-btn" id="briefHash" title="copy full SHA-256 hash" aria-label="copy full content hash"></button>
    </div>`;
  briefHash(b).then(({short, full}) => {
    const el = $("briefHash");
    if(el){ el.textContent = "SHA-256 " + short; el.addEventListener("click", () => copyText(el, full)); }
  });
}

async function briefHash(b){
  try{
    const data = new TextEncoder().encode(JSON.stringify(b));
    const buf = await crypto.subtle.digest("SHA-256", data);
    const hex = [...new Uint8Array(buf)].map(x=>x.toString(16).padStart(2,"0")).join("");
    return { short: hex.slice(0, 12), full: hex };
  }catch(e){ return { short:"", full:"" }; }
}

/* ---------- record ---------- */
function renderRecord(){
  const CALLS = SITE.calls;
  const resolved = CALLS.filter(c => c.verdict !== "pending");
  const hits = CALLS.filter(c => c.verdict === "hit").length;
  const misses = resolved.length - hits;
  const pending = CALLS.length - resolved.length;
  const rate = resolved.length ? Math.round(hits/resolved.length*100) : null;
  $("heroRecord").textContent = resolved.length ? rate+"% of "+resolved.length : "0 · first resolution pending";
  const oc = $("openCalls"); if(oc) oc.textContent = pending;
  $("statBand").innerHTML = `
    <div class="stat"><div class="n">${CALLS.length}</div><div class="l">calls logged</div></div>
    <div class="stat"><div class="n blue">${hits}</div><div class="l">hits</div></div>
    <div class="stat"><div class="n${misses>0?' red':''}">${misses}</div><div class="l">misses</div></div>
    <div class="stat"><div class="n">${rate===null?'<span class="rate-wait">pending</span>':rate+"%"}</div><div class="l">hit rate</div></div>`;
  const bn = $("bandNote"); if(bn) bn.hidden = rate !== null;
  $("recordBody").innerHTML = CALLS.map((c,i) => {
    const deadline = resolveStamp(c.date, c.horizon);
    return `
    <tr class="r-main" data-i="${i}" tabindex="0" role="button" aria-expanded="false">
      <td class="d">${fmtDate(c.date)}</td>
      <td class="call-td">${c.call}</td>
      <td class="d">${c.horizon}</td>
      <td><span class="v v-${c.verdict}">${c.verdict}</span></td>
    </tr>
    <tr class="r-detail" hidden><td colspan="4">
      <span class="dk">original call, verbatim</span>${c.call}
      <span class="dk">logged</span>${fmtDate(c.date)}, ${pad(SITE.config.briefHourUTC)}:00 UTC · horizon ${c.horizon}${deadline ? " · deadline "+deadline : ""}
      <span class="dk">resolution</span>${c.resolution || (c.verdict==="pending" ? "pending — resolves at the deadline, graded in the following brief." : "graded "+c.verdict+" in the following brief.")}
    </td></tr>`;
  }).join("");
  document.querySelectorAll("tr.r-main").forEach(row => {
    const toggle = () => {
      const det = row.nextElementSibling;
      const open = det.hidden;
      det.hidden = !open;
      row.classList.toggle("open", open);
      row.setAttribute("aria-expanded", open);
    };
    row.addEventListener("click", toggle);
    row.addEventListener("keydown", e => { if(e.key==="Enter"||e.key===" "){ e.preventDefault(); toggle(); } });
  });
}

/* ---------- the book ---------- */
const usd = v => v >= 100 ? "$" + v.toFixed(0) : v >= 1 ? "$" + v.toFixed(2) : "$" + v.toPrecision(3);
const solFmt = v => v.toFixed(3).replace(/\.?0+$/, "") + " SOL";

async function renderBook(){
  const band = $("bookBand"), posEl = $("bookPositions");
  let B;
  try{ B = await (await fetch("/api/book")).json(); }
  catch(e){ B = { error: "unreachable" }; }

  if(B.error){
    band.innerHTML = "";
    posEl.innerHTML = `<div class="book-empty">the book is temporarily unreadable (chain data unavailable). holdings are always verifiable directly on-chain at the wallet above.</div>`;
    const meta = SITE.config.wallet;
    if(meta){ wireWallet(meta); }
    return;
  }

  wireWallet(B.wallet);
  const pnlSOL = (B.startedSOL != null && B.equitySOL != null) ? B.equitySOL - B.startedSOL : null;
  const pnlPct = (pnlSOL != null && B.startedSOL) ? (pnlSOL / B.startedSOL) * 100 : null;
  const sign = v => (v >= 0 ? "+" : "");
  band.innerHTML = `
    <div class="stat"><div class="n num">${B.equitySOL != null ? B.equitySOL.toFixed(3) : "—"}</div><div class="l">equity (SOL)</div></div>
    <div class="stat"><div class="n num">${usd(B.equityUSD || 0)}</div><div class="l">equity (USD)</div></div>
    <div class="stat"><div class="n num ${pnlSOL > 0 ? "blue" : pnlSOL < 0 ? "red" : ""}">${pnlPct != null ? sign(pnlPct) + pnlPct.toFixed(1) + "%" : "—"}</div><div class="l">since start (${B.startedSOL ?? "—"} SOL)</div></div>
    <div class="stat"><div class="n num">${B.positions.length}</div><div class="l">open positions</div></div>`;

  if(!B.positions.length){
    posEl.innerHTML = B.sol > 0.001
      ? `<div class="book-empty"><b>book funded: ${solFmt(B.sol)}</b> · no open positions. the first position opens with transmission 001 — stated in the brief first, then taken, then graded.</div>`
      : `<div class="book-empty"><b>wallet created</b> · awaiting the opening 1 SOL. the book goes live with transmission 001.</div>`;
  } else {
    posEl.innerHTML = `<div class="book-positions">` + B.positions.map(p => `
      <div class="pos-row">
        <div class="pos-top">
          <span class="sym">${p.symbol}</span>
          <span class="pnl num ${p.pnlPct == null ? "" : p.pnlPct >= 0 ? "up" : "down"}">${p.pnlPct == null ? "" : sign(p.pnlPct) + p.pnlPct.toFixed(1) + "%"}</span>
          <span style="margin-left:auto;color:var(--meta);font-size:12px">${usd(p.valueUSD)}</span>
        </div>
        <div class="pos-meta">
          ${p.entryDate ? `<span>opened <b>${fmtDate(p.entryDate)}</b></span>` : ""}
          ${p.sizeSOL ? `<span>size <b>${solFmt(p.sizeSOL)}</b></span>` : ""}
          ${p.entryPriceUSD ? `<span>entry <b>${usd(p.entryPriceUSD)}</b></span>` : ""}
          <span>now <b>${usd(p.priceUSD)}</b></span>
          ${p.brief ? `<span>per <b>transmission ${pad3(p.brief)}</b></span>` : ""}
        </div>
        ${p.invalidation ? `<div class="pos-inv"><b>exits if:</b> ${p.invalidation}</div>` : ""}
      </div>`).join("") + `</div>`;
  }
  posEl.insertAdjacentHTML("afterend", "");
  const note = document.querySelector(".book-note");
  if(!note) posEl.insertAdjacentHTML("afterend",
    `<p class="book-note">positions are opened only on a call published in that day's brief, sized from a ${B.startedSOL ?? 1} SOL starting book, with the exit condition written before entry. realized results move to the record. updated ${B.updated ? new Date(B.updated).toUTCString().slice(17, 22) + " UTC" : "—"}.</p>`);
}

function wireWallet(addr){
  if(!addr) return;
  const a = $("bookWalletLink"), t = $("bookWalletAddr"), c = $("bookWalletCopy");
  if(t) t.textContent = addr.slice(0, 4) + "…" + addr.slice(-4);
  if(a) a.href = "https://solscan.io/account/" + addr;
  if(c && !c.dataset.wired){ c.dataset.wired = "1"; c.addEventListener("click", () => copyText(c, addr)); }
}

/* ---------- board ---------- */
function renderBoard(){
  $("boardGrid").innerHTML = SITE.board.map(x => `
    <div class="b-item">
      <div class="t">${x.t}</div>
      <div class="s">${x.s}</div>
      ${x.invalidation ? `<div class="inv"><b>invalidates if:</b> ${x.invalidation}</div>` : ""}
      <div class="meta-row">
        <span>since ${x.since}</span>
        ${x.review ? `<span>next review ${x.review}</span>` : ""}
      </div>
    </div>`).join("");
}

/* ---------- archive ---------- */
async function renderArchive(){
  const rows = await Promise.all(SITE.briefs.map(async b => {
    const h = await briefHash(b);
    return `
    <div class="arch-row" data-n="${b.n}">
      <span class="no num">${pad3(b.n)}</span>
      <span class="dt">${fmtDate(b.date)}</span>
      <span class="pv">${b.title || b.read}</span>
      <button class="hash-btn" data-full="${h.full}" title="copy full SHA-256 hash" aria-label="copy full content hash for transmission ${pad3(b.n)}">SHA-256 ${h.short}</button>
      ${b.tweet ? `<a class="go" href="${b.tweet}" target="_blank" rel="noopener" aria-label="transmission ${pad3(b.n)} on X, opens in new tab">x ↗</a>` : `<span class="go"></span>`}
    </div>`;
  }));
  $("archList").innerHTML =
    `<div class="arch-labels" aria-hidden="true">
      <span class="no">no.</span><span class="dt">published</span>
      <span class="pv">lead observation</span><span class="hash">verification</span><span class="go"></span>
    </div>` +
    rows.join("") +
    `<div class="arch-note" style="padding:14px 22px;background:var(--panel)">hashes are SHA-256, computed in your browser from the archived brief text (its JSON, utf-8). the archive is canonical; the copy posted to X is a redundant public timestamp.</div>`;
  $("archList").querySelectorAll(".hash-btn").forEach(btn =>
    btn.addEventListener("click", () => copyText(btn, btn.dataset.full)));
}

/* ================================================================
   the sky — constellation engine v2
   nebula haze · entrance · parallax · sparkles · hover labels
   synced pulse · signal · meteor wink · reactive wordmark
================================================================ */
const canvas = $("sky");
const ctx = canvas.getContext("2d");
let W, H, DPR, stars = [], meteors = [], sparkles = [], hoverStar = null;
const T0 = performance.now();
const mouse = { x:.5, y:.5, cx:-1, cy:-1 };
const par = { f:{x:0,y:0}, c:{x:0,y:0} };

const SKY = [
  { id:"orion", alpha:.16, t0:0.9,
    pos:(nx,ny)=>{const s=Math.min(W*.42,H*.82);return [W*.60+nx*s*.9, H*.06+ny*s]},
    stars:{
      betelgeuse:{p:[.585,.205],l:"betelgeuse · α ori"},
      meissa:{p:[.505,.13],l:"meissa · λ ori"},
      bellatrix:{p:[.415,.225],l:"bellatrix · γ ori"},
      alnitak:{p:[.535,.44],l:"alnitak · ζ ori"},
      alnilam:{p:[.505,.455],l:"alnilam · ε ori"},
      mintaka:{p:[.475,.47],l:"mintaka · δ ori"},
      saiph:{p:[.565,.72],l:"saiph · κ ori"},
      rigel:{p:[.40,.75],l:"rigel · β ori · you are here", hero:true},
    },
    lines:[["betelgeuse","meissa"],["meissa","bellatrix"],["betelgeuse","alnitak"],
           ["bellatrix","mintaka"],["alnitak","alnilam"],["alnilam","mintaka"],
           ["alnitak","saiph"],["mintaka","rigel"],["saiph","rigel"]] },
  { id:"canis major", alpha:.09, t0:0.6,
    pos:(nx,ny)=>{const s=Math.min(W*.30,H*.60);return [W*.04+nx*s, H*.28+ny*s]},
    stars:{
      sirius:{p:[.30,.28],l:"sirius · α cma", bright:true},
      mirzam:{p:[.16,.33],l:"mirzam · β cma"},
      muliphein:{p:[.42,.22],l:"muliphein · γ cma"},
      wezen:{p:[.34,.58],l:"wezen · δ cma"},
      adhara:{p:[.24,.70],l:"adhara · ε cma"},
      aludra:{p:[.46,.66],l:"aludra · η cma"},
    },
    lines:[["sirius","mirzam"],["sirius","muliphein"],["sirius","wezen"],
           ["wezen","adhara"],["wezen","aludra"]] },
  { id:"taurus", alpha:.07, t0:1.3,
    pos:(nx,ny)=>{const s=Math.min(W*.26,H*.50);return [W*.34+nx*s, H*.02+ny*s]},
    stars:{
      aldebaran:{p:[.52,.42],l:"aldebaran · α tau", bright:true},
      ain:{p:[.44,.30],l:"ain · ε tau"},
      hyadum:{p:[.36,.38],l:"hyadum · γ tau"},
      zeta:{p:[.78,.18],l:"tianguan · ζ tau"},
      lambda:{p:[.22,.62],l:"λ tau"},
    },
    lines:[["aldebaran","ain"],["ain","hyadum"],["hyadum","lambda"],["aldebaran","zeta"]] },
  { id:"canis minor", alpha:.07, t0:1.5,
    pos:(nx,ny)=>{const s=Math.min(W*.14,H*.26);return [W*.13+nx*s, H*.06+ny*s]},
    stars:{
      procyon:{p:[.30,.60],l:"procyon · α cmi", bright:true},
      gomeisa:{p:[.70,.25],l:"gomeisa · β cmi"},
    },
    lines:[["procyon","gomeisa"]] },
  { id:"lepus", alpha:.06, t0:1.7,
    pos:(nx,ny)=>{const s=Math.min(W*.16,H*.28);return [W*.60+nx*s, H*.80+ny*s]},
    stars:{
      arneb:{p:[.40,.30],l:"arneb · α lep"},
      nihal:{p:[.44,.58],l:"nihal · β lep"},
      mu:{p:[.16,.24],l:"μ lep"},
      zeta:{p:[.72,.34],l:"ζ lep"},
    },
    lines:[["arneb","nihal"],["arneb","mu"],["arneb","zeta"]] },
];

/* nebula haze blobs — very slow drifting depth */
const NEBULAE = [
  { x:.28, y:.40, r:.34, a:.055, dx:.013, dy:.009, ph:0 },
  { x:.70, y:.30, r:.30, a:.045, dx:.010, dy:.012, ph:2.1 },
  { x:.52, y:.72, r:.38, a:.035, dx:.008, dy:.007, ph:4.4 },
];

function resize(){
  DPR = Math.min(devicePixelRatio || 1, 2);
  W = canvas.clientWidth; H = canvas.clientHeight;
  canvas.width = W*DPR; canvas.height = H*DPR;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  stars = [];
  const count = Math.floor(W*H/5200);
  for(let i=0;i<count;i++){
    stars.push({ x:Math.random()*W, y:Math.random()*H*.95,
      s:Math.random()<.85?2:3, base:.08+Math.random()*.3,
      tw:Math.random()*Math.PI*2, sp:.3+Math.random()*1.2 });
  }
}
resize(); addEventListener("resize", resize);

addEventListener("mousemove", e => {
  mouse.x = e.clientX/innerWidth; mouse.y = e.clientY/innerHeight;
  const r = canvas.getBoundingClientRect();
  mouse.cx = e.clientX - r.left; mouse.cy = e.clientY - r.top;
});

function px(x,y,s,color,alpha){
  ctx.globalAlpha = clamp01(alpha);
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x/2)*2, Math.round(y/2)*2, s, s);
}

function spawnMeteor(){
  if(reduced) return;
  meteors.push({ x:Math.random()*W*.8, y:Math.random()*H*.3,
    vx:3.2+Math.random()*2.2, vy:1.4+Math.random()*1.2, life:1 });
}
setInterval(() => { if(Math.random()<.4) spawnMeteor(); }, 6000);

/* star sparkles — a random field star flares into a tiny 4-point cross */
setInterval(() => {
  if(reduced || !stars.length) return;
  const s = stars[Math.floor(Math.random()*stars.length)];
  sparkles.push({ x:s.x, y:s.y, life:1 });
}, 2600);

let winkCooldown = 0;
function wink(){
  const now = performance.now();
  if(now - winkCooldown < 4000) return;
  winkCooldown = now;
  const tk = document.querySelector(".ticker");
  tk.classList.add("wink");
  setTimeout(() => tk.classList.remove("wink"), 1100);
}

const SYNC_W = Math.PI*2/4.5;
const titlewrap = $("titlewrap");

function draw(){
  const e = reduced ? 99 : (performance.now()-T0)/1000;
  const t = e;
  ctx.clearRect(0, 0, W, H);

  if(!reduced){
    const tx = (mouse.x-.5), ty = (mouse.y-.5);
    par.f.x += (tx*7  - par.f.x)*.04;  par.f.y += (ty*5  - par.f.y)*.04;
    par.c.x += (tx*16 - par.c.x)*.04;  par.c.y += (ty*11 - par.c.y)*.04;
    /* reactive wordmark — drifts opposite the sky, like the nearest layer */
    titlewrap.style.transform = `translate(${(-tx*10).toFixed(1)}px, ${(-ty*6).toFixed(1)}px)`;
  }

  /* nebula haze (deepest layer) */
  const hazeIn = clamp01(e/1.6);
  for(const n of NEBULAE){
    const nx = (n.x + Math.sin(t*n.dx + n.ph)*.03)*W + par.f.x*.5;
    const ny = (n.y + Math.cos(t*n.dy + n.ph)*.03)*H + par.f.y*.5;
    const nr = n.r*Math.min(W,H);
    const g = ctx.createRadialGradient(nx,ny,0,nx,ny,nr);
    g.addColorStop(0, `rgba(77,124,255,${n.a*hazeIn})`);
    g.addColorStop(.6, `rgba(77,124,255,${n.a*.35*hazeIn})`);
    g.addColorStop(1, "transparent");
    ctx.globalAlpha = 1; ctx.fillStyle = g;
    ctx.fillRect(nx-nr, ny-nr, nr*2, nr*2);
  }

  /* field stars */
  const fieldIn = clamp01(e/0.9);
  for(const s of stars){
    const a = (s.base + (reduced?0:Math.sin(t*s.sp+s.tw)*.07))*fieldIn;
    px(s.x+par.f.x, s.y+par.f.y, s.s, "#8FB5FF", Math.max(.02, a));
  }

  /* sparkles */
  for(let i=sparkles.length-1;i>=0;i--){
    const sp = sparkles[i];
    sp.life -= .02;
    if(sp.life<=0){ sparkles.splice(i,1); continue; }
    const l = sp.life, x = sp.x+par.f.x, y = sp.y+par.f.y, r = (1-l)*7+3;
    px(x-1, y-1-r, 2, "#DCE7FF", l*.8); px(x-1, y-1+r, 2, "#DCE7FF", l*.8);
    px(x-1-r, y-1, 2, "#DCE7FF", l*.8); px(x-1+r, y-1, 2, "#DCE7FF", l*.8);
    px(x-1, y-1, 2, "#FFFFFF", l);
  }

  /* meteors */
  for(let i=meteors.length-1;i>=0;i--){
    const m = meteors[i];
    m.x += m.vx; m.y += m.vy; m.life -= .012;
    if(m.life<=0 || m.x>W+40){
      if(m.x>W*.5) wink();
      meteors.splice(i,1); continue;
    }
    for(let j=0;j<7;j++){
      px(m.x-j*m.vx*1.6+par.c.x, m.y-j*m.vy*1.6+par.c.y, 2, "#BFD4FF", Math.max(0,(m.life-.1)*(1-j/7)*.7));
    }
    px(m.x+par.c.x, m.y+par.c.y, 2, "#FFFFFF", m.life);
  }

  /* constellations */
  hoverStar = null;
  ctx.font = '10px "IBM Plex Mono", monospace';
  for(const C of SKY){
    const prog = clamp01((e - C.t0)/1.4);
    if(prog<=0) continue;
    const P = k => { const [x,y]=C.pos(...C.stars[k].p); return [x+par.c.x, y+par.c.y]; };

    ctx.strokeStyle = "#4D7CFF"; ctx.lineWidth = 1;
    const total = C.lines.length, reach = prog*total;
    for(let i=0;i<total;i++){
      const seg = clamp01(reach - i);
      if(seg<=0) break;
      const [x1,y1]=P(C.lines[i][0]), [x2,y2]=P(C.lines[i][1]);
      ctx.globalAlpha = C.alpha*seg;
      ctx.beginPath(); ctx.moveTo(x1,y1);
      ctx.lineTo(x1+(x2-x1)*seg, y1+(y2-y1)*seg); ctx.stroke();
    }

    for(const k in C.stars){
      const S = C.stars[k];
      const [x,y] = P(k);
      const sIn = clamp01((e-C.t0)/0.8);
      if(S.hero){
        const ig = clamp01((e-2.3)/0.6);
        const flash = e>2.3 && e<3.1 ? (1-(e-2.3)/0.8)*.6 : 0;
        const p = reduced ? 1 : (.75 + .25*Math.sin(SYNC_W*t - Math.PI/2))*ig;
        if(ig>0){
          const g = ctx.createRadialGradient(x,y,0,x,y,26+34*flash);
          g.addColorStop(0, `rgba(143,181,255,${.5*p+flash})`);
          g.addColorStop(.4, `rgba(77,124,255,${.18*p+flash*.4})`);
          g.addColorStop(1, "transparent");
          ctx.globalAlpha = 1; ctx.fillStyle = g;
          ctx.fillRect(x-60, y-60, 120, 120);
          px(x-2,y-6,4,"#DCE7FF",p); px(x-2,y+2,4,"#DCE7FF",p);
          px(x-6,y-2,4,"#DCE7FF",p); px(x+2,y-2,4,"#DCE7FF",p);
          px(x-2,y-2,4,"#FFFFFF",Math.min(1,ig+flash));
        }
      } else if(S.bright){
        px(x-1,y-1,3,"#BFD4FF",.6*sIn); px(x-1,y-1,2,"#FFFFFF",.45*sIn);
      } else {
        px(x-1,y-1,2,"#8FB5FF",.4*sIn);
      }
      if(mouse.cx>0){
        const d = Math.hypot(mouse.cx-x, mouse.cy-y);
        if(d<14 && !hoverStar) hoverStar = {x, y, l:S.l, hero:!!S.hero};
      }
    }
  }

  /* hover label */
  if(hoverStar){
    const {x, y, l, hero} = hoverStar;
    ctx.globalAlpha = .92;
    ctx.fillStyle = hero ? "#DCE7FF" : "#8FB5FF";
    ctx.fillText(l, x+14, y-10);
    ctx.globalAlpha = .5; ctx.strokeStyle = "#3A4566";
    ctx.beginPath(); ctx.moveTo(x+5, y-3); ctx.lineTo(x+11, y-7); ctx.stroke();
    canvas.style.cursor = "crosshair";
  } else {
    canvas.style.cursor = "default";
  }

  drawSignal(t, e);
  if(!reduced) requestAnimationFrame(draw);
}

/* ---------- signal ---------- */
const sig = $("signal"), sctx = sig.getContext("2d");
let spike = 0, nextSpike = 4+Math.random()*7;
function drawSignal(t, e){
  const w = sig.width, h = sig.height;
  sctx.clearRect(0, 0, w, h);
  if(e < 2.75 && !reduced) return;
  if(t > nextSpike){ spike = 1; nextSpike = t + 5 + Math.random()*9; }
  spike *= .94;
  sctx.strokeStyle = "rgba(143,181,255,.7)";
  sctx.lineWidth = 1;
  sctx.beginPath();
  for(let x=0;x<=w;x+=2){
    const ph = x/w*Math.PI*4 + t*1.8;
    const env = Math.exp(-Math.pow((x-w*.5)/(w*.32), 2));
    const sp = spike*Math.sin(x/w*Math.PI*18 + t*14)*7*Math.exp(-Math.pow((x-w*.55)/(w*.1), 2));
    const y = h/2 + Math.sin(ph)*2.2*env + sp;
    x===0 ? sctx.moveTo(x, y) : sctx.lineTo(x, y);
  }
  sctx.stroke();
}
draw();

/* ---------- scroll reveal ---------- */
(function(){
  const els = document.querySelectorAll("section > *, .creed > *");
  els.forEach(el => el.classList.add("reveal"));
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if(en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold:.12, rootMargin:"0px 0px -40px 0px" });
  els.forEach(el => io.observe(el));
})();

/* ---------- nav backdrop on scroll ---------- */
(function(){
  const nav = document.querySelector(".topnav");
  const onScroll = () => nav.classList.toggle("scrolled", scrollY > 40);
  addEventListener("scroll", onScroll, { passive:true });
  onScroll();
})();
