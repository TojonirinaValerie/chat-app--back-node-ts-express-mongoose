import { Server, Socket } from "socket.io";

class MySocket {
  private static socket: Server;

  static setSocket(sokcetInstance: Server) {
    this.socket = sokcetInstance;
  }

  static getSocket() {
    return this.socket;
  }
}

export default MySocket;
