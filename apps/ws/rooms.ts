import type { RedisClient } from "@repo/redis";
import { createId } from "./utils/generateId";

export async function createRoom(redis: RedisClient, userId: string) {
    const roomId = createId();

    await redis.multi()
        .sadd(`room:${roomId}:users`, userId)
        .set(`user:${userId}:room`, roomId)
        .exec();

    return roomId;
}

export async function joinRoom(redis: RedisClient, roomId: string, userId: string) {
    const exists = await redis.exists(`room:${roomId}:users`);
    if (!exists) return false;
  
    await redis.multi()
      .sadd(`room:${roomId}:users`, userId)
      .set(`user:${userId}:room`, roomId)
      .exec();
  
    return true;
  }
  
  export async function leaveRoom(redis: RedisClient, userId: string) {
    const roomId = await redis.get(`user:${userId}:room`);
    if (!roomId) return;
  
    await redis.multi()
      .srem(`room:${roomId}:users`, userId)
      .del(`user:${userId}:room`)
      .exec();
  
    const count = await redis.scard(`room:${roomId}:users`);
    if (count === 0) {
      await redis.del(`room:${roomId}:users`);
    }
  }

  export async function getRoomUsers(redis: RedisClient, roomId: string) {
    return await redis.smembers(`room:${roomId}:users`);
  }