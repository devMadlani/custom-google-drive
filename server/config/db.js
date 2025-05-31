import { MongoClient } from "mongodb";

export const client = new MongoClient("mongodb://localhost:27017/storageApp");

export async function connectDb() {
  await client.connect();
  const db = client.db();
  console.log("Database Connected");
  return db;
}

process.on("SIGINT", async () => {
  await client.close();
  console.log("Client Disconnected");
  process.exit(0);
});
