import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL,
  username: "default",
  password: "BvqH6Ntd5DL5jowWJgrTSpkvWeZaYfW2",
});

redisClient.on("error", (error) => {
  console.log("Redis client error", error);
  process.exit(1);
});

await redisClient.connect();

export default redisClient;
