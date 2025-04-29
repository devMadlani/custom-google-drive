import express from "express";
import { createWriteStream } from "fs";
import { mkdir, readdir, rename, rm, stat } from "fs/promises";
import cors from "cors";
const app = express();

app.use(express.json());
app.use(cors());

//serving static files
// app.use((req, res, next) => {
//   if (req.query.action === "download") {
//     res.set("Content-Disposition", `attachment; `);
//   }
//   express.static("./storage")(req, res, next);
// });

//Optional Dynamic Route
app.get("/directory/?*", async (req, res) => {
  const { 0: dirname } = req.params;
  const fileList = await readdir(`./storage/${dirname || ""}`);
  const resData = [];
  for (const item of fileList) {
    const stats = await stat(`./storage/${dirname || ""}/${item}`);
    resData.push({ name: item, isDirectory: stats.isDirectory() });
  }
  res.json(resData);
});

//CREATE
app.post("/directory/*", async (req, res) => {
  const { 0: dirname } = req.params;
  try {
    await mkdir(`${import.meta.dirname}/storage/${dirname || ""}`);
    res.json({ message: "Directory Created Successfully" });
  } catch (error) {
    res.json({ message: error.message });
  }
});

//CREATE
app.post("/files/*", (req, res) => {
  const { 0: filePath } = req.params;
  const writeableStrem = createWriteStream(`./storage/${filePath}`);
  req.pipe(writeableStrem);
  req.on("end", () => {
    res.json({ message: "File Uploaded Successfully" });
  });
});

//READ
// wild card routing
app.get("/files/*", (req, res) => {
  const filePath = req.params[0];
  if (req.query.action === "download") {
    res.set("Content-Disposition", "attachment");
  }
  res.sendFile(`${import.meta.dirname}/storage/${filePath}`);
});

//DELETE

app.delete("/files/*", async (req, res) => {
  const { 0: filePath } = req.params;
  try {
    await rm(`${import.meta.dirname}/storage/${filePath}`, { recursive: true });
    res.json({ message: "File Deleted Successfully" });
  } catch (error) {
    res.status(404).json({ message: "File Not Found" });
  }
});

//UPDATE
app.patch("/files/*", async (req, res) => {
  const { 0: filePath } = req.params;
  await rename(`./storage/${filePath}`, `./storage/${req.body.newFileName}`);
  res.json({ message: "File Renamed Successfully" });
});

app.listen(4000, () => {
  console.log("Example app listening on port 4000!");
});
