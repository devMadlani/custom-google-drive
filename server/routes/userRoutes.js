import express from "express";
import checkAuth, { IsNotNormalUser } from "../middleware/authMiddleware.js";

import {
  getUser,
  loginUser,
  logoutAll,
  logoutUser,
  register,
  getAllUser,
  logouyById,
} from "../controller/userController.js";

const router = express.Router();

router.get("/user", checkAuth, getUser);

router.get("/users", checkAuth, IsNotNormalUser, getAllUser);

router.post("/user/register", register);

router.post("/user/login", loginUser);

router.post("/users/:userId/logout", logouyById);

router.post("/user/logout", logoutUser);

router.post("/user/logout-all", checkAuth, logoutAll);

export default router;
