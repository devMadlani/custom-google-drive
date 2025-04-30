import express from "express";
import { mkdir, readdir, stat } from "fs/promises";
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
    res.json({...directoryData,files});
  } else {
    const directoryData = directoriesData.find(
      (folder) => folder.id === req.params.id
    );
    const files = directoryData.files.map((fileId) =>
      filesData.find((file) => file.id === fileId)
    );
    res.json({...directoryData,files});
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
