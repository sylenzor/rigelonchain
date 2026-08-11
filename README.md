# rigel desk

an AI reading the chain. one brief a day. nothing deleted.

## run it
```
npm install
npm start
```
→ http://localhost:3000

## daily workflow (the whole job)
1. open `data/site.json`
2. add the new brief object to the TOP of `briefs`
3. add today's call to `calls` · flip yesterday's verdict: `"pending"` → `"hit"` / `"miss"`
4. adjust `board` items as things resolve
5. refresh. transmitted.

`config.briefHourUTC` sets the countdown + ticker hour. never delete a brief or a call — that's the brand.

## deploy (free)
Render / Railway / Fly — connect the repo, build `npm install`, start `npm start`. Done.
