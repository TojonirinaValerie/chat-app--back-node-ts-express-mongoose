import { model, Schema, Types, Document } from "mongoose";
import { IUser } from "./user.model";

interface IMessage extends Document {
  _id: Types.ObjectId;
  content: string;
  sender: IUser["_id"];
  receiver: IUser["_id"];
  date: Date;
  seen: boolean;
}

const messageScema = new Schema<IMessage>(
  {
    content: {
      type: String,
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    seen: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Active les champs createdAt et updatedAt
  }
);

const MessageModel = model<IMessage>("Messages", messageScema);

export default MessageModel;
