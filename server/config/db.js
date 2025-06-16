import mongoose from "mongoose";

export async function connectDb() {
  try {
    await mongoose.connect("mongodb://localhost:27017/storageApp");
    console.log("Database Connected");
  } catch (error) {
    console.log(error);
    console.log("Database Connection Failed");
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  await mongoose.disconnect();
  console.log("Database Disconnected");
  process.exit(0);
});
