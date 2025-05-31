import express from "express";
import { rm } from "fs/promises";
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
  const _id = req.params.id ? new ObjectId(req.params.id) : user.rootDirId;
  const directoryData = await dirCollection.findOne({ _id });
  if (!directoryData) {
    return res
      .status(404)
      .json({ error: "Directory not found or you do not have access to it!" });
  }

  const files = await db
    .collection("files")
    .find({ parentDir: directoryData._id })
    .toArray();
  const directories = await dirCollection.find({ parentDirId: _id }).toArray();

  return res.status(200).json({
    ...directoryData,
    files: files.map((file) => ({ ...file, id: file._id })),
    directories: directories.map((dir) => ({ ...dir, id: dir._id })),
  });
});

//CREATE
router.post("/:paretnDirId?", async (req, res, next) => {
  const user = req.user;
  const db = req.db;
  const dirCollection = db.collection("directories");

  const parentDirId = req.params.paretnDirId
    ? new ObjectId(req.params.paretnDirId)
    : user.rootDirId;
  const dirname = req.headers.dirname || "untitled";

  try {
    const parentDirData = await dirCollection.findOne({
      _id: parentDirId,
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
  const { id } = req.params;
  const db = req.db;
  const fileCollection = db.collection("files");
  const dirCollection = db.collection("directories");
  const dirObjId = new ObjectId(id);

  const directoryData = await dirCollection.findOne(
    {
      _id: dirObjId,
      userId: req.user._id,
    },
    { projection: { _id: 1 } }
  );

  if (!directoryData) {
    return res
      .status(404)
      .json({ error: "Directory not found or you do not have access to it!" });
  }
  async function getDirectoryContents(id) {
    let files = await fileCollection
      .find({ parentDir: id }, { projection: { extension: 1 } })
      .toArray();
    let directories = await dirCollection
      .find({ parentDirId: id }, { projection: { _id: 1 } })
      .toArray();

    for (const { _id, name } of directories) {
      const { files: chiledFiles, directories: chiledDirectories } =
        await getDirectoryContents(_id);
      files = [...files, ...chiledFiles];
      directories = [...directories, ...chiledDirectories];
    }

    return { files, directories };
  }
  const { files, directories } = await getDirectoryContents(dirObjId);

  for (const { _id, extension } of files) {
    await rm(`./storage/${_id.toString()}${extension}`);
  }

  await fileCollection.deleteMany({
    _id: { $in: files.map(({ _id }) => _id) },
  });
  await dirCollection.deleteMany({
    _id: { $in: [...directories.map(({ _id }) => _id), dirObjId] },
  });

  return res.status(200).json({ message: "Directory Deleted Successfully" });
});

export default router;
