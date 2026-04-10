import Redis from "ioredis";

export const redis = new Redis({
    host: "redis", // docker service name
    port: 6379,
});

redis.on("connect", () => {
    console.log("Redis connected");
});

redis.on("error", (err) => {
    console.error("Redis error:", err);
});