import { createWriteStream } from "fs";
import path from "path";
import { ObjectId } from "mongodb";
import { rm } from "fs/promises";

export const uploadFile = async (req, res) => {
  const db = req.db;
  const dirCollection = db.collection("directories");
  const filesCollection = db.collection("files");
  const parentDirId = req.params.parentDirId || req.user.rootDirId;

  const parentDirData = await dirCollection.findOne({
    _id: new ObjectId(parentDirId),
    userId: req.user._id,
  });

  // Check if parent directory exists
  if (!parentDirData) {
    return res.status(404).json({ error: "Parent directory not found!" });
  }

  const filename = req.headers.filename || "untitled";
  const extension = path.extname(filename);

  const fileData = await filesCollection.insertOne({
    extension,
    name: filename,
    parentDirId: parentDirData._id,
    userId: req.user._id,
  });
  const fileId = fileData.insertedId.toString();
  const fullFileName = `${fileId}${extension}`;
  const writeableStrem = createWriteStream(`./storage/${fullFileName}`);
  req.pipe(writeableStrem);
  req.on("end", async () => {
    return res.status(201).json({ message: "File Uploaded Successfully" });
  });
  req.on("error", async (error) => {
    await filesCollection.deleteOne({ _id: fileData.insertedId });
    return res.status(404).json({ message: "File Could not upload" });
  });
};

export const getFile = async (req, res) => {
  const { id } = req.params;
  const db = req.db;
  const filesCollection = db.collection("files");
  const data = await filesCollection.findOne({
    _id: new ObjectId(id),
    userId: req.user._id,
  });

  if (!data) {
    return res.status(404).json({ error: "File not found!" });
  }
  const fullFileName = `${id}${data.extension}`;
  const filePath = `${process.cwd()}/storage/${fullFileName}`;
  if (req.query.action === "download") {
    // res.set("Content-Disposition", ` attachment; filename=${data.name}`);
    return res.download(filePath, data.name);
  }
  res.sendFile(filePath, (err) => {
    if (!res.headersSent && err) {
      res.status(404).json({ message: "file not found" });
    }
  });
};

export const deleteFile = async (req, res, next) => {
  const { id } = req.params;
  const db = req.db;
  const filesCollection = db.collection("files");
  const fileData = await filesCollection.findOne({ _id: new ObjectId(id) });
  if (!fileData) {
    return res.status(404).json({ message: "File Not Found" });
  }
  const fullFileName = `${id}${fileData.extension}`;
  try {
    await rm(`./storage/${fullFileName}`);
    await filesCollection.deleteOne({ _id: fileData._id });
    return res.status(200).json({ message: "File Deleted Successfully" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const renameFile = async (req, res, next) => {
  const { id } = req.params;
  const db = req.db;
  const filesCollection = db.collection("files");
  const fileData = await filesCollection.findOne({
    _id: new ObjectId(id),
    userId: req.user._id,
  });
  if (!fileData) {
    return res.status(404).json({ message: "File Not Found" });
  }
  await filesCollection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        name: req.body.newFilename,
      },
    }
  );
  try {
    return res.status(200).json({ message: "File Renamed Successfully" });
  } catch (error) {
    error.status = 500;
    next(error);
  }
};
