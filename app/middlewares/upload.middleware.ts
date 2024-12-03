import multer from "multer";
import path from "path";
import { rootDir } from "../config";
import fs from "fs";
import { NextFunction, Request, Response } from "express";
import { IUser } from "../models/user.model";
import HttpService from "../service/httpService";

const storage = multer.diskStorage({
  destination: (req: any, file: Express.Multer.File, cb) => {
    const userFolderPath = req.userFolderPath as string;
    cb(null, userFolderPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "." + file.originalname.split(".").pop());
  },
});

export const removeImageUploaded = (imageName: string) => {
  fs.rm(path.join(__dirname, "files", imageName), (err) => {
    if (err) {
      console.log("error", err);
    }
  });
};

export const createFolderMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.body.user;
    const userFolder = path.join(rootDir, "files", user._id.toString());

    if (!fs.existsSync(userFolder)) {
      fs.mkdirSync(userFolder, { recursive: true });
    }

    (req as any).userFolderPath = userFolder;
    (req as any).user = user;
    next();
  } catch (e) {
    console.log(e);
    HttpService.serverError(res);
    return;
  }
};

export const verifyFile = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      HttpService.sendResponse(res, 400, false, "Aucun fichier téléchargé");
      return;
    }
    next();
  } catch (e) {
    console.log(e);
    HttpService.serverError(res);
    return;
  }
};
const UploadWithMulter = multer({ storage });

export default UploadWithMulter;
