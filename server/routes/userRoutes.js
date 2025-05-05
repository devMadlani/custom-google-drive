import express from "express";
import { writeFile } from "fs/promises";
import usersData from "../usersDB.json" with { type: "json" };
import directoriesData from "../directoriesDB.json" with { type: "json" };
const router = express.Router();

router.post("/", async (req, res, next) => {
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

export default router;
