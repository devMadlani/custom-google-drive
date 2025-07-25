import Session from "../models/sessionModel.js";
import User from "../models/userModel.js";

async function checkAuth(req, res, next) {
  const { sid } = req.signedCookies;
  if (!sid) {
    res.clearCookie("sid");
    return res.status(401).json({ message: "Unauthorized" });
  }
  const session = await Session.findById(sid);
  if (!session) {
    res.clearCookie("sid");
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await User.findById(session.userId).lean();
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  req.user = user;
  next();
}

export const IsNotNormalUser = (req, res, next) => {
  if (req.user.role !== "User") return next();
  res.status(403).json({ error: "Not Authorized" });
};

export const isAdmin = (req, res, next) => {
  if (req.user.role === "Admin") return next();
  res.status(403).json({ error: "Not Authorized" });
};

export default checkAuth;
