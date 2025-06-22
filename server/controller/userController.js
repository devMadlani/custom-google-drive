import User from "../models/userModel.js";
import Directory from "../models/direcotryModel.js";
import mongoose, { Types } from "mongoose";
export const getUser = async (req, res) => {
  res.status(200).json({
    name: req.user.name,
    email: req.user.email,
  });
};

export const register = async (req, res, next) => {
  const { name, email, password } = req.body;
  const db = req.db;
  const foundUser = await User.findOne({ email });
  if (foundUser) {
    return res.status(409).json({
      error: "User Already Exists",
      message: "A user with this emil already existsF",
    });
  }

  const session = await mongoose.startSession();
  try {
    const rootDirId = new Types.ObjectId();
    const userId = new Types.ObjectId();
    const dirCollection = db.collection("directories");
    session.startTransaction();
    await Directory.insertOne(
      {
        _id: rootDirId,
        name: `root-${email}`,
        parentDirId: null,
        userId,
      },
      { session }
    );

    await User.insertOne(
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
};

export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (!user) {
    return res.status(404).json({ error: "Invalid Credentials" });
  }
  const cookiePayload = {
    id: user._id.toString(),
    expiry: Math.round(Date.now() / 1000 + 40),
  };
  res.cookie(
    "userId",
    Buffer.from(JSON.stringify(cookiePayload)).toString("base64url"),
    {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    }
  );
  res.status(200).json({ message: "User Logged In Successfully" });
};

export const logoutUser = async (req, res) => {
  res.clearCookie("userId");
  res.status(204).end();
};
