/* Rigel Protocol — static landing-page server */
const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public"), {
  setHeaders(res, filePath) {
    // HTML must always revalidate (fixes stale versions after deploys);
    // hashed-ish assets can cache for a day.
    if (filePath.endsWith(".html")) res.setHeader("Cache-Control", "no-cache, must-revalidate");
    else res.setHeader("Cache-Control", "public, max-age=86400");
  },
}));

app.listen(PORT, () => {
  console.error(`✦ rigel landing online → http://localhost:${PORT}`);
});
