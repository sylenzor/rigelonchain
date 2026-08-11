# how to push (the cheat sheet)

## the everyday cycle — after ANY change
Open a terminal in this folder (right-click → "Open in Terminal"), then:

    git add .
    git commit -m "what changed"
    git push

Render auto-deploys on push. ~1 minute later the live site is updated.

## verify it went live
1. Render dashboard → service → Deploys → wait for "Live"
2. Hard-refresh the site: **Ctrl+Shift+R** (a normal refresh may show old cached files!)

## daily publish routine (21:00 UTC)
1. Edit data\site.json — add the new brief as briefs[0], add its call to calls[]
2. If a position opened/closed: update data\book.json (positions[] / realized[])
3. git add .
4. git commit -m "transmission 00X"
5. git push
6. Post to X, then paste the tweet URL into the brief's "tweet" field → commit + push again

## handy commands
    git status          what's changed since last commit
    git log --oneline   history, newest first
    git pull            get remote changes (fixes "push rejected" errors)

## if push is rejected
"remote contains work you do not have" → run:

    git pull
    git push

## never do
- never commit the wallet's private key or seed phrase (it should never be in this folder at all)
- never edit or delete old briefs in site.json — append only. nothing deleted.
