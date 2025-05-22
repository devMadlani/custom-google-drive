import express from "express";
import { rm, writeFile } from "fs/promises";
// import directoriesData from "../directoriesDB.json" with { type: "json" };
// import filesData from "../filesDB.json" with { type: "json" };
import validateIdMiddleware from "../middleware/validateIdMiddleware.js";
import { ObjectId } from "mongodb";
const router = express.Router();

router.param("parentDirid", validateIdMiddleware);
router.param("id", validateIdMiddleware);

//Optional Dynamic Route
router.get("/:id?", async (req, res) => {
  const db = req.db;
  const user = req.user;
  const dirCollection = db.collection("directories");
  const id = req.params.id || user.rootDirId;
  const directoryData = await dirCollection.findOne({ _id: new ObjectId(id) });
  if (!directoryData) {
    return res
      .status(404)
      .json({ error: "Directory not found or you do not have access to it!" });
  }

  const files = [];
  const directories = await dirCollection
    .find({ parentDirId: new ObjectId(id) })
    .toArray();

  return res.status(200).json({
    ...directoryData,
    files,
    directories: directories.map((dir) => ({ ...dir, id: dir._id })),
  });
});

//CREATE
router.post("/:paretnDirId?", async (req, res, next) => {
  const user = req.user;
  const db = req.db;
  const dirCollection = db.collection("directories");

  const parentDirId = req.params.paretnDirId || user.rootDirId;
  const dirname = req.headers.dirname || "untitled";

  try {
    const parentDirData = await dirCollection.findOne({
      _id: new ObjectId(parentDirId),
    });
    if (!parentDirData) {
      return res
        .status(404)
        .json({ message: "Parent Directory Does not exist" });
    }
    await dirCollection.insertOne({
      name: dirname,
      parentDirId,
      userId: user._id,
    });
    return res.status(201).json({ message: "Directory Created Successfully" });
  } catch (error) {
    next(error);
  }
});

//UPDATE
router.patch("/:id", async (req, res, next) => {
  const user = req.user;
  const { id } = req.params;
  const { newDirName } = req.body;
  const db = req.db;
  const dirCollection = db.collection("directories");

  try {
    await dirCollection.updateOne(
      { _id: new ObjectId(id), userId: user._id },
      { $set: { name: newDirName } }
    );
    res.status(200).json({ message: "Directory Renamed Successfully" });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  const user = req.user;
  const { id } = req.params;
  const dirIndex = directoriesData.findIndex(
    (directory) => directory.id === id
  );
  if (dirIndex === -1)
    return res.status(404).json({ message: "Directory not found!" });

  const directoryData = directoriesData[dirIndex];

  // Check if the directory belongs to the user
  if (directoryData.userId !== user.id) {
    return res
      .status(403)
      .json({ message: "You are not authorized to delete this directory!" });
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
    next(err);
  }
});

export default router;
