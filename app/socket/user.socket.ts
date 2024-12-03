import { Server, Socket } from "socket.io";
import { IUser } from "../models/user.model";

const userSocket = (io: Server, socket: Socket) => {
  socket.on("user-connected", (userId: string) => {
    try {
      const user = socket.data.user as IUser;
      console.log("Join reussie:", user._id.toString());
      socket.join(user._id.toString());
    } catch (e) {
      console.log(e);
    }
  });

  socket.on("disconnect", () => {
    try {
      const user = socket.data.user as IUser;
      // console.log(`Deconnexion de : ${user.pseudo}(${user._id})`);
    } catch (e) {
      console.log("deconnexion");
    }
  });
};

export default userSocket;
