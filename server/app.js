import express from "express";
import { readdir, rename, rm } from "fs/promises";
const app = express();
app.use((req, res, next) => {
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Headers": "*",
  });
  next();
});
app.use(express.json());
//serving static files
// app.use((req, res, next) => {
//   if (req.query.action === "download") {
//     res.set("Content-Disposition", `attachment; `);
//   }
//   express.static("./storage")(req, res, next);
// });

app.get("/:filename", (req, res) => {
  const { filename } = req.params;
  if (req.query.action === "download") {
    res.set("Content-Disposition", "attchment");
  }
  res.sendFile(`${import.meta.dirname}/storage/${filename}`);
});
app.delete("/:filename", async (req, res) => {
  const { filename } = req.params;
  try {
    await rm(`${import.meta.dirname}/storage/${filename}`);
    res.json({ message: "File Deleted Successfully" });
  } catch (error) {
    res.status(404).json({ message: "File Not Found" });
  }
});

app.patch("/:filename", async (req, res) => {
  const { filename } = req.params;
  await rename(`./storage/${filename}`, `./storage/${req.body.newFileName}`);
  res.json({ message: "File Renamed Successfully" });
});

//serving directory content
app.get("/", async (req, res) => {
  const fileList = await readdir("./storage");
  res.json(fileList);
});

app.listen(4000, () => {
  console.log("Example app listening on port 4000!");
});
