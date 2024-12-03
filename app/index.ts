import dotenv from "dotenv";
dotenv.config();
import bodyParser from "body-parser";
import express, { Express, Request, Response } from "express";
import cors from "cors";
import router from "./routes/routes";
import databaseConnection from "./dbConfig";
import socketInit from "./socket";
import http from "http";
import MySocket from "./socket/socketManager";
import path from "path";
import { rootDir } from "./config";

const init = async () => {
  // Connection au base de données
  await databaseConnection();

  // Creation serveur
  const app: Express = express();
  const httpServer = http.createServer(app);

  // Configuration serveur
  app.use(bodyParser.json());
  app.use(cors());
  const PORT = process.env.PORT;
  httpServer.listen(PORT, () => {
    console.log(`server is running on port http://localhost:${PORT}`);
  });

  // Route
  app.use("/api", router);
  app.use("/files", express.static(path.join(rootDir, "files")));

  // creation serveur socket
  const socketIo = socketInit(httpServer);
  MySocket.setSocket(socketIo);

  return { socketIo, httpServer };
};

init();
