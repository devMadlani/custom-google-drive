import nodemailer from "nodemailer";
import OTP from "../models/otpModel.js";

export async function SendOtpService(email) {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  await OTP.findOneAndUpdate(
    { email },
    { otp, createdAt: Date.now() },
    { upsert: true }
  );

  const html = `
    <div style="font-family:sans-serif;">
        <h2>Your OTP is: ${otp}</h2>
        <p>This otp is valid for 10 minutes.</p>
    </div>
`;
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: "madlanidev@gmail.com",
      pass: "ulcr mrds nsiz jgyu",
    },
  });

  await transporter.sendMail({
    from: "Dev Madlani <madlanidev@gmail.com>",
    to: email,
    subject: "Storage App OTP",
    html,
  });

  return { success: true, message: `OTP sent successfully on ${email}` };
}
