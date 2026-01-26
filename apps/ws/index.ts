const clients = new Set<any>();

Bun.serve({
  port: 8080,
  fetch(req, server) {
    if (server.upgrade(req)) return;
    return new Response("Not a WebSocket");
  },

  websocket: {
    open(ws) {
      clients.add(ws);
      console.log("connected", clients.size);
    },

    message(ws, message) {
     
      let data;

      if (typeof message === "string") {
        data = JSON.parse(message);
      } else {
    
        data = JSON.parse(new TextDecoder().decode(message));
      }

      const { from, to, color, size } = data;
      const messageToSend = JSON.stringify({ type: "draw", from, to, color, size });
      
      clients.forEach((client) => {
        if (client !== ws) {
          client.send(messageToSend);
        }
      });
    },

    close(ws) {
      clients.delete(ws);
      console.log("disconnected", clients.size);
    }
  }
});
