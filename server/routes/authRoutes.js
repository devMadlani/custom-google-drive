import express from "express";
import {
  sendOtp,
  verifyOtp,
  loginWithGoogle,
} from "../controller/authController.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/google", loginWithGoogle);

export default router;
