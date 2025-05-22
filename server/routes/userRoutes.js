import express from "express";
import checkAuth from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", checkAuth, async (req, res) => {
  res.status(200).json({
    name: req.user.name,
    email: req.user.email,
  });
});

router.post("/register", async (req, res, next) => {
  const { name, email, password } = req.body;
  const db = req.db;
  const foundUser = await db.collection("users").findOne({ email });
  if (foundUser) {
    return res.status(409).json({
      error: "User Already Exists",
      message: "A user with this emil already existsF",
    });
  }

  try {
    const dirCollection = db.collection("directories");
    const userRootDir = await dirCollection.insertOne({
      name: `root-${email}`,
      parentDirId: null,
      files: [],
      directories: [],
    });

    const rootDirId = userRootDir.insertedId;

    const createdUser = await db.collection("users").insertOne({
      name,
      email,
      password,
      rootDirId,
    });
    const userId = createdUser.insertedId;
    await dirCollection.updateOne({ _id: rootDirId }, { $set: { userId } });

    res.status(201).json({ message: "User Created Successfully" });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  const db = req.db;
  const user = await db.collection("users").findOne({ email, password });
  console.log();
  if (!user) {
    return res.status(404).json({ error: "Invalid Credentials" });
  }
  res.cookie("userId", user._id.toString(), {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
  res.status(200).json({ message: "User Logged In Successfully" });
});

router.post("/logout", async (req, res) => {
  res.clearCookie("userId");
  res.status(204).end();
});

export default router;
