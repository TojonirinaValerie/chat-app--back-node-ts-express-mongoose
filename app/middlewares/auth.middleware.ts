import { Request, Response, NextFunction } from "express";
import HttpService from "../service/httpService";
import UserModel, { IUser } from "../models/user.model";
import jwt from "jsonwebtoken";
import { verifyValidityToken } from "../service/utils";
import { Types } from "mongoose";

export const checkDuplicatePseudo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const response = await UserModel.findOne({ pseudo: req.body.pseudo });
    if (response) {
      HttpService.sendResponse(res, 400, false, "Cet pseudo est déjà utiliser");
      return;
    }
    next();
  } catch (e) {
    console.log(e);
    HttpService.serverError(res, JSON.stringify(e));
    return;
  }
};

export const checkBodyData = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const valid = HttpService.isCompletePostData(req, fields);
    if (!valid) {
      HttpService.sendResponse(
        res,
        400,
        false,
        HttpService.fieldRequiredMissedMessage(fields)
      );
      return;
    }
    next();
  };
};

export const checkQueryParamsData = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const valid = HttpService.isCompleteQueryParamsData(req, fields);
    if (!valid) {
      HttpService.sendResponse(
        res,
        400,
        false,
        HttpService.fieldRequiredMissedMessage(fields)
      );
      return;
    }
    next();
  };
};

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let authorization = req.headers.authorization;
  if (!authorization) {
    HttpService.sendResponse(res, 403, false, "No token");
    return;
  }

  try {
    let token = authorization.split(" ")[1];

    verifyValidityToken(token, (err, decoded: any) => {
      if (err) {
        console.log(err);
        HttpService.sendResponse(res, 401, false, "Unauthorized");
        return;
      }

      const user = decoded;
      delete user.iat;
      delete user.exp;

      req.body.user = user;
      next();
    });
  } catch (e) {
    console.log(e);
    HttpService.serverError(res);
    return;
  }
};

export const findUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.body.user as IUser;
    const find = await UserModel.findOne({ _id: new Types.ObjectId(user._id) });
    if (!find) {
      HttpService.sendResponse(res, 404, false, "Utilisateur non trouvé");
      return;
    }
    next();
  } catch (e) {
    console.log(e);
    HttpService.serverError(res);
    return;
  }
};
