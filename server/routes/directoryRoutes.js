import express from "express";
import validateIdMiddleware from "../middleware/validateIdMiddleware.js";
import {
  createDirectory,
  deleteDirectory,
  getDirectoryContents,
  renameDirectory,
} from "../controller/directoryController.js";
const router = express.Router();

router.param("parentDirid", validateIdMiddleware);
router.param("id", validateIdMiddleware);

//Optional Dynamic Route
router.get("/:id?", getDirectoryContents);

router.post("/:paretnDirId?", createDirectory);

router.patch("/:id", renameDirectory);

router.delete("/:id", deleteDirectory);

export default router;
