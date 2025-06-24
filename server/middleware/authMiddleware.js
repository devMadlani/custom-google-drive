import User from "../models/userModel.js";

async function checkAuth(req, res, next) {
  const { token } = req.signedCookies;
  if (!token) {
    res.clearCookie("token");
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { id, expiry: expiryTimeInSec } = JSON.parse(
    Buffer.from(token, "base64").toString()
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
