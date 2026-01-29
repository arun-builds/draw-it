import { getRedis } from "@repo/redis";
import { createId } from "./utils/generateId";
import { createRoom, joinRoom, leaveRoom, getRoomUsers } from "./rooms";

export const redis = getRedis();

interface WebSocketData {
  userId: string;
  roomId: string | null;
}

Bun.serve<WebSocketData>({
  port: 8080,
  fetch(req, server) {
    const userId = createId();
    if (server.upgrade(req, { data: { userId, roomId: null } })) return;
    return new Response("Not a WebSocket");
  },

  websocket: {
    open(ws) {
      ws.send(JSON.stringify({ type: "connected", userId: ws.data.userId }));
    },

    async message(ws, message) {
      const { userId } = ws.data;

      let data;

      if (typeof message === "string") {
        data = JSON.parse(message);
      } else {
        data = JSON.parse(new TextDecoder().decode(message));
      }

      switch (data.type) {
        case "create_room": {
          // Leave current room if in one
          if (ws.data.roomId) {
            ws.unsubscribe(`room:${ws.data.roomId}`);
            ws.publish(`room:${ws.data.roomId}`, JSON.stringify({ type: "user_left", userId }));
            await leaveRoom(redis, userId);
          }

          const roomId = await createRoom(redis, userId);
          ws.data.roomId = roomId;
          ws.subscribe(`room:${roomId}`);
          ws.send(JSON.stringify({ type: "room_created", roomId, userId }));
          break;
        }

        case "join_room": {
          // Leave current room if in one
          if (ws.data.roomId) {
            ws.unsubscribe(`room:${ws.data.roomId}`);
            ws.publish(`room:${ws.data.roomId}`, JSON.stringify({ type: "user_left", userId }));
            await leaveRoom(redis, userId);
          }

          const joined = await joinRoom(redis, data.roomId, userId);
          if (joined) {
            ws.data.roomId = data.roomId;
            ws.subscribe(`room:${data.roomId}`);
            ws.send(JSON.stringify({ type: "room_joined", roomId: data.roomId, userId }));
            // Notify others in the room
            ws.publish(`room:${data.roomId}`, JSON.stringify({ type: "user_joined", userId }));
          } else {
            ws.send(JSON.stringify({ type: "error", message: "Room not found" }));
          }
          break;
        }

        case "leave_room": {
          if (ws.data.roomId) {
            const roomId = ws.data.roomId;
            ws.unsubscribe(`room:${roomId}`);
            ws.publish(`room:${roomId}`, JSON.stringify({ type: "user_left", userId }));
            await leaveRoom(redis, userId);
            ws.data.roomId = null;
            ws.send(JSON.stringify({ type: "room_left", userId }));
          }
          break;
        }

        case "broadcast": {
          if (!ws.data.roomId) {
            ws.send(JSON.stringify({ type: "error", message: "Not in a room" }));
            break;
          }
          // Broadcast message to all users in the room (including sender via publish)
          const broadcastMsg = JSON.stringify({
            type: "broadcast",
            userId,
            roomId: ws.data.roomId,
            payload: data.payload
          });
          ws.publish(`room:${ws.data.roomId}`, broadcastMsg);
          // Also send to self since publish doesn't send to the sender
          ws.send(broadcastMsg);
          break;
        }

        // just for testing
        case "get_room_users": {
          const users = await getRoomUsers(redis, data.roomId);
          ws.send(JSON.stringify({ type: "room_users", roomId: data.roomId, users }));
          break;
        }

        default:
          ws.send(JSON.stringify({ type: "error", message: "Invalid message type" }));
          break;
      }
    },

    close(ws) {
      const { userId, roomId } = ws.data;
      if (roomId) {
        ws.publish(`room:${roomId}`, JSON.stringify({ type: "user_left", userId }));
      }
      leaveRoom(redis, userId);
    }
  }
});


