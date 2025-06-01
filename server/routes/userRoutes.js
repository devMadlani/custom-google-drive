import express from "express";
import checkAuth from "../middleware/authMiddleware.js";
import { ObjectId } from "mongodb";
import { client } from "../config/db.js";

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

  const session = client.startSession();
  try {
    const rootDirId = new ObjectId();
    const userId = new ObjectId();
    const dirCollection = db.collection("directories");
    session.startTransaction();
    await dirCollection.insertOne(
      {
        _id: rootDirId,
        name: `root-${email}`,
        parentDirId: null,
        userId,
      },
      { session }
    );

    await db.collection("users").insertOne(
      {
        _id: userId,
        name,
        email,
        password,
        rootDirId,
      },
      { session }
    );
    session.commitTransaction();
    res.status(201).json({ message: "User Created Successfully" });
  } catch (error) {
    session.abortTransaction();
    if (error.code === 121) {
      res.status(400).json({ error: "Invalid Data" });
    } else {
      next(error);
    }
  }
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  const db = req.db;
  const user = await db.collection("users").findOne({ email, password });
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
