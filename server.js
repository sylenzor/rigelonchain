/* Rigel Protocol — static landing-page server */
const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.error(`✦ rigel landing online → http://localhost:${PORT}`);
});
