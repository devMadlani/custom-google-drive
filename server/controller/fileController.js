import { createWriteStream } from "fs";
import path from "path";
import { rm } from "fs/promises";
import Directory from "../models/direcotryModel.js";
import File from "../models/fileModel.js";
export const uploadFile = async (req, res, next) => {
  const parentDirId = req.params.parentDirId || req.user.rootDirId;
  try {
    const parentDirData = await Directory.findOne({
      _id: parentDirId,
      userId: req.user._id,
    });

    // Check if parent directory exists
    if (!parentDirData) {
      return res.status(404).json({ error: "Parent directory not found!" });
    }

    const filename = req.headers.filename || "untitled";
    const filesize = req.headers.filesize;

    if (filesize > 100 * 1024) {
      return res
        .status(312)
        .json({ error: "File should be not greater than 100MB" });
    }
    const extension = path.extname(filename);

    const fileData = await File.insertOne({
      extension,
      name: filename,
      size: filesize,
      parentDirId: parentDirData._id,
      userId: req.user._id,
    });
    const fileId = fileData.id;
    const fullFileName = `${fileId}${extension}`;
    const writeableStrem = createWriteStream(`./storage/${fullFileName}`);
    req.pipe(writeableStrem);
    req.on("end", async () => {
      return res.status(201).json({ message: "File Uploaded Successfully" });
    });
    req.on("error", async (error) => {
      await File.deleteOne({ _id: fileData.insertedId });
      return res.status(404).json({ message: "File Could not upload" });
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getFile = async (req, res) => {
  const { id } = req.params;
  const data = await File.findOne({
    _id: id,
    userId: req.user._id,
  }).lean();

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
  const file = await File.findById({
    _id: id,
    userId: req.user._id,
  }).select("extension");

  if (!file) {
    return res.status(404).json({ message: "File Not Found" });
  }

  try {
    const fullFileName = `${id}${file.extension}`;
    await rm(`./storage/${fullFileName}`);
    await file.deleteOne();
    return res.status(200).json({ message: "File Deleted Successfully" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const renameFile = async (req, res, next) => {
  const { id } = req.params;
  const file = await File.findOne({
    _id: id,
    userId: req.user._id,
  });
  if (!file) {
    return res.status(404).json({ message: "File Not Found" });
  }
  try {
    file.name = req.body.newFilename;
    await file.save();
    return res.status(200).json({ message: "File Renamed Successfully" });
  } catch (error) {
    error.status = 500;
    next(error);
  }
};
