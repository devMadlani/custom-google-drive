import redisClient from "../config/redis.js";
import User from "../models/userModel.js";

async function checkAuth(req, res, next) {
  const { sid } = req.signedCookies;
  if (!sid) {
    res.clearCookie("sid");
    return res.status(401).json({ message: "Unauthorized" });
  }

  const session = await redisClient.json.get(`session:${sid}`);
  if (!session) {
    res.clearCookie("sid");
    return res.status(401).json({ message: "Unauthorized" });
  }
  // const user = await User.findById(session.userId).lean();
  // if (!user) {
  //   return res.status(401).json({ message: "Unauthorized" });
  // }
  req.user = { _id: session.userId, rootDirId: session.rootDirId };
  next();
}

export const IsNotNormalUser = (req, res, next) => {
  if (req.user.role !== "User") return next();
  res.status(403).json({ error: "Not Authorized" });
};

export const isAdmin = async (req, res, next) => {
  const user = await User.findById(req.user._id).lean();
  if (user.role === "Admin") return next();
  res.status(403).json({ error: "Not Authorized" });
};

export default checkAuth;
