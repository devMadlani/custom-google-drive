import express from "express";
import cors from "cors";
import directoryRoutes from "./routes/directoryRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";
import checkAuth from "./middleware/authMiddleware.js";
import { connectDb } from "./config/db.js";
import dotenv from "dotenv";
dotenv.config();
await connectDb();
const app = express();
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
const port = process.env.PORT || 4000;

app.use(cookieParser(process.env.SESSION_SECRET));
app.use(express.json());
app.use("/directory", checkAuth, directoryRoutes);
app.use("/file", checkAuth, fileRoutes);
app.use("/", userRoutes);
app.use("/auth", authRoutes);

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).json({ error: "Something went wrong", err });
});

//serving static files
// app.use((req, res, next) => {
//   if (req.query.action === "download") {
//     res.set("Content-Disposition", `attachment; `);
//   }
//   express.static("./storage")(req, res, next);
// });

app.listen(port, () => {
  console.log("Example app listening on port 4000!");
});
