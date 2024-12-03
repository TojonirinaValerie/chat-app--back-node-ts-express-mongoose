import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import userSocket from "./socket/user.socket";
import { socketAuthMiddleware } from "./middlewares/socket.middleware";
import messageSocket from "./socket/message.socket";

const socketInit = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      allowedHeaders: ["Content-Type", "Authorization"],
    },
  });

  io.on("connection", (socket: Socket) => {
    io.use(socketAuthMiddleware);

    userSocket(io, socket);
    messageSocket(io, socket);
  });

  return io;
};

export default socketInit;
