import express from "express";
import { readdir } from "fs/promises";
const app = express();
app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  next();
});
app.use((req, res, next) => {
  if (req.query.action === "download") {
    res.set("Content-Disposition", `attachment; `);
  }
  express.static("./storage")(req, res, next);
});

app.get("/", async (req, res) => {
  const fileList = await readdir("./storage");
  res.json(fileList);
});

app.listen(4000, () => {
  console.log("Example app listening on port 4000!");
});
