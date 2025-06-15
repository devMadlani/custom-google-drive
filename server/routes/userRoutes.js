import express from "express";
import checkAuth from "../middleware/authMiddleware.js";

import {
  getUser,
  loginUser,
  logoutUser,
  register,
} from "../controller/userController.js";

const router = express.Router();

router.get("/", checkAuth, getUser);

router.post("/register", register);

router.post("/login", loginUser);

router.post("/logout", logoutUser);

export default router;
