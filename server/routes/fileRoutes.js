import express from "express";
import validateIdMiddleware from "../middleware/validateIdMiddleware.js";
import {
  deleteFile,
  getFile,
  renameFile,
  uploadComplete,
  uploadFile,
  uploadInitiate,
} from "../controller/fileController.js";

const router = express.Router();

router.param("parentDirId", validateIdMiddleware);
router.param("id", validateIdMiddleware);

router.post("/upload/initiate", uploadInitiate);
router.post("/upload/complete", uploadComplete);

router.post("/:parentDirId?", uploadFile);

router.get("/:id", getFile);

router.patch("/:id", renameFile);

router.delete("/:id", deleteFile);

export default router;
