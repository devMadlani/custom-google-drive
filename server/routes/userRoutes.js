import express from "express";
import { writeFile } from "fs/promises";
import usersData from "../usersDB.json" with { type: "json" };
import directoriesData from "../directoriesDB.json" with { type: "json" };
import checkAuth from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", checkAuth, async (req, res) => {
  res.status(200).json({
    name: req.user.name,
    email: req.user.email,
  })
});

router.post("/register", async (req, res, next) => {
  const { name, email, password } = req.body;
  const foundUser = usersData.find((user) => user.email === email);
  if (foundUser) {
   return  res
      .status(409)
      .json({
        error: "User Already Exists",
        message: "A user with this emil already existsF",
      });
  }
  const dirId = crypto.randomUUID();
  const userId = crypto.randomUUID();
  directoriesData.push({
    id: dirId,
    name: `root-${email}`,
    userId,
    parentDirId: null,
    files: [],
    directories: [],
  });
  usersData.push({ id: userId, name, email, password, rootDirId: dirId });

  try {
    await writeFile("./usersDB.json", JSON.stringify(usersData));
    await writeFile("./directoriesDB.json", JSON.stringify(directoriesData));
  } catch (error) {
    next(error);
  }
  res.status(201).json({ message: "User Created Successfully" });
});

router.post("/login", async (req, res,next) => {
  const { email, password } = req.body;
  const user = usersData.find((user) => user.email === email);
  if (!user || user.password !== password) {
    return res.status(404).json({ error: "Invalid Credentials" });
  } 
  res.cookie("userId", user.id,{
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }); 
  res.status(200).json({ message: "User Logged In Successfully" });
})

router.post("/logout", async (req, res) => {
  res.clearCookie("userId");
  res.status(204).end()
})

export default router;
