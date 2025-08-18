import { createClient } from "redis";

const redisClient = createClient({
  password: "123123",
});

redisClient.on("error", (error) => {
  console.log("Redis client error", error);
  process.exit(1);
});

await redisClient.connect();

export default redisClient;
