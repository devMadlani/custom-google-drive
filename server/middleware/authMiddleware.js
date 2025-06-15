// import usersData from "../usersDB.json" with { type: "json" };

import { ObjectId } from "mongodb";
import User from "../models/userModel.js";

async function checkAuth(req, res, next) {
  const { userId } = req.cookies;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await User.findById(userId);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  req.user = user;
  next();
}

export default checkAuth;
