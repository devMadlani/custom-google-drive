import express from "express";
import { createWriteStream } from "fs";
import { rm, writeFile } from "fs/promises";
import path from "path";
import fileData from "../filesDB.json" with { type: "json" };
import directoriesData from "../directoriesDB.json" with { type: "json" };

const router = express.Router();

//CREATE
router.post("/:parentDirId?", (req, res) => {
  const parentDirId = req.params.parentDirId || req.user.rootDirId;

   const parentDirData = directoriesData.find(
    (directoryData) => directoryData.id === parentDirId
  );

  // Check if parent directory exists
  if (!parentDirData) {
    return res.status(404).json({ error: "Parent directory not found!" });
  }

  // Check if the directory belongs to the user
  if (parentDirData.userId !== req.user.id) {
    return res
      .status(403)
      .json({ error: "You do not have permission to upload to this directory." });
  }

  const filename = req.headers.filename || "untitled";
  const extension = path.extname(filename);
  const id = crypto.randomUUID();
  const fullFileName = `${id}${extension}`;
  const writeableStrem = createWriteStream(`./storage/${fullFileName}`);
  req.pipe(writeableStrem);
  req.on("end", async () => {
    fileData.push({ id, extension, name: filename, parentDirId });
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
    return res.status(404).json({ error: "File not found!" });
  }

  const parentDir = directoriesData.find((dir) => dir.id == data.parentDirId);
   if (!parentDir) {
    return res.status(404).json({ error: "Parent directory not found!" });
  }

  if(parentDir.userId !== req.user.id){
    return res.status(401).json({error:"You don't have access to this file"})
  }

  if (req.query.action === "download") {
    res.set("Content-Disposition", ` attachment; filename=${data.name}`);
  }
  const fullFileName = `${id}${data.extension}`;
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

  const parentDir = directoriesData.find((dir) => dir.id == data.parentDirId);
if (!parentDir) {
    return res.status(404).json({ error: "Parent directory not found!" });
  }

  if(parentDir.userId !== req.user.id){
    return res.status(401).json({error:"You don't have access to this file"})
  }
  const fullFileName = `${id}${data.extension}`;
  try {
    await rm(`./storage/${fullFileName}`, { recursive: true });
    fileData.splice(fileIndex, 1);
    const parentDirData = directoriesData.find(
      (dir) => dir.id == data.parentDirId
    );
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
  if(!data){
    return res.status(404).json({message:"File Not Found"})
  }
   const parentDir = directoriesData.find((dir) => dir.id == data.parentDirId);
   if (!parentDir) {
    return res.status(404).json({ error: "Parent directory not found!" });
  }
  if(parentDir.userId !== req.user.id){
    return res.status(401).json({error:"You don't have access to this file"})
  }
  data.name = req.body.newFilename ;
  try {
    await writeFile("./filesDB.json", JSON.stringify(fileData));
    return res.status(200).json({ message: "File Renamed Successfully" });
  } catch (error) {
    error.status = 500;
    next(error);
  }
});

export default router;
