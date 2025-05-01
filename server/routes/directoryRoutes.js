import express from "express";
import { mkdir, readdir, stat, writeFile } from "fs/promises";
import path from "path";
import directoriesData from "../directoriesDB.json" with { type: "json" };
import filesData from "../filesDB.json" with { type: "json" };

const router = express.Router();

//Optional Dynamic Route
router.get("/:id?", async (req, res) => {
  const { id } = req.params;
  if (!id) {
    const directoryData = directoriesData[0];
    const files = directoryData.files.map((fileId) =>
      filesData.find((file) => file.id === fileId)
    );
    const directories = directoryData.directories.map(dirId =>
      directoriesData.find((dir)=> dir.id ===dirId )
    )
    res.json({ ...directoryData, files , directories });
  } else {
    const directoryData = directoriesData.find(
      (folder) => folder.id === req.params.id
    );
    const files = directoryData.files.map((fileId) =>
      filesData.find((file) => file.id === fileId)
    );
    res.json({ ...directoryData, files });
  }
});

//CREATE
router.post("/:paretnDirId?", async (req, res) => {
  const parentDirId = req.params.paretnDirId || directoriesData[0].id;

  const { newDirName } = req.body;
  const id = crypto.randomUUID();
  try {
    const parentDirData = directoriesData.find((dir) => dir.id === parentDirId);
    console.log(parentDirData.directories.push(id))
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

export default router;
