import { Request, Response } from "express";
import HttpService from "../service/httpService";
import UserModel, { IUser } from "../models/user.model";
import RelationModel, {
  IRelation,
  RelationStatus,
} from "../models/relation.model";
import MySocket from "../socket/socketManager";
import { Types } from "mongoose";
import NotificationModel, {
  NotificationType,
} from "../models/notifications.model";

export const getFriendRequest = async (req: Request, res: Response) => {
  try {
    const user = req.body.user as IUser;

    const users = await UserModel.aggregate([
      {
        $lookup: {
          from: "relations",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$sender", "$$userId"] },
                    { $eq: ["$status", RelationStatus.Pending] },
                  ],
                },
              },
            },
          ],
          as: "relations",
        },
      },
      {
        $match: {
          $and: [
            { _id: { $ne: new Types.ObjectId(user._id) } },
            {
              $expr: {
                $in: [new Types.ObjectId(user._id), "$relations.receiver"],
              },
            },
          ],
        },
      },
      {
        $project: {
          password: 0,
        },
      },
    ]);

    HttpService.sendResponse(res, 200, true, "Opération réussie", users);
    return;
  } catch (e) {
    console.log(e);
    HttpService.serverError(res, "Erreur serveur", e);
    return;
  }
};

export const getMyFriendRequest = async (req: Request, res: Response) => {
  try {
    const user = req.body.user as IUser;

    const users = await UserModel.aggregate([
      {
        $lookup: {
          from: "relations",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$receiver", "$$userId"] },
                    { $eq: ["$sender", new Types.ObjectId(user._id)] },
                    {
                      $or: [
                        { $eq: ["$status", RelationStatus.Pending] },
                        { $eq: ["$status", RelationStatus.Rejected] },
                      ],
                    },
                  ],
                },
              },
            },
          ],
          as: "relations",
        },
      },
      {
        $match: {
          $and: [
            { _id: { $ne: new Types.ObjectId(user._id) } },
            {
              $expr: {
                $in: [new Types.ObjectId(user._id), "$relations.sender"],
              },
            },
          ],
        },
      },
      {
        $project: {
          password: 0,
          role: 0,
        },
      },
    ]);
    // const response = await RelationModel.aggregate([
    //   {
    //     $match: {
    //       $and: [
    //         { sender: new Types.ObjectId(user._id) },
    //         { status: RelationStatus.Pending },
    //       ],
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "users",
    //       localField: "sender",
    //       foreignField: "_id",
    //       as: "sender",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "users",
    //       localField: "receiver",
    //       foreignField: "_id",
    //       as: "receiver",
    //     },
    //   },
    //   {
    //     $project: {
    //       _id: 1,
    //       sender: { $arrayElemAt: ["$sender", 0] },
    //       receiver: { $arrayElemAt: ["$receiver", 0] },
    //       status: 1,
    //       date: 1,
    //     },
    //   },
    // ]);

    HttpService.sendResponse(res, 200, true, "Opération réussie", users);
    return;
  } catch (e) {
    console.log(e);
    HttpService.serverError(res, "Erreur serveur", e);
    return;
  }
};

export const getListFriend = async (req: Request, res: Response) => {
  try {
    const user = req.body.user as IUser;

    const users = await UserModel.aggregate([
      {
        $lookup: {
          from: "relations",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $or: [
                        { $eq: ["$sender", "$$userId"] },
                        { $eq: ["$receiver", "$$userId"] },
                      ],
                    },
                    { $eq: ["$status", RelationStatus.Accepted] },
                  ],
                },
              },
            },
          ],
          as: "relations",
        },
      },
      {
        $match: {
          $and: [
            { _id: { $ne: new Types.ObjectId(user._id) } },
            {
              $expr: {
                $or: [
                  {
                    $in: [new Types.ObjectId(user._id), "$relations.receiver"],
                  },
                  { $in: [new Types.ObjectId(user._id), "$relations.sender"] },
                ],
              },
            },
          ],
        },
      },
      {
        $project: {
          password: 0,
        },
      },
    ]);

    // const response = await RelationModel.aggregate([
    //   {
    //     $match: {
    //       $and: [
    //         {
    //           $or: [
    //             { receiver: new Types.ObjectId(user._id) },
    //             { sender: new Types.ObjectId(user._id) },
    //           ],
    //         },
    //         { status: RelationStatus.Accepted },
    //       ],
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "users",
    //       localField: "sender",
    //       foreignField: "_id",
    //       as: "sender",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "users",
    //       localField: "receiver",
    //       foreignField: "_id",
    //       as: "receiver",
    //     },
    //   },
    //   {
    //     $project: {
    //       _id: 1,
    //       friend: {
    //         $cond: [
    //           {
    //             $eq: [
    //               { $arrayElemAt: ["$receiver._id", 0] },
    //               new Types.ObjectId(user._id),
    //             ],
    //           },
    //           { $arrayElemAt: ["$sender", 0] },
    //           { $arrayElemAt: ["$receiver", 0] },
    //         ],
    //       },
    //       status: 1,
    //       date: 1,
    //     },
    //   },
    // ]);

    HttpService.sendResponse(res, 200, true, "Opération réussie", users);
    return;
  } catch (e) {
    console.log(e);
    HttpService.serverError(res, "Erreur serveur", e);
    return;
  }
};

export const getSuggestions = async (req: Request, res: Response) => {
  try {
    const user = req.body.user as IUser;
    const users = await UserModel.aggregate([
      {
        $lookup: {
          from: "relations",
          localField: "_id",
          foreignField: "sender",
          as: "relationsAsSender",
        },
      },
      {
        $lookup: {
          from: "relations",
          localField: "_id",
          foreignField: "receiver",
          as: "relationsAsReceiver",
        },
      },
      {
        $match: {
          $and: [
            // Enlever l'utilisateur qui fait le requete
            { _id: { $ne: new Types.ObjectId(user._id) } },
            {
              $expr: {
                $not: {
                  $or: [
                    {
                      $in: [
                        new Types.ObjectId(user._id),
                        "$relationsAsSender.receiver",
                      ],
                    },
                    {
                      $in: [
                        new Types.ObjectId(user._id),
                        "$relationsAsReceiver.sender",
                      ],
                    },
                  ],
                },
              },
            },
          ],
        },
      },
      {
        $project: {
          password: 0,
        },
      },
    ]);
    HttpService.sendResponse(res, 200, true, "Opération réussie", users);
    return;
  } catch (e) {
    console.log(e);
    HttpService.serverError(res, "Erreur serveur", e);
    return;
  }
};

export const sendFriendRequest = async (req: Request, res: Response) => {
  try {
    const { receiver } = req.body;
    const user = req.body.user as IUser;

    const relation = new RelationModel({
      sender: user._id,
      receiver,
    });
    const responseRelation = await relation.save();

    const notification = new NotificationModel({
      type: "friend-request",
      receiver,
      relationId: relation._id,
    });
    const responseNotification = await notification.save();

    const socketIo = MySocket.getSocket();
    socketIo.to(relation.receiver.toString()).emit("receive-friend-request", {
      notification: responseNotification,
      relation: responseRelation,
      otherUser: user,
    });

    HttpService.sendResponse(res, 200, true, "Demande envoyé", relation);
    return;
  } catch (e) {
    console.log(e);
    HttpService.serverError(res, "Demande non envoyé", e);
    return;
  }
};

export const replyFriendRequest = async (req: Request, res: Response) => {
  const user = req.body.user as IUser;
  const { idRelation, status } = req.body;

  try {
    const response = await RelationModel.findOneAndUpdate(
      {
        _id: idRelation,
      },
      { status }
    );

    const notifResponse = await NotificationModel.updateMany(
      {
        relationId: idRelation,
      },
      {
        seen: true,
        opened: true,
      }
    );

    const notification = new NotificationModel({
      type:
        status === RelationStatus.Accepted
          ? NotificationType.FriendAccept
          : NotificationType.FriendReject,
      receiver: response?.toJSON().sender,
      relationId: idRelation,
    });

    const responseNotification = await notification.save();

    const socketIo = MySocket.getSocket();
    socketIo
      .to(notification.receiver.toString())
      .emit(`${status}-friend-notif`, {
        notification,
        relation: response,
        otherUser: user,
      });

    HttpService.sendResponse(res, 200, true, "Operation reussie");
    return;
  } catch (e) {
    HttpService.serverError(res, "Une erreur s'est produite", e);
    return;
  }
};

export const deleteRequest = async (req: Request, res: Response) => {
  const user = req.body.user as IUser;
  const { idRelation } = req.params;

  try {
    const notification = await NotificationModel.deleteMany({
      relationId: idRelation,
    });
    const relation = await RelationModel.findOneAndDelete({
      _id: new Types.ObjectId(idRelation),
    });
    console.log({ notification, relation });

    HttpService.sendResponse(res, 200, true, "Operation reussie");
    return;
  } catch (e) {
    HttpService.serverError(res, "Une erreur s'est produite", e);
    return;
  }
};

export const resendRequest = async (req: Request, res: Response) => {
  try {
    const user = req.body.user as IUser;
    const { idRelation } = req.body;
    const relation = req.body.relation as IRelation;

    console.log("idrelation => ", idRelation);

    const notifResponse = await NotificationModel.updateMany(
      {
        relationId: new Types.ObjectId(idRelation),
      },
      {
        seen: true,
        opened: true,
      }
    );
    console.log("notif resonse => ", notifResponse);

    const response = await RelationModel.findOneAndUpdate(
      {
        _id: idRelation,
      },
      { status: RelationStatus.Pending }
    );

    const notification = new NotificationModel({
      type: "friend-request",
      receiver: relation.receiver,
      relationId: idRelation,
    });
    const responseNotification = await notification.save();

    const socketIo = MySocket.getSocket();
    socketIo.to(relation.receiver.toString()).emit("receive-friend-request", {
      notification: responseNotification,
      relation,
      otherUser: user,
    });

    HttpService.sendResponse(res, 200, true, "Demande envoyé", relation);
    return;
  } catch (e) {
    console.log(e);
    HttpService.serverError(res, "Demande non envoyé", e);
    return;
  }
};
