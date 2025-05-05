import express from "express";
import { createWriteStream } from "fs";
import { rm, writeFile } from "fs/promises";
import path from "path";
import fileData from "../filesDB.json" with { type: "json" };
import directoriesData from "../directoriesDB.json" with { type: "json" };

const router = express.Router();

//CREATE
router.post("/:parentDirId?", (req, res) => {
  const parentDirId = req.params.parentDirId || directoriesData[0].id;
  const filename = req.headers.filename || "untitled";
  const extention = path.extname(filename);
  const id = crypto.randomUUID();
  const fullFileName = `${id}${extention}`;
  const writeableStrem = createWriteStream(`./storage/${fullFileName}`);
  req.pipe(writeableStrem);
  req.on("end", async () => {
    fileData.push({ id, extention, name: filename, parentDirId });
    const parentDirData = directoriesData.find((dir) => dir.id == parentDirId);
    parentDirData.files.push(id);
    try {
      await writeFile("./filesDB.json", JSON.stringify(fileData));
      await writeFile("./directoriesDB.json", JSON.stringify(directoriesData));
      return res.status(201).json({ message: "File Uploaded Successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  });
});

//READ
// wild card routing
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const data = fileData.find((file) => file.id === id);
  if (!data) {
    return res.status(404).json({ message: "File Not Found" });
  }
  if (req.query.action === "download") {
    res.set("Content-Disposition", ` attachment; filename=${data.name}`);
  }
  const fullFileName = `${id}${data.extention}`;
  res.sendFile(`${process.cwd()}/storage/${fullFileName}`, (err) => {
    if (!res.headersSent && err) {
      res.status(404).json({ message: "file not found" });
    }
  });
});

//DELETE

router.delete("/:id", async (req, res, error) => {
  const { id } = req.params;
  const fileIndex = fileData.findIndex((file) => file.id === id);
  if (fileIndex === -1) {
    return res.status(404).json({ message: "File Not Found" });
  }
  const data = fileData[fileIndex];
  const fullFileName = `${id}${data.extention}`;
  try {
    await rm(`./storage/${fullFileName}`, { recursive: true });
    fileData.splice(fileIndex, 1);
    const parentDirData = directoriesData.find(
      (dir) => dir.id == data.parentDirId
    );
    console.log(parentDirData);
    parentDirData.files = parentDirData.files.filter((fileId) => fileId !== id);
    await writeFile("./filesDB.json", JSON.stringify(fileData));
    await writeFile("./directoriesDB.json", JSON.stringify(directoriesData));
    return res.status(200).json({ message: "File Deleted Successfully" });
  } catch (error) {
    next(error);
  }
});

//UPDATE
router.patch("/:id", async (req, res, next) => {
  const { id } = req.params;
  const data = fileData.find((file) => file.id === id);
  data.name = req.body.newFileName;
  try {
    await writeFile("./filesDB.json", JSON.stringify(fileData));
    return res.status(200).json({ message: "File Renamed Successfully" });
  } catch (error) {
    error.status = 500;
    next(error);
  }
});

export default router;
