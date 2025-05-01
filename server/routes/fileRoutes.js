import express from "express";
import { createWriteStream } from "fs";
import { rename, rm, writeFile } from "fs/promises";
import path from "path";
import fileData from "../filesDB.json" with { type: "json" };
import directoriesData from "../directoriesDB.json" with { type: "json" };


const router = express.Router();

//CREATE
router.post("/:parentDirId?", (req, res) => {
  const  parentDirId  = req.params.parentDirId || directoriesData[0].id;
  const filename = req.headers.filename;
  const extention = path.extname(filename);
  const id = crypto.randomUUID();
  const fullFileName = `${id}${extention}`;
  const writeableStrem = createWriteStream(`./storage/${fullFileName}`);
  req.pipe(writeableStrem);
  req.on("end", async() => {
    fileData.push({ id, extention,name:filename,parentDirId });
    const parentDirData = directoriesData.find((dir) => dir.id == parentDirId);
    parentDirData.files.push(id);
    await writeFile("./filesDB.json", JSON.stringify(fileData));
    await writeFile("./directoriesDB.json", JSON.stringify(directoriesData));
    res.json({ message: "File Uploaded Successfully" });
  });
});

//READ
// wild card routing
router.get("/:id", (req, res) => {
  const {id} = req.params 
  const data = fileData.find((file)=> file.id === id)
  if (req.query.action === "download") {
    res.set("Content-Disposition",` attachment; filename=${data.name}`);
  }
  const fullFileName = `${id}${data.extention}`;
  res.sendFile(`${process.cwd()}/storage/${fullFileName}`, (err) => {
    if (!res.headersSent) {
      res.json({ message: "file not found" });
    }
  });
});

//DELETE

router.delete("/:id", async (req, res) => {
  const {id} = req.params
  const fileIndex= fileData.findIndex((file)=> file.id === id)
  const data= fileData[fileIndex]
  const fullFileName = `${id}${data.extention}`;
  try {
    await rm(`./storage/${fullFileName}`, { recursive: true });
    fileData.splice(fileIndex, 1);
   const parentDirData = directoriesData.find((dir) => dir.id == data.parentDirId)
   console.log(parentDirData);
   parentDirData.files = parentDirData.files.filter((fileId) => fileId !== id);
    await writeFile("./filesDB.json", JSON.stringify(fileData));
    await writeFile("./directoriesDB.json", JSON.stringify(directoriesData));
    res.json({ message: "File Deleted Successfully" });
  } catch (error) {
    res.status(404).json({ message: "File Not Found" });
  }
});

//UPDATE
router.patch("/:id", async (req, res) => {
  const {id} = req.params
  const data = fileData.find((file)=> file.id === id)
  data.name = req.body.newFileName;
  await writeFile("./filesDB.json", JSON.stringify(fileData));
  res.json({ message: "File Renamed Successfully" });
});

export default router;
