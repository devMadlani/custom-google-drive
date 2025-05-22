import express from "express";
import cors from "cors";
import directoryRoutes from "./routes/directoryRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
import checkAuth from "./middleware/authMiddleware.js";
import { connectDb } from "./db.js";

try {
  const db = await connectDb();
  const app = express();
  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    })
  );
  app.use(cookieParser());
  app.use(express.json());

  app.use((req, res, next) => {
    req.db = db;
    next();
  });
  app.use("/directory", checkAuth, directoryRoutes);
  app.use("/file", checkAuth, fileRoutes);
  app.use("/user", userRoutes);

  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ message: "Something went wrong" });
  });

  //serving static files
  // app.use((req, res, next) => {
  //   if (req.query.action === "download") {
  //     res.set("Content-Disposition", `attachment; `);
  //   }
  //   express.static("./storage")(req, res, next);
  // });

  app.listen(4000, () => {
    console.log("Example app listening on port 4000!");
  });
} catch (error) {
  console.log("Could not connect to database");
  console.log(error);
}
