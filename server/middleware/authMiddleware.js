// import usersData from "../usersDB.json" with { type: "json" };

import { ObjectId } from "mongodb";

async function checkAuth(req, res, next) {
  const { userId } = req.cookies;
  const db = req.db;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await db
    .collection("users")
    .findOne({ _id: new ObjectId(userId) });
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  req.user = user;
  next();
}

export default checkAuth;
