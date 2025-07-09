import User from "../models/userModel.js";
import Directory from "../models/direcotryModel.js";
import mongoose, { Types } from "mongoose";
import crypto from "node:crypto";
import bcrypt from "bcrypt";
import Session from "../models/sessionModel.js";
import OTP from "../models/otpModel.js";

export const getUser = async (req, res) => {
  res.status(200).json({
    name: req.user.name,
    email: req.user.email,
  });
};

export const register = async (req, res, next) => {
  const { name, email, password, otp } = req.body;

  const otpRecord = await OTP.findOne({ email, otp });
  if (!otpRecord) {
    return res.status(400).json({ error: "Invalid or Expired Otp" });
  }

  await otpRecord.deleteOne();

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
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ error: "Invalid Credentials" });
  }
  const isValidPass = await user.comparePassword(password);

  if (!isValidPass) {
    return res.status(401).json({ error: "Invalid Credentials" });
  }
  const allSession = await Session.find({ userId: user._id });
  if (allSession.length >= 2) {
    await Session.deleteOne({ userId: user._id });
  }
  const session = await Session.create({ userId: user._id });

  res.cookie("sid", session.id, {
    httpOnly: true,
    signed: true,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
  res.status(200).json({ message: "User Logged In Successfully" });
};

export const logoutUser = async (req, res) => {
  const { sid } = req.signedCookies;
  await Session.findByIdAndDelete(sid);
  res.clearCookie("sid");
  res.status(204).end();
};

export const logoutAll = async (req, res) => {
  await Session.deleteMany({ userId: req.user._id });
  res.clearCookie("sid");
  res.status(204).end();
};
