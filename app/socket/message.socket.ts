import { Server, Socket } from "socket.io";

const messageSocket = (io: Server, socket: Socket) => {
  socket.on("send-message", () => {
    console.log("message envoyer");
  });

  socket.on(
    "typing",
    (data: { sender: string; receiver: string; isTyping: false }) => {
      console.log(data);
      io.to(data.receiver).emit("on-typing", {
        otherUser: data.sender,
        isTyping: data.isTyping,
      });
    }
  );
};

export default messageSocket;
