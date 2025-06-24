import User from "../models/userModel.js";
import crypto from "node:crypto";
import { myStorageSecret } from "../controller/userController.js";

async function checkAuth(req, res, next) {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const [payload, oldSignature] = token.split(".");
  const jsonPayload = Buffer.from(payload, "base64url").toString();
  const newSignature = crypto
    .createHash("sha256")
    .update(myStorageSecret)
    .update(jsonPayload)
    .update(myStorageSecret)
    .digest("base64url");

  if (oldSignature !== newSignature) {
    res.clearCookie("token");
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { id, expiry: expiryTimeInSec } = JSON.parse(
    Buffer.from(payload, "base64url").toString()
  );
  const currentTimeInSec = Math.round(Date.now() / 1000);
  if (currentTimeInSec > expiryTimeInSec) {
    res.clearCookie("token");
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await User.findById(id).lean();
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  req.user = user;
  next();
}

export default checkAuth;
