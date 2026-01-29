import Redis from "ioredis";

let redis: Redis | null = null;

export function getRedis() {
    if (!redis) {
        redis = new Redis("redis://localhost:6379");

        redis.on("error", (err) => {
            console.error("Redis error", err);
        });

        redis.on("connect", () => {
            console.log("Redis connected");
        });
    }

    return redis;
}

export type RedisClient = Redis;