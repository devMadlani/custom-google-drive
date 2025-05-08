import express from "express";
import { rm,  writeFile } from "fs/promises";
import directoriesData from "../directoriesDB.json" with { type: "json" };
import filesData from "../filesDB.json" with { type: "json" };
import validateIdMiddleware from "../middleware/validateIdMiddleware.js";
const router = express.Router();


router.param("parentDirid",validateIdMiddleware)
router.param("id",validateIdMiddleware)

//Optional Dynamic Route
router.get("/:id?", async (req, res) => {
  const user = req.user
  const  id  = req.params.id || user.rootDirId
 const directoryData = directoriesData.find((directory) => directory.id === id && directory.userId === user.id);
  if (!directoryData) {
    return res.status(404).json({ error: "Directory not found or you do not have access to it!" });
  }
  
  const files = directoryData.files.map((fileId) =>
    filesData.find((file) => file.id === fileId)
  );
  const directories = directoryData.directories
    .map((dirId) => directoriesData.find((dir) => dir.id === dirId))
    .map(({ id, name }) => ({ id, name }));
    
  return res.status(200).json({ ...directoryData, files, directories });
});

//CREATE
router.post("/:paretnDirId?", async (req, res, next) => {
  const user = req.user
  const parentDirId = req.params.paretnDirId || user.rootDirId;
  const dirname = req.headers.dirname || "untitled";
  const id = crypto.randomUUID();
  const parentDirData = directoriesData.find((dir) => dir.id === parentDirId);
  if (!parentDirData) {
    return res.status(404).json({ message: "Parent Directory Does not exist" });
  }
  parentDirData.directories.push(id);
  directoriesData.push({
    id,
    name: dirname,
    parentDirId,
    files: [],
    userId : user.id,
    directories: [],
  });
  try {
    await writeFile("./directoriesDB.json", JSON.stringify(directoriesData));

    return res.status(201).json({ message: "Directory Created Successfully" });
  } catch (error) {
    next(error);
  }
});

//UPDATE
router.patch("/:id", async (req, res,next) => {
   const user = req.user;
  const { id } = req.params;
  const data = directoriesData.find((dir) => dir.id === id);
  if (!data) {
    return res.status(404).json({ message: "Directory Not Found" });
  }
  if(data.userId !== user.id){
    return res.status(401).json({error:"You don't have access to this directory"})
  }
  data.name = req.body.newDirName;
  try {
    await writeFile("./directoriesDB.json", JSON.stringify(directoriesData));
    res.status(200).json({ message: "Directory Renamed Successfully" })
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res,next) => {
  const user = req.user;
  const { id } = req.params;
  const dirIndex = directoriesData.findIndex(
    (directory) => directory.id === id
  );
  if (dirIndex === -1) return res.status(404).json({ message: "Directory not found!" });
  
  const directoryData = directoriesData[dirIndex];

  // Check if the directory belongs to the user
  if (directoryData.userId !== user.id) {
    return res.status(403).json({ message: "You are not authorized to delete this directory!" });
  }

  try {

    // Remove directory from the database
    directoriesData.splice(dirIndex, 1);

    // Delete all associated files
    for await (const fileId of directoryData.files) {
      const fileIndex = filesData.findIndex((file) => file.id === fileId);
      const fileData = filesData[fileIndex];
      await rm(`./storage/${fileId}${fileData.extension}`);
      filesData.splice(fileIndex, 1);
    }

    // Delete all child directories
    for await (const dirId of directoryData.directories) {
      const dirIndex = directoriesData.findIndex(({ id }) => id === dirId);
      directoriesData.splice(dirIndex, 1);
    }
    
    // Update parent directory
    const parentDirData = directoriesData.find(
      (dirData) => dirData.id === directoryData.parentDirId
    );
    parentDirData.directories = parentDirData.directories.filter(
      (dirId) => dirId !== id
    );

    
    // Save updated data to the database
    await writeFile("./filesDB.json", JSON.stringify(filesData));
    await writeFile("./directoriesDB.json", JSON.stringify(directoriesData));
    res.status(200).json({ message: "Directory Deleted!" });
  } catch (err) {
    next(err)
  }
});

export default router;
