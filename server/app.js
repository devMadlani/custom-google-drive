import express from "express";
import cors from "cors";
import directoryRoutes from "./routes/directoryRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import userRoutes from "./routes/userRoutes.js";
const app = express();

app.use(express.json());
app.use(cors());
app.use("/directory", directoryRoutes);
app.use("/file", fileRoutes);
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
