import express from "express";
import { createWriteStream } from "fs";
import { readdir, rename, rm, stat } from "fs/promises";
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

//CREATE
app.post("/files/:filename", (req, res) => {
  const { filename } = req.params;
  const writeableStrem = createWriteStream(`./storage/${filename}`);
  req.pipe(writeableStrem);
  req.on("end", () => {
    res.json({ message: "File Uploaded Successfully" });
  });
});

//READ
app.get("/files/:filename", (req, res) => {
  const { filename } = req.params;
  if (req.query.action === "download") {
    res.set("Content-Disposition", "attachment");
  }
  res.sendFile(`${import.meta.dirname}/storage/${filename}`);
});

//serving directory content

//Optional Dynamic Route

app.get("/directory", async (req, res) => {
  const { dirname } = req.params;
  const fileList = await readdir("./storage");
  const resData = [];
  for (const item of fileList) {
    const stats = await stat(`./storage/${item}`);
    resData.push({ name: item, isDirectory: stats.isDirectory() });
  }
  res.json(resData);
});

app.get("/directory/:dirname", async (req, res) => {
  const { dirname } = req.params;
  const fileList = await readdir(`./storage/${dirname}`);
  const resData = [];
  for (const item of fileList) {
    const stats = await stat(`./storage/${dirname}/${item}`);
    resData.push({ name: item, isDirectory: stats.isDirectory() });
  }
  res.json(resData);
});

//DELETE
app.delete("/files/:filename", async (req, res) => {
  const { filename } = req.params;
  try {
    await rm(`${import.meta.dirname}/storage/${filename}`);
    res.json({ message: "File Deleted Successfully" });
  } catch (error) {
    res.status(404).json({ message: "File Not Found" });
  }
});

//UPDATE
app.patch("/files/:filename", async (req, res) => {
  const { filename } = req.params;
  await rename(`./storage/${filename}`, `./storage/${req.body.newFileName}`);
  res.json({ message: "File Renamed Successfully" });
});

app.listen(4000, () => {
  console.log("Example app listening on port 4000!");
});
