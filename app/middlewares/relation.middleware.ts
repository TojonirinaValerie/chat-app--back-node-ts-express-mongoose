import { Request, Response, NextFunction } from "express";
import HttpService from "../service/httpService";
import RelationModel from "../models/relation.model";

export const findRelation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { idRelation } = req.body;
    const relation = await RelationModel.findById(idRelation);

    if (!relation) {
      HttpService.sendResponse(
        res,
        404,
        false,
        "Erreur: la demande est supprimer par la personne"
      );
      return;
    }

    req.body.relation = relation.toJSON();
    next();
  } catch (e: any) {
    HttpService.serverError(res, "Erreur server", e);
    return;
  }
};
