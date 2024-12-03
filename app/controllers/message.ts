import { Request, Response } from "express";
import HttpService from "../service/httpService";
import MessageModel from "../models/message.model";
import { IUser } from "../models/user.model";
import MySocket from "../socket/socketManager";
import { Types } from "mongoose";

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { content, receiver } = req.body;
    const user = req.body.user as IUser;

    const message = new MessageModel({
      content,
      sender: user._id,
      receiver,
    });

    const response = await message.save();

    const socketIo = MySocket.getSocket();
    socketIo
      .to(message.receiver.toString())
      .emit("receive-message", { message, otherUser: user });

    HttpService.sendResponse(res, 200, true, "Message envoye", message);
    return;
  } catch (e) {
    HttpService.serverError(res, "Message non envoyé", e);
    return;
  }
};

export const getDiscussions = async (req: Request, res: Response) => {
  try {
    const user = req.body.user as IUser;

    const discussions = await MessageModel.aggregate([
      {
        $match: {
          $or: [
            { sender: new Types.ObjectId(user._id) },
            { receiver: new Types.ObjectId(user._id) },
          ],
        },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $lt: ["$sender", "$receiver"] },
              ["$sender", "$receiver"],
              ["$receiver", "$sender"],
            ],
          },
          lastMessage: { $last: "$$ROOT" },
          unreadMessage: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiver", new Types.ObjectId(user._id)] },
                    { $eq: ["$seen", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "lastMessage.sender",
          foreignField: "_id",
          as: "senderInfo",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "lastMessage.receiver",
          foreignField: "_id",
          as: "receiverInfo",
        },
      },
      {
        $project: {
          _id: 0,
          lastMessage: 1,
          unreadMessage: 1,
          otherUser: {
            $cond: [
              { $eq: ["$lastMessage.receiver", new Types.ObjectId(user._id)] },
              { $arrayElemAt: ["$senderInfo", 0] },
              { $arrayElemAt: ["$receiverInfo", 0] },
            ],
          },
          allConversation: [],
        },
      },
      {
        $sort: { "lastMessage.date": -1 },
      },
    ]);

    HttpService.sendResponse(res, 200, true, "Opération réussie", discussions);
    return;
  } catch (e) {
    HttpService.serverError(res);
    return;
  }
};

export const getConversations = async (req: Request, res: Response) => {
  try {
    const user = req.body.user as IUser;
    const { otherUserId } = req.params;
    const { skip, limit } = req.query;

    if (typeof limit !== "string") {
      HttpService.serverError(res, "limit doit etre un number");
      return;
    }
    if (typeof skip !== "string") {
      HttpService.serverError(res, "skip doit etre un number");
      return;
    }
    const conversations = await MessageModel.find({
      $or: [
        {
          $and: [
            { sender: new Types.ObjectId(user._id) },
            { receiver: new Types.ObjectId(otherUserId) },
          ],
        },
        {
          $and: [
            { receiver: new Types.ObjectId(user._id) },
            { sender: new Types.ObjectId(otherUserId) },
          ],
        },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
    const totalMessages = await MessageModel.countDocuments({
      $or: [
        {
          $and: [
            { sender: new Types.ObjectId(user._id) },
            { receiver: new Types.ObjectId(otherUserId) },
          ],
        },
        {
          $and: [
            { receiver: new Types.ObjectId(user._id) },
            { sender: new Types.ObjectId(otherUserId) },
          ],
        },
      ],
    });

    HttpService.sendResponse(res, 200, true, "Opération réussie", {
      conversations,
      totalMessages,
    });
    return;
  } catch (e) {
    console.log(e);
    HttpService.serverError(res, "Message non envoyé", e);
    return;
  }
};

export const markAsSeen = async (req: Request, res: Response) => {
  const user = req.body.user as IUser;
  const otherUser = req.body.otherUser;

  try {
    const response = await MessageModel.updateMany(
      {
        seen: false,
        sender: new Types.ObjectId(otherUser),
        receiver: new Types.ObjectId(user._id),
      },
      { seen: true }
    );

    const socketIo = MySocket.getSocket();
    socketIo.to(user._id.toString()).emit("message-seen", { otherUser });

    HttpService.sendResponse(res, 200, true, "Message lu");
    return;
  } catch (e) {
    HttpService.serverError(res, "Message non lu", e);
    return;
  }
};
