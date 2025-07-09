import OTP from "../models/otpModel.js";
import { SendOtpService } from "../services/SendOtpService.js";

export const sendOtp = async (req, res, next) => {
  const { email } = req.body;
  const resData = await SendOtpService(email);
  res.status(200).json(resData);
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const otpRecord = await OTP.findOne({ email, otp });
  if (!otpRecord) {
    return res.status(400).json({ error: "Invalid or Expired Otp" });
  }
  res.json({ message: "Otp verified" });
};
