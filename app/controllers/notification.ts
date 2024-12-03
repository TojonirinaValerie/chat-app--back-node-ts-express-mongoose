import { Request, Response } from "express";
import { IUser } from "../models/user.model";
import HttpService from "../service/httpService";
import NotificationModel from "../models/notifications.model";
import { Types } from "mongoose";

export const getNotificationNumber = async (req: Request, res: Response) => {
  const user = req.body.user as IUser;

  try {
    const counts = await NotificationModel.aggregate([
      {
        $match: {
          $and: [{ opened: false }, { receiver: new Types.ObjectId(user._id) }],
        },
      },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);

    let result: {
      "friend-request": number;
      "friend-accept": number;
      "friend-reject": number;
    } = {
      "friend-accept": 0,
      "friend-reject": 0,
      "friend-request": 0,
    };
    if (counts.length > 0) {
      counts.forEach((item: any) => {
        result = { ...result, [item._id]: item.count };
      });
    }

    HttpService.sendResponse(res, 200, true, "Operation reussie", result);
    return;
  } catch (e) {
    console.log(e);
    HttpService.serverError(res, "Une erreur s'est produite", e);
    return;
  }
};
