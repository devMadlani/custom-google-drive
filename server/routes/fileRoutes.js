import express from "express";
import { createWriteStream } from "fs";
import { rename, rm } from "fs/promises";
import path from "path";

const router = express.Router();

//CREATE
router.post("/*", (req, res) => {
  const filePath = path.join("/", req.params[0]);
  console.log(filePath);
  const writeableStrem = createWriteStream(`./storage/${filePath}`);
  req.pipe(writeableStrem);
  req.on("end", () => {
    res.json({ message: "File Uploaded Successfully" });
  });
});

//READ
// wild card routing
router.get("/*", (req, res) => {
  const filePath = path.join("/", req.params[0]);
  if (req.query.action === "download") {
    res.set("Content-Disposition", "attachment");
  }
  res.sendFile(`${process.cwd()}/storage/${filePath}`, (err) => {
    if (err) {
      res.json({ message: "file not found" });
    }
  });
});

//DELETE

router.delete("/*", async (req, res) => {
  const filePath = path.join("/", req.params[0]);
  try {
    await rm(`${import.meta.dirname}/storage/${filePath}`, { recursive: true });
    res.json({ message: "File Deleted Successfully" });
  } catch (error) {
    res.status(404).json({ message: "File Not Found" });
  }
});

//UPDATE
router.patch("/*", async (req, res) => {
  const filePath = req.params[0];
  await rename(`./storage/${filePath}`, `./storage/${req.body.newFileName}`);
  res.json({ message: "File Renamed Successfully" });
});

export default router;
