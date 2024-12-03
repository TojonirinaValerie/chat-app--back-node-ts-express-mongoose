import { ExtendedError, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { verifyValidityToken } from "../service/utils";

export const socketAuthMiddleware = (
  socket: Socket,
  next: (err?: ExtendedError) => void
) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("No Token"));
  }

  verifyValidityToken(token, (err: any, decoded: any) => {
    if (err) {
      if (err instanceof jwt.TokenExpiredError) {
        return next(
          new Error(JSON.stringify({ code: 4011, message: "token expiré" }))
        );
      } else {
        return next(
          new Error(JSON.stringify({ code: 4012, message: "token invalide" }))
        );
      }
    }

    const user = decoded;
    delete user.iat;
    delete user.exp;
    socket.data.user = user; // Stocke les données de l'utilisateur dans le socket
    next();
  });
};
