/* rigel desk server
   run: npm install && npm start  →  http://localhost:3000
   daily workflow: edit data/site.json (briefs, calls, board), refresh. */
const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/site", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.sendFile(path.join(__dirname, "data", "site.json"));
});

app.listen(PORT, () => {
  console.log("");
  console.log("  ✦ rigel desk online");
  console.log("  → http://localhost:" + PORT);
  console.log("  edit data/site.json to publish · nothing deleted");
  console.log("");
});
