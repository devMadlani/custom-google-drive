import express from "express";
import { mkdir, readdir, rm, stat, writeFile } from "fs/promises";
import path from "path";
import directoriesData from "../directoriesDB.json" with { type: "json" };
import filesData from "../filesDB.json" with { type: "json" };

const router = express.Router();

//Optional Dynamic Route
router.get("/:id?", async (req, res) => {
  const { id } = req.params;
  let directoryData = id
    ? directoriesData.find((directory) => directory.id === req.params.id)
    : directoriesData[0];

  const files = directoryData.files.map((fileId) =>
    filesData.find((file) => file.id === fileId)
  );
  const directories = directoryData.directories
    .map((dirId) => directoriesData.find((dir) => dir.id === dirId))
    .map(({ id, name }) => ({ id, name }));
  res.json({ ...directoryData, files, directories });
});

//CREATE
router.post("/:paretnDirId?", async (req, res) => {
  const parentDirId = req.params.paretnDirId || directoriesData[0].id;
  const { newDirName } = req.body;
  const id = crypto.randomUUID();
  try {
    const parentDirData = directoriesData.find((dir) => dir.id === parentDirId);
    parentDirData.directories.push(id);
    directoriesData.push({
      id,
      name: newDirName,
      parentDirId,
      files: [],
      directories: [],
    });
    await writeFile("./directoriesDB.json", JSON.stringify(directoriesData));

    res.json({ message: "Directory Created Successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//UPDATE
router.patch("/:id", async (req, res) => {
  const {id} = req.params 
  const data = directoriesData.find(dir=> dir.id === id)
  data.name = req.body.newDirName;
  await writeFile("./directoryRoutes.js", JSON.stringify(directoriesData))
  res.json({ message: "Directory Renamed Successfully" });

})

router.delete("/:id", async (req, res) => {
  const {id} = req.params
  try {
    const dirIndex = directoriesData.findIndex((directory) => directory.id === id)
    const directoryData = directoriesData[dirIndex]
    directoriesData.splice(dirIndex, 1)
    for await (const fileId of directoryData.files) {
      const fileIndex = filesData.findIndex((file) => file.id === fileId)
      const fileData = filesData[fileIndex]
      await rm(`./storage/${fileId}${fileData.extention}`);
      filesData.splice(fileIndex, 1)
    }
    for await (const dirId of directoryData.directories) {
      const dirIndex = directoriesData.findIndex(({id}) => id === dirId)
      directoriesData.splice(dirIndex, 1)
    }
    const parentDirData = directoriesData.find((dirData) => dirData.id === directoryData.parentDirId)
    parentDirData.directories = parentDirData.directories.filter((dirId) => dirId !== id)
    await writeFile('./filesDB.json', JSON.stringify(filesData))
    await writeFile('./directoriesDB.json', JSON.stringify(directoriesData))
    res.json({ message: "Directory Deleted!" });
  } catch (err) {
    console.log(err);
    res.json({ err: err.message });
  }
});

export default router;
