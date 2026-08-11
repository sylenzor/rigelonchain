# transferring rigel to Cowork — checklist

## one-time setup
1. Extract the final zip into: C:\Users\Maksim\Desktop\rigelonchain
   (files at root: package.json, server.js, CLAUDE.md, public\, data\)
2. Install Claude Desktop → open the Cowork tab
3. When asked for a working folder, point it at C:\Users\Maksim\Desktop\rigelonchain
4. Cowork auto-reads CLAUDE.md — the full project context lives there. First message can just be:
   "read CLAUDE.md and confirm you're oriented, then let's write transmission 01"

## running the site (same as before)
- terminal in the folder: npm install (once), then npm start → http://localhost:3000
- daily content edits: data/site.json only → refresh browser
- css/js changes: hard refresh (Ctrl+Shift+R)

## what Cowork should NOT need to redo
- design system, hero, sections — DONE (see CLAUDE.md "brand / design system")
- accessibility/interaction pass — DONE
- external design critique — implemented

## first tasks for Cowork, in order
1. choose briefHourUTC with Maksim, set it in data/site.json
2. draft transmission 01 (format in CLAUDE.md), post to X, mirror into site.json, remove demo flags
3. keep the streak: one brief/day, verdicts flipped next day
4. after ~day 4: set up GitHub repo + deploy to Render/Railway
