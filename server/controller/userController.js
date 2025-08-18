import User from "../models/userModel.js";
import Directory from "../models/direcotryModel.js";
import mongoose, { Types } from "mongoose";
import OTP from "../models/otpModel.js";
import redisClient from "../config/redis.js";
import { loginSchema, registerSchema } from "../validators/authSchema.js";
import z from "zod";

export const getUser = async (req, res) => {
  const user = await User.findById(req.user._id).lean();
  res.status(200).json({
    name: user.name,
    email: user.email,
    picture: user.picture,
    role: user.role,
  });
};
export const getAllUser = async (req, res) => {
  const allUsers = await User.find({ isDeleted: false }).lean();
  const allSession = await redisClient.json.objKeys("session:*");
  console.log(allSession);
  const allSessionUserId = allSession.map(({ userId }) => userId.toString());
  const allSessoinSet = new Set(allSessionUserId);
  const transformedUser = allUsers.map(({ _id, name, email, role }) => ({
    id: _id,
    name,
    role,
    email,
    isLoggedIn: allSessoinSet.has(_id.toString()),
  }));
  res.status(200).json(transformedUser);
};

export const register = async (req, res, next) => {
  const { success, data } = registerSchema.safeParse(req.body);
  if (!success) {
    return res.status(400).json({ error: "Invalid Data" });
  }

  const { name, email, password, otp } = data;

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
  const { success, data } = loginSchema.safeParse(req.body);
  if (!success) {
    return res.status(400).json({ error: "Invalid Credentials" });
  }
  const { email, password } = data;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ error: "Invalid Credentials" });
  }
  if (password) {
    const isValidPass = await user.comparePassword(password);
    if (!isValidPass) {
      return res.status(401).json({ error: "Invalid Credentials" });
    }
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
  res.status(200).json({ message: "User Logged In Successfully" });
};

export const logoutById = async (req, res, next) => {
  const currentUser = req.user;
  const { userId } = req.params;
  const user = await User.findById(userId).select("role").lean();
  try {
    if (currentUser.role === "Manager" && user.role === "Admin") {
      return res.status(403).json({ error: "Not Authorized" });
    }
    const allSession = await redisClient.ft.search(
      "userIdIdx",
      `@userId:{${userId}}`,
      { RETURN: [] }
    );
    if (allSession.total > 0)
      allSession.documents.map(async ({ id }) => await redisClient.del(id));

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res) => {
  const { sid } = req.signedCookies;
  await redisClient.del(`session:${sid}`);
  res.clearCookie("sid");
  res.status(204).end();
};

export const logoutAll = async (req, res) => {
  const allSession = await redisClient.ft.search(
    "userIdIdx",
    `@userId:{${req.user._id}}`,
    { RETURN: [] }
  );
  if (allSession.total > 0)
    allSession.documents.map(async ({ id }) => await redisClient.del(id));
  res.clearCookie("sid");
  res.status(204).end();
};

export const deleteUser = async (req, res) => {
  const { userId } = req.params;
  if (req.user._id.toString() === userId) {
    return res.status(403).json({ error: "Can't delete yourself" });
  }
  console.log(userId);
  const allSession = await redisClient.ft.search(
    "userIdIdx",
    `@userId:{${userId}}`,
    { RETURN: [] }
  );

  try {
    // const files = await File.find({ userId }).select("_id extension").lean();
    // console.log(files);
    // for (const { _id, extension } of files) {
    //   await rm(`./storage/${_id}${extension}`);
    // }
    if (allSession.total > 0)
      allSession.documents.map(async ({ id }) => await redisClient.del(id));
    await User.findByIdAndUpdate(userId, { isDeleted: true });
    // await Directory.deleteMany({ userId });
    // await File.deleteMany({ userId });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
