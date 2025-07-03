import User from "../models/userModel.js";
import Directory from "../models/direcotryModel.js";
import mongoose, { Types } from "mongoose";
import crypto from "node:crypto";

export const getUser = async (req, res) => {
  res.status(200).json({
    name: req.user.name,
    email: req.user.email,
  });
};

export const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  const salt = crypto.randomBytes(16);
  const hashPassword = crypto.pbkdf2Sync(password, salt, 100000, 32, "sha256");

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
        password: `${salt.toString("base64url")}.${hashPassword.toString(
          "base64url"
        )}`,
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
  const user = await User.findOne({ email });
  const [salt, savedHashPassword] = user.password.split(".");

  const enteredHashPassword = crypto
    .pbkdf2Sync(password, Buffer.from(salt, "base64url"), 100000, 32, "sha256")
    .toString("base64url");

  if (!user) {
    return res.status(401).json({ error: "Invalid Credentials" });
  }
  if (savedHashPassword !== enteredHashPassword) {
    return res.status(401).json({ error: "Invalid Credentials" });
  }

  const cookiePayload = JSON.stringify({
    id: user._id.toString(),
    expiry: Math.round(Date.now() / 1000 + 40),
  });

  // const signature = crypto
  //   .createHash("sha256")
  //   .update(myStorageSecret)
  //   .update(cookiePayload)
  //   .update(myStorageSecret)
  //   .digest("base64url");

  // const signedCookiePayload = `${Buffer.from(cookiePayload).toString(
  //   "base64url"
  // )}.${signature}`;

  res.cookie("token", Buffer.from(cookiePayload).toString("base64url"), {
    httpOnly: true,
    signed: true,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
  res.status(200).json({ message: "User Logged In Successfully" });
};

export const logoutUser = async (req, res) => {
  res.clearCookie("token");
  res.status(204).end();
};
