import { Request, Response } from "express";
import HttpService from "../service/httpService";
import UserModel, { IUser } from "../models/user.model";
import { comparePassword, generateToken, hashPassword } from "../service/utils";

export const register = async (req: Request, res: Response) => {
  const user: IUser = req.body;
  user.password = hashPassword(user.password);

  try {
    const newUser = new UserModel({
      ...user,
    });
    const response = await newUser.save();

    const { accessToken, refreshToken } = generateToken(newUser.toJSON());
    HttpService.sendResponse(res, 200, true, "Opération réussie.", {
      user: newUser.toJSON(),
      accessToken,
      refreshToken,
    });
    return;
  } catch (e) {
    console.log(e);
    HttpService.serverError(res);
    return;
  }
};

export const login = async (req: Request, res: Response) => {
  const { pseudo, password } = req.body;

  try {
    const response = await UserModel.findOne({ pseudo }).select("+password");

    // Verifier si on trouve le pseudo
    if (!response) {
      HttpService.sendResponse(res, 404, false, "Utilisateur non trouvé");
      return;
    }
    const findUser = response.toJSON();

    // Verifier le password
    if (!comparePassword(password, response.password)) {
      HttpService.sendResponse(res, 400, false, "Mot de passe invalide");
      return;
    }

    // Supprimer le champ password
    const user = findUser as Partial<typeof findUser>;
    delete user.password;

    // creer le token
    const { accessToken, refreshToken } = generateToken(user);

    HttpService.sendResponse(res, 200, true, "", {
      user: findUser,
      accessToken,
      refreshToken,
    });
    return;
  } catch (e) {
    console.log(e);
    HttpService.serverError(res);
    return;
  }
};

export const refresh = async (req: Request, res: Response) => {
  const { user } = req.body;

  const { accessToken, refreshToken } = generateToken(user);
  HttpService.sendResponse(res, 200, true, "", {
    user,
    accessToken,
    refreshToken,
  });
  return;
};
