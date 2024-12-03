import { Request, Response } from "express";
import HttpService from "../service/httpService";
import { Server, Socket } from "socket.io";
import UserModel, { IUser } from "../models/user.model";
import path from "path";
import { removeImageUploaded } from "../middlewares/upload.middleware";
import { generateToken } from "../service/utils";

export const getCurrentUserInfo = (req: Request, res: Response) => {
  const { user } = req.body;

  HttpService.sendResponse(res, 200, true, "Requête traitée avec succès", user);
  return;
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const findUser = await UserModel.findById(id);
    if (!findUser) {
      HttpService.sendResponse(res, 404, false, "Utilisateur introuvable");
      return;
    }
    HttpService.sendResponse(
      res,
      200,
      true,
      "Opération réussie",
      findUser.toJSON()
    );
    return;
  } catch (e) {
    console.log(e);
    HttpService.serverError(res);
    return;
  }
};

export const uploadProfilPicture = async (req: Request, res: Response) => {
  const user = (req as any).user as IUser;
  try {
    if (req.file) {
      const findUser = await UserModel.findByIdAndUpdate(
        user._id,
        {
          profilPicture: req.file.filename,
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!findUser) {
        HttpService.sendResponse(res, 404, false, "Utilisateur non trouvé");
        return;
      }

      const { accessToken, refreshToken } = generateToken(findUser.toJSON());
      HttpService.sendResponse(res, 200, true, "Requête traitée avec succès", {
        user: findUser.toJSON(),
        accessToken,
        refreshToken,
      });
      return;
    }
  } catch (e) {
    if (req.file)
      removeImageUploaded(path.join(user._id.toString(), req.file.filename));
    console.log(e);
    HttpService.serverError(res);
    return;
  }
};
