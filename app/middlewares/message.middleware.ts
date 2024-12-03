import { NextFunction, Request, Response } from "express";
import HttpService from "../service/httpService";
import UserModel from "../models/user.model";

export const foundUser = (key: string, message?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.body[key];
      const findUser = await UserModel.findById(user);

      if (!findUser) {
        HttpService.sendResponse(res, 404, false, "Utilisateur non trouvé");
        return;
      }

      // stocker le resultat de findUser
      req.body[`${key}User`] = findUser.toJSON();
      next();
    } catch (e: any) {
      if (e.name === "CastError") {
        HttpService.sendResponse(res, 404, false, "Utilisateur non trouvé");
        return;
      }
      HttpService.serverError(res, "erreur server", e);
      return;
    }
  };
};
