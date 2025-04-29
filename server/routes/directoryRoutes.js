import express from "express";
import { mkdir, readdir, stat } from "fs/promises";
import path from "path";

const router = express.Router();

//Optional Dynamic Route
router.get("/?*", async (req, res) => {
  const dirname = path.join("/", req.params[0]);

  try {
    const fileList = await readdir(`./storage/${dirname || ""}`);
    const resData = [];
    for (const item of fileList) {
      const stats = await stat(`./storage/${dirname || ""}/${item}`);
      resData.push({ name: item, isDirectory: stats.isDirectory() });
    }
    res.json(resData);
  } catch (error) {
    res.json({ message: error.message });
  }
});

//CREATE
router.post("/*", async (req, res) => {
  const dirname = path.join("/", req.params[0]);
  try {
    await mkdir(`./storage/${dirname}`);
    res.json({ message: "Directory Created Successfully" });
  } catch (error) {
    res.json({ message: error.message });
  }
});

export default router;
