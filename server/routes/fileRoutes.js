import express from "express";
import { createWriteStream } from "fs";
import { rename, rm, writeFile } from "fs/promises";
import path from "path";
import fileData from "../filesDB.json" with { type: "json" };

const router = express.Router();

//CREATE
router.post("/:filename", (req, res) => {
  const { filename } = req.params;
  const extention = path.extname(filename);
  const id = crypto.randomUUID();
  const fullFileName = `${id}${extention}`;
  const writeableStrem = createWriteStream(`./storage/${fullFileName}`);
  req.pipe(writeableStrem);
  req.on("end", async() => {
    fileData.push({ id, extention,name:filename });
    await writeFile("./filesDB.json", JSON.stringify(fileData));
    res.json({ message: "File Uploaded Successfully" });
  });
});

//READ
// wild card routing
router.get("/:id", (req, res) => {
  const {id} = req.params 
  const data = fileData.find((file)=> file.id === id)
  if (req.query.action === "download") {
    res.set("Content-Disposition", "attachment");
  }
  const fullFileName = `${id}${data.extention}`;
  res.sendFile(`${process.cwd()}/storage/${fullFileName}`, (err) => {
    if (err) {
      res.json({ message: "file not found" });
    }
  });
});

//DELETE

router.delete("/:id", async (req, res) => {
  const {id} = req.params
  const data= fileData.find((file)=> file.id === id)
  const fullFileName = `${id}${data.extention}`;
  console.log(fullFileName);
  try {
    await rm(`./storage/${fullFileName}`, { recursive: true });
    const newFileData = fileData.filter((file) => file.id !== id);
    await writeFile("./filesDB.json", JSON.stringify(newFileData));
    res.json({ message: "File Deleted Successfully" });
  } catch (error) {
    res.status(404).json({ message: "File Not Found" });
  }
});

//UPDATE
router.patch("/:id", async (req, res) => {
  const {id} = req.params
  const data = fileData.find((file)=> file.id === id)
  console.log(data)
  if(!data){
    res.status(404).json({message : "File Not Found"})
    return
  }
const fullFileName = `${id}${data.extention}`
  await rename(`./storage/${fullFileName}`, `./storage/${req.body.newFileName}`);
  console.log(fileData.find((file)=> file.id === id))
  res.json({ message: "File Renamed Successfully" });
});

export default router;
