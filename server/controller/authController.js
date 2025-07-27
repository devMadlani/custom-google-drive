import mongoose, { Types } from "mongoose";
import OTP from "../models/otpModel.js";
import User from "../models/userModel.js";
import { verifyIdToken } from "../services/GoogleAuthService.js";
import { SendOtpService } from "../services/SendOtpService.js";
import Directory from "../models/direcotryModel.js";
import redisClient from "../config/redis.js";

export const sendOtp = async (req, res, next) => {
  const { email } = req.body;
  const resData = await SendOtpService(email);
  res.status(200).json(resData);
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const otpRecord = await OTP.findOne({ email, otp });
  if (!otpRecord) {
    return res.status(400).json({ error: "Invalid or Expired Otp" });
  }
  res.json({ message: "Otp verified" });
};

export const loginWithGoogle = async (req, res, next) => {
  const { idToken } = req.body;
  const userData = await verifyIdToken(idToken);
  const { name, email, picture, sub } = userData;
  const user = await User.findOne({ email }).select("-__v -password");
  if (user) {
    if (user.isDeleted) {
      return res.status(403).json({ message: "Your Account has been deleted" });
    }
    const allSession = await redisClient.ft.search(
      "userIdIdx",
      `@userId:{${user._id.toString()}}`,
      {
        RETURN: [],
      }
    );

    if (allSession.total >= 2) {
      await redisClient.del(allSession.documents[0].id);
    }

    if (!user.picture.includes("googleusercontent.com")) {
      user.picture = picture;
      await user.save();
    }
    const sessionId = crypto.randomUUID();
    const redisKey = `session:${sessionId}`;
    const expiryTime = 60 * 60 * 24 * 7;
    await redisClient.json.set(redisKey, "$", {
      userId: user._id,
      rootDirId: user.rootDirId,
    });
    redisClient.expire(redisKey, expiryTime);
    res.cookie("sid", sessionId, {
      httpOnly: true,
      signed: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    return res.status(200).json({ message: "Logged in Successfully" });
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
        picture,
        rootDirId,
      },
      { session }
    );

    const sessionId = crypto.randomUUID();
    const redisKey = `session:${sessionId}`;
    const expiryTime = 60 * 60 * 24 * 7;
    await redisClient.json.set(redisKey, "$", {
      userId: user._id,
      rootDirId: user.rootDirId,
    });
    redisClient.expire(redisKey, expiryTime);
    res.cookie("sid", sessionId, {
      httpOnly: true,
      signed: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    session.commitTransaction();
    res
      .status(201)
      .json({ message: "User Created and Logged in Successfully" });
  } catch (error) {
    session.abortTransaction();
    next(error);
  }
};
