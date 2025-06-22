// import usersData from "../usersDB.json" with { type: "json" };

import { ObjectId } from "mongodb";
import User from "../models/userModel.js";

async function checkAuth(req, res, next) {
  const { userId } = req.cookies;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { id, expiry: expiryTimeInSec } = JSON.parse(
    Buffer.from(userId, "base64url").toString()
  );
  console.log(id, expiryTimeInSec);
  const currentTimeInSec = Math.round(Date.now() / 1000);
  if (currentTimeInSec > expiryTimeInSec) {
    res.clearCookie("userId");
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
