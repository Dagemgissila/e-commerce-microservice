import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

export const globalRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    limit: 60, // Limit each IP to 60 requests per minute.
    standardHeaders: "draft-7",
    legacyHeaders: false,
    store: new RedisStore({
        // @ts-expect-error - Known issue with types
        sendCommand: (...args: string[]) => redisClient.call(...args),
    }),
    message: {
        status: 429,
        message: "Too many requests from this IP, please try again after a minute",
    },
});

// Stricter limiter for specific routes (e.g., auth or sensitive operations)
export const apiRateLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    limit: 30, // Limit each IP to 30 requests per 5 minutes
    standardHeaders: "draft-7",
    legacyHeaders: false,
    store: new RedisStore({
        // @ts-expect-error - Known issue with types
        sendCommand: (...args: string[]) => redisClient.call(...args),
    }),
    message: {
        status: 429,
        message: "High traffic detected. Please slow down.",
    },
});
