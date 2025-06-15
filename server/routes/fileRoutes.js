import express from "express";
import validateIdMiddleware from "../middleware/validateIdMiddleware.js";
import {
  deleteFile,
  getFile,
  renameFile,
  uploadFile,
} from "../controller/fileController.js";

const router = express.Router();

router.param("parentDirid", validateIdMiddleware);
router.param("id", validateIdMiddleware);

//CREATE
router.post("/:parentDirId?", uploadFile);

//READ
// wild card routing
router.get("/:id", getFile);

//DELETE

router.delete("/:id", deleteFile);

//UPDATE
router.patch("/:id", renameFile);

export default router;
